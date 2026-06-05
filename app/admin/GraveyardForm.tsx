import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/theme";
import { adminCreateGraveyard, adminUpdateGraveyard } from "../utils/api";

type PlaceResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export default function GraveyardForm() {
  const router = useRouter();
  const { mode, id, name: initName, city: initCity } = useLocalSearchParams<{
    mode: string; id?: string; name?: string; city?: string;
  }>();

  const nameRef = useRef(initName || "");
  const cityRef = useRef(initCity || "");
  const totalPlotsRef = useRef("");
  const [address, setAddress] = useState("");

  // lat/lng as controlled state so auto-fill reflects in the inputs
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const [saving, setSaving] = useState(false);

  // Google Places search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);

  const searchPlaces = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "EternalCare/1.0", "Accept-Language": "en" },
      });
      const data: PlaceResult[] = await res.json();
      if (!data.length) alert("No locations found. Try a different search term.");
      setSearchResults(data);
    } catch {
      alert("Could not search locations. Check your internet connection.");
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = (place: PlaceResult) => {
    setLat(place.lat);
    setLng(place.lon);
    setAddress(place.display_name);
    setSearchResults([]);
    setSearchQuery(place.display_name.split(",")[0]);
  };

  const handleSave = async () => {
    if (!nameRef.current.trim() || !cityRef.current.trim()) {
      alert("Name and city are required.");
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        name: nameRef.current.trim(),
        city: cityRef.current.trim(),
        address: address.trim() || undefined,
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        total_plots: totalPlotsRef.current ? Number(totalPlotsRef.current) : undefined,
      };
      if (mode === "edit" && id) {
        await adminUpdateGraveyard(id, payload);
      } else {
        await adminCreateGraveyard(payload);
      }
      (router as any).back();
    } catch (e: any) {
      alert(e?.error || "Failed to save graveyard.");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, fieldRef, placeholder, keyboardType }: {
    label: string; fieldRef: React.MutableRefObject<string>; placeholder: string; keyboardType?: any;
  }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9AA"
        defaultValue={fieldRef.current}
        onChangeText={(v) => { fieldRef.current = v; }}
        keyboardType={keyboardType}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{mode === "edit" ? "Edit Graveyard" : "Add Graveyard"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Google Places search — always shown first */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Search on Google Maps</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.input, styles.searchInput]}
              placeholder="Type graveyard name or address..."
              placeholderTextColor="#9AA"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={searchPlaces}
              returnKeyType="search"
              autoCorrect={false}
            />
            <Pressable style={styles.searchBtn} onPress={searchPlaces} disabled={searching}>
              {searching
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.searchBtnText}>Search</Text>
              }
            </Pressable>
          </View>
        </View>

        {searchResults.length > 0 && (
          <View style={styles.resultsList}>
            {searchResults.map((place) => (
              <Pressable key={place.place_id} style={styles.resultItem} onPress={() => selectPlace(place)}>
                <Text style={styles.resultName}>{place.display_name.split(",")[0]}</Text>
                <Text style={styles.resultAddr} numberOfLines={2}>{place.display_name}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setSearchResults([])} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </Pressable>
          </View>
        )}

        <Text style={styles.manualLabel}>Or fill in the details manually</Text>

        <Field label="Name *" fieldRef={nameRef} placeholder="e.g. Karachi Muslim Graveyard" />
        <Field label="City *" fieldRef={cityRef} placeholder="e.g. Karachi" />
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Full address"
            placeholderTextColor="#9AA"
            value={address}
            onChangeText={setAddress}
            autoCorrect={false}
            multiline
          />
        </View>

        {/* Controlled lat/lng inputs so auto-fill is visible */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Latitude</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 24.8607"
            placeholderTextColor="#9AA"
            value={lat}
            onChangeText={setLat}
            keyboardType="decimal-pad"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Longitude</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 67.0011"
            placeholderTextColor="#9AA"
            value={lng}
            onChangeText={setLng}
            keyboardType="decimal-pad"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>

        <Field label="Total Plots" fieldRef={totalPlotsRef} placeholder="e.g. 200" keyboardType="numeric" />

        <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Graveyard</Text>}
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
  headerTitle: { flex: 1, marginLeft: 12, fontSize: 18, fontWeight: "800" },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, color: "#555", marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1, borderColor: "#164A40", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#111",
  },
  searchRow: { flexDirection: "row", gap: 8 },
  searchInput: { flex: 1 },
  searchBtn: {
    backgroundColor: "#164A40", borderRadius: 10,
    paddingHorizontal: 14, justifyContent: "center", alignItems: "center",
    minWidth: 72,
  },
  searchBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  resultsList: {
    borderWidth: 1, borderColor: "#ddd", borderRadius: 10,
    marginBottom: 16, overflow: "hidden",
  },
  resultItem: {
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  resultName: { fontSize: 14, fontWeight: "700", color: "#111", marginBottom: 2 },
  resultAddr: { fontSize: 12, color: "#666" },
  dismissBtn: { paddingVertical: 10, alignItems: "center", backgroundColor: "#f9f9f9" },
  dismissText: { color: "#999", fontSize: 12 },
  manualLabel: {
    fontSize: 12, color: "#888", fontWeight: "600",
    marginBottom: 12, marginTop: 4,
    textAlign: "center",
  },
  saveBtn: {
    backgroundColor: "#164A40", borderRadius: 24, paddingVertical: 16,
    alignItems: "center", marginTop: 10,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
