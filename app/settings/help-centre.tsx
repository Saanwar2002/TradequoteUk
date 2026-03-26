import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

const FAQ_ITEMS = [
  {
    id: 1,
    question: "How do I post a job?",
    answer: "Tap the 'Jobs' tab, then 'Post a Job'. Follow the wizard to describe your job, set your budget, and choose your preferred timeline. Your job will be visible to tradespeople immediately.",
  },
  {
    id: 2,
    question: "How do I submit a quote?",
    answer: "Browse available jobs in the 'Jobs' tab, tap a job you're interested in, and tap 'Submit Quote'. Enter your price, timeline, and a brief message about your experience.",
  },
  {
    id: 3,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards (Visa, Mastercard, American Express). Payment is processed securely through our payment partner.",
  },
  {
    id: 4,
    question: "How does the escrow system work?",
    answer: "When you accept a quote, payment is held securely in escrow. It's released to the tradesperson only after you confirm the job is complete.",
  },
  {
    id: 5,
    question: "Can I cancel a job?",
    answer: "Yes, you can cancel a job anytime before a tradesperson starts work. If quotes have been submitted, you'll need to reject them first.",
  },
  {
    id: 6,
    question: "How do I leave a review?",
    answer: "After a job is completed, you'll receive a notification to leave a review. Tap it to rate the tradesperson and share your experience.",
  },
];

function FAQItem({ item, colors, expanded, onPress }: any) {
  return (
    <Pressable
      style={({ pressed }) => [styles.faqItem, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
    >
      <View style={{ flex: 1, gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{item.question}</Text>
          <IconSymbol name={expanded ? "chevron.up" : "chevron.down"} size={16} color={colors.muted} />
        </View>
        {expanded && <Text style={[styles.faqAnswer, { color: colors.muted }]}>{item.answer}</Text>}
      </View>
    </Pressable>
  );
}

export default function HelpCentreScreen() {
  const colors = useColors();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Help Centre</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Contact Support */}
          <View style={[styles.supportCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
            <IconSymbol name="questionmark.circle.fill" size={32} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.supportTitle, { color: colors.foreground }]}>Need Help?</Text>
              <Text style={[styles.supportDesc, { color: colors.muted }]}>Can't find the answer? Contact our support team.</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.contactBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={() => alert("Contact support coming soon")}
            >
              <Text style={styles.contactBtnText}>Contact</Text>
            </Pressable>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Frequently Asked Questions</Text>
            <FlatList
              data={FAQ_ITEMS}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <FAQItem
                  item={item}
                  colors={colors}
                  expanded={expandedId === item.id}
                  onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                />
              )}
            />
          </View>

          {/* Quick Links */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Links</Text>
            <Pressable
              style={({ pressed }) => [styles.quickLink, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => alert("Community forum coming soon")}
            >
              <IconSymbol name="bubble.right.fill" size={18} color={colors.primary} />
              <Text style={[styles.quickLinkText, { color: colors.foreground }]}>Community Forum</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickLink, { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => alert("Blog coming soon")}
            >
              <IconSymbol name="doc.text.fill" size={18} color={colors.primary} />
              <Text style={[styles.quickLinkText, { color: colors.foreground }]}>Blog & Tips</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickLink, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => alert("Status page coming soon")}
            >
              <IconSymbol name="checkmark.circle.fill" size={18} color={colors.primary} />
              <Text style={[styles.quickLinkText, { color: colors.foreground }]}>System Status</Text>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </Pressable>
          </View>

          {/* App Version */}
          <View style={[styles.versionBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.versionText, { color: colors.muted }]}>TradeQuote UK v1.0.0</Text>
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
  content: { padding: 16, gap: 20 },
  supportCard: { borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1 },
  supportTitle: { fontSize: 15, fontWeight: "700" },
  supportDesc: { fontSize: 12, marginTop: 2 },
  contactBtn: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  contactBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  faqItem: { borderRadius: 10, padding: 12, borderWidth: 1, marginBottom: 8 },
  faqQuestion: { fontSize: 14, fontWeight: "600", flex: 1 },
  faqAnswer: { fontSize: 13, lineHeight: 18 },
  quickLink: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, gap: 12 },
  quickLinkText: { fontSize: 15, fontWeight: "500", flex: 1 },
  versionBox: { borderRadius: 10, padding: 12, alignItems: "center", borderWidth: 1 },
  versionText: { fontSize: 12 },
});
