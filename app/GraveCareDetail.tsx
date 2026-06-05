import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AvatarButton from "../components/ui/avatar-button";
import AppHeader from "../components/ui/app-header";
import { Colors } from "../constants/theme";
import { getToken } from "../utils/authStore";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

const PKG_DAYS: Record<string, number> = {
  gravecare_1d: 1, gravecare_weekly: 7, gravecare_monthly: 30,
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_OF_WEEK = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function buildDays(count = 14) {
  const days: { label: string; dayLabel: string; iso: string }[] = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      label: `${d.getDate()}`,
      dayLabel: DAYS_OF_WEEK[d.getDay()],
      iso: d.toISOString(),
    });
  }
  return days;
}

const DAYS = buildDays();

const PACKAGES = [
  {
    id: "gravecare_1d",
    label: "One-Time Clean",
    price: 2500,
    includes: ["Full grave cleaning", "Weeding and trimming", "Photo report sent to family"],
  },
  {
    id: "gravecare_weekly",
    label: "Weekly Care",
    price: 8000,
    includes: ["Weekly grave cleaning", "Fresh flower placement", "Monthly photo report", "Priority scheduling"],
    recommended: true,
  },
  {
    id: "gravecare_monthly",
    label: "Monthly Plan",
    price: 4500,
    includes: ["Monthly deep clean", "Grave stone polishing", "Photo report after service"],
  },
];

export default function GraveCareDetail() {
  const router = useRouter();
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[1].id);
  const [selectedDay, setSelectedDay] = useState(DAYS[0].iso);
  const [activePlan, setActivePlan] = useState<{ label: string; expiry: Date } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API}/bookings/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const { bookings } = await res.json();
        for (const b of bookings ?? []) {
          const pid: string = b.packageId || b.meta?.packageId || "";
          const days = PKG_DAYS[pid];
          if (!days) continue;
          const expiryStr = b.meta?.packageExpiry || (() => {
            const d = new Date(b.created_at || b.date || Date.now());
            d.setDate(d.getDate() + days);
            return d.toISOString();
          })();
          const expiry = new Date(expiryStr);
          if (expiry > new Date()) {
            const pkg = PACKAGES.find((p) => p.id === pid);
            setActivePlan({ label: pkg?.label ?? pid, expiry });
            break;
          }
        }
      } catch { /* non-critical */ }
    })();
  }, []);

  const handleConfirm = () => {
    const { setBooking } = require("../utils/bookingStore");
    const pkg = PACKAGES.find((p) => p.id === selectedPkg)!;
    setBooking({
      service: "Memorial Care",
      detail: pkg.label,
      packageId: pkg.id,
      date: selectedDay,
      price: String(pkg.price),
    });
    (router as any).push("/Form");
  };

  const selectedPkgObj = PACKAGES.find((p) => p.id === selectedPkg);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="Memorial Care" right={<AvatarButton size={36} />} />

      {activePlan && (
        <View style={styles.activeBanner}>
          <View>
            <Text style={styles.activeBannerTitle}>✓ Active Plan: {activePlan.label}</Text>
            <Text style={styles.activeBannerSub}>
              Valid until {activePlan.expiry.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          </View>
          <View style={styles.activeDot} />
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.desc}>
          Professional grave cleaning and maintenance carried out with respect, care, and devotion. Choose a plan that suits your needs.
        </Text>

        <Text style={styles.sectionLabel}>CHOOSE A PACKAGE</Text>
        {PACKAGES.map((pkg) => {
          const active = selectedPkg === pkg.id;
          return (
            <Pressable key={pkg.id} style={[styles.pkgCard, active && styles.pkgCardActive]} onPress={() => setSelectedPkg(pkg.id)}>
              <View style={styles.pkgHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.pkgLabelRow}>
                    <Text style={[styles.pkgLabel, active && styles.pkgLabelActive]}>{pkg.label}</Text>
                    {pkg.recommended && <View style={styles.recBadge}><Text style={styles.recText}>Recommended</Text></View>}
                  </View>
                  <Text style={[styles.pkgPrice, active && styles.pkgPriceActive]}>PKR {pkg.price.toLocaleString()}</Text>
                </View>
                <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </View>
              <View style={styles.includesList}>
                {pkg.includes.map((item) => (
                  <Text key={item} style={[styles.includeItem, active && styles.includeItemActive]}>
                    ✓  {item}
                  </Text>
                ))}
              </View>
            </Pressable>
          );
        })}

        <Text style={styles.sectionLabel}>FIRST SERVICE DATE</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll} contentContainerStyle={{ gap: 10 }}>
          {DAYS.map((d) => {
            const active = selectedDay === d.iso;
            return (
              <Pressable key={d.iso} style={[styles.dayBtn, active && styles.dayBtnActive]} onPress={() => setSelectedDay(d.iso)}>
                <Text style={[styles.dayDow, active && styles.dayDowActive]}>{d.dayLabel}</Text>
                <Text style={[styles.dayNum, active && styles.dayNumActive]}>{d.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Summary strip */}
        {selectedPkgObj && (
          <View style={styles.summaryStrip}>
            <Text style={styles.summaryLabel}>{selectedPkgObj.label}</Text>
            <Text style={styles.summaryPrice}>PKR {selectedPkgObj.price.toLocaleString()}</Text>
          </View>
        )}

        <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Confirm Package</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f8fa" },
  activeBanner: {
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: "#d7efe6", borderRadius: 14, padding: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderWidth: 1, borderColor: "#164A40",
  },
  activeBannerTitle: { color: "#164A40", fontWeight: "800", fontSize: 14 },
  activeBannerSub: { color: "#164A40", fontSize: 12, marginTop: 2, opacity: 0.8 },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#22c55e", marginLeft: 10 },
  content: { paddingHorizontal: 16, paddingBottom: 50 },
  desc: { color: "#777", lineHeight: 22, marginBottom: 20, marginTop: 4, fontSize: 14 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#999", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, marginTop: 4 },

  // Package cards
  pkgCard: {
    borderWidth: 1.5, borderColor: "#e9ecef", borderRadius: 16, padding: 16, marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  pkgCardActive: { borderColor: "#164A40", backgroundColor: "#164A40" },
  pkgHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  pkgLabelRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  pkgLabel: { fontSize: 16, fontWeight: "800", color: "#111" },
  pkgLabelActive: { color: "#fff" },
  pkgPrice: { fontSize: 20, fontWeight: "900", color: "#164A40" },
  pkgPriceActive: { color: "#cfe9d8" },
  recBadge: { backgroundColor: "#fef3c7", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" },
  recText: { fontSize: 11, color: "#92400e", fontWeight: "700" },
  radioCircle: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#ccc",
    alignItems: "center", justifyContent: "center", marginLeft: 10, marginTop: 2,
  },
  radioCircleActive: { borderColor: "#cfe9d8" },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#cfe9d8" },
  includesList: { gap: 6 },
  includeItem: { color: "#555", fontSize: 13, lineHeight: 19 },
  includeItemActive: { color: "rgba(255,255,255,0.85)" },

  // Date picker
  dayScroll: { marginBottom: 20 },
  dayBtn: {
    borderWidth: 1.5, borderColor: "#e9ecef", borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 14, alignItems: "center", backgroundColor: "#fff",
    minWidth: 54,
  },
  dayBtnActive: { backgroundColor: "#164A40", borderColor: "#164A40" },
  dayDow: { fontSize: 11, color: "#999", fontWeight: "600", marginBottom: 2 },
  dayDowActive: { color: "rgba(255,255,255,0.7)" },
  dayNum: { fontSize: 16, fontWeight: "800", color: "#111" },
  dayNumActive: { color: "#fff" },

  // Summary + confirm
  summaryStrip: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#eaf4ee", borderRadius: 12, padding: 14, marginBottom: 14,
  },
  summaryLabel: { fontSize: 14, fontWeight: "700", color: "#164A40" },
  summaryPrice: { fontSize: 16, fontWeight: "900", color: "#164A40" },
  confirmBtn: {
    backgroundColor: "#164A40", borderRadius: 16, paddingVertical: 16, alignItems: "center",
    shadowColor: "#164A40", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  confirmBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
