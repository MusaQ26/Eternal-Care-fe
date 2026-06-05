import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../../constants/theme";
import AppHeader from "../../components/ui/app-header";
import { adminGetBookings, adminUpdateBooking } from "../utils/api";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface AdminBooking {
  id: string;
  user: string;
  phone: string;
  cnic: string;
  service: string;
  detail: string;
  providerName: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: string;
  packageExpiry: string;
}

const STATUS_STYLE: Record<BookingStatus, { bg: string; text: string; label: string }> = {
  pending:   { bg: "#fef3c7", text: "#92400e", label: "Pending" },
  confirmed: { bg: "#d1fae5", text: "#065f46", label: "Confirmed" },
  completed: { bg: "#dbeafe", text: "#1e40af", label: "Completed" },
  cancelled: { bg: "#fee2e2", text: "#991b1b", label: "Cancelled" },
};

const FILTERS: (BookingStatus | "all")[] = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function ManageBookings() {
  const router = useRouter();
  const [filter, setFilter] = useState<BookingStatus | "all">("all"); // default all so new bookings are visible immediately
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        try {
          const raw: any[] = await adminGetBookings();
          if (active) setBookings(raw.map((b) => ({
            id: b.id,
            user: b.meta?.name || b.users?.name || b.user_name || 'Unknown',
            phone: b.meta?.phone || '',
            cnic: b.meta?.cnic || '',
            service: b.meta?.serviceType || b.meta?.service || b.package_id || 'Service',
            detail: b.meta?.detail || b.meta?.packageLabel || '',
            providerName: b.meta?.providerName || '',
            date: (b.date || b.created_at || '').substring(0, 10),
            time: b.meta?.selectedTime || '',
            status: (b.meta?.completed_at ? 'completed' : b.status === 'paid' ? 'confirmed' : b.status) as BookingStatus,
            price: String(b.meta?.price || b.amount || 0),
            packageExpiry: b.meta?.packageExpiry || '',
          })));
        } catch { /* show empty */ }
        if (active) setLoading(false);
      })();
      return () => { active = false; };
    }, [])
  );

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  const updateStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      await adminUpdateBooking(id, { status: newStatus });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
    } catch (e: any) {
      Alert.alert("Error", e?.error || "Update failed.");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="Manage Bookings"
        right={<View style={styles.countBadge}><Text style={styles.countText}>{bookings.filter(b => b.status === 'pending').length} pending</Text></View>}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {FILTERS.map((f) => (
          <Pressable key={f} style={[styles.filterBtn, filter === f && styles.filterBtnActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} color="#164A40" /> : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No {filter === "all" ? "" : filter} bookings.</Text>}
          renderItem={({ item }) => {
            const sc = STATUS_STYLE[item.status];
            const isExpanded = expanded === item.id;
            return (
              <View style={styles.card}>
                {/* Header row */}
                <Pressable style={styles.cardTop} onPress={() => setExpanded(isExpanded ? null : item.id)}>
                  <View style={styles.userInitial}>
                    <Text style={styles.userInitialText}>{(item.user[0] || "?").toUpperCase()}</Text>
                  </View>
                  <View style={styles.cardTopMid}>
                    <Text style={styles.user}>{item.user}</Text>
                    <Text style={styles.serviceRow} numberOfLines={1}>
                      {item.service}{item.detail ? ` · ${item.detail}` : ""}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.badgeText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                </Pressable>

                {/* Always visible summary */}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryDate}>📅 {item.date}{item.time ? ` · ${item.time}` : ""}</Text>
                  <Text style={styles.summaryPrice}>PKR {Number(item.price).toLocaleString()}</Text>
                </View>

                {/* Expanded person details */}
                {isExpanded && (
                  <View style={styles.detailsBlock}>
                    {item.phone ? <Text style={styles.detailLine}>📞 {item.phone}</Text> : null}
                    {item.cnic ? <Text style={styles.detailLine}>🪪 CNIC: {item.cnic}</Text> : null}
                    {item.providerName ? <Text style={styles.detailLine}>👤 Provider: {item.providerName}</Text> : null}
                    {item.packageExpiry ? (() => {
                      const expiry = new Date(item.packageExpiry);
                      const active = expiry > new Date();
                      return <Text style={[styles.detailLine, { color: active ? "#164A40" : "#888" }]}>
                        📦 Package {active ? "active" : "expired"} {active ? "until" : "on"} {expiry.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>;
                    })() : null}
                    <Text style={styles.detailLine}>🔖 Ref: #{item.id.slice(-8).toUpperCase()}</Text>
                  </View>
                )}

                {/* Action buttons */}
                {item.status === "pending" && (
                  <View style={styles.actionRow}>
                    <Pressable style={styles.approveBtn} onPress={() => updateStatus(item.id, "confirmed")}>
                      <Text style={styles.approveTxt}>✓ Approve</Text>
                    </Pressable>
                    <Pressable style={styles.rejectBtn} onPress={() => updateStatus(item.id, "cancelled")}>
                      <Text style={styles.rejectTxt}>✕ Reject</Text>
                    </Pressable>
                  </View>
                )}
                {item.status === "confirmed" && (
                  <Pressable style={styles.completeBtn} onPress={() => updateStatus(item.id, "completed")}>
                    <Text style={styles.completeTxt}>Mark Complete</Text>
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
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 10 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  countBadge: { backgroundColor: "#fef3c7", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { color: "#92400e", fontWeight: "700", fontSize: 12 },
  filterScroll: { paddingHorizontal: 18, marginBottom: 12, flexGrow: 0 },
  filterBtn: { borderWidth: 1, borderColor: "#164A40", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, marginRight: 8 },
  filterBtnActive: { backgroundColor: "#164A40" },
  filterText: { color: "#164A40", fontWeight: "600", fontSize: 13 },
  filterTextActive: { color: "#fff" },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  userInitial: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: "#d7efe6",
    alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  userInitialText: { color: "#164A40", fontWeight: "800", fontSize: 16 },
  cardTopMid: { flex: 1 },
  user: { fontSize: 15, fontWeight: "700", color: "#111" },
  serviceRow: { color: "#666", fontSize: 12, marginTop: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  summaryDate: { color: "#666", fontSize: 13 },
  summaryPrice: { color: "#164A40", fontWeight: "700", fontSize: 13 },
  detailsBlock: { backgroundColor: "#f8f9fa", borderRadius: 10, padding: 12, marginBottom: 10 },
  detailLine: { color: "#444", fontSize: 13, marginBottom: 4 },
  actionRow: { flexDirection: "row", gap: 10 },
  approveBtn: { flex: 1, backgroundColor: "#d1fae5", borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  approveTxt: { color: "#065f46", fontWeight: "700" },
  rejectBtn: { flex: 1, backgroundColor: "#fee2e2", borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  rejectTxt: { color: "#dc2626", fontWeight: "700" },
  completeBtn: { backgroundColor: "#dbeafe", borderRadius: 10, paddingVertical: 9, alignItems: "center" },
  completeTxt: { color: "#1e40af", fontWeight: "700" },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
