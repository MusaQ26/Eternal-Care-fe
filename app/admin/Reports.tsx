import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import AppHeader from "../../components/ui/app-header";
import { adminGetReports } from "../utils/api";

interface ReportData {
  totalBookings: number;
  revenue: number;
  byService: { label: string; count: number; revenue: number }[];
  plotOccupancy: number;
}

export default function Reports() {
  const router = useRouter();
  const [from, setFrom] = useState("2026-05-01");
  const [to, setTo] = useState("2026-05-31");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await adminGetReports(from, to);
      setReport({
        totalBookings: data.bookingsToday ?? data.totalBookings ?? 0,
        revenue: data.revenue ?? 0,
        byService: data.byService ?? [],
        plotOccupancy: data.plotOccupancy ?? data.availablePlots ?? 0,
      });
    } catch { /* show nothing */ }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Reports" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>From (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={from}
              onChangeText={setFrom}
              placeholder="2026-05-01"
              placeholderTextColor="#9AA"
              autoCorrect={false}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>To (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              value={to}
              onChangeText={setTo}
              placeholder="2026-05-31"
              placeholderTextColor="#9AA"
              autoCorrect={false}
            />
          </View>
        </View>

        <Pressable style={[styles.genBtn, loading && { opacity: 0.6 }]} onPress={handleGenerate} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.genBtnText}>Generate Report</Text>}
        </Pressable>

        {report && (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryTile}>
                <Text style={styles.tileValue}>{report.totalBookings}</Text>
                <Text style={styles.tileLabel}>Total Bookings</Text>
              </View>
              <View style={[styles.summaryTile, { backgroundColor: "#059669" }]}>
                <Text style={styles.tileValue}>PKR {(report.revenue / 1000).toFixed(0)}K</Text>
                <Text style={styles.tileLabel}>Revenue</Text>
              </View>
              <View style={[styles.summaryTile, { backgroundColor: "#7c3aed" }]}>
                <Text style={styles.tileValue}>{report.plotOccupancy}%</Text>
                <Text style={styles.tileLabel}>Plot Occupancy</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>By Service</Text>
            {report.byService.map((s) => (
              <View key={s.label} style={styles.serviceRow}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceLabel}>{s.label}</Text>
                  <Text style={styles.serviceSub}>{s.count} bookings</Text>
                </View>
                <Text style={styles.serviceRevenue}>PKR {s.revenue.toLocaleString()}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 16 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  dateRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  dateField: { flex: 1 },
  fieldLabel: { fontSize: 12, color: "#555", marginBottom: 6, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#164A40", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111" },
  genBtn: { backgroundColor: "#164A40", borderRadius: 24, paddingVertical: 14, alignItems: "center", marginBottom: 24 },
  genBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  summaryTile: { flex: 1, backgroundColor: "#164A40", borderRadius: 12, padding: 14, alignItems: "center" },
  tileValue: { color: "#fff", fontSize: 18, fontWeight: "900" },
  tileLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 4, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  serviceRow: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  serviceInfo: {},
  serviceLabel: { fontSize: 14, fontWeight: "700", color: "#111" },
  serviceSub: { color: "#888", fontSize: 12, marginTop: 2 },
  serviceRevenue: { color: "#164A40", fontWeight: "800", fontSize: 15 },
});
