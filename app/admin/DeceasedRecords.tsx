import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../../constants/theme";
import AppHeader from "../../components/ui/app-header";
import { adminGetDeceased } from "../utils/api";

interface Deceased { id: string; name: string; cnic: string; burialDate: string; graveyard: string; plotCode: string }

export default function DeceasedRecords() {
  const router = useRouter();
  const [items, setItems] = useState<Deceased[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        try {
          const raw: any[] = await adminGetDeceased();
          if (active) setItems(raw.map((d) => ({
            id: d.id,
            name: d.full_name || d.name || '',
            cnic: d.cnic || '',
            burialDate: (d.date_of_burial || d.burial_date || '').substring(0, 10),
            graveyard: d.plots?.graveyards?.name || d.graveyard_name || '',
            plotCode: d.plots?.plot_code || d.plot_code || '',
          })));
        } catch { /* show empty */ }
        if (active) setLoading(false);
      })();
      return () => { active = false; };
    }, [])
  );

  const filtered = items.filter(
    (d) => d.name.toLowerCase().includes(query.toLowerCase()) || d.cnic.includes(query)
  );

  const handleDelete = (id: string) => {
    Alert.alert("Delete Record", "Permanently remove this deceased record?", [
      { text: "Cancel" },
      { text: "Delete", style: "destructive", onPress: () => { setItems((p) => p.filter((x) => x.id !== id)); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Deceased Records" right={<Pressable style={styles.addBtn} onPress={() => (router as any).push({ pathname: "/admin/DeceasedForm", params: { mode: "create" } })}><Text style={styles.addBtnText}>+ Add</Text></Pressable>} />

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or CNIC..."
          placeholderTextColor="#9AA"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#164A40" /> : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.sub}>CNIC: {item.cnic}</Text>
                <Text style={styles.sub}>{item.graveyard} · Plot {item.plotCode}</Text>
                <Text style={styles.sub}>Burial: {item.burialDate}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={styles.editBtn}
                  onPress={() => (router as any).push({ pathname: "/admin/DeceasedForm", params: { mode: "edit", id: item.id, name: item.name, cnic: item.cnic } })}
                >
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable style={styles.delBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.delText}>Del</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No records found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 10 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  addBtn: { backgroundColor: "#164A40", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: "#fff", fontWeight: "700" },
  searchWrap: { marginHorizontal: 18, marginBottom: 12, borderWidth: 1, borderColor: "#164A40", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { color: "#111", fontSize: 14 },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "flex-start", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 2 },
  sub: { color: "#666", fontSize: 12, marginTop: 1 },
  actions: { flexDirection: "column", gap: 6, marginLeft: 10 },
  editBtn: { backgroundColor: "#dbeafe", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editText: { color: "#1e40af", fontWeight: "600", fontSize: 13 },
  delBtn: { backgroundColor: "#fee2e2", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  delText: { color: "#dc2626", fontWeight: "600", fontSize: 13 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
