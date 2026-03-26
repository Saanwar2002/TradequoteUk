import { ScrollView, Text, View, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAppContext, type AppRole } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { startOAuthLogin } from "@/constants/oauth";

type Step = "welcome" | "role" | "details" | "trade_details" | "done";

export default function OnboardingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const { setProfile } = useAppContext();

  const [step, setStep] = useState<Step>("welcome");
  const [role, setRole] = useState<AppRole>("homeowner");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [propertyType, setPropertyType] = useState<"house" | "flat" | "bungalow" | "commercial" | "other">("house");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [serviceRadius, setServiceRadius] = useState("10");
  const [error, setError] = useState("");

  const setupProfile = trpc.profile.setup.useMutation({
    onSuccess: () => {
      setStep("done");
    },
    onError: (e) => setError(e.message),
  });

  const getProfile = trpc.profile.get.useQuery(undefined, { enabled: false });

  const handleContinue = async () => {
    setError("");
    if (step === "welcome") {
      if (!user) {
        // Trigger OAuth login flow
        try {
          await startOAuthLogin();
        } catch (err) {
          setError("Failed to start login. Please try again.");
          console.error("OAuth login error:", err);
        }
        return;
      }
      setStep("role");
      return;
    }
    if (step === "role") { setStep("details"); return; }
    if (step === "details") {
      if (!firstName.trim() || !lastName.trim() || !postcode.trim()) {
        setError("Please fill in all required fields");
        return;
      }
      if (role === "tradesperson") { setStep("trade_details"); return; }
      // Submit for homeowner
      await setupProfile.mutateAsync({
        appRole: role,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        postcode: postcode.trim().toUpperCase(),
        propertyType,
        serviceRadiusMiles: 10,
      });
      return;
    }
    if (step === "trade_details") {
      await setupProfile.mutateAsync({
        appRole: "tradesperson",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        postcode: postcode.trim().toUpperCase(),
        businessName: businessName.trim() || undefined,
        bio: bio.trim() || undefined,
        yearsExperience: yearsExp ? parseInt(yearsExp) : undefined,
        serviceRadiusMiles: parseInt(serviceRadius) || 10,
      });
      return;
    }
    if (step === "done") {
      router.replace("/(tabs)" as any);
      return;
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          {/* Progress Bar */}
          {step !== "welcome" && step !== "done" && (
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${getProgress(step)}%` }]} />
            </View>
          )}

          <View style={styles.content}>
            {/* Welcome Step */}
            {step === "welcome" && (
              <View style={styles.stepContainer}>
                <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
                  <IconSymbol name="hammer.fill" size={40} color="#fff" />
                </View>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Welcome to TradeQuote UK</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>
                  The UK's trusted marketplace for connecting homeowners with verified local tradespeople.
                </Text>
                <View style={styles.benefitsList}>
                  {[
                    { icon: "checkmark.circle.fill" as const, text: "Get competitive quotes from verified tradespeople" },
                    { icon: "checkmark.circle.fill" as const, text: "Secure escrow payments — only pay when satisfied" },
                    { icon: "checkmark.circle.fill" as const, text: "Real reviews from real customers" },
                    { icon: "checkmark.circle.fill" as const, text: "Emergency call-outs available 24/7" },
                  ].map((b, i) => (
                    <View key={i} style={styles.benefitItem}>
                      <IconSymbol name={b.icon} size={20} color={colors.success} />
                      <Text style={[styles.benefitText, { color: colors.foreground }]}>{b.text}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Role Selection */}
            {step === "role" && (
              <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>I am a...</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Choose how you'll use TradeQuote UK</Text>
                <View style={styles.roleGrid}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.roleCard,
                      { borderColor: role === "homeowner" ? colors.primary : colors.border, backgroundColor: role === "homeowner" ? colors.primary + "10" : colors.surface, opacity: pressed ? 0.85 : 1 },
                    ]}
                    onPress={() => setRole("homeowner")}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: role === "homeowner" ? colors.primary : colors.muted + "20" }]}>
                      <IconSymbol name="house.fill" size={32} color={role === "homeowner" ? "#fff" : colors.muted} />
                    </View>
                    <Text style={[styles.roleTitle, { color: colors.foreground }]}>Homeowner</Text>
                    <Text style={[styles.roleDesc, { color: colors.muted }]}>I need work done on my property</Text>
                    {role === "homeowner" && (
                      <View style={[styles.roleCheck, { backgroundColor: colors.primary }]}>
                        <IconSymbol name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.roleCard,
                      { borderColor: role === "tradesperson" ? colors.primary : colors.border, backgroundColor: role === "tradesperson" ? colors.primary + "10" : colors.surface, opacity: pressed ? 0.85 : 1 },
                    ]}
                    onPress={() => setRole("tradesperson")}
                  >
                    <View style={[styles.roleIconCircle, { backgroundColor: role === "tradesperson" ? colors.primary : colors.muted + "20" }]}>
                      <IconSymbol name="wrench.fill" size={32} color={role === "tradesperson" ? "#fff" : colors.muted} />
                    </View>
                    <Text style={[styles.roleTitle, { color: colors.foreground }]}>Tradesperson</Text>
                    <Text style={[styles.roleDesc, { color: colors.muted }]}>I offer trade services to customers</Text>
                    {role === "tradesperson" && (
                      <View style={[styles.roleCheck, { backgroundColor: colors.primary }]}>
                        <IconSymbol name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {/* Personal Details */}
            {step === "details" && (
              <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Your Details</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Tell us a bit about yourself</Text>
                <View style={styles.form}>
                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: colors.foreground }]}>First Name *</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                        placeholder="John"
                        placeholderTextColor={colors.muted}
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        returnKeyType="next"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: colors.foreground }]}>Last Name *</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                        placeholder="Smith"
                        placeholderTextColor={colors.muted}
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        returnKeyType="next"
                      />
                    </View>
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.foreground }]}>Phone Number</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="07700 900000"
                      placeholderTextColor={colors.muted}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      returnKeyType="next"
                    />
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
                  {role === "homeowner" && (
                    <View>
                      <Text style={[styles.label, { color: colors.foreground }]}>Property Type</Text>
                      <View style={styles.propertyGrid}>
                        {(["house", "flat", "bungalow", "commercial", "other"] as const).map((pt) => (
                          <Pressable
                            key={pt}
                            style={({ pressed }) => [
                              styles.propertyOption,
                              { borderColor: propertyType === pt ? colors.primary : colors.border, backgroundColor: propertyType === pt ? colors.primary + "10" : colors.surface, opacity: pressed ? 0.8 : 1 },
                            ]}
                            onPress={() => setPropertyType(pt)}
                          >
                            <Text style={[styles.propertyOptionText, { color: propertyType === pt ? colors.primary : colors.foreground }]}>
                              {pt.charAt(0).toUpperCase() + pt.slice(1)}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Trade Details */}
            {step === "trade_details" && (
              <View style={styles.stepContainer}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>Your Business</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>Help customers find you</Text>
                <View style={styles.form}>
                  <View>
                    <Text style={[styles.label, { color: colors.foreground }]}>Business Name</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="Smith Plumbing Ltd"
                      placeholderTextColor={colors.muted}
                      value={businessName}
                      onChangeText={setBusinessName}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  </View>
                  <View>
                    <Text style={[styles.label, { color: colors.foreground }]}>Bio / About You</Text>
                    <TextInput
                      style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                      placeholder="Tell customers about your experience and specialities..."
                      placeholderTextColor={colors.muted}
                      value={bio}
                      onChangeText={setBio}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </View>
                  <View style={styles.formRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: colors.foreground }]}>Years Experience</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                        placeholder="5"
                        placeholderTextColor={colors.muted}
                        value={yearsExp}
                        onChangeText={setYearsExp}
                        keyboardType="number-pad"
                        returnKeyType="next"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.label, { color: colors.foreground }]}>Service Radius (miles)</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                        placeholder="10"
                        placeholderTextColor={colors.muted}
                        value={serviceRadius}
                        onChangeText={setServiceRadius}
                        keyboardType="number-pad"
                        returnKeyType="done"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Done Step */}
            {step === "done" && (
              <View style={[styles.stepContainer, { alignItems: "center" }]}>
                <View style={[styles.successCircle, { backgroundColor: colors.success + "20" }]}>
                  <IconSymbol name="checkmark.circle.fill" size={64} color={colors.success} />
                </View>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>You're all set!</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>
                  {role === "homeowner"
                    ? "Start posting jobs and receive competitive quotes from verified tradespeople."
                    : "Your profile is ready. Start browsing available jobs and submit quotes."}
                </Text>
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

          {/* Bottom CTA */}
          <View style={styles.bottomCta}>
            {step !== "welcome" && step !== "role" && step !== "done" && (
              <Pressable
                style={({ pressed }) => [styles.backBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => {
                  if (step === "details") setStep("role");
                  else if (step === "trade_details") setStep("details");
                }}
              >
                <IconSymbol name="chevron.left" size={16} color={colors.foreground} />
                <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [styles.continueBtn, { backgroundColor: colors.primary, flex: 1, opacity: pressed || setupProfile.isPending ? 0.85 : 1 }]}
              onPress={handleContinue}
              disabled={setupProfile.isPending}
            >
              <Text style={styles.continueBtnText}>
                {setupProfile.isPending ? "Saving..." : step === "done" ? "Go to Home" : step === "welcome" ? (user ? "Get Started" : "Sign In to Continue") : "Continue"}
              </Text>
              {step !== "done" && <IconSymbol name="chevron.right" size={18} color="#fff" />}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function getProgress(step: Step) {
  const map: Record<Step, number> = { welcome: 0, role: 25, details: 50, trade_details: 75, done: 100 };
  return map[step] ?? 0;
}

const styles = StyleSheet.create({
  progressBar: { height: 4, width: "100%" },
  progressFill: { height: 4 },
  content: { flex: 1, padding: 24 },
  stepContainer: { gap: 16 },
  logoMark: { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 8 },
  stepTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  stepDesc: { fontSize: 16, lineHeight: 24 },
  benefitsList: { gap: 12, marginTop: 8 },
  benefitItem: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitText: { fontSize: 15, flex: 1, lineHeight: 22 },
  roleGrid: { flexDirection: "row", gap: 12 },
  roleCard: { flex: 1, borderRadius: 18, borderWidth: 2, padding: 16, alignItems: "center", gap: 10, position: "relative" },
  roleIconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  roleTitle: { fontSize: 16, fontWeight: "700" },
  roleDesc: { fontSize: 12, textAlign: "center", lineHeight: 18 },
  roleCheck: { position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  form: { gap: 16 },
  formRow: { flexDirection: "row", gap: 12 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { height: 100, paddingTop: 12 },
  propertyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  propertyOption: { borderRadius: 10, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8 },
  propertyOptionText: { fontSize: 13, fontWeight: "600" },
  successCircle: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, padding: 12, borderWidth: 1 },
  errorText: { fontSize: 13, flex: 1 },
  bottomCta: { flexDirection: "row", gap: 10, padding: 20, paddingBottom: 32 },
  backBtn: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1 },
  backBtnText: { fontSize: 15, fontWeight: "600" },
  continueBtn: { borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  continueBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
