import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { saveToken, saveUser } from './authStore';

const BACKEND =
  (process.env.EXPO_PUBLIC_API_URL as string) || 'https://eternal-care-be.vercel.app';

export async function handleGoogleAuth(router: any): Promise<void> {
  const result = await WebBrowser.openAuthSessionAsync(
    `${BACKEND}/auth/google`,
    'eternalcare://auth'
  );

  if (result.type !== 'success') return;

  const parsed = Linking.parse(result.url);
  const token = parsed.queryParams?.token as string | undefined;
  const error = parsed.queryParams?.error as string | undefined;

  if (error || !token) {
    const msg =
      error === 'google_denied' ? 'Google sign-in was cancelled.' :
      error === 'no_email'      ? 'Your Google account has no accessible email.' :
                                  'Google sign-in failed. Please try again.';
    throw new Error(msg);
  }

  const payload = JSON.parse(
    atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
  );

  await saveToken(token);
  await saveUser({ id: payload.userId, name: '', email: payload.email, role: payload.role });

  router.replace('/Home');
}
