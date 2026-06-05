module.exports = {
  expo: {
    name: "Eternal Care",
    slug: "eternal-care",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/Eternal-Care-logo-black3.png",
    scheme: "eternalcare",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
      },
    },
    android: {
      package: "com.affantariq.eternalcare",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
        },
      },
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.eternalcare.app",
          "enableGooglePay": false
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Eternal Care to access your photos to set a profile picture.",
          "cameraPermission": "Allow Eternal Care to use your camera to take a profile photo."
        }
      ],
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Allow Eternal Care to access your location to find nearby graveyards.",
        },
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "9ad88895-aef1-4f6f-ae9d-869873458460",
      },
    },
  },
};
