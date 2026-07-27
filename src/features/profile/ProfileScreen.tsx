import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  Image,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/hooks/useAuth";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { useCurrentGroup } from "@/hooks/useCurrentGroup";
import { colors } from "@/lib/theme";
import { signOut } from "@/services/auth.service";
import {
  pickAvatar,
  updateAccountSettings,
  type PendingAvatar,
} from "@/services/profile.service";
import { accountSettingsSchema } from "@/utils/validation";

type AccountSettingsForm = z.infer<typeof accountSettingsSchema>;

function accountError(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes("Bucket not found"))
      return "Avatar storage is not configured. Apply migration 006_account_settings.sql in Supabase.";
    if (error.message.includes("row-level security"))
      return "Your account could not be updated. Apply migration 006_account_settings.sql and try again.";
    return error.message;
  }
  return "Account settings could not be saved. Try again.";
}

export function ProfileScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { profile, session, reload } = useAuth();
  const groups = useCurrentGroup();
  const avatar = useAvatarUrl(profile?.avatar_url);
  const [pendingAvatar, setPendingAvatar] =
    React.useState<PendingAvatar | null>(null);
  const [removePhoto, setRemovePhoto] = React.useState(false);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AccountSettingsForm>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      firstName: profile?.first_name ?? "",
      lastName: profile?.last_name ?? "",
      email: session?.user.email ?? "",
    },
  });

  React.useEffect(() => {
    if (!profile || !session) return;
    reset({
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: session.user.email ?? "",
    });
  }, [profile, reset, session]);

  const choosePhoto = async () => {
    setPhotoError(null);
    try {
      const selected = await pickAvatar();
      if (!selected) return;
      setPendingAvatar(selected);
      setRemovePhoto(false);
    } catch (error) {
      setPhotoError(accountError(error));
    }
  };

  const submit = async (values: AccountSettingsForm) => {
    if (!profile || !session?.user.email) return;
    setNotice(null);
    setPhotoError(null);
    try {
      const result = await updateAccountSettings({
        userId: profile.id,
        currentEmail: session.user.email,
        currentAvatarPath: profile.avatar_url,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        avatar: pendingAvatar,
        removeAvatar: removePhoto,
      });
      setPendingAvatar(null);
      setRemovePhoto(false);
      reset(values);
      await reload();
      if (result.emailError) {
        setError("email", {
          message: `Profile saved, but email was not changed: ${result.emailError}`,
        });
        setNotice("Your name and profile photo were saved.");
      } else if (result.emailConfirmationRequired) {
        setNotice(
          "Settings saved. Check both email inboxes to confirm your new address.",
        );
      } else {
        setNotice("Account settings saved.");
      }
    } catch (error) {
      setError("root", { message: accountError(error) });
    }
  };

  const displayAvatar =
    pendingAvatar?.uri ?? (!removePhoto ? avatar.data : null);
  const initials = `${profile?.first_name?.[0] ?? ""}${profile?.last_name?.[0] ?? ""}`;

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <View style={styles.pageHeader}>
        <Text style={styles.kicker}>ACCOUNT</Text>
        <Text style={[styles.title, desktop && styles.titleDesktop]}>
          Profile settings
        </Text>
        <Text style={[styles.muted, desktop && styles.mutedDesktop]}>
          Manage your personal details and profile photo.
        </Text>
      </View>

      <View style={[styles.grid, desktop && styles.gridDesktop]}>
        <View style={[styles.sidebar, desktop && styles.sidebarDesktop]}>
          <Card style={styles.identityCard}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                {displayAvatar ? (
                  <Image
                    source={{ uri: displayAvatar }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                    accessibilityLabel="Profile photo"
                  />
                ) : (
                  <Text style={styles.initials}>{initials || "A"}</Text>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Choose a new profile photo"
                style={({ pressed }) => [
                  styles.cameraButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => void choosePhoto()}
              >
                <Ionicons name="camera-outline" size={21} color="#fff" />
              </Pressable>
            </View>
            <Text style={styles.name}>
              {profile?.first_name} {profile?.last_name}
            </Text>
            <Text style={styles.email}>{session?.user.email}</Text>
            <View style={styles.rolePill}>
              <Ionicons
                name={
                  profile?.role === "teacher"
                    ? "school-outline"
                    : "person-outline"
                }
                size={15}
                color={colors.primaryDark}
              />
              <Text style={styles.role}>{profile?.role}</Text>
            </View>
            <View style={styles.photoActions}>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => pressed && styles.pressed}
                onPress={() => void choosePhoto()}
              >
                <Text style={styles.photoLink}>Change photo</Text>
              </Pressable>
              {displayAvatar ? (
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => pressed && styles.pressed}
                  onPress={() => {
                    setPendingAvatar(null);
                    setRemovePhoto(true);
                    setPhotoError(null);
                  }}
                >
                  <Text style={styles.removeLink}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.photoHint}>JPG, PNG or WebP · up to 5 MB</Text>
            {photoError ? <Text style={styles.error}>{photoError}</Text> : null}
          </Card>

          <Card>
            <View style={styles.cardHeading}>
              <View style={styles.iconTile}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View>
                <Text style={styles.heading}>
                  {profile?.role === "teacher" ? "Assigned groups" : "Groups"}
                </Text>
                <Text style={styles.muted}>
                  {groups.data?.length ?? 0} total
                </Text>
              </View>
            </View>
            {groups.data?.map((group) => (
              <View key={group.id} style={styles.groupRow}>
                <View style={styles.groupDot} />
                <Text style={styles.body}>{group.name}</Text>
              </View>
            ))}
            {!groups.data?.length ? (
              <Text style={styles.muted}>No groups assigned.</Text>
            ) : null}
          </Card>
        </View>

        <Card style={styles.formCard}>
          <View style={styles.cardHeading}>
            <View style={[styles.iconTile, styles.iconTileMint]}>
              <Ionicons name="settings-outline" size={20} color={colors.mint} />
            </View>
            <View style={styles.headingCopy}>
              <Text style={styles.heading}>Personal details</Text>
              <Text style={styles.muted}>
                Keep your name and contact email up to date.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          <View
            style={[styles.nameFields, desktop && styles.nameFieldsDesktop]}
          >
            <View style={styles.field}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="First name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoComplete="given-name"
                    error={errors.firstName?.message}
                  />
                )}
              />
            </View>
            <View style={styles.field}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { value, onChange, onBlur } }) => (
                  <Input
                    label="Last name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoComplete="family-name"
                    error={errors.lastName?.message}
                  />
                )}
              />
            </View>
          </View>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email?.message}
              />
            )}
          />
          <View style={styles.helperRow}>
            <Ionicons
              name="information-circle-outline"
              size={17}
              color={colors.muted}
            />
            <Text style={styles.helper}>
              Changing your email may require confirmation from both addresses.
            </Text>
          </View>
          {errors.root?.message ? (
            <View style={[styles.feedback, styles.feedbackError]}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.danger}
              />
              <Text style={styles.error}>{errors.root.message}</Text>
            </View>
          ) : null}
          {notice ? (
            <View style={[styles.feedback, styles.feedbackSuccess]}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#187A65"
              />
              <Text style={styles.success}>{notice}</Text>
            </View>
          ) : null}
          <Button
            title="Save changes"
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleSubmit(submit)}
          />
        </Card>
      </View>

      <Card style={styles.sessionCard}>
        <View style={styles.sessionCopy}>
          <Text style={styles.heading}>Session</Text>
          <Text style={styles.muted}>Sign out of this device securely.</Text>
        </View>
        <View style={styles.logoutButton}>
          <Button
            title="Log out"
            variant="danger"
            onPress={() => void signOut()}
          />
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", maxWidth: 1080, alignSelf: "center" },
  pageHeader: { gap: 4, marginBottom: 4 },
  kicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  title: { color: colors.ink, fontSize: 27, fontWeight: "900" },
  titleDesktop: { fontSize: 36 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  mutedDesktop: { fontSize: 15, lineHeight: 22 },
  grid: { gap: 14 },
  gridDesktop: { flexDirection: "row", alignItems: "flex-start", gap: 20 },
  sidebar: { gap: 14 },
  sidebarDesktop: { width: 310 },
  identityCard: { alignItems: "center", paddingVertical: 24 },
  avatarWrap: { position: "relative", marginBottom: 4 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.primarySoft,
  },
  avatarImage: { width: "100%", height: "100%" },
  initials: { color: "#fff", fontSize: 28, fontWeight: "900" },
  cameraButton: {
    position: "absolute",
    right: -3,
    bottom: -3,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  pressed: { opacity: 0.72 },
  name: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  email: { color: colors.muted, fontSize: 14 },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  role: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  photoActions: { flexDirection: "row", gap: 18, marginTop: 4 },
  photoLink: { color: colors.primaryDark, fontSize: 13, fontWeight: "800" },
  removeLink: { color: colors.danger, fontSize: 13, fontWeight: "800" },
  photoHint: { color: colors.muted, fontSize: 12, textAlign: "center" },
  cardHeading: { flexDirection: "row", alignItems: "center", gap: 11 },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  iconTileMint: { backgroundColor: colors.mintSoft },
  headingCopy: { flex: 1 },
  heading: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  body: { color: colors.ink, fontSize: 14, lineHeight: 20 },
  groupRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.mint,
  },
  formCard: { flex: 1, width: "100%", gap: 14 },
  divider: { height: 1, backgroundColor: colors.border },
  nameFields: { gap: 12 },
  nameFieldsDesktop: { flexDirection: "row" },
  field: { flex: 1, minWidth: 0 },
  helperRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  helper: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
  feedback: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 13,
  },
  feedbackError: { backgroundColor: "#FFF0F2" },
  feedbackSuccess: { backgroundColor: colors.mintSoft },
  error: { flex: 1, color: colors.danger, fontSize: 13, lineHeight: 19 },
  success: { flex: 1, color: "#187A65", fontSize: 13, lineHeight: 19 },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  sessionCopy: { flex: 1 },
  logoutButton: { minWidth: 120 },
});
