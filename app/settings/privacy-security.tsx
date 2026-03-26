import { useState } from "react";
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

function SettingRow({ icon, label, description, value, onValueChange, colors }: {
  icon: any; label: string; description?: string; value?: boolean; onValueChange?: (val: boolean) => void; colors: any;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: colors.primary + "15" }]}>
        <IconSymbol name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        {description && <Text style={[styles.rowDesc, { color: colors.muted }]}>{description}</Text>}
      </View>
      {onValueChange !== undefined && (
        <Switch
          value={value ?? false}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.primary + "40" }}
          thumbColor={value ? colors.primary : colors.muted}
        />
      )}
    </View>
  );
}

export default function PrivacySecurityScreen() {
  const colors = useColors();
  const router = useRouter();
  const [profilePrivate, setProfilePrivate] = useState(false);
  const [showReviews, setShowReviews] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>PRIVACY</Text>
          <SettingRow
            icon="lock.fill"
            label="Private Profile"
            description="Hide your profile from other users"
            value={profilePrivate}
            onValueChange={setProfilePrivate}
            colors={colors}
          />
          <SettingRow
            icon="star.fill"
            label="Show Reviews"
            description="Allow others to see your reviews"
            value={showReviews}
            onValueChange={setShowReviews}
            colors={colors}
          />
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>SECURITY</Text>
          <SettingRow
            icon="shield.fill"
            label="Two-Factor Authentication"
            description="Add an extra layer of security"
            value={twoFactorEnabled}
            onValueChange={setTwoFactorEnabled}
            colors={colors}
          />
          <Pressable
            style={({ pressed }) => [styles.row, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => alert("Change password screen coming soon")}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.primary + "15" }]}>
              <IconSymbol name="lock.fill" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>Change Password</Text>
              <Text style={[styles.rowDesc, { color: colors.muted }]}>Update your password regularly</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </Pressable>
        </View>

        {/* Active Sessions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>SESSIONS</Text>
          <View style={[styles.sessionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <IconSymbol name="iphone" size={16} color={colors.primary} />
              <Text style={[styles.sessionDevice, { color: colors.foreground }]}>iPhone 15 Pro</Text>
              <Text style={[styles.sessionStatus, { color: colors.success }]}>Active</Text>
            </View>
            <Text style={[styles.sessionInfo, { color: colors.muted }]}>Last active: Just now</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  section: { borderBottomWidth: 0.5, paddingTop: 8 },
  sectionTitle: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8, paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  rowDesc: { fontSize: 12, marginTop: 4 },
  sessionCard: { margin: 16, borderRadius: 12, padding: 12, borderWidth: 1 },
  sessionDevice: { fontSize: 14, fontWeight: "600", flex: 1 },
  sessionStatus: { fontSize: 12, fontWeight: "600" },
  sessionInfo: { fontSize: 12 },
});
