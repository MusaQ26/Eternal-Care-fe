import React, { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import SocialSvg from './social-svg';
import ProfileIcon from '../../assets/images/profile.svg';
import { getUser } from '../../utils/authStore';

export default function AvatarButton({ size = 36 }: { size?: number }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getUser().then((u) => setAvatarUrl(u?.avatar_url || null));
    }, [])
  );

  const imgSize = size - 8;
  const radius = imgSize / 2;

  return (
    <Pressable
      onPress={() => router.push('/Profile')}
      style={[styles.wrap, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      <View style={[styles.inner, { borderRadius: radius, width: imgSize, height: imgSize }]}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: imgSize, height: imgSize, borderRadius: radius }}
          />
        ) : (
          <SocialSvg Icon={ProfileIcon} size={Math.max(16, size - 16)} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: '#d7efe6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
