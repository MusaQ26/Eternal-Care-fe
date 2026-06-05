import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
};

export default function AppHeader({ title, subtitle, right, onBack, showBack = true }: Props) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack && (
          <Pressable
            style={styles.backBtn}
            onPress={onBack ?? (() => router.back())}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color="#164A40" />
          </Pressable>
        )}
        <View style={styles.titleWrap}>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
        </View>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eaf4ee",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: { flex: 1 },
  subtitle: { fontSize: 11, color: "#999", fontWeight: "500", marginBottom: 1 },
  title: { fontSize: 20, fontWeight: "800", color: "#111" },
  right: { flexDirection: "row", alignItems: "center", gap: 10 },
});
