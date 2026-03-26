import { ScrollView, Text, View, Pressable, StyleSheet, FlatList, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ProjectTimeline } from "@/components/project-timeline";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function JobDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAppContext();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: job, isLoading } = trpc.jobs.get.useQuery({ id: parseInt(id) }, { enabled: !!id });
  const { data: quotes } = trpc.quotes.byJob.useQuery({ jobId: parseInt(id) }, { enabled: !!id });
  const { data: progressUpdates } = trpc.progress.byJob.useQuery({ jobId: parseInt(id) }, { enabled: !!id && job?.status === "in_progress" });

  const acceptQuote = trpc.quotes.accept.useMutation({
    onSuccess: () => {
      utils.jobs.get.invalidate({ id: parseInt(id) });
      utils.quotes.byJob.invalidate({ jobId: parseInt(id) });
    },
  });

  const isHomeowner = !profile || profile.appRole === "homeowner";
  const isTradesperson = profile?.appRole === "tradesperson";
  const canQuote = isTradesperson && job?.status === "open";
  const alreadyQuoted = quotes?.some(q => q.tradespersonId === user?.id);

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text style={[{ color: colors.muted, fontSize: 16 }]}>Loading...</Text>
      </ScreenContainer>
    );
  }

  if (!job) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center px-6">
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.muted} />
        <Text style={[{ color: colors.foreground, fontSize: 18, fontWeight: "700", marginTop: 12 }]}>Job not found</Text>
      </ScreenContainer>
    );
  }

  const statusColor = getStatusColor(job.status, colors);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>Job Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Job Header */}
          <View style={[styles.jobHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.jobHeaderTop}>
              <Text style={[styles.jobTitle, { color: colors.foreground }]}>{job.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>{formatStatus(job.status)}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <IconSymbol name="location.fill" size={14} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.foreground }]}>{job.postcode}</Text>
              </View>
              <View style={styles.metaItem}>
                <IconSymbol name="text.bubble.fill" size={14} color={colors.primary} />
                <Text style={[styles.metaText, { color: colors.foreground }]}>{job.quoteCount} quote{job.quoteCount !== 1 ? "s" : ""}</Text>
              </View>
              {job.urgency !== "normal" && (
                <View style={[styles.urgencyBadge, { backgroundColor: job.urgency === "emergency" ? "#DC262620" : colors.warning + "20" }]}>
                  <Text style={[{ fontSize: 11, fontWeight: "700" }, { color: job.urgency === "emergency" ? "#DC2626" : colors.warning }]}>
                    {job.urgency === "emergency" ? "🚨 Emergency" : "⚡ Urgent"}
                  </Text>
                </View>
              )}
            </View>
            {(job.budgetMin || job.budgetMax) && (
              <View style={styles.metaItem}>
                <IconSymbol name="banknote.fill" size={14} color={colors.success} />
                <Text style={[styles.metaText, { color: colors.success, fontWeight: "600" }]}>
                  Budget: £{job.budgetMin ?? "?"} – £{job.budgetMax ?? "?"}
                </Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Description</Text>
            <Text style={[styles.description, { color: colors.foreground }]}>{job.description}</Text>
          </View>

          {/* Project Timeline */}
          {job.status === "in_progress" && progressUpdates && progressUpdates.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, padding: 0, overflow: "hidden" }]}>
              <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Project Progress</Text>
                </View>
              </View>
              <ProjectTimeline events={progressUpdates} onVerifyMilestone={(id) => {
                // Handle milestone verification
              }} />
            </View>
          )}

          {/* Availability Info */}
          {isHomeowner && (
            <View style={[styles.section, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <IconSymbol name="clock.fill" size={16} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Preferred Start Date</Text>
              </View>
              <Text style={[styles.description, { color: colors.foreground }]}>
                {job.preferredStartDate ? (typeof job.preferredStartDate === "string" ? job.preferredStartDate : new Date(job.preferredStartDate).toLocaleDateString("en-GB")) : "ASAP"}
              </Text>
              <Text style={[{ fontSize: 12, color: colors.muted, marginTop: 8 }]}>
                Check tradesperson profiles to see their available dates and times before accepting quotes.
              </Text>
            </View>
          )}

          {/* Quotes Section */}
          <View style={styles.quotesSection}>
            <View style={styles.quotesSectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Quotes ({quotes?.length ?? 0})
              </Text>
              {canQuote && !alreadyQuoted && (
                <Pressable
                  style={({ pressed }) => [styles.submitQuoteBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                  onPress={() => router.push({ pathname: "/quote/[jobId]", params: { jobId: job.id } } as any)}
                >
                  <IconSymbol name="plus" size={16} color="#fff" />
                  <Text style={styles.submitQuoteBtnText}>Submit Quote</Text>
                </Pressable>
              )}
              {canQuote && alreadyQuoted && (
                <View style={[styles.alreadyQuotedBadge, { backgroundColor: colors.success + "20" }]}>
                  <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
                  <Text style={[{ fontSize: 12, fontWeight: "600" }, { color: colors.success }]}>Quoted</Text>
                </View>
              )}
            </View>

            {(!quotes || quotes.length === 0) ? (
              <View style={[styles.emptyQuotes, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <IconSymbol name="doc.fill" size={32} color={colors.muted} />
                <Text style={[styles.emptyQuotesText, { color: colors.muted }]}>
                  {isHomeowner ? "No quotes yet. Tradespeople will respond soon." : "Be the first to quote on this job!"}
                </Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {quotes.map((quote) => (
                  <View key={quote.id} style={[styles.quoteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.quoteHeader}>
                      <View style={styles.quoteTradeInfo}>
                        <View style={[styles.quoteAvatar, { backgroundColor: colors.primary + "20" }]}>
                          <IconSymbol name="person.fill" size={20} color={colors.primary} />
                        </View>
                        <View>
                          <Text style={[styles.quoteTradeName, { color: colors.foreground }]}>
                            Tradesperson #{quote.tradespersonId}
                          </Text>
                          {quote.isBoosted && (
                            <View style={[styles.boostedBadge, { backgroundColor: colors.warning + "20" }]}>
                              <Text style={[{ fontSize: 10, fontWeight: "700" }, { color: colors.warning }]}>⚡ Featured</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={[styles.quotePrice, { color: colors.primary }]}>£{parseFloat(quote.priceGbp).toFixed(2)}</Text>
                    </View>
                    {quote.message && (
                      <Text style={[styles.quoteMessage, { color: colors.foreground }]} numberOfLines={3}>{quote.message}</Text>
                    )}
                    {quote.timelineText && (
                      <View style={styles.metaItem}>
                        <IconSymbol name="clock.fill" size={12} color={colors.muted} />
                        <Text style={[{ fontSize: 12 }, { color: colors.muted }]}>{quote.timelineText}</Text>
                      </View>
                    )}
                    {isHomeowner && job.status === "open" && quote.status === "pending" && (
                      <View style={styles.quoteActions}>
                        <Pressable
                          style={({ pressed }) => [styles.acceptBtn, { backgroundColor: colors.success, opacity: pressed ? 0.85 : 1 }]}
                          onPress={() => {
                            Alert.alert("Accept Quote", `Accept quote for £${parseFloat(quote.priceGbp).toFixed(2)}?`, [
                              { text: "Cancel", style: "cancel" },
                              { text: "Accept", onPress: () => acceptQuote.mutate({ quoteId: quote.id, jobId: job.id }) },
                            ]);
                          }}
                        >
                          <Text style={styles.acceptBtnText}>Accept Quote</Text>
                        </Pressable>
                        <Pressable
                          style={({ pressed }) => [styles.messageBtn, { borderColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                          onPress={() => {}}
                        >
                          <IconSymbol name="message.fill" size={14} color={colors.primary} />
                          <Text style={[styles.messageBtnText, { color: colors.primary }]}>Message</Text>
                        </Pressable>
                      </View>
                    )}
                    {quote.status !== "pending" && (
                      <View style={[styles.quoteStatusBadge, { backgroundColor: getQuoteStatusColor(quote.status, colors) + "20" }]}>
                        <Text style={[{ fontSize: 11, fontWeight: "700" }, { color: getQuoteStatusColor(quote.status, colors) }]}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function getStatusColor(status: string, colors: any) {
  switch (status) {
    case "open": return colors.primary;
    case "quoting": return colors.warning;
    case "accepted": return colors.success;
    case "in_progress": return "#8B5CF6";
    case "completed": return colors.success;
    case "cancelled": return colors.error;
    default: return colors.muted;
  }
}

function getQuoteStatusColor(status: string, colors: any) {
  switch (status) {
    case "accepted": return colors.success;
    case "rejected": return colors.error;
    default: return colors.muted;
  }
}

function formatStatus(status: string) {
  return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 17, fontWeight: "700", flex: 1, textAlign: "center" },
  content: { padding: 16, gap: 16 },
  jobHeader: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  jobHeaderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  jobTitle: { fontSize: 20, fontWeight: "800", flex: 1, lineHeight: 26 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13 },
  urgencyBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  description: { fontSize: 15, lineHeight: 24 },
  quotesSection: { gap: 12 },
  quotesSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  submitQuoteBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  submitQuoteBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  alreadyQuotedBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  emptyQuotes: { borderRadius: 14, padding: 24, borderWidth: 1, alignItems: "center", gap: 8 },
  emptyQuotesText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  quoteCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  quoteHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  quoteTradeInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  quoteAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  quoteTradeName: { fontSize: 14, fontWeight: "700" },
  boostedBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  quotePrice: { fontSize: 22, fontWeight: "800" },
  quoteMessage: { fontSize: 14, lineHeight: 20 },
  quoteActions: { flexDirection: "row", gap: 10 },
  acceptBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  acceptBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  messageBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1.5 },
  messageBtnText: { fontSize: 14, fontWeight: "600" },
  quoteStatusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: "flex-start" },
});
