import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialSvg from "../components/ui/social-svg";
import BellIcon from "../assets/images/bell.svg";
import FilterIcon from "../assets/images/filter.svg";
import SearchIcon from "../assets/images/search.svg";
import GraveBookingIcon from "../assets/images/grave-booking.svg";
import AvatarButton from "../components/ui/avatar-button";
import { Colors } from "../constants/theme";
import BottomNav from "../components/ui/bottom-nav";

export default function GraveBooking() {
  const router = useRouter();
  const [selectedPlot, setSelectedPlot] = useState("F8");
  // search and header use normal layout flow now

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background || "#fff" }}>
    <SafeAreaView style={[styles.safe, { flex: 1 }]} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <AvatarButton size={36} />
          <Pressable onPress={() => (router as any).push("/Notifications")}><SocialSvg Icon={BellIcon} size={20} /></Pressable>
        </View>
      </View>

      <View style={styles.searchWrapStatic}>
        <View style={styles.searchBar}>
          <Text style={styles.searchPlaceholder}>Search graveyard.....</Text>
          <View style={styles.searchIcons}>
            <SocialSvg
              Icon={FilterIcon}
              size={16}
            />
            <SocialSvg
              Icon={SearchIcon}
              size={18}
            />
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.nearbyBtn}
          onPress={() => (router as any).push("/NearbyGraveyards")}
        >
          <Text style={styles.nearbyBtnText}>📍 Find Nearby Graveyards</Text>
        </Pressable>

        <View style={styles.bannerWrap}>
          <View style={styles.bannerInner}>
            <SocialSvg
              Icon={GraveBookingIcon}
              size={"100%"}
              style={{ borderRadius: 12 }}
            />
          </View>
        </View>

        {/* no floating filter card - layout matches QuranRecitation */}

        <Text style={styles.title}>Meadow Cemetary</Text>
        <Text style={styles.desc}>
          Meadow Cemetary offers a serene and respectful final resting place
          amidst nature's quiet beauty. Designed for peace and remembrance, it
          provides thoughtfully maintained grounds for honoring loved ones.
        </Text>

        <Text style={styles.bookHeading}>Book a Plot</Text>

        <View style={styles.selectorRow}>
          {["F8", "D5", "N6", "C2"].map((p) => (
            <Pressable
              key={p}
              onPress={() => setSelectedPlot(p)}
              style={[styles.option, selectedPlot === p && styles.optionActive]}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedPlot === p && styles.optionTextActive,
                ]}
              >
                {p}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.bookBtn}
          onPress={() => {
            const { setBooking } = require("../utils/bookingStore");
            const next = new Date(); next.setDate(next.getDate() + 1);
            setBooking({
              service: "Grave Booking",
              detail: `Meadow Cemetary Plot no. ${selectedPlot}`,
              price: "57000",
              packageId: `plot_${selectedPlot}`,
              date: next.toISOString(),
            });
            (router as any).push("/Form");
          }}
        >
          <Text style={styles.bookText}>Book Now</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
    <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    marginTop: 16,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#fff", fontWeight: "700" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  content: { paddingHorizontal: 20, alignItems: "center", paddingBottom: 30 },
  searchWrap: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 80,
    zIndex: 1000,
    elevation: 1000,
  },
  searchWrapStatic: { paddingHorizontal: 18, marginTop: 12 },
  // ensure search bar stretches
  searchBar: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#164A40",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    zIndex: 1001,
    elevation: 1001,
  },
  searchPlaceholder: { color: "#999", flex: 1 },
  searchIcons: { flexDirection: "row", gap: 12, marginLeft: 8 },
  nearbyBtn: {
    width: "90%",
    backgroundColor: "#164A40",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "center",
  },
  nearbyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  bannerWrap: {
    width: "90%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 12,
    alignItems: "center",
  },
  bannerInner: {
    width: "100%",
    height: 180,
    overflow: "hidden",
    borderRadius: 12,
  },
  title: { fontSize: 20, fontWeight: "800", marginTop: 12 },
  desc: {
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 6,
  },
  bookHeading: { marginTop: 18, fontWeight: "800", fontSize: 18 },
  selectorRow: { flexDirection: "row", marginTop: 14 },
  option: {
    borderWidth: 1,
    borderColor: "#164A40",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginHorizontal: 8,
    backgroundColor: "transparent",
  },
  optionActive: { backgroundColor: "#164A40" },
  optionText: { color: "#164A40", fontWeight: "600" },
  optionTextActive: { color: "#fff" },
  bookBtn: {
    marginTop: 22,
    backgroundColor: "#164A40",
    paddingVertical: 12,
    paddingHorizontal: 38,
    borderRadius: 24,
  },
  bookText: { color: "#fff", fontWeight: "700" },
});
