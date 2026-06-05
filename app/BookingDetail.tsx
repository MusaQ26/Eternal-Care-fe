import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarButton from "../components/ui/avatar-button";
import { Colors } from "../constants/theme";
import { getToken } from "../utils/authStore";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: "#d1fae5", text: "#065f46" },
  completed: { bg: "#dbeafe", text: "#1e40af" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

export default function BookingDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { booking: raw } = await res.json();
          if (raw) {
            setBooking({
              id: raw.id,
              service: raw.meta?.serviceType || raw.meta?.service || 'Booking',
              detail: raw.meta?.packageLabel || raw.meta?.detail || raw.package_id || '',
              date: (raw.date || '').substring(0, 10),
              price: String(raw.meta?.price || raw.amount || 0),
              status: ['paid', 'confirmed', 'pending'].includes(raw.status) ? 'upcoming' : (raw.status || 'upcoming'),
              packageId: raw.package_id,
              meta: raw.meta || {},
            });
          }
        }
      } catch { /* show not-found */ }
      setLoading(false);
    })();
  }, [id]);

  const handleCancel = () => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            const token = await getToken();
            await fetch(`${API}/bookings/${id}/cancel`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch { /* best effort */ }
          setCancelling(false);
          (router as any).back();
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#164A40" />;

  if (!booking) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <AvatarButton size={36} />
      </View>
      <Text style={styles.empty}>Booking not found.</Text>
    </SafeAreaView>
  );

  const sc = STATUS_COLOR[booking.status] || STATUS_COLOR.completed;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Booking Detail</Text>
        <AvatarButton size={36} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.statusBanner}>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.bookingId}>#{booking.id.toUpperCase()}</Text>
        </View>

        <View style={styles.card}>
          {[
            ["Service", booking.service],
            ["Detail", booking.detail],
            ["Date", booking.date],
            ["Package", booking.packageId],
            ["Price", `PKR ${Number(booking.price).toLocaleString()}`],
          ].map(([label, value]) => (
            <View key={label}>
              <View style={styles.row}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
              </View>
              <View style={styles.divider} />
            </View>
          ))}
        </View>

        {(() => {
          const PKG_DAYS: Record<string, number> = { gravecare_1d:1, gravecare_weekly:7, gravecare_monthly:30 };
          const expiryStr = booking.meta?.packageExpiry || (() => {
            const pid = booking.packageId || booking.meta?.packageId || "";
            const days = PKG_DAYS[pid];
            if (!days) return null;
            const d = new Date(booking.meta?.created_at || booking.date || Date.now());
            d.setDate(d.getDate() + days);
            return d.toISOString();
          })();
          return expiryStr ? (() => {
          const expiry = new Date(expiryStr);
          const isActive = expiry > new Date();
          return (
            <View style={[styles.packageCard, { borderColor: isActive ? "#164A40" : "#ccc" }]}>
              <Text style={[styles.packageCardTitle, { color: isActive ? "#164A40" : "#888" }]}>
                {isActive ? "Package Active" : "Package Expired"}
              </Text>
              <Text style={styles.packageCardDate}>
                {isActive ? "Valid until" : "Expired on"} {expiry.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
              {isActive && (
                <Pressable style={styles.upgradeBtn} onPress={() => (router as any).back()}>
                  <Text style={styles.upgradeBtnText}>Upgrade Package</Text>
                </Pressable>
              )}
            </View>
          );
          })() : null;
        })()}

        {booking.status === "upcoming" && (
          <Pressable
            style={[styles.cancelBtn, cancelling && { opacity: 0.6 }]}
            onPress={handleCancel}
            disabled={cancelling}
          >
            {cancelling
              ? <ActivityIndicator color="#dc2626" />
              : <Text style={styles.cancelBtnText}>Cancel Booking</Text>
            }
          </Pressable>
        )}

        {booking.status === "completed" && booking.service === "Memorial Care" && (
          <Pressable
            style={styles.reportBtn}
            onPress={() => (router as any).push({ pathname: "/ServiceReport", params: { bookingId: id } })}
          >
            <Text style={styles.reportBtnText}>View Service Report</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
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
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  statusBanner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  statusBadge: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  statusText: { fontWeight: "700", fontSize: 14 },
  bookingId: { color: "#aaa", fontSize: 13 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 18,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, marginBottom: 20,
  },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 13 },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  label: { color: "#888", fontSize: 14 },
  value: { color: "#111", fontWeight: "600", fontSize: 14, maxWidth: "60%", textAlign: "right" },
  cancelBtn: {
    borderWidth: 2, borderColor: "#dc2626", borderRadius: 24, paddingVertical: 14,
    alignItems: "center", marginBottom: 12,
  },
  cancelBtnText: { color: "#dc2626", fontWeight: "700", fontSize: 15 },
  reportBtn: {
    backgroundColor: "#164A40", borderRadius: 24, paddingVertical: 14, alignItems: "center",
  },
  reportBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  empty: { textAlign: "center", color: "#999", marginTop: 60 },
  packageCard: {
    borderWidth: 1.5, borderRadius: 16, padding: 18, marginBottom: 16,
    backgroundColor: "#f0faf5",
  },
  packageCardTitle: { fontSize: 16, fontWeight: "800", marginBottom: 4 },
  packageCardDate: { color: "#555", fontSize: 14, marginBottom: 10 },
  upgradeBtn: {
    backgroundColor: "#164A40", borderRadius: 10, paddingVertical: 10, alignItems: "center",
  },
  upgradeBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
