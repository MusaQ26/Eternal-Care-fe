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
import GraveCareIcon from "../assets/images/grave-care.svg";
import AvatarButton from "../components/ui/avatar-button";
import { Colors } from "../constants/theme";
import BottomNav from "../components/ui/bottom-nav";

export default function GraveCare() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("1 day");
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
        <View style={[styles.bannerWrap]}>
          <View style={styles.bannerInner}>
            <SocialSvg
              Icon={GraveCareIcon}
              size={"100%"}
              style={{ borderRadius: 20 }}
            />
          </View>
        </View>

        <Text style={styles.title}>Grave Care Service</Text>
        <Text style={styles.desc}>
          We offer professional grave cleaning and maintenance services carried
          out with the utmost respect and care. Our team ensures each resting
          place is kept clean, dignified, and well-maintained. We understand the
          emotional value of these sites and treat every grave with the
          reverence it deserves.
        </Text>

        <Text style={styles.bookHeading}>Book a Package</Text>

        <View style={styles.selectorRow}>
          {["1 day", "Weekly", "Monthly"].map((s) => (
            <Pressable
              key={s}
              onPress={() => setSelected(s)}
              style={[styles.option, selected === s && styles.optionActive]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected === s && styles.optionTextActive,
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.bookBtn}
          onPress={() => {
            const { setBooking } = require("../utils/bookingStore");
            // Map UI selection to packageId and provide a sensible default date (next day)
            const map: Record<string,string> = { '1 day':'gravecare_1d', 'Weekly':'gravecare_weekly', 'Monthly':'gravecare_monthly' };
            const pkg = map[selected] || 'gravecare_custom';
            const next = new Date(); next.setDate(next.getDate() + 1);
            setBooking({
              service: "Grave Care",
              detail: "Meadow Cemetary",
              price: "57000",
              packageId: pkg,
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
  searchWrapStatic: { paddingHorizontal: 18, marginTop: 18 },
  // (searchBar width merged into main searchBar definition below)
  searchWrap: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 80,
    zIndex: 1000,
    elevation: 1000,
  },
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
  bannerWrap: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 12,
    alignItems: "center",
  },
  bannerInner: {
    width: "100%",
    height: 160,
    overflow: "hidden",
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 16,
    textAlign: "center",
  },
  desc: {
    color: "#333",
    textAlign: "center",
    marginTop: 14,
    lineHeight: 24,
    paddingHorizontal: 20,
    fontSize: 15,
    maxWidth: 760,
  },
  bookHeading: { marginTop: 18, fontWeight: "800", fontSize: 18 },
  selectorRow: { flexDirection: "row", marginTop: 14 },
  option: {
    borderWidth: 1,
    borderColor: "#164A40",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
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
