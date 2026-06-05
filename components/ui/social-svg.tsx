import React from "react";
import { View } from "react-native";

type Props = {
  Icon: React.ComponentType<{ width?: any; height?: any; preserveAspectRatio?: string }>;
  size?: number | string;
  style?: any;
};

export default function SocialSvg({ Icon, size = 36, style }: Props) {
  const borderRadius =
    style?.borderRadius ?? (typeof size === "number" ? size / 2 : undefined);

  return (
    <View
      style={[
        {
          overflow: "hidden",
          width: typeof size === "number" ? size : "100%",
          height: typeof size === "number" ? size : "100%",
          borderRadius,
        },
        style,
      ]}
    >
      <Icon width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
    </View>
  );
}
