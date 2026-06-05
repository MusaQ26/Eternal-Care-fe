import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import SocialSvg from "../components/ui/social-svg";
import BellIcon from "../assets/images/bell.svg";
import ProfileIcon from "../assets/images/profile.svg";
import EditIcon from "../assets/images/edit.svg";
import { Colors } from "../constants/theme";
import { getUser, saveUser, getToken, clearToken, clearUser } from "../utils/authStore";
import BottomNav from "../components/ui/bottom-nav";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });

  useEffect(() => {
    (async () => {
      const cached = await getUser();
      if (cached) {
        setProfile(cached as UserProfile);
        setForm({ name: cached.name, phone: cached.phone ?? "", address: cached.address ?? "" });
      }
      const token = await getToken();
      if (!cached?.id || !token) return;
      try {
        const res = await fetch(`${API}/profile/${cached.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { user } = await res.json();
          const merged = { ...cached, ...user };
          setProfile(merged);
          setForm({ name: user.name ?? "", phone: user.phone ?? "", address: user.address ?? "" });
          await saveUser(merged);
        }
      } catch {
        // use cached
      }
    })();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to your photo library to upload a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    uploadAvatar(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to your camera to take a profile photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    uploadAvatar(result.assets[0].uri);
  };

  const showImageOptions = () => {
    Alert.alert("Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const uploadAvatar = async (uri: string) => {
    if (!profile) return;
    const token = await getToken();
    if (!token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop() ?? "avatar.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("avatar", { uri, name: filename, type } as any);

      const res = await fetch(`${API}/avatar/${profile.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json();
        Alert.alert("Upload Failed", body.error ?? "Could not upload image.");
        return;
      }
      const { avatarUrl } = await res.json();
      const updated = { ...profile, avatar_url: avatarUrl };
      setProfile(updated);
      await saveUser(updated);
    } catch {
      Alert.alert("Error", "Could not reach the server.");
    } finally {
      setUploading(false);
    }
  };

  const saveChanges = async () => {
    if (!profile) return;
    const token = await getToken();
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/profile/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name, phone: form.phone, address: form.address }),
      });
      if (!res.ok) {
        const body = await res.json();
        Alert.alert("Error", body.error ?? "Failed to save changes.");
        return;
      }
      const { user } = await res.json();
      const updated = { ...profile, ...user, phone: form.phone, address: form.address };
      setProfile(updated);
      await saveUser(updated);
      setEditing(false);
    } catch {
      Alert.alert("Error", "Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 60 }} color="#164A40" />
      </SafeAreaView>
    );
  }

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel" },
      {
        text: "Log Out", style: "destructive",
        onPress: async () => {
          await clearToken();
          await clearUser();
          (router as any).replace("/Login");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f8fa" }}>
    <SafeAreaView style={[styles.safe, { flex: 1 }]} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={styles.pageTitle}>{editing ? "Edit Profile" : "My Profile"}</Text>
            <Pressable onPress={() => (router as any).push("/Notifications")}>
              <SocialSvg Icon={BellIcon} size={20} />
            </Pressable>
          </View>

          {/* Hero card */}
          <View style={styles.heroCard}>
            <Pressable style={styles.avatarCircle} onPress={showImageOptions} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>{(profile.name || "U")[0].toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.cameraOverlay}>
                <Text style={styles.cameraIcon}>📷</Text>
              </View>
            </Pressable>
            <Text style={styles.profileName}>{profile.name || "User"}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            {!editing && (
              <Pressable style={styles.editChip} onPress={() => setEditing(true)}>
                <SocialSvg Icon={EditIcon} size={14} />
                <Text style={styles.editChipText}>Edit Profile</Text>
              </Pressable>
            )}
          </View>

          {/* Info section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ACCOUNT DETAILS</Text>
            {editing ? (
              <View style={styles.fieldsCard}>
                <FieldInput label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Your full name" />
                <FieldInput label="Email" value={profile.email} onChange={() => {}} placeholder="" disabled />
                <FieldInput label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="+92 300 0000000" keyboardType="phone-pad" />
                <FieldInput label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} placeholder="Your city / address" />
              </View>
            ) : (
              <View style={styles.infoCard}>
                <InfoRow icon="👤" label="Name"    value={profile.name || "—"} />
                <InfoRow icon="✉️"  label="Email"   value={profile.email} />
                <InfoRow icon="📞" label="Phone"   value={profile.phone || "—"} last />
              </View>
            )}
          </View>

          {editing ? (
            <View style={styles.btnRow}>
              <Pressable style={styles.cancelBtn} onPress={() => { setEditing(false); setForm({ name: profile.name, phone: profile.phone ?? "", address: profile.address ?? "" }); }}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={saveChanges} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </Pressable>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    <BottomNav />
    </View>
  );
}

function InfoRow({ icon, label, value, last }: { icon: string; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, last && styles.infoRowLast]}>
      <Text style={styles.infoRowIcon}>{icon}</Text>
      <View style={styles.infoRowBody}>
        <Text style={styles.infoRowLabel}>{label}</Text>
        <Text style={styles.infoRowValue} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

function FieldInput({ label, value, onChange, placeholder, disabled, keyboardType }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; disabled?: boolean; keyboardType?: any;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        editable={!disabled}
        keyboardType={keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f8fa" },
  container: { paddingBottom: 100 },

  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  pageTitle: { fontSize: 22, fontWeight: "800", color: "#111" },

  heroCard: {
    marginHorizontal: 16, marginTop: 8, marginBottom: 20,
    backgroundColor: "#164A40", borderRadius: 24, padding: 28,
    alignItems: "center",
  },
  avatarCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center",
    overflow: "hidden", borderWidth: 3, borderColor: "rgba(255,255,255,0.6)",
    marginBottom: 14,
  },
  avatarImg: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { color: "#fff", fontSize: 36, fontWeight: "900" },
  cameraOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", paddingVertical: 5,
  },
  cameraIcon: { fontSize: 12 },
  profileName: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  profileEmail: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 14 },
  editChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 20,
    paddingVertical: 7, paddingHorizontal: 16,
  },
  editChipText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#999", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10, marginLeft: 4 },

  infoCard: {
    backgroundColor: "#fff", borderRadius: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoRowIcon: { fontSize: 18, marginRight: 12, width: 24, textAlign: "center" },
  infoRowBody: { flex: 1 },
  infoRowLabel: { fontSize: 11, color: "#999", fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  infoRowValue: { fontSize: 15, color: "#111", fontWeight: "600" },

  fieldsCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "700", color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 },
  input: { backgroundColor: "#f7f8fa", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15, color: "#111" },
  inputDisabled: { backgroundColor: "#f0f0f0", color: "#aaa" },

  btnRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: "#164A40", alignItems: "center" },
  cancelBtnText: { color: "#164A40", fontWeight: "700", fontSize: 15 },
  saveBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: "#164A40", alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  logoutBtn: {
    marginHorizontal: 16, marginTop: 8, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: "#ef4444",
    alignItems: "center",
  },
  logoutBtnText: { color: "#ef4444", fontWeight: "700", fontSize: 15 },
});
