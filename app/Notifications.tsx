import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarButton from "../components/ui/avatar-button";
import AppHeader from "../components/ui/app-header";
import { Colors } from "../constants/theme";
import { getToken } from "../utils/authStore";
import BottomNav from "../components/ui/bottom-nav";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

interface Notif {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: "booking" | "payment" | "service" | "system";
  booking_id?: string;
}

const TYPE_COLOR: Record<Notif["type"], string> = {
  booking: "#164A40",
  payment: "#059669",
  service: "#7c3aed",
  system: "#6b7280",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function Notifications() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { notifications: raw } = await res.json();
          setNotifs((raw || []).map((n: any) => ({
            id: n.id,
            title: n.title || '',
            body: n.body || n.message || '',
            time: n.created_at ? timeAgo(n.created_at) : '',
            read: Boolean(n.read),
            type: n.type || 'system',
            booking_id: n.booking_id,
          })));
        }
      } catch { /* show empty */ }
      setLoading(false);
    })();
  }, []);

  const markRead = async (notifId: string) => {
    setNotifs((prev) => prev.map((n) => n.id === notifId ? { ...n, read: true } : n));
    try {
      const token = await getToken();
      await fetch(`${API}/notifications/${notifId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* best effort */ }
  };

  const handleTap = (item: Notif) => {
    markRead(item.id);
    if (item.booking_id) {
      (router as any).push({ pathname: '/BookingDetail', params: { id: item.booking_id } });
    }
  };

  const markAllRead = async () => {
    const unread = notifs.filter((n) => !n.read);
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));
    const token = await getToken();
    for (const n of unread) {
      try {
        await fetch(`${API}/notifications/${n.id}/read`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* best effort */ }
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background || "#fff" }}>
    <SafeAreaView style={[styles.safe, { flex: 1 }]} edges={["top", "left", "right"]}>
      <AppHeader title="Notifications" right={<AvatarButton size={36} />} />

      {unreadCount > 0 && (
        <Pressable style={styles.markAllWrap} onPress={markAllRead}>
          <Text style={styles.markAllText}>Mark all as read ({unreadCount})</Text>
        </Pressable>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#164A40" />
      ) : (
      <FlatList
        data={notifs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !item.read && styles.cardUnread]}
            onPress={() => handleTap(item)}
          >
            <View style={[styles.typeDot, { backgroundColor: TYPE_COLOR[item.type] }]} />
            <View style={styles.cardBody}>
              <Text style={[styles.title, !item.read && styles.titleBold]}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications.</Text>}
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
  markAllWrap: { paddingHorizontal: 18, paddingBottom: 10, alignItems: "flex-end" },
  markAllText: { color: "#164A40", fontWeight: "600", fontSize: 13 },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: "row", alignItems: "flex-start",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardUnread: { backgroundColor: "#f0faf5" },
  typeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: 12 },
  cardBody: { flex: 1 },
  title: { fontSize: 14, color: "#333", marginBottom: 3 },
  titleBold: { fontWeight: "700", color: "#111" },
  body: { color: "#555", fontSize: 13, lineHeight: 19, marginBottom: 4 },
  time: { color: "#aaa", fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#164A40", marginLeft: 8, marginTop: 4 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
