import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";

export default function JobAlertsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tradeCategory: "",
    postcode: "",
    radiusMiles: "10",
    minBudget: "",
    maxBudget: "",
  });

  const { data: alertsData } = trpc.jobAlerts.list.useQuery();

  useEffect(() => {
    if (alertsData) setAlerts(alertsData);
  }, [alertsData]);

  const createAlertMutation = trpc.jobAlerts.create.useMutation({
    onSuccess: () => {
      setFormData({ tradeCategory: "", postcode: "", radiusMiles: "10", minBudget: "", maxBudget: "" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["jobAlerts", "list"] });
    },
  });

  const updateAlertMutation = trpc.jobAlerts.update.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobAlerts", "list"] });
    },
  });

  const deleteAlertMutation = trpc.jobAlerts.delete.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobAlerts", "list"] });
    },
  });

  const handleCreateAlert = () => {
    if (!formData.tradeCategory || !formData.postcode) {
      alert("Please fill in trade category and postcode");
      return;
    }
    createAlertMutation.mutate({
      tradeCategory: formData.tradeCategory,
      postcode: formData.postcode,
      radiusMiles: parseInt(formData.radiusMiles) || 10,
      minBudget: formData.minBudget ? parseInt(formData.minBudget) : undefined,
      maxBudget: formData.maxBudget ? parseInt(formData.maxBudget) : undefined,
      enabled: true,
    });
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.title, { color: colors.foreground }]}>Job Alerts</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Info Text */}
          <Text style={[styles.infoText, { color: colors.muted }]}>
            Get notified when new jobs matching your criteria are posted
          </Text>

          {/* Alerts List */}
          {alerts.length > 0 && (
            <View style={styles.alertsList}>
              {alerts.map((alert) => (
                <View key={alert.id} style={[styles.alertCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                  <View style={styles.alertHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.alertCategory, { color: colors.foreground }]}>{alert.tradeCategory}</Text>
                      <Text style={[styles.alertPostcode, { color: colors.muted }]}>{alert.postcode} • {alert.radiusMiles}mi radius</Text>
                      {(alert.minBudget || alert.maxBudget) && (
                        <Text style={[styles.alertBudget, { color: colors.muted }]}>
                          Budget: £{alert.minBudget || "0"}-£{alert.maxBudget || "∞"}
                        </Text>
                      )}
                    </View>
                    <Switch
                      value={alert.enabled}
                      onValueChange={(value) => updateAlertMutation.mutate({ alertId: alert.id, enabled: value })}
                      trackColor={{ false: colors.border, true: colors.primary }}
                    />
                  </View>
                  <Pressable
                    onPress={() => deleteAlertMutation.mutate({ alertId: alert.id })}
                    style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]}
                  >
                    <IconSymbol name="trash.fill" size={16} color={colors.error} />
                    <Text style={[styles.deleteText, { color: colors.error }]}>Delete</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Create Alert Form */}
          {showForm ? (
            <View style={[styles.formContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text style={[styles.formTitle, { color: colors.foreground }]}>Create New Alert</Text>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>Trade Category *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                  placeholder="e.g., Plumbing, Electrical"
                  placeholderTextColor={colors.muted}
                  value={formData.tradeCategory}
                  onChangeText={(text) => setFormData({ ...formData, tradeCategory: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>Postcode *</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                  placeholder="e.g., M1 1AA"
                  placeholderTextColor={colors.muted}
                  value={formData.postcode}
                  onChangeText={(text) => setFormData({ ...formData, postcode: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.foreground }]}>Radius (miles)</Text>
                <TextInput
                  style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                  placeholder="10"
                  placeholderTextColor={colors.muted}
                  value={formData.radiusMiles}
                  onChangeText={(text) => setFormData({ ...formData, radiusMiles: text })}
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.budgetRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Min Budget (£)</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Optional"
                    placeholderTextColor={colors.muted}
                    value={formData.minBudget}
                    onChangeText={(text) => setFormData({ ...formData, minBudget: text })}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: colors.foreground }]}>Max Budget (£)</Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Optional"
                    placeholderTextColor={colors.muted}
                    value={formData.maxBudget}
                    onChangeText={(text) => setFormData({ ...formData, maxBudget: text })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.formButtons}>
                <Pressable
                  onPress={() => setShowForm(false)}
                  style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleCreateAlert}
                  style={({ pressed }) => [styles.submitBtn, { opacity: pressed ? 0.8 : 1, backgroundColor: colors.primary }]}
                >
                  <Text style={styles.submitText}>Create Alert</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowForm(true)}
              style={({ pressed }) => [styles.createBtn, { opacity: pressed ? 0.8 : 1, backgroundColor: colors.primary }]}
            >
              <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
              <Text style={styles.createBtnText}>Create New Alert</Text>
            </Pressable>
          )}

          {alerts.length === 0 && !showForm && (
            <View style={styles.emptyState}>
              <IconSymbol name="bell.slash.fill" size={48} color={colors.muted} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Alerts Yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.muted }]}>Create an alert to get notified about new jobs</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = {
  container: { flex: 1, padding: 16, gap: 16 },
  header: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const },
  title: { fontSize: 20, fontWeight: "700" as const },
  infoText: { fontSize: 13, lineHeight: 18 },
  alertsList: { gap: 12 },
  alertCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  alertHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "flex-start" as const },
  alertCategory: { fontSize: 15, fontWeight: "600" as const },
  alertPostcode: { fontSize: 12, marginTop: 4 },
  alertBudget: { fontSize: 12, marginTop: 2 },
  deleteBtn: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6, paddingVertical: 6 },
  deleteText: { fontSize: 12, fontWeight: "500" as const },
  formContainer: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 14 },
  formTitle: { fontSize: 16, fontWeight: "600" as const },
  formGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: "500" as const },
  input: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  budgetRow: { flexDirection: "row" as const, gap: 8 },
  formButtons: { flexDirection: "row" as const, gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" as const },
  cancelText: { fontSize: 14, fontWeight: "600" as const },
  submitBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" as const },
  submitText: { fontSize: 14, fontWeight: "600" as const, color: "#fff" },
  createBtn: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 8, paddingVertical: 14, borderRadius: 8 },
  createBtnText: { fontSize: 15, fontWeight: "600" as const, color: "#fff" },
  emptyState: { flex: 1, alignItems: "center" as const, justifyContent: "center" as const, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "600" as const },
  emptyDesc: { fontSize: 13, textAlign: "center" as const },
};
