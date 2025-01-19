import { useFlipTheme } from "@/common";
import FlipStyles from "@/styles";
import React from "react";

import { StyleProp, StyleSheet, Text, TextProps, TextStyle, View, ViewStyle } from "react-native";



export const FONT_WEIGHT = {
    "400": "Pretendard-Regular",
    "500": "Pretendard-Medium",
    "600": "Pretendard-SemiBold",
    "700": "Pretendard-Bold",
    "800": "Pretendard-ExtraBold"
} as const;

export type FontSizeType = {
    LargeTitle?: boolean;
    Title1?: boolean;
    Title2?: boolean;
    Title3?: boolean;
    Title4?: boolean;
    Body1?: boolean;
    Body2?: boolean;
    Button1?: boolean;
    Button2?: boolean;
    Button3?: boolean;
    Label?: boolean;
};

export type DefaultTextFontWeightType = keyof typeof FONT_WEIGHT;

export type DefaultTextProps = FontSizeType & {
    color?: string;
    weight?: DefaultTextFontWeightType;
    fontFamily?: string;
    containerStyle?: StyleProp<ViewStyle>;
    style?: TextStyle;
} & Partial<TextProps>;

const DefaultText: React.FC<DefaultTextProps> = ({
    color,
    weight,
    fontFamily,
    containerStyle,
    style,
    children,
    ...fontSizeProps
}) => {
    const theme = useFlipTheme();
    const { LargeTitle, Title1, Title2, Title3, Title4, Body1, Body2, Button1, Button2, Button3,Label, ...textProps } = fontSizeProps;

    return (
        <View style={containerStyle}>
            <Text
                {...textProps}
                style={[
                    fontStyles.Body2, // base fontSize
                    Title1 && fontStyles.Title1,
                    Title2 && fontStyles.Title2,
                    Title3 && fontStyles.Title3,
                    Title4 && fontStyles.Title4,
                    Body1 && fontStyles.Body1,
                    Body2 && fontStyles.Body2,
                    Button1 && fontStyles.Button1,
                    Button2 && fontStyles.Button2,
                    Button3 && fontStyles.Button3,
                    Label && fontStyles.Label,
                    {
                        color: color ?? theme.gray2,
                        fontFamily: FONT_WEIGHT[weight ?? "500"]
                    },
                    style
                ]}
            >
                {children}
            </Text>
        </View>
    );
};

export default DefaultText;

export const fontStyles = StyleSheet.create({
    LargeTitle: {
        fontSize: FlipStyles.adjustScale(48),
        lineHeight: FlipStyles.adjustScale(60)
    },
    Title1: {
        fontSize: FlipStyles.adjustScale(32),
        lineHeight: FlipStyles.adjustScale(42)
    },
    Title2: {
        fontSize: FlipStyles.adjustScale(28),
        lineHeight: FlipStyles.adjustScale(36)
    },
    Title3: {
        fontSize: FlipStyles.adjustScale(22),
        lineHeight: FlipStyles.adjustScale(30)
    },
    Title4: {
        fontSize: FlipStyles.adjustScale(18),
        lineHeight: FlipStyles.adjustScale(24)
    },
    Body1: {
        fontSize: FlipStyles.adjustScale(16),
        lineHeight: FlipStyles.adjustScale(22)
    },
    Body2: {
        fontSize: FlipStyles.adjustScale(14),
        lineHeight: FlipStyles.adjustScale(22)
    },
    Button1: {
        fontSize: FlipStyles.adjustScale(17),
        lineHeight: FlipStyles.adjustScale(22)
    },
    Button2: {
        fontSize: FlipStyles.adjustScale(15),
        lineHeight: FlipStyles.adjustScale(20)
    },
    Button3: {
        fontSize: FlipStyles.adjustScale(12),
        lineHeight: FlipStyles.adjustScale(18)
    },
    Label: {
        fontSize: FlipStyles.adjustScale(16),
        lineHeight: FlipStyles.adjustScale(22)
    }
});
