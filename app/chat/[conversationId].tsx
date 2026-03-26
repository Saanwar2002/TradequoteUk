import { FlatList, Text, View, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useRef } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import * as Haptics from "expo-haptics";

export default function ChatScreen() {
  const colors = useColors();
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const utils = trpc.useUtils();

  const { data: messages, isLoading } = trpc.messages.thread.useQuery(
    { conversationId: parseInt(conversationId) },
    { enabled: !!conversationId, refetchInterval: 5000 }
  );

  const sendMessage = trpc.messages.send.useMutation({
    onSuccess: () => {
      utils.messages.thread.invalidate({ conversationId: parseInt(conversationId) });
      utils.messages.conversations.invalidate();
      setMessage("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({ conversationId: parseInt(conversationId), body: message.trim() });
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerInfo}>
          <View style={[styles.headerAvatar, { backgroundColor: colors.primary + "20" }]}>
            <IconSymbol name="person.fill" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.headerName, { color: colors.foreground }]}>Job Conversation</Text>
            <Text style={[styles.headerSub, { color: colors.muted }]}>Conversation #{conversationId}</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages ?? []}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="message.fill" size={40} color={colors.muted} />
              <Text style={[styles.emptyText, { color: colors.muted }]}>
                {isLoading ? "Loading messages..." : "No messages yet. Start the conversation!"}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.id;
            return (
              <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
                {!isMe && (
                  <View style={[styles.msgAvatar, { backgroundColor: colors.primary + "20" }]}>
                    <IconSymbol name="person.fill" size={14} color={colors.primary} />
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  isMe ? [styles.messageBubbleMe, { backgroundColor: colors.primary }] : [styles.messageBubbleOther, { backgroundColor: colors.surface, borderColor: colors.border }],
                ]}>
                  {item.body && (
                    <Text style={[styles.messageText, { color: isMe ? "#fff" : colors.foreground }]}>{item.body}</Text>
                  )}
                  <Text style={[styles.messageTime, { color: isMe ? "rgba(255,255,255,0.7)" : colors.muted }]}>
                    {formatTime(item.sentAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.muted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, { backgroundColor: message.trim() ? colors.primary : colors.border, opacity: pressed ? 0.85 : 1 }]}
            onPress={handleSend}
            disabled={!message.trim() || sendMessage.isPending}
          >
            <IconSymbol name="paperplane.fill" size={18} color={message.trim() ? "#fff" : colors.muted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function formatTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, gap: 10 },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerName: { fontSize: 15, fontWeight: "700" },
  headerSub: { fontSize: 12 },
  messagesList: { padding: 16, gap: 8, flexGrow: 1 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, textAlign: "center" },
  messageRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  messageRowMe: { flexDirection: "row-reverse" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  messageBubble: { maxWidth: "75%", borderRadius: 18, padding: 12, gap: 4 },
  messageBubbleMe: { borderBottomRightRadius: 4 },
  messageBubbleOther: { borderBottomLeftRadius: 4, borderWidth: 1 },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTime: { fontSize: 11, alignSelf: "flex-end" },
  inputContainer: { flexDirection: "row", alignItems: "flex-end", padding: 12, gap: 10, borderTopWidth: 0.5 },
  input: { flex: 1, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});
