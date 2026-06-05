import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/theme";
import { getConfirmedBooking, clearConfirmedBooking } from "../utils/confirmedBookingStore";

export default function BookingConfirmed() {
  const router = useRouter();
  const confirmed = getConfirmedBooking() ?? {};
  const {
    bookingId = "",
    service = "",
    detail = "",
    date = "",
    price = "0",
    expiry = "",
  } = confirmed as any;

  useEffect(() => {
    return () => { clearConfirmedBooking(); };
  }, []);

  const ref = bookingId ? `#${bookingId.slice(-8).toUpperCase()}` : "";
  const hasExpiry = !!expiry;
  const expiryDate = hasExpiry
    ? new Date(expiry).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
    : "";

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.checkWrap}>
          <Text style={styles.checkMark}>✓</Text>
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        {ref ? <Text style={styles.ref}>{ref}</Text> : null}

        <View style={styles.detailCard}>
          {service ? <Row label="Service" value={service} /> : null}
          {detail ? <Row label="Details" value={detail} /> : null}
          {date ? <Row label="Date" value={date} /> : null}
          {price && price !== "0" ? <Row label="Amount Paid" value={`PKR ${Number(price).toLocaleString()}`} /> : null}
        </View>

        {hasExpiry && (
          <View style={styles.packageBadge}>
            <Text style={styles.packageBadgeTitle}>Package Active</Text>
            <Text style={styles.packageBadgeText}>Valid until {expiryDate}</Text>
          </View>
        )}

        <Text style={styles.note}>
          Your booking is confirmed. You will receive a notification when it is reviewed by our team.
        </Text>

        <Pressable style={styles.historyBtn} onPress={() => (router as any).replace("/BookingHistory")}>
          <Text style={styles.historyBtnText}>View My Bookings</Text>
        </Pressable>

        <Pressable style={styles.homeBtn} onPress={() => (router as any).replace("/Home")}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  container: { alignItems: "center", padding: 28, paddingBottom: 40 },
  checkWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: "#22c55e", alignItems: "center", justifyContent: "center", marginTop: 40,
  },
  checkMark: { color: "#fff", fontSize: 60, fontWeight: "700" },
  title: { fontSize: 24, fontWeight: "800", marginTop: 20, color: "#164A40" },
  ref: { fontSize: 14, color: "#888", marginTop: 6, letterSpacing: 1 },
  detailCard: {
    width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 18,
    marginTop: 24, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  row: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  rowLabel: { color: "#666", fontSize: 14 },
  rowValue: { color: "#111", fontSize: 14, fontWeight: "600", flex: 1, textAlign: "right", marginLeft: 12 },
  packageBadge: {
    width: "100%", backgroundColor: "#d7efe6", borderRadius: 14, padding: 16,
    marginTop: 16, alignItems: "center", borderWidth: 1, borderColor: "#164A40",
  },
  packageBadgeTitle: { color: "#164A40", fontWeight: "800", fontSize: 16 },
  packageBadgeText: { color: "#164A40", fontSize: 13, marginTop: 4 },
  note: { color: "#888", textAlign: "center", marginTop: 20, fontSize: 13, lineHeight: 20, paddingHorizontal: 8 },
  historyBtn: {
    width: "100%", backgroundColor: "#164A40", borderRadius: 14,
    paddingVertical: 14, alignItems: "center", marginTop: 24,
  },
  historyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  homeBtn: {
    width: "100%", borderWidth: 1, borderColor: "#164A40", borderRadius: 14,
    paddingVertical: 14, alignItems: "center", marginTop: 12,
  },
  homeBtnText: { color: "#164A40", fontWeight: "700", fontSize: 15 },
});
