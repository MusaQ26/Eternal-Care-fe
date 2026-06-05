import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../../constants/theme";
import AppHeader from "../../components/ui/app-header";
import { adminGetGraveyards, adminDeleteGraveyard } from "../utils/api";

interface Graveyard { id: string; name: string; city: string; totalPlots: number; availablePlots: number }

export default function ManageGraveyards() {
  const router = useRouter();
  const [items, setItems] = useState<Graveyard[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        try {
          const raw: any[] = await adminGetGraveyards();
          if (active) setItems(raw.map((g) => ({
            id: g.id,
            name: g.name,
            city: g.city ?? '',
            totalPlots: g.total_plots ?? 0,
            availablePlots: g.available_plots ?? 0,
          })));
        } catch { /* show empty */ }
        if (active) setLoading(false);
      })();
      return () => { active = false; };
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert("Delete Graveyard", "This will permanently remove the graveyard and all its plots.", [
      { text: "Cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await adminDeleteGraveyard(id);
            setItems((prev) => prev.filter((g) => g.id !== id));
          } catch (e: any) {
            Alert.alert("Error", e?.error || "Could not delete graveyard.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Graveyards" right={<Pressable style={styles.addBtn} onPress={() => (router as any).push({ pathname: "/admin/GraveyardForm", params: { mode: "create" } })}><Text style={styles.addBtnText}>+ Add</Text></Pressable>} />

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#164A40" /> : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>{item.city} · {item.availablePlots}/{item.totalPlots} available</Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={styles.editBtn}
                  onPress={() => (router as any).push({ pathname: "/admin/GraveyardForm", params: { mode: "edit", id: item.id, name: item.name, city: item.city } })}
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.delBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.delText}>Del</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 16,
  },
  back: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#000",
    alignItems: "center", justifyContent: "center",
  },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  addBtn: { backgroundColor: "#164A40", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700" },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 12,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 5, elevation: 2,
  },
  cardInfo: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", color: "#111" },
  sub: { color: "#666", fontSize: 13, marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  editBtn: { backgroundColor: "#dbeafe", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editText: { color: "#1e40af", fontWeight: "600", fontSize: 13 },
  delBtn: { backgroundColor: "#fee2e2", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  delText: { color: "#dc2626", fontWeight: "600", fontSize: 13 },
});
