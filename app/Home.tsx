import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialSvg from "../components/ui/social-svg";
import AvatarButton from "../components/ui/avatar-button";

import { isAdmin, clearUser } from "../utils/authStore";
import BottomNav from "../components/ui/bottom-nav";
import BookingIcon from "../assets/images/booking.svg";
import SpertualIcon from "../assets/images/spertual.svg";
import MemorealIcon from "../assets/images/memoreal.svg";
import SupportIcon from "../assets/images/support.svg";
import BellIcon from "../assets/images/bell.svg";
import SearchIcon from "../assets/images/search.svg";

export default function Home() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [adminUser, setAdminUser] = React.useState(false);

  const [userName, setUserName] = React.useState("");
  React.useEffect(() => {
    isAdmin().then(setAdminUser);
    import('../utils/authStore').then(m => m.getUser()).then(u => { if (u?.name) setUserName(u.name.split(' ')[0]); });
  }, []);

  const ServiceCard = ({
    tag,
    title,
    desc,
    Icon,
    onPress,
  }: {
    tag: string;
    title: string;
    desc: string;
    Icon: React.ComponentType<any>;
    onPress: () => void;
  }) => (
    <Pressable style={styles.serviceCard} onPress={onPress}>
      <View style={styles.serviceCardLeft}>
        <View style={styles.serviceTag}><Text style={styles.serviceTagText}>{tag}</Text></View>
        <Text style={styles.serviceTitle}>{title}</Text>
        <Text style={styles.serviceDesc} numberOfLines={3}>{desc}</Text>
        <View style={styles.bookBtn}><Text style={styles.bookBtnText}>Book Now →</Text></View>
      </View>
      <View style={styles.serviceImgWrap}>
        <SocialSvg Icon={Icon} size={110} />
      </View>
    </Pressable>
  );

  const onLogout = async () => {
    try {
      const { clearToken } = await import('../utils/authStore');
      await clearToken();
      await clearUser();
    } catch { /* non-critical */ }
    setMenuVisible(false);
    (router as any).replace('/Login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
    <SafeAreaView style={[styles.safe, { flex: 1 }]} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Pressable onPress={() => setMenuVisible(true)}>
          <Text style={styles.menu}>≡</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.iconWrap}
            onPress={() => (router as any).push("/Support")}
          >
            <SocialSvg
              Icon={SupportIcon}
              size={22}
            />
          </Pressable>
          <View style={{ marginHorizontal: 6 }}>
            <AvatarButton size={36} />
          </View>
          <Pressable style={styles.iconWrap} onPress={() => (router as any).push("/Notifications")}>
            <SocialSvg Icon={BellIcon} size={20} />
          </Pressable>
        </View>
      </View>

      {/* Side drawer menu */}
      <Modal visible={menuVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          {/* Drawer panel — left side */}
          <View style={styles.drawer}>
            {/* Branding header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerBrand}>Eternal Care</Text>
              <Text style={styles.drawerTagline}>Honoring Memories, Embracing Peace</Text>
            </View>

            <View style={styles.drawerDivider} />

            {/* Nav items */}
            {[
              { icon: "🏠", label: "Home",           route: "/Home" },
              { icon: "👤", label: "Profile",         route: "/Profile" },
              { icon: "📋", label: "My Bookings",     route: "/BookingHistory" },
              { icon: "🔍", label: "Grave Search",    route: "/GraveSearch" },
              { icon: "🔔", label: "Notifications",   route: "/Notifications" },
            ].map((item) => (
              <Pressable key={item.route} style={styles.drawerItem} onPress={() => { setMenuVisible(false); (router as any).push(item.route); }}>
                <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                <Text style={styles.drawerItemText}>{item.label}</Text>
              </Pressable>
            ))}

            {adminUser && (
              <Pressable style={styles.drawerItem} onPress={() => { setMenuVisible(false); (router as any).push('/admin/AdminDashboard'); }}>
                <Text style={styles.drawerItemIcon}>⚙️</Text>
                <Text style={styles.drawerItemText}>Admin Panel</Text>
              </Pressable>
            )}

            <View style={styles.drawerDivider} />

            <Pressable style={styles.drawerLogout} onPress={() => { setMenuVisible(false); onLogout(); }}>
              <Text style={styles.drawerLogoutIcon}>🚪</Text>
              <Text style={styles.drawerLogoutText}>Log Out</Text>
            </Pressable>
          </View>
          {/* Dimmed backdrop — tap to close */}
          <Pressable style={styles.backdrop} onPress={() => setMenuVisible(false)} />
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Greeting */}
        <View style={styles.greetRow}>
          <View>
            <Text style={styles.greetSub}>Assalamu Alaikum{userName ? `, ${userName}` : ""} 👋</Text>
            <Text style={styles.greetTitle}>How can we help{"\n"}you today?</Text>
          </View>
        </View>

        {/* Search */}
        <Pressable style={styles.searchBar} onPress={() => (router as any).push("/GraveSearch")}>
          <SocialSvg Icon={SearchIcon} size={18} />
          <Text style={styles.searchPlaceholder}>Search graveyard...</Text>
        </Pressable>

        {/* Services */}
        <Text style={styles.sectionLabel}>OUR SERVICES</Text>

        <ServiceCard
          tag="Graveyard"
          title="Grave Booking"
          desc="Find and book a plot in a nearby graveyard with respect and care."
          Icon={BookingIcon}
          onPress={() => (router as any).push("/NearbyGraveyards")}
        />
        <ServiceCard
          tag="Spiritual"
          title="Spiritual Comfort"
          desc="Dignified Quran and Dua recitation for peace, blessings, and spiritual comfort."
          Icon={SpertualIcon}
          onPress={() => (router as any).push("/ReciterList")}
        />
        <ServiceCard
          tag="Maintenance"
          title="Memorial Care"
          desc="Professional grave cleaning and maintenance carried out with devotion."
          Icon={MemorealIcon}
          onPress={() => (router as any).push("/GraveCareDetail")}
        />
      </ScrollView>
    </SafeAreaView>
    <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f8fa" },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  menu: { fontSize: 24 },
  headerRight: { flexDirection: "row", alignItems: "center" },
  icon: { marginHorizontal: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  profileWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d7efe6",
    marginHorizontal: 6,
  },
  container: { paddingHorizontal: 18, paddingBottom: 100, paddingTop: 4 },

  // Greeting
  greetRow: { marginBottom: 20, marginTop: 8 },
  greetSub: { fontSize: 13, color: "#888", marginBottom: 4 },
  greetTitle: { fontSize: 26, fontWeight: "900", color: "#111", lineHeight: 32 },

  // Search
  searchBar: {
    backgroundColor: "#fff",
    borderRadius: 14,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  searchPlaceholder: { flex: 1, color: "#aaa", fontSize: 14 },

  // Section
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: "#999",
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 14,
  },

  // Service card
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  serviceCardLeft: { flex: 1, paddingRight: 10 },
  serviceTag: {
    backgroundColor: "#eaf4ee",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  serviceTagText: { fontSize: 11, color: "#164A40", fontWeight: "700" },
  serviceTitle: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 6 },
  serviceDesc: { fontSize: 13, color: "#666", lineHeight: 19, marginBottom: 14 },
  serviceImgWrap: { width: 110, height: 100, alignItems: "center", justifyContent: "center" },
  bookBtn: {
    backgroundColor: "#164A40",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  // Drawer modal
  modalOverlay: { flex: 1, flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  drawer: {
    width: 270, backgroundColor: "#164A40",
    paddingTop: 60, paddingBottom: 36,
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 16, elevation: 20,
  },
  drawerHeader: { paddingHorizontal: 24, paddingBottom: 20 },
  drawerBrand: { color: "#fff", fontSize: 20, fontWeight: "900", marginBottom: 4 },
  drawerTagline: { color: "rgba(255,255,255,0.55)", fontSize: 11, lineHeight: 15 },
  drawerDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.12)", marginHorizontal: 20, marginVertical: 8 },
  drawerItem: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 13, paddingHorizontal: 24, gap: 14,
  },
  drawerItemIcon: { fontSize: 18, width: 24, textAlign: "center" },
  drawerItemText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  drawerLogout: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 13, paddingHorizontal: 24, gap: 14, marginTop: 4,
  },
  drawerLogoutIcon: { fontSize: 18, width: 24, textAlign: "center" },
  drawerLogoutText: { color: "#ff6b6b", fontSize: 15, fontWeight: "700" },
});
