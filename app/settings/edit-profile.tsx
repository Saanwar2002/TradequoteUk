import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAppContext } from "@/lib/app-context";
import * as Haptics from "expo-haptics";

export default function EditProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile } = useAppContext();
  const [firstName, setFirstName] = useState(profile?.firstName ?? "");
  const [lastName, setLastName] = useState(profile?.lastName ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [postcode, setPostcode] = useState(profile?.postcode ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName || !lastName || !postcode) {
      alert("Please fill in all required fields");
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Profile updated successfully!");
      router.back();
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]} onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.content}>
            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>First Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="John"
                placeholderTextColor={colors.muted}
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Last Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Doe"
                placeholderTextColor={colors.muted}
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="next"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="+44 7700 900000"
                placeholderTextColor={colors.muted}
                value={phone}
                onChangeText={setPhone}
                returnKeyType="next"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>Postcode *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
                placeholder="SW1A 1AA"
                placeholderTextColor={colors.muted}
                value={postcode}
                onChangeText={setPostcode}
                returnKeyType="done"
              />
            </View>

            <Text style={[styles.requiredNote, { color: colors.muted }]}>* Required fields</Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={[styles.bottomCta, { borderTopColor: colors.border }]}>
          <Pressable
            style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed || isSaving ? 0.85 : 1 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save Changes"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  content: { padding: 16, gap: 16 },
  formGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  requiredNote: { fontSize: 12, marginTop: 8 },
  bottomCta: { padding: 16, borderTopWidth: 0.5 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: "center", justifyContent: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
