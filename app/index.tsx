import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import LogoSvg from "../assets/images/Eternal-Care-logo-black3.svg";

export default function SplashScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <LogoSvg width="100%" height="100%" />
      </View>

      <Pressable style={styles.button} onPress={() => router.push("/second")}>
        <View style={styles.chevron} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 80,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#114A3A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
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
