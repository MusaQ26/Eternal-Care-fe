import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { getToken } from "../utils/authStore";
import { getBooking, clearBooking } from "../utils/bookingStore";

const API = process.env.EXPO_PUBLIC_API_URL ?? "";
const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_KEY ?? "";

type ConfirmedInfo = {
  bookingId: string;
  service: string;
  detail: string;
  date: string;
  price: string;
  expiry: string;
};

function PaymentForm() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    amount: string;
    description: string;
    returnPath: string;
  }>();

  const amount = parseFloat(params.amount ?? "0");
  const description = params.description ?? "Eternal Care booking";

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedInfo | null>(null);

  useEffect(() => {
    setupPaymentSheet();
  }, []);

  const setupPaymentSheet = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API}/payments/create-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, description }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        Alert.alert("Payment Error", (body as any).error ?? "Could not initialise payment.");
        return;
      }
      const { clientSecret, intentId: id } = await res.json();
      setIntentId(id ?? null);
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Eternal Care",
        style: "alwaysLight",
        defaultBillingDetails: { name: "" },
      });
      if (error) {
        Alert.alert("Setup Error", error.message);
        return;
      }
      setReady(true);
    } catch (e: any) {
      const msg = (e?.message ?? "").toLowerCase();
      if (msg.includes("native") || msg.includes("module") || msg.includes("stripe")) {
        Alert.alert(
          "APK Required",
          "Stripe payments need the APK build, not Expo Go. Please install the preview APK.",
        );
      } else {
        Alert.alert("Error", "Could not reach the payment server. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!ready) return;
    setReady(false);
    const { error } = await presentPaymentSheet();
    if (error) {
      if (error.code !== "Canceled") Alert.alert("Payment Failed", error.message);
      setReady(true);
      return;
    }
    await processBooking();
  };

  const processBooking = async () => {
    const token = await getToken();
    const ctx = getBooking();

    const expiryDays: Record<string, number> = {
      gravecare_1d: 1, gravecare_weekly: 7, gravecare_monthly: 30,
    };
    const pkg = ctx.packageId ?? "";
    const packageExpiry = expiryDays[pkg]
      ? (() => { const d = new Date(); d.setDate(d.getDate() + expiryDays[pkg]); return d.toISOString(); })()
      : null;

    const bookingDate = ctx.date ?? new Date().toISOString();
    const fullMeta = {
      ...ctx,
      description,
      serviceType: ctx.service ?? description,
      price: amount,
      ...(packageExpiry ? { packageExpiry } : {}),
    };

    // Show confirmation immediately — Stripe payment already succeeded.
    // API calls below happen in the background.
    await clearBooking();
    setConfirmed({
      bookingId: "",
      service: fullMeta.serviceType ?? "",
      detail: ctx.detail ?? ctx.service ?? "",
      date: bookingDate.substring(0, 10),
      price: String(amount),
      expiry: packageExpiry ?? "",
    });

    // Create & pay booking record in background (non-blocking for the UI)
    try {
      const res = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          packageId: ctx.packageId ?? "direct_payment",
          date: bookingDate,
          meta: fullMeta,
        }),
      });
      if (res.ok) {
        const body = await res.json();
        const bookingId: string = body.booking?.id ?? "";
        if (bookingId) {
          // Update confirmation ref now that we have the ID
          setConfirmed((prev) => prev ? { ...prev, bookingId } : prev);
          try {
            await fetch(`${API}/bookings/${bookingId}/pay`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({ amount, method: "stripe", receipt: intentId }),
            });
          } catch { /* non-blocking */ }
        }
      }
    } catch { /* non-blocking — confirmation already shown */ }
  };

  // ── Confirmation view (replaces payment UI in-place after success) ──────────
  if (confirmed) {
    const ref = confirmed.bookingId ? `#${confirmed.bookingId.slice(-8).toUpperCase()}` : "";
    const hasExpiry = !!confirmed.expiry;
    const expiryDate = hasExpiry
      ? new Date(confirmed.expiry).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
      : "";

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.confirmContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.checkWrap}>
            <Text style={styles.checkMark}>✓</Text>
          </View>

          <Text style={styles.confirmTitle}>Booking Confirmed!</Text>
          {ref ? <Text style={styles.confirmRef}>{ref}</Text> : null}

          <View style={styles.confirmCard}>
            {confirmed.service ? (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Service</Text>
                <Text style={styles.confirmValue}>{confirmed.service}</Text>
              </View>
            ) : null}
            {confirmed.detail ? (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Details</Text>
                <Text style={styles.confirmValue}>{confirmed.detail}</Text>
              </View>
            ) : null}
            {confirmed.date ? (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Date</Text>
                <Text style={styles.confirmValue}>{confirmed.date}</Text>
              </View>
            ) : null}
            {confirmed.price && confirmed.price !== "0" ? (
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Amount Paid</Text>
                <Text style={styles.confirmValue}>PKR {Number(confirmed.price).toLocaleString()}</Text>
              </View>
            ) : null}
          </View>

          {hasExpiry && (
            <View style={styles.pkgBadge}>
              <Text style={styles.pkgBadgeTitle}>Package Active</Text>
              <Text style={styles.pkgBadgeSub}>Valid until {expiryDate}</Text>
            </View>
          )}

          <Text style={styles.confirmNote}>
            Your booking is confirmed. You will be notified when it is reviewed.
          </Text>

          <Pressable
            style={styles.historyBtn}
            onPress={() => (router as any).replace("/BookingHistory")}
          >
            <Text style={styles.historyBtnText}>View My Bookings</Text>
          </Pressable>

          <Pressable
            style={styles.homeBtn}
            onPress={() => (router as any).replace("/Home")}
          >
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Payment view ─────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.title}>Payment</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Amount Due</Text>
        <Text style={styles.amount}>PKR {amount.toLocaleString()}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Secure Payment via Stripe</Text>
        <Text style={styles.infoText}>
          Your card details are encrypted and processed securely by Stripe. Eternal Care never stores your payment information.
        </Text>
      </View>

      <View style={styles.bottom}>
        {loading ? (
          <ActivityIndicator color="#164A40" />
        ) : (
          <Pressable
            style={[styles.payBtn, !ready && styles.payBtnDisabled]}
            onPress={handlePay}
            disabled={!ready}
          >
            <Text style={styles.payBtnText}>Pay PKR {amount.toLocaleString()}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function PaymentScreen() {
  return (
    <StripeProvider publishableKey={STRIPE_KEY} merchantIdentifier="com.eternalcare.app">
      <PaymentForm />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8f9fa" },

  // Payment view
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 18, paddingVertical: 14,
  },
  back: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#000",
    alignItems: "center", justifyContent: "center",
  },
  backText: { color: "#fff", fontWeight: "700" },
  title: { fontSize: 18, fontWeight: "800", color: "#111" },
  card: {
    margin: 18, backgroundColor: "#164A40", borderRadius: 20,
    padding: 24, alignItems: "center",
  },
  label: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginBottom: 6 },
  amount: { color: "#fff", fontSize: 36, fontWeight: "900", marginBottom: 6 },
  desc: { color: "rgba(255,255,255,0.8)", fontSize: 14, textAlign: "center" },
  infoBox: {
    marginHorizontal: 18, backgroundColor: "#fff", borderRadius: 16,
    padding: 18, borderLeftWidth: 4, borderLeftColor: "#164A40",
  },
  infoTitle: { fontWeight: "700", fontSize: 14, color: "#164A40", marginBottom: 6 },
  infoText: { color: "#555", fontSize: 13, lineHeight: 20 },
  bottom: { position: "absolute", bottom: 40, left: 18, right: 18 },
  payBtn: {
    backgroundColor: "#164A40", borderRadius: 16,
    paddingVertical: 18, alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: "#fff", fontWeight: "800", fontSize: 17 },

  // Confirmation view
  confirmContainer: { alignItems: "center", padding: 28, paddingBottom: 40 },
  checkWrap: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: "#22c55e",
    alignItems: "center", justifyContent: "center", marginTop: 40,
  },
  checkMark: { color: "#fff", fontSize: 60, fontWeight: "700" },
  confirmTitle: { fontSize: 24, fontWeight: "800", marginTop: 20, color: "#164A40" },
  confirmRef: { fontSize: 14, color: "#888", marginTop: 6, letterSpacing: 1 },
  confirmCard: {
    width: "100%", backgroundColor: "#fff", borderRadius: 16, padding: 18,
    marginTop: 24, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  confirmRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f0f0f0",
  },
  confirmLabel: { color: "#666", fontSize: 14 },
  confirmValue: { color: "#111", fontSize: 14, fontWeight: "600", flex: 1, textAlign: "right", marginLeft: 12 },
  pkgBadge: {
    width: "100%", backgroundColor: "#d7efe6", borderRadius: 14, padding: 16,
    marginTop: 16, alignItems: "center", borderWidth: 1, borderColor: "#164A40",
  },
  pkgBadgeTitle: { color: "#164A40", fontWeight: "800", fontSize: 16 },
  pkgBadgeSub: { color: "#164A40", fontSize: 13, marginTop: 4 },
  confirmNote: { color: "#888", textAlign: "center", marginTop: 20, fontSize: 13, lineHeight: 20, paddingHorizontal: 8 },
  historyBtn: {
    width: "100%", backgroundColor: "#164A40", borderRadius: 14,
    paddingVertical: 14, alignItems: "center", marginTop: 24,
  },
  historyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  homeBtn: {
    width: "100%", borderWidth: 1, borderColor: "#164A40", borderRadius: 14,
    paddingVertical: 14, alignItems: "center", marginTop: 12,
  },
  homeBtnText: { color: "#164A40", fontWeight: "700", fontSize: 15 },
});
