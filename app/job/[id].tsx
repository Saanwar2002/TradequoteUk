import { ScrollView, Text, View, Pressable, StyleSheet, FlatList, Alert, Image } from "react-native";
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
  const { data: progressUpdates } = trpc.progress.byJob.useQuery({ jobId: parseInt(id) }, { enabled: !!id });
  const { data: media } = trpc.jobs.getMedia.useQuery({ jobId: parseInt(id) }, { enabled: !!id });

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

          {/* Job Media (Photos & Videos) */}
          {((media?.photos && media.photos.length > 0) || (media?.videos && media.videos.length > 0)) && (
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>Job Media</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {media.videos?.map((video: any) => (
                  <Pressable key={video.id} style={styles.mediaCard}>
                    <Image source={{ uri: video.thumbnailUrl || "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500" }} style={styles.mediaImage} />
                    <View style={styles.playOverlay}>
                      <IconSymbol name="play.fill" size={24} color="#fff" />
                    </View>
                  </Pressable>
                ))}
                {media.photos?.map((photo: any) => (
                  <Pressable key={photo.id} style={styles.mediaCard}>
                    <Image source={{ uri: photo.photoUrl }} style={styles.mediaImage} />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Project Timeline / AI Checklist */}
          {progressUpdates && progressUpdates.length > 0 && (
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border, padding: 0, overflow: "hidden" }]}>
              <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <IconSymbol name="sparkles" size={16} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>AI-Generated Job Checklist</Text>
                </View>
                {job.status === "open" && (
                  <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>
                    These milestones help you and your tradesperson stay aligned on the project steps.
                  </Text>
                )}
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
                        </View>
                      </View>
                      <Text style={[styles.quotePrice, { color: colors.primary }]}>£{parseFloat(quote.priceGbp).toFixed(2)}</Text>
                    </View>
                    {quote.message && (
                      <Text style={[styles.quoteMessage, { color: colors.foreground }]} numberOfLines={3}>{quote.message}</Text>
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
    case "accepted":
    case "in_progress": return colors.warning;
    case "completed": return colors.success;
    case "cancelled":
    case "disputed": return colors.error;
    default: return colors.muted;
  }
}

function formatStatus(status: string) {
  return status.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
}

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  content: { padding: 16, gap: 16 },
  jobHeader: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  jobHeaderTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  jobTitle: { fontSize: 20, fontWeight: "800", flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "700" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 13 },
  urgencyBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  description: { fontSize: 15, lineHeight: 22 },
  mediaCard: { width: 140, height: 140, borderRadius: 12, overflow: "hidden", position: "relative" },
  mediaImage: { width: "100%", height: "100%", borderRadius: 12 },
  playOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },
  quotesSection: { gap: 12 },
  quotesSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  submitQuoteBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  submitQuoteBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  emptyQuotes: { padding: 32, borderRadius: 16, borderWidth: 1, borderStyle: "dashed", alignItems: "center", gap: 12 },
  emptyQuotesText: { textAlign: "center", fontSize: 14 },
  quoteCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
  quoteHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  quoteTradeInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  quoteAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  quoteTradeName: { fontSize: 15, fontWeight: "700" },
  quotePrice: { fontSize: 18, fontWeight: "800" },
  quoteMessage: { fontSize: 14, lineHeight: 20 },
  quoteActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  acceptBtn: { flex: 1, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  acceptBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
