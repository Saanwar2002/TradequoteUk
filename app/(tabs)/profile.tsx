import { ScrollView, Text, View, Pressable, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

function ProfileRow({ icon, label, value, onPress, colors, danger }: {
  icon: any; label: string; value?: string; onPress?: () => void; colors: any; danger?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed && onPress ? 0.7 : 1 }]}
      onPress={onPress}
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.error + "15" : colors.primary + "15" }]}>
        <IconSymbol name={icon} size={18} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: danger ? colors.error : colors.foreground }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value && <Text style={[styles.rowValue, { color: colors.muted }]}>{value}</Text>}
      {onPress && <IconSymbol name="chevron.right" size={16} color={colors.muted} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile, activeRole, switchRole } = useAppContext();
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();

  const { data: tradespersonProfile } = trpc.profile.getTradesperson.useQuery(undefined, {
    enabled: !!user && profile?.appRole === "tradesperson",
  });

  if (!user) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center px-6">
        <View style={[styles.avatarLarge, { backgroundColor: colors.primary + "20" }]}>
          <IconSymbol name="person.fill" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.signInTitle, { color: colors.foreground }]}>Join TradeQuote UK</Text>
        <Text style={[styles.signInDesc, { color: colors.muted }]}>
          Sign in to manage your jobs, quotes, and profile.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.signInBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push("/onboarding" as any)}
        >
          <Text style={styles.signInBtnText}>Get Started</Text>
        </Pressable>
      </ScreenContainer>
    );
  }

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : (user.name ?? "User");
  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarMedium}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{fullName}</Text>
          <Text style={styles.profileEmail}>{user.email ?? profile?.postcode}</Text>
          {profile && (
            <View style={[styles.roleBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={styles.roleBadgeText}>
                {profile.appRole === "homeowner" ? "🏠 Homeowner" : "🔧 Tradesperson"}
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        {profile && (
          <View style={[styles.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{profile.totalJobsCompleted}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Jobs Done</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {Number(profile.averageRating) > 0 ? `⭐ ${Number(profile.averageRating).toFixed(1)}` : "—"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Rating</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{profile.reviewCount}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Reviews</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {profile.loyaltyTier === "gold" ? "🥇" : profile.loyaltyTier === "silver" ? "🥈" : "🥉"}
              </Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                {profile.loyaltyTier.charAt(0).toUpperCase() + profile.loyaltyTier.slice(1)}
              </Text>
            </View>
          </View>
        )}

        {/* Tradesperson Profile */}
        {profile?.appRole === "tradesperson" && tradespersonProfile && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.muted }]}>BUSINESS</Text>
            {tradespersonProfile.businessName && (
              <ProfileRow icon="building.2.fill" label={tradespersonProfile.businessName} colors={colors} />
            )}
            <ProfileRow
              icon="wrench.and.screwdriver.fill"
              label="Service Radius"
              value={`${tradespersonProfile.serviceRadiusMiles} miles`}
              colors={colors}
            />
            <ProfileRow
              icon="exclamationmark.triangle.fill"
              label="Emergency Available"
              colors={colors}
              value={tradespersonProfile.emergencyAvailable ? "Yes" : "No"}
            />
            <ProfileRow
              icon="leaf.fill"
              label="Eco Certified"
              colors={colors}
              value={tradespersonProfile.ecoCertified ? "Yes" : "No"}
            />
          </View>
        )}

        {/* Account Section */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>ACCOUNT</Text>
          <ProfileRow icon="person.fill" label="Edit Profile" onPress={() => alert("Edit Profile coming soon")} colors={colors} />
          <ProfileRow icon="lock.fill" label="Privacy & Security" onPress={() => alert("Privacy & Security settings coming soon")} colors={colors} />
          <ProfileRow icon="bell.fill" label="Notification Preferences" onPress={() => alert("Notification preferences coming soon")} colors={colors} />
          <ProfileRow icon="creditcard.fill" label="Payment Methods" onPress={() => alert("Payment methods coming soon")} colors={colors} />
        </View>

        {/* Support Section */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>SUPPORT</Text>
          <ProfileRow icon="questionmark.circle.fill" label="Help Centre" onPress={() => alert("Help Centre coming soon")} colors={colors} />
          <ProfileRow icon="flag.fill" label="Report a Problem" onPress={() => alert("Report a Problem coming soon")} colors={colors} />
          <ProfileRow icon="doc.text.fill" label="Terms & Conditions" onPress={() => alert("Terms & Conditions coming soon")} colors={colors} />
          <ProfileRow icon="shield.fill" label="Privacy Policy" onPress={() => alert("Privacy Policy coming soon")} colors={colors} />
        </View>

        {/* Subscription */}
        {profile && (
          <View style={[styles.subscriptionCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subTitle, { color: colors.foreground }]}>
                {profile.subscriptionTier === "free" ? "Free Plan" : profile.subscriptionTier === "pro" ? "Pro Plan" : "Business Plan"}
              </Text>
              <Text style={[styles.subDesc, { color: colors.muted }]}>
                {profile.subscriptionTier === "free" ? "Upgrade for unlimited quotes & priority listing" : "Active subscription"}
              </Text>
            </View>
            {profile.subscriptionTier === "free" && (
              <Pressable style={({ pressed }) => [styles.upgradeBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}>
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <Pressable
            style={({ pressed }) => [styles.signOutBtn, { borderColor: colors.error + "40", opacity: pressed ? 0.7 : 1 }]}
            onPress={() => logout()}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color={colors.error} />
            <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileHeader: { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20, gap: 8 },
  avatarLarge: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarMedium: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#fff", fontSize: 28, fontWeight: "800" },
  profileName: { color: "#fff", fontSize: 22, fontWeight: "700" },
  profileEmail: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  roleBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4 },
  roleBadgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  statsRow: { flexDirection: "row", borderBottomWidth: 1, borderTopWidth: 1, paddingVertical: 16 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, marginVertical: 4 },
  section: { borderBottomWidth: 0.5, paddingTop: 8 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 15 },
  rowValue: { fontSize: 14, marginRight: 4 },
  subscriptionCard: { margin: 16, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1 },
  subTitle: { fontSize: 15, fontWeight: "700" },
  subDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  upgradeBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  upgradeBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  signInTitle: { fontSize: 24, fontWeight: "700", marginTop: 16 },
  signInDesc: { fontSize: 15, textAlign: "center", lineHeight: 22, paddingHorizontal: 20 },
  signInBtn: { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  signInBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  signOutContainer: { padding: 16 },
  signOutBtn: { borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1 },
  signOutText: { fontSize: 15, fontWeight: "700" },
});
