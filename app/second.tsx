import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import LogoSvg from "../assets/images/Eternal-Care-logo-black3.svg";

export default function SecondSplash() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.topGraphic} pointerEvents="none">
        <LogoSvg width={720} height={560} />
        <View style={styles.maskRect} pointerEvents="none" />
      </View>

      <View style={styles.content}>
        <Text style={styles.smallTitle}>OUR MOTTO</Text>
        <Text style={styles.bigTitle}>
          "Honoring Memories{`\n`}Embracing Peace"
        </Text>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => (router as any).push("/Login")}
      >
        <View style={styles.chevron} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  maskRect: {
    position: "absolute",
    left: 100,
    top: 320,
    width: 720,
    height: 720,
    backgroundColor: "#FFFFFF",
    zIndex: 10,
  },
  topGraphic: {
    position: "absolute",
    top: -40,
    right: -150,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  smallTitle: {
    fontSize: 12,
    letterSpacing: 1,
    color: "#000000",
    fontWeight: "700",
    marginBottom: 12,
  },
  bigTitle: {
    fontSize: 30,
    lineHeight: 40,
    textAlign: "center",
    color: "#114A3A",
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 20,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#114A3A",
    position: "absolute",
    bottom: 72,
    left: "50%",
    marginLeft: -28,
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    width: 20,
    height: 20,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    marginLeft: -4,
    borderColor: "#FFFFFF",
    transform: [{ rotate: "-45deg" }],
  },
});
