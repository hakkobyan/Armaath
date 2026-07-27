import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentGroup } from "@/hooks/useCurrentGroup";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import {
  deleteMessage,
  getChatRoom,
  getGlobalChatRoom,
  getMessages,
  pickAttachment,
  sendMessage,
  type PendingAttachment,
} from "@/services/chat.service";
import type { Message } from "@/types/models";
import { formatTime } from "@/utils/date";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getSendError(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    const message = error.message;
    if (message.includes("row-level security"))
      return "You do not have permission to send to this chat. Apply migration 005_chat_and_delete_permissions.sql.";
    if (message.includes("schema cache") || message.includes("attachment_"))
      return "The Supabase chat schema is outdated. Apply migration 005_chat_and_delete_permissions.sql.";
    if (message.includes("Bucket not found"))
      return "The chat attachment storage is not configured. Apply migration 005_chat_and_delete_permissions.sql.";
    return message;
  }
  return "Message or attachment could not be sent.";
}

export function ChatScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const phone = width < 480;
  const { profile } = useAuth();
  const groups = useCurrentGroup();
  const [selected, setSelected] = useState("global");
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<PendingAttachment | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const list = useRef<FlatList<Message>>(null);
  const room = useQuery({
    queryKey: ["chat-room", selected],
    queryFn: () =>
      selected === "global" ? getGlobalChatRoom() : getChatRoom(selected),
  });
  const messages = useQuery({
    queryKey: ["messages", room.data?.id],
    queryFn: () => getMessages(room.data!.id),
    enabled: !!room.data,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!room.data?.id) return;
    const roomId = room.data.id;
    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_room_id=eq.${roomId}`,
        },
        () =>
          void queryClient.invalidateQueries({
            queryKey: ["messages", roomId],
          }),
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR")
          console.warn("Realtime chat connection failed");
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [room.data?.id, queryClient]);
  useEffect(() => {
    if (messages.data?.length)
      setTimeout(() => list.current?.scrollToEnd({ animated: true }), 50);
  }, [messages.data?.length]);
  const send = useMutation({
    mutationFn: () => sendMessage(room.data!.id, profile!.id, text, attachment),
    onSuccess: async () => {
      setText("");
      setAttachment(null);
      await queryClient.invalidateQueries({
        queryKey: ["messages", room.data?.id],
      });
    },
    onError: (error) => console.error("Chat message failed:", error),
  });
  const remove = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["messages", room.data?.id] }),
  });
  const confirmMessageDelete = (id: string) => {
    const message = "This message will be permanently deleted for everyone.";
    if (Platform.OS === "web") {
      if (window.confirm(message)) remove.mutate(id);
      return;
    }
    Alert.alert("Delete message", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => remove.mutate(id),
      },
    ]);
  };
  const chooseAttachment = async (kind: "image" | "file") => {
    setAttachmentError(null);
    try {
      const picked = await pickAttachment(kind);
      if (picked) setAttachment(picked);
    } catch (error) {
      setAttachmentError(
        error instanceof Error ? error.message : "Could not select this file.",
      );
    }
  };
  const sendDisabled =
    (!text.trim() && !attachment) || send.isPending || !room.data;

  return (
    <KeyboardAvoidingView
      style={[styles.root, desktop && styles.rootDesktop]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, desktop && styles.headerDesktop]}>
        <PageHeader
          eyebrow="ARMATH COMMUNITY"
          title="Chats"
          description={`All students · ${groups.data?.length ?? 0} group chats`}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.roomScroller}
        contentContainerStyle={[styles.rooms, desktop && styles.roomsDesktop]}
      >
        <Pressable
          style={[styles.chip, selected === "global" && styles.chipSelected]}
          onPress={() => setSelected("global")}
        >
          <Ionicons
            name="globe-outline"
            size={17}
            color={selected === "global" ? colors.primary : colors.muted}
          />
          <Text
            style={[
              styles.chipText,
              desktop && styles.chipTextDesktop,
              selected === "global" && styles.chipTextSelected,
            ]}
          >
            All students
          </Text>
        </Pressable>
        {groups.data?.map((group) => (
          <Pressable
            key={group.id}
            style={[styles.chip, selected === group.id && styles.chipSelected]}
            onPress={() => setSelected(group.id)}
          >
            <Ionicons
              name="people-outline"
              size={17}
              color={selected === group.id ? colors.primary : colors.muted}
            />
            <Text
              style={[
                styles.chipText,
                desktop && styles.chipTextDesktop,
                selected === group.id && styles.chipTextSelected,
              ]}
            >
              {group.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {room.isError || (room.isFetched && !room.data) ? (
        <View style={styles.emptyChat}>
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="Chat is not ready"
            message="Apply migration 005_chat_and_delete_permissions.sql in Supabase."
          />
        </View>
      ) : (
        <FlatList
          style={styles.messages}
          ref={list}
          data={messages.data}
          keyExtractor={(message) => message.id}
          contentContainerStyle={[styles.list, desktop && styles.listDesktop]}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="Start the conversation"
              message={
                selected === "global"
                  ? "Say hello to students across Armath."
                  : "No messages have been sent in this group yet."
              }
            />
          }
          renderItem={({ item }) => {
            const mine = item.sender_id === profile?.id;
            const hasAttachment = Boolean(item.attachment_url);
            const image =
              item.attachment_type?.startsWith("image/") && item.attachment_url;
            return (
              <View
                style={[
                  styles.message,
                  hasAttachment && styles.attachmentMessage,
                  hasAttachment && {
                    width: Math.min(width - 48, desktop ? 520 : 320),
                  },
                  mine && styles.mine,
                ]}
              >
                <Text style={[styles.sender, mine && styles.mineMeta]}>
                  {item.profiles?.first_name ?? "Member"} ·{" "}
                  {formatTime(item.created_at)}
                </Text>
                {item.is_deleted ? (
                  <Text style={[styles.deleted, mine && styles.mineMeta]}>
                    Message deleted
                  </Text>
                ) : (
                  <>
                    {item.content ? (
                      <Text
                        style={[
                          styles.content,
                          desktop && styles.contentDesktop,
                          mine && styles.mineContent,
                        ]}
                      >
                        {item.content}
                      </Text>
                    ) : null}
                    {image ? (
                      <Pressable
                        onPress={() =>
                          void Linking.openURL(item.attachment_url!)
                        }
                      >
                        <Image
                          source={{ uri: item.attachment_url! }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      </Pressable>
                    ) : item.attachment_url ? (
                      <Pressable
                        style={styles.file}
                        onPress={() =>
                          void Linking.openURL(item.attachment_url!)
                        }
                      >
                        <View style={styles.fileIcon}>
                          <Ionicons
                            name="document-text-outline"
                            size={23}
                            color={colors.primary}
                          />
                        </View>
                        <View style={styles.fileInfo}>
                          <Text numberOfLines={1} style={styles.fileName}>
                            {item.attachment_name ?? "Attachment"}
                          </Text>
                          <Text style={styles.fileSize}>
                            {formatSize(item.attachment_size)}
                          </Text>
                        </View>
                        <Ionicons
                          name="download-outline"
                          size={20}
                          color={colors.primary}
                        />
                      </Pressable>
                    ) : null}
                  </>
                )}
                {!item.is_deleted && (mine || profile?.role === "teacher") ? (
                  <Pressable onPress={() => confirmMessageDelete(item.id)}>
                    <Text style={[styles.delete, mine && styles.mineDelete]}>
                      Delete
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            );
          }}
        />
      )}
      <View style={styles.composer}>
        {attachment ? (
          <View style={styles.pending}>
            <Ionicons
              name={
                attachment.mimeType.startsWith("image/")
                  ? "image-outline"
                  : "document-outline"
              }
              size={22}
              color={colors.primary}
            />
            <View style={styles.pendingInfo}>
              <Text numberOfLines={1} style={styles.fileName}>
                {attachment.name}
              </Text>
              <Text style={styles.fileSize}>{formatSize(attachment.size)}</Text>
            </View>
            <Pressable
              accessibilityLabel="Remove attachment"
              onPress={() => setAttachment(null)}
            >
              <Ionicons name="close-circle" size={24} color={colors.muted} />
            </Pressable>
          </View>
        ) : null}
        {attachmentError ? (
          <Text style={styles.error}>{attachmentError}</Text>
        ) : null}
        <View style={[styles.composeRow, phone && styles.composeRowPhone]}>
          <View style={styles.attachButtons}>
            <Pressable
              accessibilityLabel="Add image"
              style={styles.iconButton}
              onPress={() => void chooseAttachment("image")}
            >
              <Ionicons name="image-outline" size={22} color={colors.primary} />
            </Pressable>
            <Pressable
              accessibilityLabel="Add file"
              style={styles.iconButton}
              onPress={() => void chooseAttachment("file")}
            >
              <Ionicons
                name="attach-outline"
                size={23}
                color={colors.primary}
              />
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Write a message…"
            placeholderTextColor={colors.subtle}
            maxLength={2000}
            multiline
          />
          {phone ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              disabled={sendDisabled}
              style={[
                styles.sendButton,
                sendDisabled && styles.sendButtonDisabled,
              ]}
              onPress={() => send.mutate()}
            >
              {send.isPending ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Ionicons name="arrow-up" size={22} color={colors.white} />
              )}
            </Pressable>
          ) : (
            <Button
              title="Send"
              disabled={sendDisabled}
              loading={send.isPending}
              onPress={() => send.mutate()}
            />
          )}
        </View>
        {send.isError ? (
          <Text style={styles.error}>{getSendError(send.error)}</Text>
        ) : null}
        {remove.isError ? (
          <Text style={styles.error}>
            Message could not be deleted. Apply migration
            005_chat_and_delete_permissions.sql.
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    paddingTop: 14,
    backgroundColor: colors.background,
  },
  rootDesktop: { paddingTop: 32 },
  header: { paddingHorizontal: 12 },
  headerDesktop: { paddingHorizontal: 20 },
  roomScroller: { flexGrow: 0 },
  rooms: { flexDirection: "row", gap: 7, padding: 12 },
  roomsDesktop: { gap: 8, padding: 16 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    minHeight: 44,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  chipText: { fontSize: 12, fontWeight: "700", color: colors.muted },
  chipTextDesktop: { fontSize: 16 },
  chipTextSelected: { color: colors.primaryDark },
  messages: { flex: 1, minHeight: 0 },
  list: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexGrow: 1 },
  listDesktop: { paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  message: {
    alignSelf: "flex-start",
    maxWidth: "86%",
    padding: 11,
    borderRadius: 16,
    borderBottomLeftRadius: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    shadowColor: colors.ink,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  attachmentMessage: { maxWidth: "92%" },
  mine: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 5,
  },
  sender: { fontSize: 12, color: colors.muted, fontWeight: "700" },
  content: { fontSize: 14, lineHeight: 20, color: colors.ink },
  contentDesktop: { fontSize: 17, lineHeight: 24 },
  mineContent: { color: colors.white },
  mineMeta: { color: colors.onPrimaryMuted },
  mineDelete: { color: colors.white },
  deleted: { fontStyle: "italic", color: colors.muted },
  delete: { fontSize: 14, color: colors.danger, fontWeight: "700" },
  image: {
    width: "100%",
    aspectRatio: 1.6,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
  },
  file: {
    minWidth: 220,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 16, fontWeight: "700", color: colors.ink },
  fileSize: { fontSize: 14, color: colors.muted },
  composer: {
    width: "100%",
    flexShrink: 0,
    paddingHorizontal: 8,
    paddingVertical: 7,
    gap: 6,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
  },
  composeRow: { flexDirection: "row", gap: 6, alignItems: "flex-end" },
  composeRowPhone: { gap: 5 },
  attachButtons: { flexDirection: "row", gap: 4 },
  iconButton: {
    width: 38,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    paddingHorizontal: 11,
    paddingVertical: 9,
    color: colors.ink,
    fontSize: 15,
    backgroundColor: colors.surfaceMuted,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sendButtonDisabled: { opacity: 0.45 },
  pending: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 14,
    backgroundColor: colors.mintSoft,
  },
  pendingInfo: { flex: 1 },
  error: { color: colors.danger, paddingHorizontal: 4, fontWeight: "600" },
});
