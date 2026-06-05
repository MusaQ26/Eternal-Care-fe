import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator, Image, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../../constants/theme";
import { adminCreateProvider, adminUpdateProvider } from "../utils/api";
import { getToken } from "../../utils/authStore";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

const TYPES = [
  { key: "quran_recitation", label: "Quran Recitation" },
  { key: "gravecare", label: "Memorial Care" },
];

export default function ProviderForm() {
  const router = useRouter();
  const { mode, id, name: initName, type: initType, contact: initContact } = useLocalSearchParams<{
    mode: string; id?: string; name?: string; type?: string; contact?: string;
  }>();

  const nameRef = useRef(initName || "");
  const contactRef = useRef(initContact || "");
  const priceRef = useRef("");
  const [type, setType] = useState(initType || "quran_recitation");
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { alert("Photo library access is needed to add a provider photo."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) setImageUri(result.assets[0].uri);
  };

  const uploadImage = async (providerId: string) => {
    if (!imageUri) return;
    const filename = imageUri.split("/").pop() ?? "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = match ? `image/${match[1]}` : "image/jpeg";
    const formData = new FormData();
    formData.append("image", { uri: imageUri, name: filename, type: mimeType } as any);
    const token = await getToken();
    await fetch(`${API}/admin/providers/${providerId}/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  };

  const handleSave = async () => {
    if (!nameRef.current.trim()) { alert("Name is required."); return; }
    setSaving(true);
    try {
      const payload = {
        name: nameRef.current.trim(),
        type,
        contact: contactRef.current.trim(),
        price: Number(priceRef.current) || 0,
      };
      let savedId: string | undefined;
      if (mode === "edit" && id) {
        await adminUpdateProvider(id, payload);
        savedId = id;
      } else {
        const result: any = await adminCreateProvider(payload);
        savedId = result?.id;
      }
      if (imageUri && savedId) {
        try { await uploadImage(savedId); } catch { /* non-critical */ }
      }
      (router as any).back();
    } catch (e: any) {
      alert(e?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{mode === "edit" ? "Edit Provider" : "Add Provider"}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Provider Photo</Text>
          <Pressable style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.imagePickerText}>Tap to choose photo</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Name *</Text>
          <TextInput style={styles.input} placeholder="Provider name" placeholderTextColor="#9AA" defaultValue={nameRef.current} onChangeText={(v) => { nameRef.current = v; }} autoCorrect={false} />
        </View>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Contact Number</Text>
          <TextInput style={styles.input} placeholder="e.g. 03001234567" placeholderTextColor="#9AA" defaultValue={contactRef.current} onChangeText={(v) => { contactRef.current = v; }} keyboardType="phone-pad" />
        </View>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Price Per Session (PKR)</Text>
          <TextInput style={styles.input} placeholder="e.g. 1200" placeholderTextColor="#9AA" defaultValue={priceRef.current} onChangeText={(v) => { priceRef.current = v; }} keyboardType="numeric" />
        </View>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Service Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map((t) => (
              <Pressable key={t.key} style={[styles.typeBtn, type === t.key && styles.typeBtnActive]} onPress={() => setType(t.key)}>
                <Text style={[styles.typeBtnText, type === t.key && styles.typeBtnTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Provider</Text>}
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
  imagePicker: {
    height: 120, borderWidth: 1, borderColor: "#164A40", borderRadius: 12,
    borderStyle: "dashed", alignItems: "center", justifyContent: "center",
    backgroundColor: "#f9fafb", overflow: "hidden",
  },
  imagePreview: { width: "100%", height: "100%", resizeMode: "cover" },
  imagePickerText: { color: "#9AA", fontSize: 14 },
  typeRow: { flexDirection: "row", gap: 10 },
  typeBtn: { flex: 1, borderWidth: 1, borderColor: "#164A40", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  typeBtnActive: { backgroundColor: "#164A40" },
  typeBtnText: { color: "#164A40", fontWeight: "600", fontSize: 13 },
  typeBtnTextActive: { color: "#fff" },
  saveBtn: { backgroundColor: "#164A40", borderRadius: 24, paddingVertical: 16, alignItems: "center", marginTop: 10 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
