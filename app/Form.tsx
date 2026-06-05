import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SocialSvg from "../components/ui/social-svg";
import BellIcon from "../assets/images/bell.svg";
import AvatarButton from "../components/ui/avatar-button";
import { Colors } from "../constants/theme";

export default function Form() {
  const router = useRouter();
  // Use separate local state per input to avoid re-render interruptions while typing
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // booking info (set by Book Now buttons) will be read from bookingStore when needed

  // Refs to keep latest typed value without forcing re-renders. These capture typing immediately
  const nameRef = React.useRef<string>(name);
  const emailRef = React.useRef<string>(email);
  const phoneRef = React.useRef<string>(phone);
  const cnicRef = React.useRef<string>(cnic);
  const addressRef = React.useRef<string>(address);
  const cityRef = React.useRef<string>(city);
  const postalRef = React.useRef<string>(postal);

  // Package & date selection for users who arrive at Form directly
  const PACKAGES = [
    { id: 'pkg_basic', label: 'Basic', price: 100 },
    { id: 'pkg_standard', label: 'Standard', price: 250 },
    { id: 'pkg_premium', label: 'Premium', price: 500 },
  ];
  const [selectedPackage, setSelectedPackage] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  // Refs for editable package/date fields (uncontrolled)
  const packageRef = React.useRef<string>('');
  const dateRef = React.useRef<string>('');

  // pre-populate from bookingStore if available
  React.useEffect(() => {
    try {
      const { getBooking } = require('../utils/bookingStore');
      const prev = getBooking();
      if (prev && prev.packageId) {
        setSelectedPackage(prev.packageId);
        packageRef.current = prev.packageId;
      }
      if (prev && prev.date) {
        setSelectedDate(prev.date);
        dateRef.current = prev.date;
      }
    } catch (e) {}
  }, []);



// Uncontrolled Input — keep typed text in a ref and only commit to state on blur
const Input: React.FC<{
  placeholder: string;
  defaultValue?: string;
  valueRef: React.MutableRefObject<string>;
  onBlurCommit?: (v: string) => void;
  keyboardType?: any;
}> = React.memo(({ placeholder, defaultValue, valueRef, onBlurCommit, keyboardType }) => {
  // log renders and focus to help debug interruptions
  return (
    <View style={styles.inputWrap}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9AA"
        defaultValue={defaultValue}
        onChangeText={(v) => { valueRef.current = v; }}
        onBlur={() => { if (onBlurCommit) onBlurCommit(valueRef.current); }}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        importantForAutofill="no"
        keyboardType={keyboardType}
      />
    </View>
  );
});


  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={() => (router as any).back()}>
          <Text style={styles.backText}>{"<"}</Text>
        </Pressable>
        <View style={styles.headerRight}>
          <AvatarButton size={36} />
          <Pressable onPress={() => (router as any).push("/Notifications")}><SocialSvg Icon={BellIcon} size={20} /></Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>EnterYour details</Text>

        <View style={styles.box}>
          <Input
            placeholder="Your Full Name"
            defaultValue={name}
            valueRef={nameRef}
            onBlurCommit={setName}
          />
          <Input
            placeholder="Your Email"
            defaultValue={email}
            valueRef={emailRef}
            onBlurCommit={setEmail}
            keyboardType="email-address"
          />
          <Input
            placeholder="Your Phone Number"
            defaultValue={phone}
            valueRef={phoneRef}
            onBlurCommit={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            placeholder="Your CNIC Number"
            defaultValue={cnic}
            valueRef={cnicRef}
            onBlurCommit={setCnic}
          />
          <Input
            placeholder="Your Address"
            defaultValue={address}
            valueRef={addressRef}
            onBlurCommit={setAddress}
          />
          <Input
            placeholder="Your City"
            defaultValue={city}
            valueRef={cityRef}
            onBlurCommit={setCity}
          />
          {/* Package & Date are set by the booking flow — hidden from user */}

          <View style={styles.checkboxRow}>
            <Pressable
              onPress={() => setSaveInfo((s) => !s)}
              style={styles.checkbox}
            >
              {saveInfo && <View style={styles.checked} />}
            </Pressable>
            <Text style={styles.checkboxText}>
              Save your information for later use
            </Text>
          </View>

          <View style={styles.checkboxRow}>
            <Pressable
              onPress={() => setAgree((s) => !s)}
              style={styles.checkbox}
            >
              {agree && <View style={styles.checked} />}
            </Pressable>
            <Text style={styles.checkboxText}>
              I have read all the terms and condition
            </Text>
          </View>

          <View style={styles.nextWrap}>
            <Pressable
              style={[styles.nextBtn, submitting && styles.nextBtnDisabled]}
              onPress={async () => {
                if (submitting) return;
                setSubmitting(true);
                try {
                  const api = require('./utils/api').default;
                  const {
                    setBooking,
                    getBooking,
                  } = require("../utils/bookingStore");
                  const prev = getBooking();
                  // Read current values from refs (captures latest typed chars even if blur didn't fire)
                  const merged = {
                    ...prev,
                    // take edited refs first, then inline selection, then prev
                    packageId: (packageRef.current && packageRef.current.trim()) || selectedPackage || prev?.packageId,
                    date: (dateRef.current && dateRef.current.trim()) || selectedDate || prev?.date,
                    name: nameRef.current || name,
                    email: emailRef.current || email,
                    phone: phoneRef.current || phone,
                    cnic: cnicRef.current || cnic,
                    address: addressRef.current || address,
                    city: cityRef.current || city,
                    postal: postalRef.current || postal,
                  };

                  if (!merged.packageId || !merged.date) {
                    const missing: string[] = [];
                    if (!merged.packageId) missing.push('package');
                    if (!merged.date) missing.push('date');
                    alert('Please select ' + missing.join(' and ') + ' before continuing');
                    return;
                  }

                  // store form data — booking is created once after payment succeeds
                  setBooking(merged);
                  (router as any).push({
                    pathname: "/PaymentScreen",
                    params: {
                      amount: String(merged.price || 0),
                      description: `${merged.service || 'Eternal Care'}${merged.detail ? ' — ' + merged.detail : ''}`,
                      returnPath: "/Home",
                    },
                  });
                } catch (err: any) {
                  alert(err?.error || err?.message || 'Failed to save booking');
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextText}>Next</Text>}
            </Pressable>
          </View> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.light.background || "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    marginTop: 16,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#fff", fontWeight: "700" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: "800", marginTop: 20, marginBottom: 12 },
  box: {
    borderWidth: 1,
    borderColor: "#164A40",
    borderRadius: 8,
    padding: 14,
    marginTop: 6,
  },
  inputWrap: { marginVertical: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#164A40",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    color: "#111",
  },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  checked: { width: 18, height: 18, backgroundColor: "#fff", borderRadius: 2 },
  checkboxText: { flex: 1 },
  nextWrap: { alignItems: "center", marginTop: 18 },
  nextBtn: {
    backgroundColor: "#164A40",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 20,
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextText: { color: "#fff", fontWeight: "700" },
});
