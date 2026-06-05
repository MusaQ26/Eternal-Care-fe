import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import AvatarButton from "../components/ui/avatar-button";
import AppHeader from "../components/ui/app-header";
import SocialSvg from "../components/ui/social-svg";
import SearchIcon from "../assets/images/search.svg";
import LeafletMap, { LeafletMapHandle } from "../components/ui/leaflet-map";
import { openDirections } from "../utils/mapNavigation";
import { Colors } from "../constants/theme";

const { height } = Dimensions.get("window");

interface Graveyard {
  id: string;
  name: string;
  city: string;
  distance: string;
  availablePlots: number;
  totalPlots: number;
  lat: number;
  lng: number;
}

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

type ViewMode = "map" | "list";

export default function NearbyGraveyards() {
  const router = useRouter();
  const mapRef = useRef<LeafletMapHandle>(null);
  const [query, setQuery] = useState("");
  const [graveyards, setGraveyards] = useState<Graveyard[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission denied. Showing all graveyards.");
        } else {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch {
        setLocationError("Could not get location. Showing all graveyards.");
      }
      try {
        const res = await fetch(`${API}/graveyards`);
        if (res.ok) {
          const raw: any[] = await res.json();
          setGraveyards(raw.map((g) => ({
            id: g.id,
            name: g.name,
            city: g.city ?? "",
            distance: "",
            availablePlots: g.available_plots ?? 0,
            totalPlots: g.total_plots ?? 0,
            lat: parseFloat(g.lat) || 24.8607,
            lng: parseFloat(g.lng) || 67.0011,
          })));
        }
      } catch {
        setLocationError("Could not load graveyards. Please try again.");
      }
      setLoading(false);
    })();
  }, []);

  const filtered = graveyards.filter(
    (g) =>
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      g.city.toLowerCase().includes(query.toLowerCase())
  );

  const initialLat = userLocation?.lat ?? 24.8607;
  const initialLng = userLocation?.lng ?? 67.0011;

  const focusGraveyard = (g: Graveyard) => {
    setSelectedId(g.id);
    mapRef.current?.focusOn(g.lat, g.lng, 15);
  };

  const navigateToDetail = (g: Graveyard) =>
    (router as any).push({ pathname: "/GraveyardDetail", params: { id: g.id, name: g.name } });

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Nearby Graveyards" right={<AvatarButton size={36} />} />

      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or city..."
          placeholderTextColor="#9AA"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        <SocialSvg Icon={SearchIcon} size={18} />
      </View>

      {locationError ? (
        <Text style={styles.locationError}>{locationError}</Text>
      ) : null}

      <View style={styles.toggleRow}>
        <Pressable
          style={[styles.toggleBtn, viewMode === "map" && styles.toggleBtnActive]}
          onPress={() => setViewMode("map")}
        >
          <Text style={[styles.toggleText, viewMode === "map" && styles.toggleTextActive]}>Map</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, viewMode === "list" && styles.toggleBtnActive]}
          onPress={() => setViewMode("list")}
        >
          <Text style={[styles.toggleText, viewMode === "list" && styles.toggleTextActive]}>List</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#164A40" />
      ) : viewMode === "map" ? (
        <View style={styles.mapContainer}>
          <LeafletMap
            ref={mapRef}
            style={styles.map}
            initialLat={initialLat}
            initialLng={initialLng}
            initialZoom={12}
            markers={filtered.map((g) => ({
              id: g.id,
              lat: g.lat,
              lng: g.lng,
              title: g.name,
              subtitle: g.city,
              badge: `${g.availablePlots} available`,
            }))}
            onMarkerPress={(id) => {
              const g = filtered.find((x) => x.id === id);
              if (g) navigateToDetail(g);
            }}
          />

          <View style={styles.bottomSheet}>
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardScroll}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.mapCard, selectedId === item.id && styles.mapCardSelected]}
                  onPress={() => focusGraveyard(item)}
                  onLongPress={() => navigateToDetail(item)}
                >
                  <Text style={styles.mapCardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.mapCardCity}>{item.city} · {item.distance}</Text>
                  <View style={styles.mapCardBadge}>
                    <Text style={styles.mapCardBadgeText}>{item.availablePlots} available</Text>
                  </View>
                  <View style={styles.mapCardBtnRow}>
                    <Pressable style={[styles.mapCardBtn, { flex: 1 }]} onPress={() => navigateToDetail(item)}>
                      <Text style={styles.mapCardBtnText}>View Plots</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.mapCardBtn, styles.mapCardDirBtn, { flex: 1 }]}
                      onPress={() => openDirections(item.lat, item.lng, item.name)}
                    >
                      <Text style={styles.mapCardBtnText}>Directions</Text>
                    </Pressable>
                  </View>
                </Pressable>
              )}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigateToDetail(item)}>
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardCity}>{item.city}</Text>
                <View style={styles.statsRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.availablePlots} available</Text>
                  </View>
                  <Text style={styles.totalText}>{item.totalPlots} total plots</Text>
                </View>
                <Pressable
                  style={styles.viewMapBtn}
                  onPress={() => { setViewMode("map"); focusGraveyard(item); }}
                >
                  <Text style={styles.viewMapBtnText}>View on Map</Text>
                </Pressable>
                <Pressable
                  style={styles.directionsBtn}
                  onPress={() => openDirections(item.lat, item.lng, item.name)}
                >
                  <Text style={styles.directionsBtnText}>📍 Get Directions</Text>
                </Pressable>
              </View>
              <View style={styles.distanceWrap}>
                <Text style={styles.distanceText}>{item.distance}</Text>
                <Text style={styles.arrow}>›</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No graveyards found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 18, paddingTop: 8, marginTop: 16, marginBottom: 12,
  },
  back: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#000",
    alignItems: "center", justifyContent: "center",
  },
  backText: { color: "#fff", fontWeight: "700" },
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 18, marginBottom: 8,
    borderWidth: 1, borderColor: "#164A40", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#fff",
  },
  searchInput: { flex: 1, color: "#111", fontSize: 14 },
  locationError: { color: "#f59e0b", fontSize: 12, paddingHorizontal: 18, marginBottom: 6 },
  toggleRow: { flexDirection: "row", paddingHorizontal: 18, gap: 10, marginBottom: 10 },
  toggleBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: "#164A40", alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: "#164A40" },
  toggleText: { color: "#164A40", fontWeight: "700" },
  toggleTextActive: { color: "#fff" },
  mapContainer: { flex: 1 },
  map: { width: "100%", height: height * 0.52 },
  bottomSheet: {
    backgroundColor: "#fff", paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: "#eee",
  },
  cardScroll: { paddingHorizontal: 18, gap: 12 },
  mapCard: {
    width: 180, backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 2, borderColor: "#e5e7eb",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  mapCardSelected: { borderColor: "#164A40" },
  mapCardName: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 },
  mapCardCity: { color: "#666", fontSize: 12, marginBottom: 8 },
  mapCardBadge: { backgroundColor: "#d7efe6", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 10 },
  mapCardBadgeText: { color: "#164A40", fontSize: 11, fontWeight: "600" },
  mapCardBtnRow: { flexDirection: "row", gap: 6 },
  mapCardBtn: { backgroundColor: "#164A40", borderRadius: 10, paddingVertical: 7, alignItems: "center" },
  mapCardDirBtn: { backgroundColor: "#22c55e" },
  mapCardBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  directionsBtn: { marginTop: 6, borderWidth: 1, borderColor: "#22c55e", borderRadius: 8, paddingVertical: 6, alignItems: "center" },
  directionsBtnText: { color: "#22c55e", fontSize: 12, fontWeight: "700" },
  list: { paddingHorizontal: 18, paddingBottom: 30 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardBody: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 2 },
  cardCity: { fontSize: 13, color: "#666", marginBottom: 8 },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  badge: { backgroundColor: "#d7efe6", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: "#164A40", fontSize: 12, fontWeight: "600" },
  totalText: { color: "#888", fontSize: 12 },
  distanceWrap: { alignItems: "flex-end" },
  distanceText: { color: "#164A40", fontWeight: "700", fontSize: 13 },
  arrow: { fontSize: 22, color: "#164A40", marginTop: 4 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
  viewMapBtn: {
    marginTop: 8, borderWidth: 1, borderColor: "#164A40",
    borderRadius: 8, paddingVertical: 6, alignItems: "center",
  },
  viewMapBtnText: { color: "#164A40", fontSize: 12, fontWeight: "700" },
});
