import { FlatList, Text, View, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function MessagesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();

  const { data: conversations, isLoading } = trpc.messages.conversations.useQuery(undefined, { enabled: !!user });

  if (!user) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center px-6">
        <IconSymbol name="message.fill" size={48} color={colors.muted} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in to view messages</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Messages</Text>
      </View>

      <FlatList
        data={conversations ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, (!conversations || conversations.length === 0) && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="message.fill" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No messages yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.muted }]}>
              Messages will appear here once you accept a quote or start a conversation with a tradesperson.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.convCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push({ pathname: "/chat/[conversationId]", params: { conversationId: item.id } } as any)}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
              <IconSymbol name="person.fill" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.convHeader}>
                <Text style={[styles.convName, { color: colors.foreground }]}>Job #{item.jobId}</Text>
                <Text style={[styles.convTime, { color: colors.muted }]}>
                  {formatTime(item.lastMessageAt)}
                </Text>
              </View>
              <Text style={[styles.convPreview, { color: colors.muted }]} numberOfLines={1}>
                Tap to view conversation
              </Text>
            </View>
            {(item.homeownerUnread > 0 || item.tradespersonUnread > 0) && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadText}>
                  {Math.max(item.homeownerUnread, item.tradespersonUnread)}
                </Text>
              </View>
            )}
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

function formatTime(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  list: { padding: 12, gap: 8 },
  emptyList: { flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  convCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  convHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  convName: { fontSize: 15, fontWeight: "700" },
  convTime: { fontSize: 12 },
  convPreview: { fontSize: 13, marginTop: 2 },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
