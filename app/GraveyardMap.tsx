import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LeafletMap from "../components/ui/leaflet-map";
import { Colors } from "../constants/theme";
import { openDirections } from "../utils/mapNavigation";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

interface GraveyardData {
  lat: number;
  lng: number;
  city: string;
  available_plots: number;
  total_plots: number;
  address?: string;
}

export default function GraveyardMap() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [graveyard, setGraveyard] = useState<GraveyardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/graveyards/${id}`)
      .then((r) => r.json())
      .then((g) =>
        setGraveyard({
          lat: parseFloat(g.lat) || 24.8607,
          lng: parseFloat(g.lng) || 67.0011,
          city: g.city ?? "",
          available_plots: g.available_plots ?? 0,
          total_plots: g.total_plots ?? 0,
          address: g.address,
        })
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{name || "Graveyard Map"}</Text>
      </View>

      {loading || !graveyard ? (
        <View style={styles.centered}>
          {loading
            ? <ActivityIndicator color="#164A40" size="large" />
            : <Text style={styles.errorText}>Could not load graveyard location.</Text>
          }
        </View>
      ) : (
        <>
          <LeafletMap
            style={styles.map}
            initialLat={graveyard.lat}
            initialLng={graveyard.lng}
            initialZoom={15}
            markers={[{
              id: id as string,
              lat: graveyard.lat,
              lng: graveyard.lng,
              title: name as string,
              subtitle: graveyard.city,
              badge: `${graveyard.available_plots} available`,
            }]}
          />

          <View style={styles.infoPanel}>
            <Text style={styles.infoPanelName}>{name}</Text>
            {graveyard.city ? <Text style={styles.infoPanelCity}>{graveyard.city}</Text> : null}
            {graveyard.address ? <Text style={styles.infoPanelAddr}>{graveyard.address}</Text> : null}
            <View style={styles.infoStats}>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>{graveyard.available_plots} available</Text>
              </View>
              <Text style={styles.statTotal}>{graveyard.total_plots} total plots</Text>
            </View>
            <Pressable
              style={styles.directionsBtn}
              onPress={() => openDirections(graveyard.lat, graveyard.lng, name as string)}
            >
              <Text style={styles.directionsBtnText}>📍 Get Directions</Text>
            </Pressable>
            <Pressable style={styles.detailBtn} onPress={() => (router as any).back()}>
              <Text style={styles.detailBtnText}>Back to Plots</Text>
            </Pressable>
          </View>
        </>
      )}
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
  map: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  errorText: { color: "#666", textAlign: "center", fontSize: 14 },
  infoPanel: {
    backgroundColor: "#fff", padding: 20,
    borderTopWidth: 1, borderTopColor: "#eee",
  },
  infoPanelName: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 2 },
  infoPanelCity: { fontSize: 13, color: "#666", marginBottom: 2 },
  infoPanelAddr: { fontSize: 12, color: "#888", marginBottom: 10 },
  infoStats: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  statBadge: { backgroundColor: "#d7efe6", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statBadgeText: { color: "#164A40", fontSize: 13, fontWeight: "600" },
  statTotal: { color: "#888", fontSize: 13 },
  directionsBtn: { backgroundColor: "#22c55e", borderRadius: 24, paddingVertical: 12, alignItems: "center", marginBottom: 10 },
  directionsBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  detailBtn: { backgroundColor: "#164A40", borderRadius: 24, paddingVertical: 12, alignItems: "center" },
  detailBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
