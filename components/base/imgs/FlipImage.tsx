import React from "react";

import { ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { Image, ImageProps } from "expo-image";
import Assets from "@/common/assets";

export type tImg = keyof (typeof Assets)["image"];

export type DefaultImageProps = {
    img?: tImg;
    uri?: string;
    style?: ImageStyle;
    containerStyle?: StyleProp<ViewStyle>;
    color?: string;
    width?: number;
    height?: number;
    aspectRatio?: number;
    fullWidth?: boolean;
} & Partial<ImageProps>;

const DefaultImage: React.FC<DefaultImageProps> = ({
    img,
    uri,
    containerStyle,
    style,
    width,
    height,
    aspectRatio,
    fullWidth,
    ...props
}) => {
    return (
        <View style={containerStyle}>
            <Image
                contentFit={props.contentFit ?? "cover"}
                {...props}
                source={uri ? { uri } : img && Assets.image[img]}
                style={[
                    styles.img,
                    {
                        width: fullWidth ? "100%" : width,
                        height,
                        aspectRatio
                    },
                    style
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    img: {
        overflow: "hidden"
    }
});

export default DefaultImage;
