import { ScrollView, Text, View, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

type Step = "category" | "details" | "media" | "budget" | "timing" | "confirm";

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
  { id: 13, name: "Home Appliance Repair", icon: "washer.fill" as const },
  { id: 14, name: "Handyman Services", icon: "wrench.and.screwdriver.fill" as const },
  { id: 15, name: "Smart Home & Security", icon: "lock.shield.fill" as const },
  { id: 16, name: "EV Charger Installation", icon: "bolt.car.fill" as const },
  { id: 17, name: "Pest Control", icon: "ant.fill" as const },
  { id: 18, name: "Locksmith Services", icon: "key.fill" as const },
  { id: 19, name: "Waste Removal", icon: "trash.fill" as const },
  { id: 20, name: "Window & Door Fitting", icon: "door.left.hand.closed" as const },
  { id: 21, name: "Flooring & Tiling", icon: "square.grid.3x3.fill" as const },
  { id: 22, name: "Fencing & Decking", icon: "fence.fill" as const },
  { id: 23, name: "Handyman Work", icon: "wrench.and.screwdriver.fill" as const },
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
  
  // Media state
  const [mediaItems, setMediaItems] = useState<{ url: string; type: "photo" | "video"; thumbnailUrl?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // If emergency param is set, set urgency to emergency
  useEffect(() => {
    if (params.emergency === "true") {
      setUrgency("emergency");
      setIsEmergency(true);
    }
  }, [params.emergency]);

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: async (data) => {
      // After job creation, add media if any
      if (mediaItems.length > 0) {
        for (const item of mediaItems) {
          await addMedia.mutateAsync({
            jobId: data.jobId,
            type: item.type,
            url: item.url,
            thumbnailUrl: item.thumbnailUrl,
          });
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({ pathname: "/job/[id]", params: { id: data.jobId } } as any);
    },
    onError: (e) => setError(e.message),
  });

  const addMedia = trpc.jobs.addMedia.useMutation();

  const selectedCategory = TRADE_CATEGORIES.find(c => c.id === categoryId);

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

  const steps: Step[] = ["category", "details", "media", "budget", "timing", "confirm"];
  const stepIndex = steps.indexOf(step);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const handleAddMockMedia = (type: "photo" | "video") => {
    setIsUploading(true);
    // Simulate upload delay
    setTimeout(() => {
      const newMedia = type === "photo" 
        ? { url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500", type: "photo" as const }
        : { url: "https://www.w3schools.com/html/mov_bbb.mp4", type: "video" as const, thumbnailUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500" };
      
      setMediaItems([...mediaItems, newMedia]);
      setIsUploading(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 1000);
  };

  const removeMedia = (index: number) => {
    const newMedia = [...mediaItems];
    newMedia.splice(index, 1);
    setMediaItems(newMedia);
  };

  const goNext = () => {
    setError("");
    if (step === "category") {
      if (!categoryId) { setError("Please select a trade category"); return; }
      setStep("details");
    } else if (step === "details") {
      if (!title.trim() || title.trim().length < 5) { setError("Please enter a descriptive title (min 5 chars)"); return; }
      if (!description.trim() || description.trim().length < 10) { setError("Please describe the work needed (min 10 chars)"); return; }
      if (!postcode.trim()) { setError("Please enter your postcode"); return; }
      setStep("media");
    } else if (step === "media") {
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
    else if (step === "media") setStep("details");
    else if (step === "budget") setStep("media");
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
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.foreground }]}>Postcode *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="e.g. SW1A 1AA"
                      placeholderTextColor={colors.muted}
                      value={postcode}
                      onChangeText={setPostcode}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Step: Media (NEW) */}
            {step === "media" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Add photos or video</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Visuals help tradespeople give you much more accurate quotes</Text>
                
                <View style={styles.mediaGrid}>
                  {mediaItems.map((item, index) => (
                    <View key={index} style={[styles.mediaItem, { borderColor: colors.border }]}>
                      <Image source={{ uri: item.thumbnailUrl || item.url }} style={styles.mediaPreview} />
                      {item.type === "video" && (
                        <View style={styles.videoOverlay}>
                          <IconSymbol name="play.fill" size={20} color="#fff" />
                        </View>
                      )}
                      <Pressable style={styles.removeMediaBtn} onPress={() => removeMedia(index)}>
                        <IconSymbol name="xmark.circle.fill" size={20} color="#DC2626" />
                      </Pressable>
                    </View>
                  ))}
                  
                  {mediaItems.length < 6 && (
                    <View style={styles.mediaUploadRow}>
                      <Pressable 
                        style={[styles.uploadBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => handleAddMockMedia("photo")}
                        disabled={isUploading}
                      >
                        {isUploading ? <ActivityIndicator size="small" color={colors.primary} /> : (
                          <>
                            <IconSymbol name="camera.fill" size={24} color={colors.primary} />
                            <Text style={[styles.uploadBtnText, { color: colors.foreground }]}>Add Photo</Text>
                          </>
                        )}
                      </Pressable>
                      <Pressable 
                        style={[styles.uploadBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => handleAddMockMedia("video")}
                        disabled={isUploading}
                      >
                        {isUploading ? <ActivityIndicator size="small" color={colors.primary} /> : (
                          <>
                            <IconSymbol name="video.fill" size={24} color={colors.primary} />
                            <Text style={[styles.uploadBtnText, { color: colors.foreground }]}>Add Video</Text>
                          </>
                        )}
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Step: Budget */}
            {step === "budget" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>What's your budget?</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Set a range or use our AI estimate as a guide</Text>
                
                {aiEstimate && (
                  <View style={[styles.aiEstimateCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                    <View style={styles.aiEstimateHeader}>
                      <IconSymbol name="sparkles" size={16} color={colors.primary} />
                      <Text style={[styles.aiEstimateTitle, { color: colors.primary }]}>AI Price Estimate</Text>
                    </View>
                    <Text style={[styles.aiEstimatePrice, { color: colors.foreground }]}>£{aiEstimate.minPrice} - £{aiEstimate.maxPrice}</Text>
                    <Text style={[styles.aiEstimateReason, { color: colors.muted }]}>{aiEstimate.reasoning}</Text>
                    <Pressable 
                      style={styles.useEstimateBtn}
                      onPress={() => {
                        setBudgetMin(aiEstimate.minPrice.toString());
                        setBudgetMax(aiEstimate.maxPrice.toString());
                        setBudgetNotSure(false);
                      }}
                    >
                      <Text style={[styles.useEstimateText, { color: colors.primary }]}>Use these amounts</Text>
                    </Pressable>
                  </View>
                )}

                <View style={styles.budgetInputs}>
                  <View style={styles.budgetField}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Min (£)</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="0"
                      value={budgetMin}
                      onChangeText={setBudgetMin}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.budgetField}>
                    <Text style={[styles.label, { color: colors.foreground }]}>Max (£)</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="1000"
                      value={budgetMax}
                      onChangeText={setBudgetMax}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                
                <Pressable 
                  style={styles.checkboxRow}
                  onPress={() => setBudgetNotSure(!budgetNotSure)}
                >
                  <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: budgetNotSure ? colors.primary : "transparent" }]}>
                    {budgetNotSure && <IconSymbol name="checkmark" size={12} color="#fff" />}
                  </View>
                  <Text style={[styles.checkboxLabel, { color: colors.foreground }]}>I'm not sure about the budget</Text>
                </Pressable>
              </View>
            )}

            {/* Step: Timing */}
            {step === "timing" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>When do you need it?</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Select the urgency level for your project</Text>
                
                <View style={styles.urgencyGrid}>
                  {URGENCY_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={[
                        styles.urgencyCard,
                        { borderColor: urgency === opt.value ? colors.primary : colors.border, backgroundColor: urgency === opt.value ? colors.primary + "10" : colors.surface }
                      ]}
                      onPress={() => setUrgency(opt.value)}
                    >
                      <IconSymbol name={opt.icon} size={24} color={urgency === opt.value ? colors.primary : colors.muted} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.urgencyLabel, { color: colors.foreground }]}>{opt.label}</Text>
                        <Text style={[styles.urgencyDesc, { color: colors.muted }]}>{opt.desc}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Step: Confirm */}
            {step === "confirm" && (
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Review & Post</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Double check everything before posting your job</Text>
                
                <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.reviewItem}>
                    <Text style={[styles.reviewLabel, { color: colors.muted }]}>Category</Text>
                    <Text style={[styles.reviewValue, { color: colors.foreground }]}>{selectedCategory?.name}</Text>
                  </View>
                  <View style={styles.reviewItem}>
                    <Text style={[styles.reviewLabel, { color: colors.muted }]}>Title</Text>
                    <Text style={[styles.reviewValue, { color: colors.foreground }]}>{title}</Text>
                  </View>
                  <View style={styles.reviewItem}>
                    <Text style={[styles.reviewLabel, { color: colors.muted }]}>Budget</Text>
                    <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                      {budgetNotSure ? "Not sure" : `£${budgetMin || 0} - £${budgetMax || "Any"}`}
                    </Text>
                  </View>
                  <View style={styles.reviewItem}>
                    <Text style={[styles.reviewLabel, { color: colors.muted }]}>Urgency</Text>
                    <Text style={[styles.reviewValue, { color: colors.foreground }]}>{urgency.toUpperCase()}</Text>
                  </View>
                  {mediaItems.length > 0 && (
                    <View style={styles.reviewItem}>
                      <Text style={[styles.reviewLabel, { color: colors.muted }]}>Media</Text>
                      <Text style={[styles.reviewValue, { color: colors.foreground }]}>{mediaItems.length} items attached</Text>
                    </View>
                  )}
                </View>

                {urgency === "emergency" && (
                  <View style={[styles.boostCard, { backgroundColor: colors.warning + "10", borderColor: colors.warning + "30" }]}>
                    <View style={styles.boostHeader}>
                      <IconSymbol name="bolt.fill" size={16} color={colors.warning} />
                      <Text style={[styles.boostTitle, { color: colors.warning }]}>Emergency Boost</Text>
                    </View>
                    <Text style={[styles.boostDesc, { color: colors.muted }]}>Boost your job to get faster responses from nearby tradespeople.</Text>
                    <Pressable 
                      style={styles.checkboxRow}
                      onPress={() => setWantBoost(!wantBoost)}
                    >
                      <View style={[styles.checkbox, { borderColor: colors.warning, backgroundColor: wantBoost ? colors.warning : "transparent" }]}>
                        {wantBoost && <IconSymbol name="checkmark" size={12} color="#fff" />}
                      </View>
                      <Text style={[styles.checkboxLabel, { color: colors.foreground }]}>Boost my job for £4.99</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <Pressable
            style={({ pressed }) => [
              styles.nextBtn,
              { backgroundColor: colors.primary, opacity: pressed || createJob.isLoading ? 0.8 : 1 }
            ]}
            onPress={goNext}
            disabled={createJob.isLoading}
          >
            {createJob.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.nextBtnText}>{step === "confirm" ? "Post Job Now" : "Continue"}</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  progressBar: { height: 4, flexDirection: "row" },
  progressFill: { height: "100%" },
  content: { flex: 1, padding: 20 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  stepDesc: { fontSize: 16, marginBottom: 24 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryCard: { width: "48%", padding: 16, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 8 },
  categoryName: { fontSize: 13, fontWeight: "600", textAlign: "center" },
  form: { gap: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: { height: 50, borderWidth: 1, borderRadius: 10, paddingHorizontal: 16, fontSize: 16 },
  textArea: { height: 120, paddingTop: 12 },
  mediaGrid: { gap: 16 },
  mediaItem: { width: 100, height: 100, borderRadius: 12, borderWidth: 1, overflow: "hidden", position: "relative" },
  mediaPreview: { width: "100%", height: "100%" },
  removeMediaBtn: { position: "absolute", top: 4, right: 4, backgroundColor: "#fff", borderRadius: 10 },
  videoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },
  mediaUploadRow: { flexDirection: "row", gap: 12 },
  uploadBtn: { flex: 1, height: 100, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 8 },
  uploadBtnText: { fontSize: 12, fontWeight: "600" },
  aiEstimateCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  aiEstimateHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  aiEstimateTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  aiEstimatePrice: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  aiEstimateReason: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  useEstimateBtn: { alignSelf: "flex-start" },
  useEstimateText: { fontSize: 14, fontWeight: "700" },
  budgetInputs: { flexDirection: "row", gap: 16, marginBottom: 16 },
  budgetField: { flex: 1 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  checkboxLabel: { fontSize: 14, fontWeight: "500" },
  urgencyGrid: { gap: 12 },
  urgencyCard: { flexDirection: "row", padding: 16, borderRadius: 12, borderWidth: 1, alignItems: "center", gap: 16 },
  urgencyLabel: { fontSize: 16, fontWeight: "700" },
  urgencyDesc: { fontSize: 13 },
  reviewCard: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
  reviewItem: { gap: 4 },
  reviewLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  reviewValue: { fontSize: 16, fontWeight: "500" },
  boostCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 20 },
  boostHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  boostTitle: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  boostDesc: { fontSize: 13, marginBottom: 12 },
  errorText: { color: "#DC2626", fontSize: 14, fontWeight: "600", marginTop: 12, textAlign: "center" },
  footer: { padding: 20, paddingBottom: Platform.OS === "ios" ? 40 : 20, borderTopWidth: 1 },
  nextBtn: { height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  nextBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
