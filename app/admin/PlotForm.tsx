import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { adminCreatePlot, adminGetGraveyards, adminUpdatePlot } from "../utils/api";

const STATUSES = ["available", "occupied", "reserved"];

export default function PlotForm() {
  const router = useRouter();
  const { mode, id, code: initCode, status: initStatus, price: initPrice, graveyard_id: initGraveyardId } = useLocalSearchParams<{
    mode: string; id?: string; code?: string; status?: string; price?: string; graveyard_id?: string;
  }>();

  const codeRef = useRef(initCode || "");
  const sectionRef = useRef("");
  const latRef = useRef("");
  const lngRef = useRef("");
  const priceRef = useRef(initPrice || "");
  const [status, setStatus] = useState(initStatus || "available");
  const [saving, setSaving] = useState(false);

  const [graveyards, setGraveyards] = useState<{ id: string; name: string }[]>([]);
  const [loadingGraveyards, setLoadingGraveyards] = useState(true);
  const [selectedGraveyardId, setSelectedGraveyardId] = useState(initGraveyardId || "");

  useEffect(() => {
    (async () => {
      try {
        const raw: any[] = await adminGetGraveyards();
        setGraveyards(raw.map((g) => ({ id: g.id, name: g.name || g.id })));
      } catch { /* show empty */ }
      setLoadingGraveyards(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!codeRef.current.trim()) { alert("Plot code is required."); return; }
    if (mode !== 'edit' && !selectedGraveyardId) { alert("Please select a cemetery for this plot."); return; }
    setSaving(true);
    try {
      const payload: any = {
        plot_code: codeRef.current.trim(),
        section: sectionRef.current || undefined,
        lat: latRef.current ? Number(latRef.current) : undefined,
        lng: lngRef.current ? Number(lngRef.current) : undefined,
        price: Number(priceRef.current) || 0,
        status,
      };
      if (selectedGraveyardId) payload.graveyard_id = selectedGraveyardId;
      if (mode === 'edit' && id) {
        await adminUpdatePlot(id, payload);
      } else {
        await adminCreatePlot(payload);
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
        <Text style={styles.headerTitle}>{mode === "edit" ? "Edit Plot" : "Add Plot"}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cemetery selector */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Cemetery *</Text>
          {loadingGraveyards ? (
            <ActivityIndicator color="#164A40" style={{ alignSelf: "flex-start", marginTop: 6 }} />
          ) : graveyards.length === 0 ? (
            <Text style={styles.hint}>No cemeteries found. Add a cemetery first.</Text>
          ) : (
            <View style={styles.graveyardList}>
              {graveyards.map((g) => (
                <Pressable
                  key={g.id}
                  style={[styles.graveyardBtn, selectedGraveyardId === g.id && styles.graveyardBtnActive]}
                  onPress={() => setSelectedGraveyardId(g.id)}
                >
                  <Text style={[styles.graveyardBtnText, selectedGraveyardId === g.id && styles.graveyardBtnTextActive]}>
                    {g.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {[
          { label: "Plot Code *", ref: codeRef, placeholder: "e.g. A1" },
          { label: "Section", ref: sectionRef, placeholder: "e.g. Section A" },
          { label: "Latitude", ref: latRef, placeholder: "e.g. 31.5204", kb: "decimal-pad" },
          { label: "Longitude", ref: lngRef, placeholder: "e.g. 74.3587", kb: "decimal-pad" },
          { label: "Price (PKR)", ref: priceRef, placeholder: "e.g. 15000", kb: "numeric" },
        ].map(({ label, ref: r, placeholder, kb }) => (
          <View key={label} style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#9AA"
              defaultValue={r.current}
              onChangeText={(v) => { r.current = v; }}
              keyboardType={kb as any}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        ))}

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <Pressable key={s} style={[styles.statusBtn, status === s && styles.statusBtnActive]} onPress={() => setStatus(s)}>
                <Text style={[styles.statusBtnText, status === s && styles.statusBtnTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Plot</Text>}
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
  statusRow: { flexDirection: "row", gap: 10 },
  statusBtn: { flex: 1, borderWidth: 1, borderColor: "#164A40", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  statusBtnActive: { backgroundColor: "#164A40" },
  statusBtnText: { color: "#164A40", fontWeight: "600", fontSize: 13 },
  statusBtnTextActive: { color: "#fff" },
  graveyardList: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  graveyardBtn: { borderWidth: 1, borderColor: "#164A40", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  graveyardBtnActive: { backgroundColor: "#164A40" },
  graveyardBtnText: { color: "#164A40", fontWeight: "600", fontSize: 13 },
  graveyardBtnTextActive: { color: "#fff" },
  hint: { color: "#999", fontSize: 13, marginTop: 4 },
  saveBtn: { backgroundColor: "#164A40", borderRadius: 24, paddingVertical: 16, alignItems: "center", marginTop: 10 },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
