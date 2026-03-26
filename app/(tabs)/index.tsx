import { ScrollView, Text, View, Pressable, StyleSheet, FlatList } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { startOAuthLogin } from "@/constants/oauth";
import { useAppContext } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";

const TRADE_CATEGORIES = [
  { slug: "plumbing", name: "Plumbing", icon: "drop.fill" as const },
  { slug: "electrical", name: "Electrical", icon: "bolt.fill" as const },
  { slug: "gas-heating", name: "Gas & Heating", icon: "flame.fill" as const },
  { slug: "building", name: "Building", icon: "hammer.fill" as const },
  { slug: "painting", name: "Painting", icon: "paintbrush.fill" as const },
  { slug: "carpentry", name: "Carpentry", icon: "wrench.fill" as const },
  { slug: "roofing", name: "Roofing", icon: "house.fill" as const },
  { slug: "landscaping", name: "Landscaping", icon: "leaf.fill" as const },
  { slug: "cleaning", name: "Cleaning", icon: "sparkles" as const },
  { slug: "solar", name: "Solar", icon: "sun.max.fill" as const },
  { slug: "bathroom", name: "Bathroom", icon: "bathtub.fill" as const },
  { slug: "kitchen", name: "Kitchen", icon: "house.fill" as const },
];

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile } = useAppContext();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const { data: jobs } = trpc.jobs.myJobs.useQuery(undefined, { enabled: !!user });
  const { data: openJobs } = trpc.jobs.openJobs.useQuery(undefined, { enabled: !!user });

  const activeJobs = jobs?.filter(j => ["open", "quoting", "accepted", "in_progress"].includes(j.status)) ?? [];
  const isHomeowner = !profile || profile.appRole === "homeowner";

  if (!user) {
    return (
      <ScreenContainer className="px-6 py-8">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
              <IconSymbol name="hammer.fill" size={32} color="#fff" />
            </View>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>TradeQuote UK</Text>
            <Text style={[styles.heroSubtitle, { color: colors.muted }]}>
              Get competitive quotes from verified UK tradespeople
            </Text>
          </View>

          <View style={styles.ctaRow}>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push("/onboarding?role=homeowner" as any)}
            >
              <Text style={styles.ctaBtnText}>I'm a Homeowner</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.ctaBtn, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 2, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push("/onboarding?role=tradesperson" as any)}
            >
              <Text style={[styles.ctaBtnText, { color: colors.primary }]}>I'm a Tradesperson</Text>
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.muted }]}>Why choose TradeQuote?</Text>

          <View style={styles.featureGrid}>
            {[
              { icon: "checkmark.seal.fill" as const, title: "Verified Trades", desc: "All tradespeople are background-checked" },
              { icon: "creditcard.fill" as const, title: "Secure Payments", desc: "Money held in escrow until job done" },
              { icon: "star.fill" as const, title: "Real Reviews", desc: "Genuine ratings from real customers" },
              { icon: "clock.fill" as const, title: "Fast Quotes", desc: "Receive quotes within hours" },
            ].map((f) => (
              <View key={f.title} style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <IconSymbol name={f.icon} size={28} color={colors.primary} />
                <Text style={[styles.featureTitle, { color: colors.foreground }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: colors.muted }]}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.headerGreeting}>Good day,</Text>
            <Text style={styles.headerName}>{profile?.firstName ?? "there"} 👋</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.notifBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push("/(tabs)/notifications" as any)}
          >
            <IconSymbol name="bell.fill" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.content}>
          {/* Quick Action */}
          {isHomeowner ? (
            <Pressable
              style={({ pressed }) => [styles.postJobBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => router.push("/job/post" as any)}
            >
              <IconSymbol name="plus.circle.fill" size={22} color="#fff" />
              <Text style={styles.postJobText}>Post a New Job</Text>
              <IconSymbol name="chevron.right" size={18} color="#fff" />
            </Pressable>
          ) : (
            <>
              <Pressable
                style={({ pressed }) => [styles.postJobBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => router.push("/(tabs)/jobs" as any)}
              >
                <IconSymbol name="magnifyingglass" size={22} color="#fff" />
                <Text style={styles.postJobText}>Browse Available Jobs</Text>
                <IconSymbol name="chevron.right" size={18} color="#fff" />
              </Pressable>

              {/* Find Work Stats Card */}
              <View style={[styles.findWorkCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.findWorkHeader}>
                  <Text style={[styles.findWorkTitle, { color: colors.foreground }]}>Find Work</Text>
                  <IconSymbol name="briefcase.fill" size={20} color={colors.primary} />
                </View>
                <View style={styles.findWorkStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>{openJobs?.length ?? 0}</Text>
                    <Text style={[styles.statLabel, { color: colors.muted }]}>Available</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>£0</Text>
                    <Text style={[styles.statLabel, { color: colors.muted }]}>Earnings</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.primary }]}>0</Text>
                    <Text style={[styles.statLabel, { color: colors.muted }]}>Pending</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Active Jobs</Text>
              {activeJobs.slice(0, 3).map((job) => (
                <Pressable
                  key={job.id}
                  style={({ pressed }) => [styles.jobCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
                  onPress={() => router.push(`/job/${job.id}` as any)}
                >
                  <View style={styles.jobCardHeader}>
                    <Text style={[styles.jobTitle, { color: colors.foreground }]} numberOfLines={1}>{job.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                      <Text style={styles.statusText}>{formatStatus(job.status)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.jobDescText, { color: colors.muted }]} numberOfLines={1}>{job.description}</Text>
                  <View style={styles.jobMeta}>
                    <View style={styles.metaItem}>
                      <IconSymbol name="location.fill" size={12} color={colors.muted} />
                      <Text style={[styles.jobMetaText, { color: colors.muted }]}>{job.postcode}</Text>
                    </View>
                    <Text style={[styles.jobMetaDot, { color: colors.muted }]}>•</Text>
                    <View style={styles.metaItem}>
                      <IconSymbol name="creditcard.fill" size={12} color={colors.muted} />
                      <Text style={[styles.jobMetaText, { color: colors.muted }]}>£{job.budgetMin}-{job.budgetMax}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
              {activeJobs.length > 3 && (
                <Pressable onPress={() => router.push("/(tabs)/jobs" as any)}>
                  <Text style={[styles.viewAll, { color: colors.primary }]}>View all jobs →</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Trade Categories */}
          {isHomeowner && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse by Trade</Text>
              <View style={styles.categoryGrid}>
                {TRADE_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.slug}
                    style={({ pressed }) => [styles.categoryCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => router.push(`/job/post?category=${cat.slug}` as any)}
                  >
                    <IconSymbol name={cat.icon} size={24} color={colors.primary} />
                    <Text style={[styles.categoryName, { color: colors.foreground }]}>{cat.name}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Emergency Banner */}
          {isHomeowner && (
            <Pressable
              style={styles.emergencyBanner}
              onPress={() => router.push("/job/post?emergency=true" as any)}
            >
              <View>
                <Text style={styles.emergencyTitle}>Need help urgently?</Text>
                <Text style={styles.emergencyDesc}>Post an emergency job to get quotes within minutes</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#fff" />
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function getStatusColor(status: string) {
  const colors = useColors();
  switch (status) {
    case "open": return colors.primary;
    case "quoting": return colors.warning;
    case "accepted": return colors.success;
    case "in_progress": return "#8B5CF6";
    case "completed": return colors.success;
    default: return colors.muted;
  }
}

function formatStatus(status: string) {
  return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
}

const styles = StyleSheet.create({
  heroSection: { alignItems: "center", paddingVertical: 40, gap: 12 },
  logoMark: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  heroTitle: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 16, textAlign: "center", lineHeight: 24, paddingHorizontal: 20 },
  ctaRow: { paddingHorizontal: 20, marginBottom: 32, gap: 12 },
  ctaBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  ctaBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  divider: { height: 1, marginVertical: 24 },
  dividerText: { fontSize: 13, fontWeight: "600", textAlign: "center", marginBottom: 16 },
  ctaPrimary: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  ctaPrimaryText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, paddingBottom: 40 },
  featureCard: { width: "47%", borderRadius: 16, padding: 16, gap: 8, borderWidth: 1 },
  featureTitle: { fontSize: 14, fontWeight: "700" },
  featureDesc: { fontSize: 12, lineHeight: 18 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerGreeting: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  headerName: { color: "#fff", fontSize: 22, fontWeight: "700" },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 20 },
  postJobBtn: { borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", gap: 10 },
  postJobText: { color: "#fff", fontSize: 16, fontWeight: "700", flex: 1 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  jobCard: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 8 },
  jobCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  jobTitle: { fontSize: 15, fontWeight: "600", flex: 1 },
  jobDescText: { fontSize: 13, lineHeight: 18 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: "700", color: "#fff" },
  jobMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  jobMetaText: { fontSize: 12 },
  jobMetaDot: { fontSize: 12 },
  viewAll: { fontSize: 14, fontWeight: "600", textAlign: "center", paddingVertical: 8 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryCard: { width: "30%", borderRadius: 14, padding: 12, alignItems: "center", gap: 6, borderWidth: 1 },
  categoryName: { fontSize: 11, fontWeight: "600", textAlign: "center" },
  emergencyBanner: { backgroundColor: "#DC2626", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  emergencyTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  emergencyDesc: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 4 },
  findWorkCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  findWorkHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  findWorkTitle: { fontSize: 16, fontWeight: "700" },
  findWorkStats: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  statItem: { alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 11, fontWeight: "500" },
  statDivider: { width: 1, height: 30 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
});
