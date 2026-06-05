import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Tab = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
};

const TABS: Tab[] = [
  { label: "Home",     icon: "home-outline",          iconActive: "home",          route: "/Home" },
  { label: "Bookings", icon: "calendar-outline",       iconActive: "calendar",      route: "/BookingHistory" },
  { label: "Alerts",   icon: "notifications-outline",  iconActive: "notifications", route: "/Notifications" },
  { label: "Profile",  icon: "person-outline",         iconActive: "person",        route: "/Profile" },
];

const ACTIVE_COLOR = "#164A40";
const INACTIVE_COLOR = "#999";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.route;
        return (
          <Pressable
            key={tab.route}
            style={styles.tab}
            onPress={() => {
              if (!isActive) (router as any).push(tab.route);
            }}
          >
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={24}
              color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  label: {
    fontSize: 11,
    color: INACTIVE_COLOR,
    marginTop: 3,
    fontWeight: "500",
  },
  labelActive: {
    color: ACTIVE_COLOR,
    fontWeight: "700",
  },
  activeDot: {
    position: "absolute",
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
  },
});
