import * as DocumentPicker from "expo-document-picker";
import { File as ExpoFile } from "expo-file-system";
import { Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/models";

export type PendingAvatar = {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
  webFile?: File;
};

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getAvatarUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const { data, error } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}

export async function pickAvatar() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/jpeg", "image/png", "image/webp"],
    multiple: false,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if ((asset.size ?? 0) > 5 * 1024 * 1024)
    throw new Error("Profile photos must be 5 MB or smaller.");
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? "image/jpeg",
    size: asset.size ?? 0,
    webFile: asset.file,
  } as PendingAvatar;
}

async function uploadAvatar(userId: string, avatar: PendingAvatar) {
  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionByType[avatar.mimeType] ?? "jpg";
  const path = `${userId}/avatar-${Date.now()}.${extension}`;
  const body =
    Platform.OS === "web" && avatar.webFile
      ? await avatar.webFile.arrayBuffer()
      : await new ExpoFile(avatar.uri).arrayBuffer();
  const { error } = await supabase.storage.from("avatars").upload(path, body, {
    contentType: avatar.mimeType,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

async function removeAvatar(path?: string | null) {
  if (!path || /^https?:\/\//.test(path)) return;
  await supabase.storage.from("avatars").remove([path]);
}

export async function updateAccountSettings(input: {
  userId: string;
  currentEmail: string;
  currentAvatarPath?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: PendingAvatar | null;
  removeAvatar?: boolean;
}) {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim().toLowerCase();
  const emailChanged = email !== input.currentEmail.trim().toLowerCase();
  let uploadedPath: string | null = null;

  try {
    if (input.avatar)
      uploadedPath = await uploadAvatar(input.userId, input.avatar);
    const avatarPath =
      uploadedPath ??
      (input.removeAvatar ? null : (input.currentAvatarPath ?? null));

    const { error: metadataError } = await supabase.auth.updateUser({
      data: { first_name: firstName, last_name: lastName },
    });
    if (metadataError) throw metadataError;

    const { data: updatedProfile, error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarPath,
      })
      .eq("id", input.userId)
      .select()
      .single();
    if (profileError) throw profileError;

    let emailError: string | null = null;
    let emailConfirmationRequired = false;
    if (emailChanged) {
      const { data, error } = await supabase.auth.updateUser({ email });
      if (error) emailError = error.message;
      else emailConfirmationRequired = data.user.email !== email;
    }

    if (
      input.currentAvatarPath &&
      (uploadedPath || input.removeAvatar) &&
      input.currentAvatarPath !== uploadedPath
    )
      await removeAvatar(input.currentAvatarPath);

    return {
      profile: updatedProfile as Profile,
      emailError,
      emailConfirmationRequired,
    };
  } catch (error) {
    if (uploadedPath) await removeAvatar(uploadedPath);
    throw error;
  }
}
