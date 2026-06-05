import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarButton from "../components/ui/avatar-button";
import AppHeader from "../components/ui/app-header";
import { Colors } from "../constants/theme";

type PlotStatus = "available" | "occupied" | "reserved";
interface Plot { code: string; status: PlotStatus; price?: number; plotId?: string }

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

const STATUS_COLOR: Record<PlotStatus, string> = {
  available: "#22c55e",
  occupied: "#ef4444",
  reserved: "#f59e0b",
};

export default function GraveyardDetail() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/graveyards/${id}/plots`);
        if (res.ok) {
          const raw: any[] = await res.json();
          setPlots(raw.map((p) => ({
            code: p.plot_code,
            status: (p.status as PlotStatus) || "available",
            price: parseFloat(p.price) || 15000,
            plotId: p.id,
          })));
        }
      } catch { /* show empty state */ }
      setLoading(false);
    })();
  }, [id]);

  const available = plots.filter((p) => p.status === "available").length;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title={name || "Graveyard"} right={<AvatarButton size={36} />} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.graveyardName}>{name}</Text>
          <Text style={styles.infoSub}>Available plots: <Text style={styles.highlight}>{available}</Text> of {plots.length}</Text>

          <View style={styles.legend}>
            {(["available", "occupied", "reserved"] as PlotStatus[]).map((s) => (
              <View key={s} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: STATUS_COLOR[s] }]} />
                <Text style={styles.legendText}>{s.charAt(0).toUpperCase() + s.slice(1)}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select a Plot</Text>

        {loading ? (
          <ActivityIndicator color="#164A40" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.grid}>
            {plots.map((plot) => (
              <Pressable
                key={plot.code}
                style={[
                  styles.plotCell,
                  { borderColor: STATUS_COLOR[plot.status] },
                  plot.status !== "available" && styles.plotDisabled,
                ]}
                disabled={plot.status !== "available"}
                onPress={() =>
                  (router as any).push({
                    pathname: "/PlotDetail",
                    params: { graveyardId: id, graveyardName: name, plotCode: plot.code, price: plot.price, plotId: plot.plotId ?? "" },
                  })
                }
              >
                <View style={[styles.plotDot, { backgroundColor: STATUS_COLOR[plot.status] }]} />
                <Text style={styles.plotCode}>{plot.code}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Pressable
          style={styles.mapBtn}
          onPress={() => (router as any).push({ pathname: "/GraveyardMap", params: { id, name } })}
        >
          <Text style={styles.mapBtnText}>View on Map</Text>
        </Pressable>
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
  headerTitle: { flex: 1, marginHorizontal: 12, fontSize: 16, fontWeight: "700" },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  infoCard: {
    backgroundColor: "#164A40", borderRadius: 16, padding: 18, marginBottom: 20,
  },
  graveyardName: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  infoSub: { color: "#cfe9d8", fontSize: 14 },
  highlight: { color: "#fff", fontWeight: "700" },
  legend: { flexDirection: "row", marginTop: 14, gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: "#cfe9d8", fontSize: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  plotCell: {
    width: "22%", aspectRatio: 1, borderRadius: 10, borderWidth: 2,
    alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb",
  },
  plotDisabled: { opacity: 0.45 },
  plotDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  plotCode: { fontSize: 12, fontWeight: "700", color: "#111" },
  mapBtn: {
    borderWidth: 2, borderColor: "#164A40", borderRadius: 24, paddingVertical: 14,
    alignItems: "center", marginTop: 4,
  },
  mapBtnText: { color: "#164A40", fontWeight: "700" },
});
