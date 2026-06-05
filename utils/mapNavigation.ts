import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

export function openDirections(lat: number, lng: number, label: string) {
  if (!lat || !lng) {
    Alert.alert("Location Unavailable", "This graveyard does not have map coordinates set yet. Please contact the administrator.");
    return;
  }

  const encodedLabel = encodeURIComponent(label);

  // Android: deep-link into Google Maps navigation
  // iOS: deep-link into Apple Maps navigation
  const nativeUrl = Platform.OS === 'android'
    ? `google.navigation:q=${lat},${lng}&label=${encodedLabel}`
    : `maps://?daddr=${lat},${lng}&dirflg=d`;

  const webFallback = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedLabel}&travelmode=driving`;

  Linking.canOpenURL(nativeUrl)
    .then((supported) => Linking.openURL(supported ? nativeUrl : webFallback))
    .catch(() => {
      Linking.openURL(webFallback).catch(() => {
        Alert.alert("Error", "Could not open maps. Please check your maps app is installed.");
      });
    });
}
