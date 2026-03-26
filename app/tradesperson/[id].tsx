import { ScrollView, Text, View, Pressable, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <IconSymbol key={s} name="star.fill" size={size} color={s <= Math.round(rating) ? "#F59E0B" : colors.border} />
      ))}
    </View>
  );
}

export default function TradespersonProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: reviews } = trpc.reviews.byUser.useQuery({ userId: parseInt(id) }, { enabled: !!id });

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Tradesperson Profile</Text>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <IconSymbol name="heart" size={22} color={colors.muted} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <View style={[styles.profileHero, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarInitials}>TP</Text>
          </View>
          <Text style={styles.profileName}>Tradesperson #{id}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={4.5} size={18} />
            <Text style={styles.ratingText}>4.5 ({reviews?.length ?? 0} reviews)</Text>
          </View>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <IconSymbol name="checkmark.seal.fill" size={14} color="#fff" />
              <Text style={styles.badgeText}>Verified</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <IconSymbol name="star.fill" size={14} color="#F59E0B" />
              <Text style={styles.badgeText}>Top Rated</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stats */}
          <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { label: "Jobs Done", value: "—" },
              { label: "Response Time", value: "15 mins" },
              { label: "Repeat Clients", value: "—" },
            ].map((stat, i) => (
              <View key={i} style={[styles.statItem, i < 2 && { borderRightWidth: 1, borderRightColor: colors.border }]}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Credentials */}
          <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Credentials & Certifications</Text>
            <View style={styles.credentialsList}>
              {[
                { name: "Gas Safe Registered", icon: "flame.fill" as const, color: "#DC2626" },
                { name: "NICEIC Approved", icon: "bolt.fill" as const, color: "#F59E0B" },
                { name: "DBS Checked", icon: "checkmark.seal.fill" as const, color: "#22C55E" },
                { name: "Public Liability Insurance", icon: "shield.fill" as const, color: "#3B82F6" },
              ].map((cred) => (
                <View key={cred.name} style={[styles.credentialItem, { borderColor: colors.border }]}>
                  <View style={[styles.credIcon, { backgroundColor: cred.color + "20" }]}>
                    <IconSymbol name={cred.icon} size={16} color={cred.color} />
                  </View>
                  <Text style={[styles.credName, { color: colors.foreground }]}>{cred.name}</Text>
                  <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
                </View>
              ))}
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Reviews ({reviews?.length ?? 0})
            </Text>
            {(!reviews || reviews.length === 0) ? (
              <View style={[styles.emptyReviews, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.emptyText, { color: colors.muted }]}>No reviews yet</Text>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                {reviews.map((review) => (
                  <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.reviewHeader}>
                      <View style={[styles.reviewAvatar, { backgroundColor: colors.primary + "20" }]}>
                        <IconSymbol name="person.fill" size={16} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reviewerName, { color: colors.foreground }]}>Customer</Text>
                        <StarRating rating={parseFloat(review.overallRating)} size={14} />
                      </View>
                      <Text style={[styles.reviewDate, { color: colors.muted }]}>
                        {new Date(review.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                      </Text>
                    </View>
                    {review.comment && (
                      <Text style={[styles.reviewComment, { color: colors.foreground }]}>{review.comment}</Text>
                    )}
                    {/* Rating breakdown */}
                    {(review.qualityRating || review.punctualityRating || review.communicationRating || review.valueRating) && (
                      <View style={styles.ratingBreakdown}>
                        {review.qualityRating && <RatingPill label="Quality" value={parseFloat(review.qualityRating)} colors={colors} />}
                        {review.punctualityRating && <RatingPill label="Punctuality" value={parseFloat(review.punctualityRating)} colors={colors} />}
                        {review.communicationRating && <RatingPill label="Communication" value={parseFloat(review.communicationRating)} colors={colors} />}
                        {review.valueRating && <RatingPill label="Value" value={parseFloat(review.valueRating)} colors={colors} />}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Contact CTA */}
      <View style={[styles.bottomCta, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.contactBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => {}}
        >
          <IconSymbol name="message.fill" size={18} color="#fff" />
          <Text style={styles.contactBtnText}>Message Tradesperson</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function RatingPill({ label, value, colors }: { label: string; value: number; colors: any }) {
  return (
    <View style={[{ backgroundColor: colors.border + "60", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 4 }]}>
      <Text style={[{ fontSize: 11, color: colors.muted }]}>{label}</Text>
      <Text style={[{ fontSize: 11, fontWeight: "700", color: colors.foreground }]}>{value.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  profileHero: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20, gap: 10 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#fff", fontSize: 28, fontWeight: "800" },
  profileName: { color: "#fff", fontSize: 22, fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  ratingText: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  badgeRow: { flexDirection: "row", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  content: { padding: 16, gap: 16 },
  statsRow: { flexDirection: "row", borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  statItem: { flex: 1, alignItems: "center", paddingVertical: 16, gap: 4 },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11 },
  section: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  credentialsList: { gap: 8 },
  credentialItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8, borderBottomWidth: 0.5 },
  credIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  credName: { flex: 1, fontSize: 14, fontWeight: "500" },
  reviewsSection: { gap: 12 },
  emptyReviews: { borderRadius: 14, padding: 24, borderWidth: 1, alignItems: "center" },
  emptyText: { fontSize: 14 },
  reviewCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  reviewerName: { fontSize: 14, fontWeight: "700" },
  reviewDate: { fontSize: 12 },
  reviewComment: { fontSize: 14, lineHeight: 20 },
  ratingBreakdown: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  bottomCta: { padding: 16, borderTopWidth: 0.5 },
  contactBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  contactBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
