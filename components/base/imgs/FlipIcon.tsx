import Assets from "@/common/assets";
import FlipStyles from "@/styles";
import { Image } from "expo-image";
import React from "react";

import { ImageStyle, StyleProp, View, ViewStyle } from "react-native";

export type tIconSize = 8 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 20 | 24 | 32 | 40 | 48 | 56 | 64 | 80;

export type tIcon = keyof (typeof Assets)["icon"];

type FlipIconProps = {
    icon?: tIcon;
    uri?: string;
    style?: ImageStyle;
    containerStyle?: StyleProp<ViewStyle>;
    size: tIconSize;
    color?: string;
} & Partial<Image>;

const FlipIcon: React.FC<FlipIconProps> = ({ icon, uri, style, containerStyle, size, color, ...props }) => {
    return (
        <View style={containerStyle}>
            <Image
                {...props}
                source={uri ? { uri } : icon && Assets.icon[icon]}
                tintColor={color}
                style={[
                    {
                        width: FlipStyles.adjustScale(size),
                        height: FlipStyles.adjustScale(size)
                    },
                    style
                ]}
                contentFit={"fill"}
            />
        </View>
    );
};

export default FlipIcon;
