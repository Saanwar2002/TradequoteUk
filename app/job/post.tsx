import { ScrollView, Text, View, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

type Step = "category" | "details" | "budget" | "timing" | "confirm";

const TRADE_CATEGORIES = [
  { id: 1, name: "Plumbing", icon: "drop.fill" as const },
  { id: 2, name: "Electrical", icon: "bolt.fill" as const },
  { id: 3, name: "Gas & Heating", icon: "flame.fill" as const },
  { id: 4, name: "Building & Construction", icon: "hammer.fill" as const },
  { id: 5, name: "Painting & Decorating", icon: "paintbrush.fill" as const },
  { id: 6, name: "Carpentry & Joinery", icon: "wrench.fill" as const },
  { id: 7, name: "Roofing", icon: "house.fill" as const },
  { id: 8, name: "Landscaping & Gardening", icon: "leaf.fill" as const },
  { id: 9, name: "Cleaning", icon: "sparkles" as const },
  { id: 10, name: "Solar & Renewables", icon: "sun.max.fill" as const },
  { id: 11, name: "Bathroom Fitting", icon: "drop.fill" as const },
  { id: 12, name: "Kitchen Fitting", icon: "house.fill" as const },
];

const URGENCY_OPTIONS = [
  { value: "normal" as const, label: "Normal", desc: "Within a few weeks", icon: "clock.fill" as const },
  { value: "urgent" as const, label: "Urgent", desc: "Within a week", icon: "exclamationmark.circle.fill" as const },
  { value: "emergency" as const, label: "Emergency", desc: "Today / ASAP", icon: "flame.fill" as const },
];

export default function PostJobScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ emergency?: string }>();

  const [step, setStep] = useState<Step>("category");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postcode, setPostcode] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent" | "emergency">("normal");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [budgetNotSure, setBudgetNotSure] = useState(false);
  const [preferredDate, setPreferredDate] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [wantBoost, setWantBoost] = useState(false);
  const [error, setError] = useState("");
  const [aiEstimate, setAiEstimate] = useState<{ minPrice: number; maxPrice: number; reasoning: string } | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  // If emergency param is set, set urgency to emergency
  useEffect(() => {
    if (params.emergency === "true") {
      setUrgency("emergency");
      setIsEmergency(true);
    }
  }, [params.emergency]);

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: "/job/[id]", params: { id: data.jobId } } as any);
    },
    onError: (e) => setError(e.message),
  });

  const getEstimate = trpc.jobs.estimate.useQuery(
    { title, description, category: selectedCategory?.name || "" },
    { enabled: false }
  );

  const handleGetEstimate = async () => {
    if (!title.trim() || !description.trim() || !selectedCategory) return;
    setIsEstimating(true);
    try {
      const result = await getEstimate.refetch();
      if (result.data) {
        setAiEstimate(result.data);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (err) {
      console.error("Estimation failed", err);
    } finally {
      setIsEstimating(false);
    }
  };

  const selectedCategory = TRADE_CATEGORIES.find(c => c.id === categoryId);

  const steps: Step[] = ["category", "details", "budget", "timing", "confirm"];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const goNext = () => {
    setError("");
    if (step === "category") {
      if (!categoryId) { setError("Please select a trade category"); return; }
      setStep("details");
    } else if (step === "details") {
      if (!title.trim() || title.trim().length < 5) { setError("Please enter a descriptive title (min 5 chars)"); return; }
      if (!description.trim() || description.trim().length < 10) { setError("Please describe the work needed (min 10 chars)"); return; }
      if (!postcode.trim()) { setError("Please enter your postcode"); return; }
      handleGetEstimate();
      setStep("budget");
    } else if (step === "budget") {
      setStep("timing");
    } else if (step === "timing") {
      setStep("confirm");
    } else if (step === "confirm") {
      createJob.mutate({
        tradeCategoryId: categoryId!,
        title: title.trim(),
        description: description.trim(),
        postcode: postcode.trim().toUpperCase(),
        urgency,
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        budgetNotSure,
        preferredStartDate: preferredDate || undefined,
        isEmergency: urgency === "emergency",
        isBoosted: wantBoost && urgency === "emergency",
      });
    }
  };

  const goBack = () => {
    if (step === "details") setStep("category");
    else if (step === "budget") setStep("details");
    else if (step === "timing") setStep("budget");
    else if (step === "confirm") setStep("timing");
    else router.back();
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={goBack}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Post a Job</Text>
        <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
          <IconSymbol name="xmark" size={20} color={colors.muted} />
        </Pressable>
      </View>

      {/* Progress */}
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.content}>
            {/* Step: Category */}
            {step === "category" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>What type of work?</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Select the trade category that best fits your job</Text>
                <View style={styles.categoryGrid}>
                  {TRADE_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.id}
                      style={({ pressed }) => [
                        styles.categoryCard,
                        { borderColor: categoryId === cat.id ? colors.primary : colors.border, backgroundColor: categoryId === cat.id ? colors.primary + "10" : colors.surface, opacity: pressed ? 0.8 : 1 },
                      ]}
                      onPress={() => { setCategoryId(cat.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    >
                      <IconSymbol name={cat.icon} size={24} color={categoryId === cat.id ? colors.primary : colors.muted} />
                      <Text style={[styles.categoryName, { color: categoryId === cat.id ? colors.primary : colors.foreground }]}>{cat.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Step: Details */}
            {step === "details" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Describe the job</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Give tradespeople enough detail to quote accurately</Text>
                <View style={styles.form}>
                  <View>
                    <Text style={[styles.label, { color: colors.foreground }]}>Job Title *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="e.g. Fix leaking kitchen tap"
                      placeholderTextColor={colors.muted}
                      value={title}
                      onChangeText={setTitle}
                      returnKeyType="next"
                    />
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.foreground }]}>Description *</Text>
                    <TextInput
                      style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="Describe the problem in detail. Include any relevant measurements, access issues, or specific requirements..."
                      placeholderTextColor={colors.muted}
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      numberOfLines={5}
                      textAlignVertical="top"
                    />
                    <Text style={[styles.charCount, { color: colors.muted }]}>{description.length} chars (min 10)</Text>
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.foreground }]}>Postcode *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="SW1A 1AA"
                      placeholderTextColor={colors.muted}
                      value={postcode}
                      onChangeText={setPostcode}
                      autoCapitalize="characters"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Step: Budget */}
            {step === "budget" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>What's your budget?</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Setting a budget helps tradespeople quote accurately</Text>
                
                {/* AI Estimate Card */}
                {(isEstimating || aiEstimate) && (
                  <View style={[styles.aiCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "30" }]}>
                    <View style={styles.aiHeader}>
                      <IconSymbol name="sparkles" size={18} color={colors.primary} />
                      <Text style={[styles.aiTitle, { color: colors.primary }]}>AI Price Estimate</Text>
                    </View>
                    {isEstimating ? (
                      <Text style={[styles.aiLoading, { color: colors.muted }]}>Analyzing job details...</Text>
                    ) : aiEstimate ? (
                      <View>
                        <Text style={[styles.aiPrice, { color: colors.foreground }]}>£{aiEstimate.minPrice} - £{aiEstimate.maxPrice}</Text>
                        <Text style={[styles.aiReasoning, { color: colors.muted }]}>{aiEstimate.reasoning}</Text>
                        <Pressable 
                          style={styles.applyAiBtn}
                          onPress={() => {
                            setBudgetMin(aiEstimate.minPrice.toString());
                            setBudgetMax(aiEstimate.maxPrice.toString());
                            setBudgetNotSure(false);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                        >
                          <Text style={[styles.applyAiText, { color: colors.primary }]}>Apply these values</Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                )}

                <View style={styles.form}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.notSureBtn,
                      { borderColor: budgetNotSure ? colors.primary : colors.border, backgroundColor: budgetNotSure ? colors.primary + "10" : colors.surface, opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={() => setBudgetNotSure(!budgetNotSure)}
                  >
                    <IconSymbol name={budgetNotSure ? "checkmark.square.fill" : "square"} size={20} color={budgetNotSure ? colors.primary : colors.muted} />
                    <Text style={[styles.notSureText, { color: colors.foreground }]}>I'm not sure about the budget</Text>
                  </Pressable>
                  {!budgetNotSure && (
                    <View style={styles.budgetRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.foreground }]}>Min Budget (£)</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                          placeholder="100"
                          placeholderTextColor={colors.muted}
                          value={budgetMin}
                          onChangeText={setBudgetMin}
                          keyboardType="decimal-pad"
                          returnKeyType="next"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.label, { color: colors.foreground }]}>Max Budget (£)</Text>
                        <TextInput
                          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                          placeholder="500"
                          placeholderTextColor={colors.muted}
                          value={budgetMax}
                          onChangeText={setBudgetMax}
                          keyboardType="decimal-pad"
                          returnKeyType="done"
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Step: Timing */}
            {step === "timing" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>When do you need it?</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Let tradespeople know your timeline</Text>
                <View style={styles.urgencyList}>
                  {URGENCY_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={({ pressed }) => [
                        styles.urgencyCard,
                        { borderColor: urgency === opt.value ? (opt.value === "emergency" ? "#DC2626" : colors.primary) : colors.border, backgroundColor: urgency === opt.value ? (opt.value === "emergency" ? "#DC262610" : colors.primary + "10") : colors.surface, opacity: pressed ? 0.8 : 1 },
                      ]}
                      onPress={() => { setUrgency(opt.value); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    >
                      <View style={[styles.urgencyIcon, { backgroundColor: opt.value === "emergency" ? "#DC262620" : colors.primary + "20" }]}>
                        <IconSymbol name={opt.icon} size={22} color={opt.value === "emergency" ? "#DC2626" : colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.urgencyLabel, { color: colors.foreground }]}>{opt.label}</Text>
                        <Text style={[styles.urgencyDesc, { color: colors.muted }]}>{opt.desc}</Text>
                      </View>
                      {urgency === opt.value && (
                        <IconSymbol name="checkmark.circle.fill" size={22} color={opt.value === "emergency" ? "#DC2626" : colors.primary} />
                      )}
                    </Pressable>
                  ))}
                </View>
                <View>
                  <Text style={[styles.label, { color: colors.foreground }]}>Preferred Start Date (optional)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="e.g. 15 April 2026"
                    placeholderTextColor={colors.muted}
                    value={preferredDate}
                    onChangeText={setPreferredDate}
                    returnKeyType="done"
                  />
                </View>
              </View>
            )}

            {/* Step: Confirm */}
            {step === "confirm" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review your job</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Check the details before posting</Text>
                <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <SummaryRow label="Category" value={selectedCategory?.name ?? ""} colors={colors} />
                  <SummaryRow label="Title" value={title} colors={colors} />
                  <SummaryRow label="Location" value={postcode.toUpperCase()} colors={colors} />
                  <SummaryRow label="Urgency" value={urgency.charAt(0).toUpperCase() + urgency.slice(1)} colors={colors} />
                  <SummaryRow
                    label="Budget"
                    value={budgetNotSure ? "Not sure" : (budgetMin || budgetMax) ? `£${budgetMin || "?"} – £${budgetMax || "?"}` : "Not specified"}
                    colors={colors}
                  />
                  {preferredDate && <SummaryRow label="Start Date" value={preferredDate} colors={colors} />}
                </View>
                {urgency === "emergency" && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.boostCard,
                      { borderColor: wantBoost ? colors.primary : colors.border, backgroundColor: wantBoost ? colors.primary + "10" : colors.surface, opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={() => { setWantBoost(!wantBoost); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <IconSymbol name="bolt.fill" size={18} color="#F59E0B" />
                        <Text style={[styles.boostTitle, { color: colors.foreground }]}>Boost this job</Text>
                        <Text style={[styles.boostPrice, { color: colors.primary }]}>£3</Text>
                      </View>
                      <Text style={[styles.boostDesc, { color: colors.muted }]}>Get to the top of the list for 24 hours</Text>
                    </View>
                    <IconSymbol name={wantBoost ? "checkmark.square.fill" : "square"} size={20} color={wantBoost ? colors.primary : colors.muted} />
                  </Pressable>
                )}
                <View style={[styles.infoBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                  <IconSymbol name="info.circle.fill" size={16} color={colors.primary} />
                  <Text style={[styles.infoText, { color: colors.foreground }]}>
                    Your job will be visible to verified tradespeople in your area. You'll receive quotes within hours.
                  </Text>
                </View>
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

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { borderTopColor: colors.border }]}>
        <Pressable
          style={({ pressed }) => [styles.continueBtn, { backgroundColor: colors.primary, opacity: pressed || createJob.isPending ? 0.85 : 1 }]}
          onPress={goNext}
          disabled={createJob.isPending}
        >
          <Text style={styles.continueBtnText}>
            {createJob.isPending ? "Posting..." : step === "confirm" ? "Post Job" : "Continue"}
          </Text>
          {!createJob.isPending && <IconSymbol name="chevron.right" size={18} color="#fff" />}
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function SummaryRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.summaryLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  progressBar: { height: 3 },
  progressFill: { height: 3 },
  content: { padding: 20, gap: 16 },
  stepContent: { gap: 16 },
  stepTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  stepDesc: { fontSize: 15, lineHeight: 22 },
  aiCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 24 },
  aiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  aiTitle: { fontSize: 14, fontWeight: "700", marginLeft: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  aiLoading: { fontSize: 14, fontStyle: "italic" },
  aiPrice: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  aiReasoning: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  applyAiBtn: { alignSelf: "flex-start" },
  applyAiText: { fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryCard: { width: "47%", borderRadius: 14, borderWidth: 1.5, padding: 14, alignItems: "center", gap: 8 },
  categoryName: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  form: { gap: 16 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { height: 120, paddingTop: 12 },
  charCount: { fontSize: 11, marginTop: 4, textAlign: "right" },
  notSureBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1.5, padding: 14 },
  notSureText: { fontSize: 15 },
  budgetRow: { flexDirection: "row", gap: 12 },
  urgencyList: { gap: 10 },
  urgencyCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  urgencyIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  urgencyLabel: { fontSize: 16, fontWeight: "700" },
  urgencyDesc: { fontSize: 13, marginTop: 2 },
  summaryCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 14, fontWeight: "600", flex: 1, textAlign: "right" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, padding: 12, borderWidth: 1 },
  infoText: { fontSize: 13, flex: 1, lineHeight: 18 },
  boostCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  boostTitle: { fontSize: 15, fontWeight: "700" },
  boostPrice: { fontSize: 14, fontWeight: "700" },
  boostDesc: { fontSize: 12, marginTop: 2 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 12, borderWidth: 1 },
  errorText: { fontSize: 13, flex: 1 },
  bottomCta: { padding: 16, borderTopWidth: 0.5 },
  continueBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  continueBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
