import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function PaymentMethodsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "card", brand: "Visa", last4: "4242", expiry: "12/26", isDefault: true },
    { id: 2, type: "card", brand: "Mastercard", last4: "5555", expiry: "08/25", isDefault: false },
  ]);

  const handleRemove = (id: number) => {
    setPaymentMethods(paymentMethods.filter(m => m.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(paymentMethods.map(m => ({ ...m, isDefault: m.id === id })));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getCardIcon = (brand: string): any => {
    switch (brand.toLowerCase()) {
      case "visa":
        return "creditcard.fill";
      case "mastercard":
        return "creditcard.fill";
      default:
        return "creditcard.fill";
    }
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Add Card Button */}
          <Pressable
            style={({ pressed }) => [styles.addCardBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={() => alert("Add payment method coming soon")}
          >
            <IconSymbol name="plus" size={20} color="#fff" />
            <Text style={styles.addCardBtnText}>Add Payment Method</Text>
          </Pressable>

          {/* Payment Methods List */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Saved Cards</Text>
            {paymentMethods.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <IconSymbol name="creditcard.fill" size={32} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>No payment methods saved</Text>
              </View>
            ) : (
              <FlatList
                data={paymentMethods}
                keyExtractor={(item) => String(item.id)}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={[styles.cardItem, { backgroundColor: colors.surface, borderColor: item.isDefault ? colors.primary : colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <IconSymbol name={getCardIcon(item.brand) as any} size={20} color={colors.primary} />
                        <Text style={[styles.cardBrand, { color: colors.foreground }]}>{item.brand}</Text>
                        {item.isDefault && (
                          <View style={[styles.defaultBadge, { backgroundColor: colors.primary + "20" }]}>
                            <Text style={[styles.defaultBadgeText, { color: colors.primary }]}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.cardNumber, { color: colors.muted }]}>•••• •••• •••• {item.last4}</Text>
                      <Text style={[styles.cardExpiry, { color: colors.muted }]}>Expires {item.expiry}</Text>
                    </View>
                    <View style={{ gap: 8 }}>
                      {!item.isDefault && (
                        <Pressable
                          style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
                          onPress={() => handleSetDefault(item.id)}
                        >
                          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Set Default</Text>
                        </Pressable>
                      )}
                      <Pressable
                        style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
                        onPress={() => handleRemove(item.id)}
                      >
                        <Text style={[styles.actionBtnText, { color: colors.error }]}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              />
            )}
          </View>

          {/* Billing Address */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Billing Address</Text>
            <Pressable
              style={({ pressed }) => [styles.row, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => alert("Edit billing address coming soon")}
            >
              <View style={[styles.rowIcon, { backgroundColor: colors.primary + "15" }]}>
                <IconSymbol name="location.fill" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>Edit Billing Address</Text>
                <Text style={[styles.rowDesc, { color: colors.muted }]}>Update your billing address</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.muted} />
            </Pressable>
          </View>

          {/* Transaction History */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Transactions</Text>
            <View style={[styles.transactionItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.transactionDesc, { color: colors.foreground }]}>Job Boost - Emergency Plumbing</Text>
                <Text style={[styles.transactionDate, { color: colors.muted }]}>Mar 26, 2026</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: colors.success }]}>-£3.00</Text>
            </View>
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
  addCardBtn: { borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  addCardBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  emptyState: { borderRadius: 12, padding: 32, alignItems: "center", gap: 8, borderWidth: 1 },
  emptyText: { fontSize: 14 },
  cardItem: { borderRadius: 12, padding: 14, borderWidth: 1.5, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cardBrand: { fontSize: 15, fontWeight: "700" },
  cardNumber: { fontSize: 13 },
  cardExpiry: { fontSize: 12, marginTop: 2 },
  defaultBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  defaultBadgeText: { fontSize: 11, fontWeight: "600" },
  actionBtn: { paddingVertical: 6, paddingHorizontal: 8 },
  actionBtnText: { fontSize: 12, fontWeight: "600" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  rowDesc: { fontSize: 12, marginTop: 4 },
  transactionItem: { borderRadius: 12, padding: 12, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  transactionDesc: { fontSize: 14, fontWeight: "500" },
  transactionDate: { fontSize: 12, marginTop: 4 },
  transactionAmount: { fontSize: 14, fontWeight: "700" },
});
