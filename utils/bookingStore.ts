import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'pending_booking';
const TTL_MS = 30 * 60 * 1000; // 30 minutes

let _cache: any = null;

export async function setBooking(b: any) {
  const payload = { data: { ...(_cache || {}), ...(b || {}) }, expiresAt: Date.now() + TTL_MS };
  _cache = payload.data;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(payload));
  } catch { /* non-critical */ }
}

export function getBooking(): any {
  return _cache || {};
}

export async function loadBooking(): Promise<any> {
  if (_cache) return _cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      await AsyncStorage.removeItem(KEY);
      return {};
    }
    _cache = data;
    return data;
  } catch {
    return {};
  }
}

export async function clearBooking() {
  _cache = null;
  try {
    await AsyncStorage.removeItem(KEY);
  } catch { /* non-critical */ }
}
