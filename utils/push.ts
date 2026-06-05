export async function getExpoPushToken() {
  // In Expo Go remote notifications are not supported on Android.
  // Return null so registration is a no-op in this environment.
  return null;
}

export default { getExpoPushToken };
