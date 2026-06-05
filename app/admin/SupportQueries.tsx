import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, FlatList, Pressable,
  StyleSheet, Text, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../../constants/theme";
import AppHeader from "../../components/ui/app-header";
import { getToken } from "../../utils/authStore";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

interface Query {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "open" | "resolved";
  created_at: string;
}

export default function SupportQueries() {
  const router = useRouter();
  const [items, setItems] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        try {
          const token = await getToken();
          const res = await fetch(`${API}/admin/support`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok && active) setItems(await res.json());
        } catch { /* show empty */ }
        if (active) setLoading(false);
      })();
      return () => { active = false; };
    }, [])
  );

  const resolve = async (id: string) => {
    try {
      const token = await getToken();
      await fetch(`${API}/admin/support/${id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.map((q) => q.id === id ? { ...q, status: "resolved" } : q));
    } catch { /* best effort */ }
  };

  const openCount = items.filter((q) => q.status === "open").length;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Support Queries" right={openCount > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{openCount} open</Text></View> : undefined} />

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#164A40" /> : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No support queries yet.</Text>}
          renderItem={({ item }) => {
            const isOpen = item.status === "open";
            const isExpanded = expanded === item.id;
            const date = new Date(item.created_at).toLocaleDateString("en-PK", {
              day: "numeric", month: "short", year: "numeric",
            });
            return (
              <View style={[styles.card, isOpen && styles.cardOpen]}>
                <Pressable style={styles.cardTop} onPress={() => setExpanded(isExpanded ? null : item.id)}>
                  <View style={styles.cardTopLeft}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                    <Text style={styles.messageSnippet} numberOfLines={isExpanded ? undefined : 2}>
                      {item.message}
                    </Text>
                  </View>
                  <View style={styles.cardTopRight}>
                    <View style={[styles.statusPill, isOpen ? styles.pillOpen : styles.pillResolved]}>
                      <Text style={[styles.pillText, isOpen ? styles.pillTextOpen : styles.pillTextResolved]}>
                        {isOpen ? "Open" : "Resolved"}
                      </Text>
                    </View>
                    <Text style={styles.date}>{date}</Text>
                  </View>
                </Pressable>
                {isOpen && (
                  <Pressable style={styles.resolveBtn} onPress={() => resolve(item.id)}>
                    <Text style={styles.resolveBtnText}>✓ Mark Resolved</Text>
                  </Pressable>
                )}
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 14,
  },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  badge: { backgroundColor: "#fef3c7", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#92400e", fontWeight: "700", fontSize: 12 },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardOpen: { borderLeftWidth: 3, borderLeftColor: "#f59e0b" },
  cardTop: { flexDirection: "row" },
  cardTopLeft: { flex: 1, marginRight: 10 },
  cardTopRight: { alignItems: "flex-end", gap: 6 },
  name: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 2 },
  email: { fontSize: 12, color: "#666", marginBottom: 6 },
  messageSnippet: { fontSize: 13, color: "#444", lineHeight: 18 },
  statusPill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  pillOpen: { backgroundColor: "#fef3c7" },
  pillResolved: { backgroundColor: "#d1fae5" },
  pillText: { fontSize: 11, fontWeight: "700" },
  pillTextOpen: { color: "#92400e" },
  pillTextResolved: { color: "#065f46" },
  date: { fontSize: 11, color: "#aaa" },
  resolveBtn: {
    marginTop: 10, backgroundColor: "#d1fae5", borderRadius: 10,
    paddingVertical: 8, alignItems: "center",
  },
  resolveBtnText: { color: "#065f46", fontWeight: "700", fontSize: 13 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
