import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarButton from "../components/ui/avatar-button";
import AppHeader from "../components/ui/app-header";
import { Colors } from "../constants/theme";
import BottomNav from "../components/ui/bottom-nav";

interface Reciter {
  id: string;
  name: string;
  language: string;
  rating: number;
  price: number;
  available: boolean;
  bio: string;
  image_url?: string;
}

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

function Stars({ count }: { count: number }) {
  return (
    <Text style={{ color: "#f59e0b", fontSize: 13 }}>
      {"★".repeat(count)}{"☆".repeat(5 - count)}
    </Text>
  );
}

export default function ReciterList() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "available">("all");
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/service-providers?type=quran_recitation`);
        if (res.ok) {
          const raw: any[] = await res.json();
          setReciters(raw.map((p) => ({
            id: p.id,
            name: p.name,
            language: p.language ?? 'Urdu',
            rating: Number(p.rating) || 4,
            price: parseFloat(p.price) || 0,
            available: p.available ?? true,
            bio: p.bio ?? '',
            image_url: p.image_url || null,
          })));
        }
      } catch { /* show empty */ }
      setLoading(false);
    })();
  }, []);

  const filtered = reciters.filter((r) => {
    const matchQuery =
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.language.toLowerCase().includes(query.toLowerCase());
    const matchFilter = filter === "all" || r.available;
    return matchQuery && matchFilter;
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background || "#fff" }}>
    <SafeAreaView style={[styles.safe, { flex: 1 }]} edges={["top", "left", "right"]}>
      <AppHeader title="Choose a Reciter" right={<AvatarButton size={36} />} />

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or language..."
          placeholderTextColor="#9AA"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <View style={styles.filterRow}>
        {(["all", "available"] as const).map((f) => (
          <Pressable
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : "Available Now"}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#164A40" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.card, !item.available && styles.cardDimmed]}
              onPress={() =>
                (router as any).push({
                  pathname: "/ReciterDetail",
                  params: { id: item.id, name: item.name, price: item.price, language: item.language, image_url: item.image_url ?? "" },
                })
              }
            >
              <View style={styles.avatar}>
                {item.image_url
                  ? <Image source={{ uri: item.image_url }} style={styles.avatarImg} />
                  : <Text style={styles.avatarLetter}>{item.name[0]}</Text>
                }
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardLang}>{item.language}</Text>
                <Stars count={item.rating} />
                <Text style={styles.cardBio} numberOfLines={2}>{item.bio}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.priceText}>PKR {item.price.toLocaleString()}</Text>
                <Text style={styles.priceSub}>/session</Text>
                <View style={[styles.avBadge, item.available ? styles.avGreen : styles.avRed]}>
                  <Text style={styles.avText}>{item.available ? "Available" : "Busy"}</Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No reciters found.</Text>}
        />
      )}
    </SafeAreaView>
    <BottomNav />
    </View>
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
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 18, marginBottom: 10,
    borderWidth: 1, borderColor: "#164A40", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#fff",
  },
  searchInput: { flex: 1, color: "#111", fontSize: 14 },
  filterRow: { flexDirection: "row", paddingHorizontal: 18, gap: 10, marginBottom: 12 },
  filterBtn: {
    borderWidth: 1, borderColor: "#164A40", borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 14,
  },
  filterBtnActive: { backgroundColor: "#164A40" },
  filterText: { color: "#164A40", fontWeight: "600", fontSize: 13 },
  filterTextActive: { color: "#fff" },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 14,
    flexDirection: "row", alignItems: "flex-start",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardDimmed: { opacity: 0.6 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: "#164A40",
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  avatarLetter: { color: "#fff", fontSize: 20, fontWeight: "700" },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  cardBody: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 2 },
  cardLang: { color: "#666", fontSize: 12, marginBottom: 4 },
  cardBio: { color: "#555", fontSize: 12, marginTop: 4, lineHeight: 17 },
  cardRight: { alignItems: "flex-end", marginLeft: 8 },
  priceText: { color: "#164A40", fontWeight: "800", fontSize: 14 },
  priceSub: { color: "#888", fontSize: 11 },
  avBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  avGreen: { backgroundColor: "#d1fae5" },
  avRed: { backgroundColor: "#fee2e2" },
  avText: { fontSize: 11, fontWeight: "600", color: "#111" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
