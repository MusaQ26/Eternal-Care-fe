import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default URLs for dev
const DEFAULT_LOCAL = 'http://localhost:4000';
const ANDROID_EMULATOR_LOCAL = 'http://10.0.2.2:4000';

const API_URL =
  (process.env.EXPO_PUBLIC_API_URL as string) ||
  (Platform.OS === 'android' ? ANDROID_EMULATOR_LOCAL : DEFAULT_LOCAL);

async function getToken() {
  return await AsyncStorage.getItem('token');
}

async function request(path: string, opts: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers as any) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  } catch (err: any) {
    // Friendly error for network failures (common on Android if using localhost)
    throw { error: 'Cannot reach backend. Check EXPO_PUBLIC_API_URL or emulator/device network.' };
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

export async function signup(name: string, email: string, password: string) {
  return request('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
}

export async function login(email: string, password: string) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function getProfile(id: string) {
  return request(`/profile/${id}`);
}

export async function registerToken(token: string) {
  return request('/auth/register-token', { method: 'POST', body: JSON.stringify({ token }) });
}

export async function createBooking(packageId: string, date: string, meta?: any) {
  return request('/bookings', { method: 'POST', body: JSON.stringify({ packageId, date, meta }) });
}

export async function getBooking(id: string) {
  return request(`/bookings/${id}`);
}

export async function payBooking(bookingId: string, body: any) {
  return request(`/bookings/${bookingId}/pay`, { method: 'POST', body: JSON.stringify(body) });
}

export async function getGraveyards(lat?: number, lng?: number, radius = 10) {
  const q = lat != null && lng != null ? `?lat=${lat}&lng=${lng}&radius=${radius}` : '';
  return request(`/graveyards${q}`);
}

export async function getGraveyard(id: string) {
  return request(`/graveyards/${id}`);
}

export async function getPlots(graveyardId: string) {
  return request(`/graveyards/${graveyardId}/plots`);
}

export async function searchGraves(query: string) {
  return request(`/graveyards/deceased/search?q=${encodeURIComponent(query)}`);
}

export async function getServiceProviders(type?: string) {
  const q = type ? `?type=${encodeURIComponent(type)}` : '';
  return request(`/service-providers${q}`);
}

export async function getServiceProvider(id: string) {
  return request(`/service-providers/${id}`);
}

export async function getUserBookings() {
  return request('/bookings/me');
}

export async function cancelBooking(id: string) {
  return request(`/bookings/${id}/cancel`, { method: 'POST' });
}

export async function getNotifications() {
  return request('/notifications');
}

export async function markNotificationRead(id: string) {
  return request(`/notifications/${id}/read`, { method: 'POST' });
}

// Admin endpoints
export async function adminGetGraveyards() { return request('/admin/graveyards'); }
export async function adminCreateGraveyard(data: any) { return request('/admin/graveyards', { method: 'POST', body: JSON.stringify(data) }); }
export async function adminUpdateGraveyard(id: string, data: any) { return request(`/admin/graveyards/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export async function adminDeleteGraveyard(id: string) { return request(`/admin/graveyards/${id}`, { method: 'DELETE' }); }

export async function adminGetPlots(graveyardId?: string) {
  const q = graveyardId ? `?graveyard_id=${graveyardId}` : '';
  return request(`/admin/plots${q}`);
}
export async function adminCreatePlot(data: any) { return request('/admin/plots', { method: 'POST', body: JSON.stringify(data) }); }
export async function adminUpdatePlot(id: string, data: any) { return request(`/admin/plots/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }

export async function adminGetBookings(filters?: any) {
  const q = filters ? '?' + new URLSearchParams(filters).toString() : '';
  return request(`/admin/bookings${q}`);
}
export async function adminUpdateBooking(id: string, data: any) { return request(`/admin/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }

export async function adminGetProviders(type?: string) {
  const q = type ? `?type=${type}` : '';
  return request(`/admin/providers${q}`);
}
export async function adminCreateProvider(data: any) { return request('/admin/providers', { method: 'POST', body: JSON.stringify(data) }); }
export async function adminUpdateProvider(id: string, data: any) { return request(`/admin/providers/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export async function adminDeleteProvider(id: string) { return request(`/admin/providers/${id}`, { method: 'DELETE' }); }

export async function adminGetDeceased() { return request('/admin/deceased'); }
export async function adminCreateDeceased(data: any) { return request('/admin/deceased', { method: 'POST', body: JSON.stringify(data) }); }
export async function adminUpdateDeceased(id: string, data: any) { return request(`/admin/deceased/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
export async function adminDeleteDeceased(id: string) { return request(`/admin/deceased/${id}`, { method: 'DELETE' }); }

export async function adminGetReports(from: string, to: string) { return request(`/admin/stats?from=${from}&to=${to}`); }
export async function adminGetDashboard() { return request('/admin/stats'); }

export default { signup, login, getProfile, registerToken, createBooking, getBooking, payBooking, getGraveyards, getGraveyard, getPlots, searchGraves, getServiceProviders, getServiceProvider, getUserBookings, cancelBooking, getNotifications, markNotificationRead };
