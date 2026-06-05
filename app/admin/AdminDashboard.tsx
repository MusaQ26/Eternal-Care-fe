import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import AppHeader from "../../components/ui/app-header";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../../constants/theme";
import { getToken } from "../../utils/authStore";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

const QUICK_LINKS = [
  { label: "Bookings",        sub: "Approve & manage all bookings",   route: "/admin/ManageBookings",        icon: "📋" },
  { label: "Graveyards",      sub: "Add, edit or remove cemeteries",  route: "/admin/ManageGraveyards",      icon: "🏛" },
  { label: "Plots",           sub: "View & update plot status",       route: "/admin/ManagePlots",           icon: "🗺" },
  { label: "Providers",       sub: "Quran & memorial care team",      route: "/admin/ManageServiceProviders",icon: "👤" },
  { label: "Deceased Records",sub: "Search & update records",         route: "/admin/DeceasedRecords",       icon: "📁" },
  { label: "Support Queries", sub: "Help center messages",            route: "/admin/SupportQueries",        icon: "💬" },
  { label: "Reports",         sub: "Revenue & occupancy reports",     route: "/admin/Reports",               icon: "📊" },
];

interface Stats {
  bookingsToday: number;
  pendingApprovals: number;
  availablePlots: number;
  revenue: number;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStats(await res.json());
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const tiles = stats
    ? [
        { label: "Bookings Today",    sub: "Total received",   value: stats.bookingsToday,                      color: "#164A40" },
        { label: "Pending Approvals", sub: "Awaiting review",  value: stats.pendingApprovals,                   color: "#f59e0b" },
        { label: "Available Plots",   sub: "Ready to book",    value: stats.availablePlots,                     color: "#22c55e" },
        { label: "Revenue (MTD)",     sub: "This month",       value: `PKR ${stats.revenue.toLocaleString()}`,  color: "#7c3aed" },
      ]
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Admin Dashboard" subtitle={`${greeting()},`} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#164A40" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(true); }} />}
        >
          {/* Stat tiles — light tint background, coloured left border, dark text */}
          <View style={styles.tilesGrid}>
            {tiles.map((t) => (
              <View key={t.label} style={[styles.tile, { borderLeftColor: t.color }]}>
                <Text style={[styles.tileValue, { color: t.color }]}>{t.value}</Text>
                <Text style={styles.tileLabel}>{t.label}</Text>
                <Text style={styles.tileSub}>{t.sub}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.linksGrid}>
            {QUICK_LINKS.map((l) => (
              <Pressable key={l.label} style={styles.linkCard} onPress={() => (router as any).push(l.route)}>
                <Text style={styles.linkIcon}>{l.icon}</Text>
                <View style={styles.linkLeft}>
                  <Text style={styles.linkText}>{l.label}</Text>
                  <Text style={styles.linkSub}>{l.sub}</Text>
                </View>
                <Text style={styles.linkArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f8fa" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 20,
    gap: 12,
  },
  back: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#111",
    alignItems: "center", justifyContent: "center",
  },
  backText: { color: "#fff", fontWeight: "700" },
  greeting: { fontSize: 12, color: "#999", fontWeight: "500" },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#111" },
  content: { paddingHorizontal: 18, paddingBottom: 40 },

  // Minimalist tiles: white card, coloured left border, dark text
  tilesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 28 },
  tile: {
    width: "47%", borderRadius: 12, padding: 16,
    backgroundColor: "#fff",
    borderLeftWidth: 4,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  tileValue: { fontSize: 26, fontWeight: "900", marginBottom: 2 },
  tileLabel: { color: "#333", fontSize: 13, fontWeight: "600" },
  tileSub: { color: "#aaa", fontSize: 11, marginTop: 2 },

  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#999", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 },
  linksGrid: { gap: 8 },
  linkCard: {
    backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  linkIcon: { fontSize: 20, marginRight: 14 },
  linkLeft: { flex: 1 },
  linkText: { fontSize: 14, fontWeight: "700", color: "#111" },
  linkSub: { fontSize: 12, color: "#999", marginTop: 1 },
  linkArrow: { fontSize: 20, color: "#ccc", marginLeft: 8 },
});
