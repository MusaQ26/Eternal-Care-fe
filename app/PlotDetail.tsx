import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarButton from "../components/ui/avatar-button";
import { Colors } from "../constants/theme";

export default function PlotDetail() {
  const router = useRouter();
  const { graveyardId, graveyardName, plotCode, price, plotId } = useLocalSearchParams<{
    graveyardId: string;
    graveyardName: string;
    plotCode: string;
    price: string;
    plotId?: string;
  }>();

  const handleBook = () => {
    const { setBooking } = require("../utils/bookingStore");
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    setBooking({
      service: "Grave Booking",
      detail: `Plot ${plotCode} — ${graveyardName}`,
      packageId: `grave_${graveyardId}_${plotCode}`,
      date: nextDay.toISOString(),
      graveyardId,
      graveyardName,
      plotCode,
      plotId: plotId || undefined,
      price: price || "15000",
    });
    (router as any).push("/Form");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Plot Details</Text>
        <AvatarButton size={36} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.plotBadge}>
            <Text style={styles.plotBadgeText}>{plotCode}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Graveyard</Text>
            <Text style={styles.value}>{graveyardName}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Plot Code</Text>
            <Text style={styles.value}>{plotCode}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Available</Text>
            </View>
          </View>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Price</Text>
            <Text style={styles.priceValue}>PKR {Number(price || 15000).toLocaleString()}</Text>
          </View>
        </View>

        <Pressable style={styles.bookBtn} onPress={handleBook}>
          <Text style={styles.bookBtnText}>Book This Plot</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 20,
  },
  back: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#000",
    alignItems: "center", justifyContent: "center",
  },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  content: { flex: 1, paddingHorizontal: 18 },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 20,
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    marginBottom: 24,
  },
  plotBadge: {
    backgroundColor: "#164A40", borderRadius: 50, width: 70, height: 70,
    alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 20,
  },
  plotBadgeText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14 },
  divider: { height: 1, backgroundColor: "#f0f0f0" },
  label: { color: "#666", fontSize: 14 },
  value: { color: "#111", fontSize: 14, fontWeight: "600" },
  priceValue: { color: "#164A40", fontSize: 16, fontWeight: "800" },
  statusBadge: { backgroundColor: "#d1fae5", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { color: "#065f46", fontSize: 13, fontWeight: "600" },
  bookBtn: {
    backgroundColor: "#164A40", borderRadius: 24, paddingVertical: 16,
    alignItems: "center",
  },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
