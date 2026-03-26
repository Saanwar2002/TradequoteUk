import { ScrollView, Text, View, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function SubmitQuoteScreen() {
  const colors = useColors();
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [price, setPrice] = useState("");
  const [timelineText, setTimelineText] = useState("");
  const [message, setMessage] = useState("");
  const [isBoosted, setIsBoosted] = useState(false);
  const [error, setError] = useState("");

  const { data: job } = trpc.jobs.get.useQuery({ id: parseInt(jobId) }, { enabled: !!jobId });
  const utils = trpc.useUtils();

  const submitQuote = trpc.quotes.submit.useMutation({
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      utils.quotes.byJob.invalidate({ jobId: parseInt(jobId) });
      utils.quotes.myQuotes.invalidate();
      router.back();
    },
    onError: (e) => setError(e.message),
  });

  const handleSubmit = () => {
    setError("");
    if (!price || parseFloat(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }
    submitQuote.mutate({
      jobId: parseInt(jobId),
      priceGbp: parseFloat(price),
      timelineText: timelineText.trim() || undefined,
      message: message.trim() || undefined,
      isBoosted,
    });
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Submit Quote</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.content}>
            {/* Job Summary */}
            {job && (
              <View style={[styles.jobSummary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.jobSummaryLabel, { color: colors.muted }]}>Quoting for:</Text>
                <Text style={[styles.jobSummaryTitle, { color: colors.foreground }]}>{job.title}</Text>
                <View style={styles.metaRow}>
                  <IconSymbol name="location.fill" size={12} color={colors.muted} />
                  <Text style={[styles.metaText, { color: colors.muted }]}>{job.postcode}</Text>
                  {(job.budgetMin || job.budgetMax) && (
                    <>
                      <Text style={[{ color: colors.muted }]}>·</Text>
                      <Text style={[styles.metaText, { color: colors.muted }]}>Budget: £{job.budgetMin ?? "?"} – £{job.budgetMax ?? "?"}</Text>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Price */}
            <View>
              <Text style={[styles.label, { color: colors.foreground }]}>Your Price (£) *</Text>
              <View style={[styles.priceInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.poundSign, { color: colors.foreground }]}>£</Text>
                <TextInput
                  style={[styles.priceInput, { color: colors.foreground }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  returnKeyType="next"
                />
              </View>
              <Text style={[styles.hint, { color: colors.muted }]}>Enter your total price including VAT (if applicable)</Text>
            </View>

            {/* Timeline */}
            <View>
              <Text style={[styles.label, { color: colors.foreground }]}>Timeline</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="e.g. 1-2 days, 1 week, 3-4 hours"
                placeholderTextColor={colors.muted}
                value={timelineText}
                onChangeText={setTimelineText}
                returnKeyType="next"
              />
            </View>

            {/* Message */}
            <View>
              <Text style={[styles.label, { color: colors.foreground }]}>Message to Homeowner</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Introduce yourself, explain your approach, mention relevant experience..."
                placeholderTextColor={colors.muted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Boost Option */}
            <Pressable
              style={({ pressed }) => [
                styles.boostCard,
                { borderColor: isBoosted ? colors.warning : colors.border, backgroundColor: isBoosted ? colors.warning + "10" : colors.surface, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => { setIsBoosted(!isBoosted); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <View style={[styles.boostIcon, { backgroundColor: isBoosted ? colors.warning + "20" : colors.muted + "20" }]}>
                <IconSymbol name="bolt.fill" size={22} color={isBoosted ? colors.warning : colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.boostTitle, { color: colors.foreground }]}>⚡ Boost this Quote — £3.00</Text>
                <Text style={[styles.boostDesc, { color: colors.muted }]}>
                  Featured at the top of the quotes list. Increases your chance of winning by 3×.
                </Text>
              </View>
              <IconSymbol name={isBoosted ? "checkmark.circle.fill" : "circle"} size={22} color={isBoosted ? colors.warning : colors.muted} />
            </Pressable>

            {/* Total */}
            {price && (
              <View style={[styles.totalCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                <Text style={[styles.totalLabel, { color: colors.muted }]}>Your Quote Total</Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>£{parseFloat(price || "0").toFixed(2)}</Text>
                {isBoosted && (
                  <Text style={[styles.totalBoost, { color: colors.muted }]}>+ £3.00 boost fee</Text>
                )}
              </View>
            )}

            {/* Error */}
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.error + "15", borderColor: colors.error + "30" }]}>
                <IconSymbol name="exclamationmark.circle.fill" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit Button */}
      <View style={[styles.bottomCta, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.primary, opacity: pressed || submitQuote.isPending ? 0.85 : 1 }]}
          onPress={handleSubmit}
          disabled={submitQuote.isPending}
        >
          <Text style={styles.submitBtnText}>
            {submitQuote.isPending ? "Submitting..." : "Submit Quote"}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  content: { padding: 20, gap: 20 },
  jobSummary: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 6 },
  jobSummaryLabel: { fontSize: 12, fontWeight: "600" },
  jobSummaryTitle: { fontSize: 16, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { height: 120, paddingTop: 12 },
  priceInputContainer: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingHorizontal: 14 },
  poundSign: { fontSize: 22, fontWeight: "700", marginRight: 4 },
  priceInput: { flex: 1, fontSize: 28, fontWeight: "700", paddingVertical: 12 },
  hint: { fontSize: 12, marginTop: 6 },
  boostCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  boostIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  boostTitle: { fontSize: 15, fontWeight: "700" },
  boostDesc: { fontSize: 12, marginTop: 2, lineHeight: 18 },
  totalCard: { borderRadius: 14, padding: 16, borderWidth: 1, alignItems: "center", gap: 4 },
  totalLabel: { fontSize: 13 },
  totalValue: { fontSize: 32, fontWeight: "800" },
  totalBoost: { fontSize: 12 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 12, borderWidth: 1 },
  errorText: { fontSize: 13, flex: 1 },
  bottomCta: { padding: 16, borderTopWidth: 0.5 },
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
