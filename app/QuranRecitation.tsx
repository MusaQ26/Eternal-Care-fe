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
import QuranIcon from "../assets/images/quran-recitation.svg";
import AvatarButton from "../components/ui/avatar-button";
import { Colors } from "../constants/theme";
import BottomNav from "../components/ui/bottom-nav";

export default function QuranRecitation() {
  const router = useRouter();
  const [selected, setSelected] = useState({
    day: "15",
    month: "March",
    time: "4:00 pm",
  });
  // search and header use normal layout flow now

  const pick = (key: "day" | "month" | "time", value: string) => {
    setSelected((s) => ({ ...s, [key]: value }));
  };

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
        <View style={styles.bannerWrap}>
          <View style={styles.bannerInner}>
            <SocialSvg
              Icon={QuranIcon}
              size={"100%"}
              style={{ borderRadius: 12 }}
            />
          </View>
        </View>

        <Text style={styles.title}>Quran Recitation</Text>
        <Text style={styles.desc}>
          We provide dignified Quran and Dua recitation services to offer peace,
          blessings, and spiritual comfort. Each recitation is delivered with
          sincerity and devotion, bringing solace during moments of remembrance.
        </Text>

        <Text style={styles.bookHeading}>Book a Slot</Text>

        <View style={styles.selectorRow}>
          <Pressable
            style={[
              styles.option,
              selected.day === "15" && styles.optionActive,
            ]}
            onPress={() => pick("day", "15")}
          >
            <Text
              style={[
                styles.optionText,
                selected.day === "15" && styles.optionTextActive,
              ]}
            >
              15
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.option,
              selected.month === "March" && styles.optionActive,
            ]}
            onPress={() => pick("month", "March")}
          >
            <Text
              style={[
                styles.optionText,
                selected.month === "March" && styles.optionTextActive,
              ]}
            >
              March
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.option,
              selected.time === "4:00 pm" && styles.optionActive,
            ]}
            onPress={() => pick("time", "4:00 pm")}
          >
            <Text
              style={[
                styles.optionText,
                selected.time === "4:00 pm" && styles.optionTextActive,
              ]}
            >
              4:00 pm
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.bookBtn}
          onPress={() => {
            const { setBooking } = require("../utils/bookingStore");
            // construct a packageId from the selected slot and default date to next day
            const pkg = `quran_${selected.day}_${selected.month}_${selected.time.replace(/\s/g,'')}`;
            const next = new Date(); next.setDate(next.getDate() + 1);
            setBooking({
              service: "Quran Recitation",
              detail: "Quran Recitation Slot",
              price: "15000",
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
  searchWrapStatic: { paddingHorizontal: 18, marginTop: 12 },
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
