import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { adminCreateDeceased, adminUpdateDeceased } from "../utils/api";

export default function DeceasedForm() {
  const router = useRouter();
  const { mode, id, name: initName, cnic: initCnic } = useLocalSearchParams<{
    mode: string; id?: string; name?: string; cnic?: string;
  }>();

  const nameRef = useRef(initName || "");
  const cnicRef = useRef(initCnic || "");
  const dobRef = useRef("");
  const burialDateRef = useRef("");
  const plotCodeRef = useRef("");
  const graveyardIdRef = useRef("");
  const familyContactRef = useRef("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nameRef.current.trim()) { alert("Full name is required."); return; }
    setSaving(true);
    try {
      const payload: any = {
        full_name: nameRef.current.trim(),
        cnic: cnicRef.current.trim() || undefined,
        date_of_birth: dobRef.current.trim() || undefined,
        date_of_burial: burialDateRef.current.trim() || undefined,
        plot_id: graveyardIdRef.current.trim() || undefined,
        family_contact: familyContactRef.current.trim() || undefined,
      };
      if (mode === 'edit' && id) {
        await adminUpdateDeceased(id, payload);
      } else {
        await adminCreateDeceased(payload);
      }
      (router as any).back();
    } catch (e: any) {
      alert(e?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const FIELDS = [
    { label: "Full Name *", ref: nameRef, placeholder: "Deceased full name" },
    { label: "CNIC", ref: cnicRef, placeholder: "e.g. 42101-1234567-1" },
    { label: "Date of Birth (YYYY-MM-DD)", ref: dobRef, placeholder: "e.g. 1950-06-15" },
    { label: "Date of Burial (YYYY-MM-DD)", ref: burialDateRef, placeholder: "e.g. 2022-03-15" },
    { label: "Graveyard ID", ref: graveyardIdRef, placeholder: "e.g. g1" },
    { label: "Plot Code", ref: plotCodeRef, placeholder: "e.g. A3" },
    { label: "Family Contact", ref: familyContactRef, placeholder: "Phone or email" },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{mode === "edit" ? "Edit Record" : "Add Deceased Record"}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {FIELDS.map(({ label, ref: r, placeholder }) => (
          <View key={label} style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#9AA"
              defaultValue={r.current}
              onChangeText={(v) => { r.current = v; }}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        ))}
        <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Record</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 8 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#164A40", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#111" },
  saveBtn: { backgroundColor: "#164A40", borderRadius: 24, paddingVertical: 16, alignItems: "center", marginTop: 10 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
