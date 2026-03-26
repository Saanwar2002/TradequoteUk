import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, FlatList, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function AvailabilityScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: slots, refetch } = trpc.availability.list.useQuery({ tradespersonId: user?.id ?? 0 }, { enabled: !!user });
  const addSlot = trpc.availability.add.useMutation({ onSuccess: () => { refetch(); setSelectedDate(""); setStartTime(""); setEndTime(""); setShowForm(false); } });
  const removeSlot = trpc.availability.remove.useMutation({ onSuccess: () => refetch() });

  const handleAddSlot = async () => {
    if (!selectedDate || !startTime || !endTime) {
      alert("Please fill in all fields");
      return;
    }
    await addSlot.mutateAsync({ date: selectedDate, startTime, endTime });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRemoveSlot = async (slotId: number) => {
    await removeSlot.mutateAsync({ slotId });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  };

  if (!user) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center px-6">
        <IconSymbol name="calendar" size={48} color={colors.muted} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sign in to manage availability</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Availability</Text>
        <Pressable
          style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => setShowForm(!showForm)}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Info Box */}
      <View style={[styles.infoBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
        <IconSymbol name="info.circle.fill" size={16} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.foreground }]}>
          Set your available dates and times so homeowners can see when you can start work.
        </Text>
      </View>

      {/* Add Slot Form */}
      {showForm && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>Add Available Slot</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                placeholder="2026-04-15"
                placeholderTextColor={colors.muted}
                value={selectedDate}
                onChangeText={setSelectedDate}
                returnKeyType="next"
              />
            </View>

            <View style={styles.timeRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.foreground }]}>Start Time</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="09:00"
                  placeholderTextColor={colors.muted}
                  value={startTime}
                  onChangeText={setStartTime}
                  returnKeyType="next"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.label, { color: colors.foreground }]}>End Time</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="17:00"
                  placeholderTextColor={colors.muted}
                  value={endTime}
                  onChangeText={setEndTime}
                  returnKeyType="done"
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.primary, opacity: pressed || addSlot.isPending ? 0.85 : 1 }]}
              onPress={handleAddSlot}
              disabled={addSlot.isPending}
            >
              <Text style={styles.submitBtnText}>{addSlot.isPending ? "Adding..." : "Add Slot"}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Slots List */}
      <FlatList
        data={slots ?? []}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, (slots?.length ?? 0) === 0 && styles.emptyList]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconSymbol name="calendar" size={48} color={colors.muted} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No availability set</Text>
            <Text style={[styles.emptyDesc, { color: colors.muted }]}>Add your first available slot to get started</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.slotCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <IconSymbol name="calendar" size={16} color={colors.primary} />
                <Text style={[styles.slotDate, { color: colors.foreground }]}>{formatDate(item.date)}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <IconSymbol name="clock.fill" size={14} color={colors.muted} />
                <Text style={[styles.slotTime, { color: colors.muted }]}>{item.startTime} – {item.endTime}</Text>
              </View>
              {item.isBooked && (
                <View style={[styles.bookedBadge, { backgroundColor: colors.success + "20" }]}>
                  <IconSymbol name="checkmark.circle.fill" size={12} color={colors.success} />
                  <Text style={[styles.bookedText, { color: colors.success }]}>Booked</Text>
                </View>
              )}
            </View>
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              onPress={() => handleRemoveSlot(item.id)}
              disabled={removeSlot.isPending}
            >
              <IconSymbol name="xmark.circle.fill" size={22} color={colors.error} />
            </Pressable>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, margin: 12, borderRadius: 12, padding: 12, borderWidth: 1 },
  infoText: { fontSize: 13, flex: 1, lineHeight: 18 },
  formCard: { margin: 12, borderRadius: 14, padding: 16, borderWidth: 1, gap: 12 },
  formTitle: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  formGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  timeRow: { flexDirection: "row", gap: 8 },
  submitBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center", marginTop: 4 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  list: { padding: 12, gap: 10 },
  emptyList: { flex: 1, justifyContent: "center" },
  emptyState: { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center", lineHeight: 20, paddingHorizontal: 20 },
  slotCard: { borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  slotDate: { fontSize: 16, fontWeight: "700" },
  slotTime: { fontSize: 13 },
  bookedBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 6 },
  bookedText: { fontSize: 11, fontWeight: "600" },
});
