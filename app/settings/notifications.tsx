import { useState } from "react";
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

function NotificationToggle({ icon, label, description, value, onValueChange, colors }: {
  icon: any; label: string; description: string; value: boolean; onValueChange: (val: boolean) => void; colors: any;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: colors.primary + "15" }]}>
        <IconSymbol name={icon} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.muted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary + "40" }}
        thumbColor={value ? colors.primary : colors.muted}
      />
    </View>
  );
}

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [newQuotes, setNewQuotes] = useState(true);
  const [messages, setMessages] = useState(true);
  const [jobUpdates, setJobUpdates] = useState(true);
  const [reviews, setReviews] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Job Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>JOB NOTIFICATIONS</Text>
          <NotificationToggle
            icon="briefcase.fill"
            label="New Quotes"
            description="Get notified when you receive new quotes"
            value={newQuotes}
            onValueChange={setNewQuotes}
            colors={colors}
          />
          <NotificationToggle
            icon="text.bubble.fill"
            label="Messages"
            description="Get notified when you receive messages"
            value={messages}
            onValueChange={setMessages}
            colors={colors}
          />
          <NotificationToggle
            icon="doc.fill"
            label="Job Updates"
            description="Get notified about job status changes"
            value={jobUpdates}
            onValueChange={setJobUpdates}
            colors={colors}
          />
        </View>

        {/* Review Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>REVIEWS & FEEDBACK</Text>
          <NotificationToggle
            icon="star.fill"
            label="New Reviews"
            description="Get notified when you receive reviews"
            value={reviews}
            onValueChange={setReviews}
            colors={colors}
          />
        </View>

        {/* Marketing Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>MARKETING</Text>
          <NotificationToggle
            icon="sparkles"
            label="Promotions & Offers"
            description="Receive special offers and promotions"
            value={promotions}
            onValueChange={setPromotions}
            colors={colors}
          />
          <NotificationToggle
            icon="newspaper"
            label="Weekly Newsletter"
            description="Get our weekly tips and insights"
            value={newsletter}
            onValueChange={setNewsletter}
            colors={colors}
          />
        </View>

        {/* Notification Channels */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>CHANNELS</Text>
          <View style={[styles.infoBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <IconSymbol name="info.circle.fill" size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              Notifications are sent via push notifications, email, and in-app messages based on your preferences.
            </Text>
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
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, margin: 16, borderRadius: 12, padding: 12, borderWidth: 1 },
  infoText: { fontSize: 13, flex: 1, lineHeight: 18 },
});
