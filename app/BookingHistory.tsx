import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarButton from "../components/ui/avatar-button";
import AppHeader from "../components/ui/app-header";
import { getToken } from "../utils/authStore";
import BottomNav from "../components/ui/bottom-nav";

type BookingStatus = "upcoming" | "completed" | "cancelled";

interface Booking {
  id: string;
  service: string;
  detail: string;
  date: string;
  price: string;
  status: BookingStatus;
  packageId?: string;
  created_at?: string;
  meta?: { packageExpiry?: string; packageId?: string; selectedTime?: string; providerName?: string };
}

const PKG_DAYS: Record<string, number> = {
  gravecare_1d: 1, gravecare_weekly: 7, gravecare_monthly: 30,
};

function resolveExpiry(item: Booking): string | null {
  if (item.meta?.packageExpiry) return item.meta.packageExpiry;
  const pid = item.packageId || item.meta?.packageId || "";
  const days = PKG_DAYS[pid];
  if (!days) return null;
  const base = new Date(item.created_at || item.date || Date.now());
  base.setDate(base.getDate() + days);
  return base.toISOString();
}

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

const STATUS_STYLE: Record<BookingStatus, { bg: string; text: string }> = {
  upcoming: { bg: "#d1fae5", text: "#065f46" },
  completed: { bg: "#dbeafe", text: "#1e40af" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const TABS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "completed", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

export default function BookingHistory() {
  const router = useRouter();
  const [tab, setTab] = useState<BookingStatus>("upcoming");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API}/bookings/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { bookings: raw } = await res.json();
          setBookings((raw || []).map((b: any) => ({
            ...b,
            packageId: b.packageId || b.meta?.packageId,
            created_at: b.created_at,
          })) as Booking[]);
        }
      } catch { /* show empty */ }
      setLoading(false);
    })();
  }, []);

  const filtered = bookings.filter((b) => b.status === tab);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background || "#fff" }}>
    <SafeAreaView style={[styles.safe, { flex: 1 }]} edges={["top", "left", "right"]}>
      <AppHeader title="My Bookings" right={<AvatarButton size={36} />} />

      <View style={styles.tabs}>
        {TABS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.tab, tab === key && styles.tabActive]}
            onPress={() => setTab(key as BookingStatus)}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
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
              style={styles.card}
              onPress={() =>
                (router as any).push({ pathname: "/BookingDetail", params: { id: item.id } })
              }
            >
              <View style={styles.cardLeft}>
                <Text style={styles.serviceName}>{item.service}</Text>
                <Text style={styles.detail} numberOfLines={1}>{item.detail}</Text>
                {item.meta?.selectedTime ? <Text style={styles.dateText}>{item.date} · {item.meta.selectedTime}</Text> : <Text style={styles.dateText}>{item.date}</Text>}
                {resolveExpiry(item) ? (() => {
                  const expiry = new Date(resolveExpiry(item)!);
                  const isActive = expiry > new Date();
                  return (
                    <View style={[styles.pkgBadge, { backgroundColor: isActive ? "#d7efe6" : "#f0f0f0" }]}>
                      <Text style={[styles.pkgBadgeText, { color: isActive ? "#164A40" : "#888" }]}>
                        {isActive ? `Active until ${expiry.toLocaleDateString("en-PK", { day: "numeric", month: "short" })}` : "Expired"}
                      </Text>
                    </View>
                  );
                })() : null}
              </View>
              <View style={styles.cardRight}>
                <Text style={styles.priceText}>PKR {Number(item.price).toLocaleString()}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_STYLE[item.status].bg }]}>
                  <Text style={[styles.badgeText, { color: STATUS_STYLE[item.status].text }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No {tab} bookings.</Text>
          }
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
    paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 8,
  },
  back: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#000",
    alignItems: "center", justifyContent: "center",
  },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  tabs: { flexDirection: "row", paddingHorizontal: 18, gap: 10, marginBottom: 14 },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: "#164A40", alignItems: "center",
  },
  tabActive: { backgroundColor: "#164A40" },
  tabText: { color: "#164A40", fontWeight: "600", fontSize: 13 },
  tabTextActive: { color: "#fff" },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 12,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardLeft: { flex: 1, marginRight: 10 },
  serviceName: { fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 2 },
  detail: { color: "#666", fontSize: 13, marginBottom: 4 },
  dateText: { color: "#999", fontSize: 12 },
  cardRight: { alignItems: "flex-end" },
  priceText: { color: "#164A40", fontWeight: "800", fontSize: 14, marginBottom: 6 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
  pkgBadge: { marginTop: 6, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" },
  pkgBadgeText: { fontSize: 11, fontWeight: "600" },
});
