import { FlatList, Text, View, Pressable, StyleSheet, TextInput, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

type JobStatus = "open" | "quoting" | "accepted" | "in_progress" | "completed" | "cancelled" | "disputed" | "draft";

function StatusBadge({ status, colors }: { status: JobStatus; colors: any }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    open: { label: "Open", bg: colors.primary + "20", text: colors.primary },
    quoting: { label: "Quoting", bg: colors.warning + "20", text: colors.warning },
    accepted: { label: "Accepted", bg: colors.success + "20", text: colors.success },
    in_progress: { label: "In Progress", bg: "#8B5CF620", text: "#8B5CF6" },
    completed: { label: "Completed", bg: colors.success + "20", text: colors.success },
    cancelled: { label: "Cancelled", bg: colors.error + "20", text: colors.error },
    disputed: { label: "Disputed", bg: colors.error + "20", text: colors.error },
    draft: { label: "Draft", bg: colors.muted + "20", text: colors.muted },
  };
  const c = config[status] ?? config.open;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

export default function JobsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile } = useAppContext();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [budgetFilter, setBudgetFilter] = useState<"all" | "under500" | "500to1000" | "1000plus">("all");

  const isHomeowner = !profile || profile.appRole === "homeowner";

  const { data: myJobs, isLoading: myLoading } = trpc.jobs.myJobs.useQuery(undefined, { enabled: !!user && isHomeowner });
  const { data: openJobs, isLoading: openLoading } = trpc.jobs.openJobs.useQuery(undefined, { enabled: !!user && !isHomeowner });
  const { data: myQuotes, isLoading: quotesLoading } = trpc.quotes.myQuotes.useQuery(undefined, { enabled: !!user && !isHomeowner });

  const jobs = isHomeowner ? (myJobs ?? []) : (openJobs ?? []);
  const isLoading = isHomeowner ? myLoading : openLoading;

  const filteredJobs = jobs.filter((j) => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.postcode.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    const maxBudget = typeof j.budgetMax === "string" ? parseInt(j.budgetMax) : (j.budgetMax ?? 0);
    const minBudget = typeof j.budgetMin === "string" ? parseInt(j.budgetMin) : (j.budgetMin ?? 0);
    if (budgetFilter === "under500" && maxBudget >= 500) return false;
    if (budgetFilter === "500to1000" && (minBudget > 1000 || maxBudget < 500)) return false;
    if (budgetFilter === "1000plus" && minBudget < 1000) return false;
    if (filter === "active") return ["open", "quoting", "accepted", "in_progress"].includes(j.status);
    if (filter === "completed") return ["completed", "cancelled"].includes(j.status);
    return true;
  });

  if (!user) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center px-6">
        <IconSymbol name="briefcase.fill" size={48} color={colors.muted} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in to view jobs</Text>
        <Pressable
          style={({ pressed }) => [styles.signInBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push("/onboarding" as any)}
        >
          <Text style={styles.signInBtnText}>Get Started</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          {isHomeowner ? "My Jobs" : "Available Jobs"}
        </Text>
        {isHomeowner && (
          <Pressable
            style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => router.push("/job/post" as any)}
          >
            <IconSymbol name="plus" size={20} color="#fff" />
          </Pressable>
        )}
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.muted} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search jobs..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <IconSymbol name="xmark.circle.fill" size={16} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterRow, { borderBottomColor: colors.border }]}>
        {(["all", "active", "completed"] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.filterTab, filter === f && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, { color: filter === f ? colors.primary : colors.muted }]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Budget Filter for Tradespeople */}
      {!isHomeowner && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.budgetFilterContainer} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}>
          {(["all", "under500", "500to1000", "1000plus"] as const).map((b) => (
            <Pressable
              key={b}
              style={[styles.budgetFilterBtn, { backgroundColor: budgetFilter === b ? colors.primary : colors.surface, borderColor: colors.border }]}
              onPress={() => setBudgetFilter(b)}
            >
              <Text style={[styles.budgetFilterText, { color: budgetFilter === b ? "#fff" : colors.foreground }]}>
                {b === "all" ? "All" : b === "under500" ? "<£500" : b === "500to1000" ? "£500-1k" : "£1k+"}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Tradesperson: My Quotes Summary */}
      {!isHomeowner && (myQuotes?.length ?? 0) > 0 && (
        <View style={[styles.quotesSummary, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
          <IconSymbol name="doc.fill" size={16} color={colors.primary} />
          <Text style={[styles.quotesSummaryText, { color: colors.primary }]}>
            You have {myQuotes!.filter(q => q.status === "pending").length} pending quotes
          </Text>
        </View>
      )}

      {/* Jobs List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, filteredJobs.length === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="briefcase.fill" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {isLoading ? "Loading..." : isHomeowner ? "No jobs yet" : "No available jobs"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.muted }]}>
              {isHomeowner ? "Post your first job to get quotes from tradespeople" : "Check back soon for new jobs in your area"}
            </Text>
            {isHomeowner && (
              <Pressable
                style={({ pressed }) => [styles.signInBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push("/job/post" as any)}
              >
                <Text style={styles.signInBtnText}>Post a Job</Text>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.jobCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => router.push({ pathname: "/job/[id]", params: { id: item.id } } as any)}
          >
            <View style={styles.jobCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.jobTitle, { color: colors.foreground }]} numberOfLines={2}>{item.title}</Text>
              </View>
              <StatusBadge status={item.status as JobStatus} colors={colors} />
            </View>
            <Text style={[styles.jobDesc, { color: colors.muted }]} numberOfLines={2}>{item.description}</Text>
            <View style={styles.jobMeta}>
              <View style={styles.metaItem}>
                <IconSymbol name="location.fill" size={12} color={colors.muted} />
                <Text style={[styles.metaText, { color: colors.muted }]}>{item.postcode}</Text>
              </View>
              <View style={styles.metaItem}>
                <IconSymbol name="text.bubble.fill" size={12} color={colors.muted} />
                <Text style={[styles.metaText, { color: colors.muted }]}>{item.quoteCount} quotes</Text>
              </View>
              {item.urgency !== "normal" && (
                <View style={[styles.urgencyBadge, { backgroundColor: item.urgency === "emergency" ? "#DC262620" : colors.warning + "20" }]}>
                  <Text style={[styles.urgencyText, { color: item.urgency === "emergency" ? "#DC2626" : colors.warning }]}>
                    {item.urgency === "emergency" ? "🚨 Emergency" : "⚡ Urgent"}
                  </Text>
                </View>
              )}
            </View>
            {(item.budgetMin || item.budgetMax) && (
              <View style={styles.budgetRow}>
                <IconSymbol name="banknote.fill" size={12} color={colors.success} />
                <Text style={[styles.budgetText, { color: colors.success }]}>
                  Budget: £{item.budgetMin ?? "?"} – £{item.budgetMax ?? "?"}
                </Text>
              </View>
            )}
            {item.expiresAt && item.status === "open" && (
              <View style={[styles.expiryRow, { backgroundColor: colors.warning + "15", borderColor: colors.warning + "30" }]}>
                <IconSymbol name="clock.fill" size={12} color={colors.warning} />
                <Text style={[styles.expiryText, { color: colors.warning }]}>
                  Expires in {Math.ceil((new Date(item.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))} hours
                </Text>
              </View>
            )}
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  searchContainer: { flexDirection: "row", alignItems: "center", margin: 12, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15 },
  filterRow: { flexDirection: "row", borderBottomWidth: 0.5, paddingHorizontal: 16 },
  filterTab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  filterTabText: { fontSize: 14, fontWeight: "600" },
  quotesSummary: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 12, marginTop: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  quotesSummaryText: { fontSize: 13, fontWeight: "600" },
  list: { padding: 12, gap: 10 },
  emptyList: { flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  signInBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  signInBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  jobCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 8 },
  jobCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  jobTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  jobDesc: { fontSize: 13, lineHeight: 18 },
  jobMeta: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  urgencyBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  urgencyText: { fontSize: 11, fontWeight: "700" },
  budgetRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  budgetText: { fontSize: 12, fontWeight: "600" },
  expiryRow: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, padding: 8, borderWidth: 1 },
  expiryText: { fontSize: 12, fontWeight: "600" },
  budgetFilterContainer: { paddingVertical: 4 },
  budgetFilterBtn: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  budgetFilterText: { fontSize: 13, fontWeight: "600" },
});
