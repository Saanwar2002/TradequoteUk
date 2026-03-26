import { FlatList, Text, View, Pressable, StyleSheet } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

type NotifType = "new_job" | "new_quote" | "quote_accepted" | "quote_rejected" | "new_message" | "job_completed" | "review_received" | "payment_released" | "credential_expiring" | "emergency_job" | "system";

function notifIcon(type: NotifType): any {
  const map: Record<NotifType, any> = {
    new_job: "briefcase.fill",
    new_quote: "doc.fill",
    quote_accepted: "checkmark.circle.fill",
    quote_rejected: "xmark.circle.fill",
    new_message: "message.fill",
    job_completed: "trophy.fill",
    review_received: "star.fill",
    payment_released: "banknote.fill",
    credential_expiring: "exclamationmark.triangle.fill",
    emergency_job: "flame.fill",
    system: "bell.fill",
  };
  return map[type] ?? "bell.fill";
}

function notifColor(type: NotifType, colors: any) {
  if (["quote_accepted", "job_completed", "payment_released"].includes(type)) return colors.success;
  if (["quote_rejected", "credential_expiring"].includes(type)) return colors.error;
  if (type === "emergency_job") return "#DC2626";
  if (type === "new_quote") return colors.warning;
  return colors.primary;
}

export default function NotificationsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: notifications, isLoading } = trpc.notifications.list.useQuery(undefined, { enabled: !!user });
  const markRead = trpc.notifications.markRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });
  const markAllRead = trpc.notifications.markAllRead.useMutation({ onSuccess: () => utils.notifications.list.invalidate() });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  if (!user) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center px-6">
        <IconSymbol name="bell.fill" size={48} color={colors.muted} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in to view alerts</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
        {unreadCount > 0 && (
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            onPress={() => markAllRead.mutate()}
          >
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, (!notifications || notifications.length === 0) && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="bell.fill" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No notifications</Text>
            <Text style={[styles.emptyDesc, { color: colors.muted }]}>You're all caught up!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const type = item.type as NotifType;
          const iconColor = notifColor(type, colors);
          return (
            <Pressable
              style={({ pressed }) => [
                styles.notifCard,
                { backgroundColor: item.isRead ? colors.surface : colors.primary + "08", borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => { if (!item.isRead) markRead.mutate({ id: item.id }); }}
            >
              <View style={[styles.iconCircle, { backgroundColor: iconColor + "20" }]}>
                <IconSymbol name={notifIcon(type)} size={20} color={iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.notifTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.notifBody, { color: colors.muted }]} numberOfLines={2}>{item.body}</Text>
                <Text style={[styles.notifTime, { color: colors.muted }]}>{formatTime(item.createdAt)}</Text>
              </View>
              {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
            </Pressable>
          );
        }}
      />
    </ScreenContainer>
  );
}

function formatTime(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  markAllText: { fontSize: 14, fontWeight: "600" },
  list: { padding: 12, gap: 8 },
  emptyList: { flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center" },
  notifCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 14, padding: 14, borderWidth: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  notifTitle: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  notifBody: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  notifTime: { fontSize: 11, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
});
