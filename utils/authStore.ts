import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveToken(token: string) {
  await AsyncStorage.setItem('token', token);
}

export async function getToken() {
  return AsyncStorage.getItem('token');
}

export async function clearToken() {
  await AsyncStorage.removeItem('token');
}

export async function saveUser(user: { id: string; name: string; email: string; role?: string; phone?: string; address?: string; avatar_url?: string }) {
  await AsyncStorage.setItem('user', JSON.stringify(user));
}

export async function getUser(): Promise<{ id: string; name: string; email: string; role?: string; phone?: string; address?: string; avatar_url?: string } | null> {
  const raw = await AsyncStorage.getItem('user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export async function clearUser() {
  await AsyncStorage.removeItem('user');
}

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  return user?.role === 'admin';
}
