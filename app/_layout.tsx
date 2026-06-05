import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { getToken, clearToken, clearUser, getUser, saveUser } from "../utils/authStore";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        const token = await getToken();
        if (token) {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
              await clearToken();
              await clearUser();
            } else {
              // Ensure cached user has avatar_url (missing from older sessions)
              const cached = await getUser();
              if (cached?.id && !cached.avatar_url) {
                try {
                  const res = await fetch(`${API}/profile/${cached.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    const { user } = await res.json();
                    await saveUser({ ...cached, ...user });
                  }
                } catch { /* non-critical */ }
              }
            }
          }
        }
      } catch { /* malformed token — leave as-is */ }

      setAppIsReady(true);
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <StatusBar hidden />
      <Slot />
    </View>
  );
}
