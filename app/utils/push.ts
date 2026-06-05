import React from 'react';
import push from '../../utils/push';

export const getExpoPushToken = push.getExpoPushToken;

// default export to satisfy expo-router route requirement — returns null
export default function _PushRoute() {
  return null;
}
