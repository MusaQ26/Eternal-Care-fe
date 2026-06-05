import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarButton from "../components/ui/avatar-button";
import { Colors } from "../constants/theme";

interface GraveResult {
  id: string;
  deceasedName: string;
  graveyard: string;
  plotCode: string;
  burialDate: string;
  graveyardId: string;
}

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

export default function GraveSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GraveResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await fetch(`${API}/graveyards/deceased/search?q=${encodeURIComponent(query.trim())}`);
      if (res.ok) {
        const raw: any[] = await res.json();
        setResults(raw.map((d) => ({
          id: d.id,
          deceasedName: d.full_name || d.name || '',
          graveyard: d.plots?.graveyards?.name || d.graveyard_name || '',
          plotCode: d.plots?.plot_code || d.plot_code || '',
          burialDate: (d.date_of_burial || d.burial_date || '').substring(0, 10),
          graveyardId: d.plots?.graveyard_id || d.graveyard_id || '',
        })));
      }
    } catch { /* show empty */ }
    setLoading(false);
    setSearched(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Grave Search</Text>
        <AvatarButton size={36} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, CNIC or plot ID..."
          placeholderTextColor="#9AA"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
        />
        <Pressable style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Search</Text>
        </Pressable>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 40 }} color="#164A40" />}

      {!loading && searched && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() =>
                (router as any).push({
                  pathname: "/PlotDetail",
                  params: {
                    graveyardId: item.graveyardId,
                    graveyardName: item.graveyard,
                    plotCode: item.plotCode,
                    price: "0",
                  },
                })
              }
            >
              <Text style={styles.deceasedName}>{item.deceasedName}</Text>
              <Text style={styles.graveyard}>{item.graveyard}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Plot: <Text style={styles.bold}>{item.plotCode}</Text></Text>
                <Text style={styles.metaText}>Buried: <Text style={styles.bold}>{item.burialDate}</Text></Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No records found for "{query}".</Text>
          }
        />
      )}

      {!loading && !searched && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>Enter a name, CNIC, or burial ID to locate a grave.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 12,
  },
  back: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#000",
    alignItems: "center", justifyContent: "center",
  },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  searchRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 18, marginBottom: 16, gap: 10,
  },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: "#164A40", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, color: "#111", fontSize: 14,
    backgroundColor: "#fff",
  },
  searchBtn: {
    backgroundColor: "#164A40", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13,
  },
  searchBtnText: { color: "#fff", fontWeight: "700" },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  deceasedName: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 2 },
  graveyard: { color: "#666", fontSize: 13, marginBottom: 8 },
  metaRow: { flexDirection: "row", gap: 20 },
  metaText: { color: "#888", fontSize: 13 },
  bold: { fontWeight: "700", color: "#164A40" },
  empty: { textAlign: "center", color: "#999", marginTop: 40, paddingHorizontal: 18 },
  hint: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  hintText: { color: "#aaa", textAlign: "center", fontSize: 15, lineHeight: 22 },
});
