import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import DefaultInput, {  tFeedbackStyle, tInputFeedback } from ".";
import { useFlipTheme } from "@/common";
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from "react-native";
import DefaultText, { FONT_WEIGHT } from "../Text";
import FlipStyles from "@/styles";
import RowView from "../RowView";

export type FormTextInputProps = {
    value: string;
    label?: string;
    placeholder?: string;
    unit?: string;
    time?: string;
    feedback?: tInputFeedback | null;
    isError?: boolean;
    isSearch?: boolean;
    isOptional?: boolean;
    isRequired?: boolean;
    hasClearButton?: boolean;
    hasBorder?: boolean;
    hasList?: boolean;
    inputPointerEventsNone?: "box-none" | "none" | "box-only" | "auto";
    containerStyle?: StyleProp<ViewStyle>;
    textContainerStyle?: StyleProp<ViewStyle>;
    isDefaultReverseStyle?: boolean;
    style?: StyleProp<ViewStyle>;
    onChangeText?: (value: string) => void;
    onClearPress?: () => void;
    onDropDownPress?: () => void;
    onFocus?: () => void;
    onBlur?: () => void;
} & TextInputProps;


export type FormTextInputRef = {
    focus: () => void;
    blur: () => void;
};

type tLabelStyle = {
    color: string;
    fontFamily: string;
    text: string;
};
const FormInput = forwardRef<FormTextInputRef, FormTextInputProps>(
    (
        {
            value,
            label,
            placeholder = "",
            unit,
            time,
            feedback,
            isError,
            isSearch,
            isOptional = false,
            isRequired = false,
            hasClearButton,
            hasBorder = true,
            hasList,
            inputPointerEventsNone,
            containerStyle,
            textContainerStyle,
            isDefaultReverseStyle = false,
            style,
            onChangeText,
            onClearPress,
            onDropDownPress,
            onFocus,
            onBlur,
            ...props
        },
        ref
    ) => {
        const theme = useFlipTheme();

        const [isFocused, setIsFocused] = useState(false);
        const textInputRef = useRef<TextInput>(null);
        const [labelStyle, setLabelStyle] = useState<tLabelStyle>();

        const borderColor = useMemo(() => {
            if (isError) {
                return theme.red;
            }
            if (isFocused) {
                return theme.gray5;
            }
            if (isDefaultReverseStyle) {
                return theme.gray2;
            }

            return theme.gray7;
        }, [isError, isFocused, theme, isDefaultReverseStyle]);

        const feedbackStyle = useMemo<tFeedbackStyle | undefined>(() => {
            switch (feedback?.type) {
                case "success":
                    return {
                        color: theme.gray2,
                        icon: "icon-checked-filled-16"
                    } as tFeedbackStyle;
                case "info":
                    return {
                        color: theme.gray5,
                        icon: "icon-info-filled-16"
                    } as tFeedbackStyle;
                case "error":
                    return {
                        color: theme.red,
                        icon: "icon-close-filled-16"
                    } as tFeedbackStyle;
            }
        }, [feedback?.type, theme.red, theme.gray5, theme.gray2]);

        useImperativeHandle(
            ref,
            useCallback(
                () => ({
                    focus: () => textInputRef.current?.focus(),
                    blur: () => textInputRef.current?.blur()
                }),
                []
            )
        );

        const controlFocus = useCallback(
            (focused: boolean) => {
                if (focused) {
                    onFocus?.();
                } else {
                    onBlur?.();
                }

                setIsFocused(focused);
            },
            [onBlur, onFocus]
        );

        useEffect(() => {
            if (isOptional) {
                setLabelStyle({
                    color: theme.gray3,
                    fontFamily: FONT_WEIGHT["500"],
                    text: " (선택)"
                });
            } else if (isRequired) {
                setLabelStyle({
                    color: theme.gray2,
                    fontFamily: FONT_WEIGHT["700"],
                    text: " *"
                });
            }
        }, [isOptional, isRequired, theme.gray3, theme.gray2]);

        return (
            <View style={containerStyle} pointerEvents={inputPointerEventsNone}>
                {!!label && (
                    <DefaultText Button3 weight={"400"} color={theme.gray5} containerStyle={styles.labelContainer}>
                        {label}
                        {(isOptional || isRequired) && (
                            <Text
                                style={[
                                    {
                                        color: labelStyle?.color,
                                        fontFamily: labelStyle?.fontFamily
                                    },
                                    isRequired && styles.isRequireTextContainer
                                ]}
                            >
                                {labelStyle?.text}
                            </Text>
                        )}
                    </DefaultText>
                )}

                <TouchableWithoutFeedback onPress={() => textInputRef.current?.focus()}>
                    <RowView
                        style={[
                            styles.textContainer,
                            textContainerStyle,
                            {
                                backgroundColor:
                                    !isError && !isFocused && hasBorder && !isDefaultReverseStyle
                                        ? theme.white
                                        : theme.white
                            },
                            hasBorder && { borderWidth: FlipStyles.adjustScale(1.5), borderColor }
                        ]}
                    >
                        {/* {isSearch && (
                            <FlipIcon icon={"icon-search-24"} size={24} containerStyle={styles.searchIconContainer} />
                        )} */}

                        <DefaultInput
                            ref={textInputRef}
                            value={value}
                            onChangeText={onChangeText}
                            placeholder={placeholder}
                            placeholderTextColor={theme.gray7}
                            style={[
                                {
                                    fontFamily: value ? "Pretendard-Medium" : "Pretendard-Regular",
                                    color: theme.gray2
                                },
                                style
                            ]}
                            onFocus={() => controlFocus(true)}
                            onBlur={() => controlFocus(false)}
                            {...props}
                        />

                        {unit && (
                            <DefaultText Button3 weight={"400"} color={theme.gray5} style={styles.unitContainer}>
                                {unit}
                            </DefaultText>
                        )}
                        {time && (
                            <DefaultText Button3 weight={"500"} color={theme.red} style={styles.timeContainer}>
                                {time}
                            </DefaultText>
                        )}

                        {value && hasClearButton && isFocused && (
                            <TouchableOpacity onPress={onClearPress} style={styles.subActionIconContainer}>
                                {/* <FlipIcon icon={"icon-remove-gray-24"} size={24} /> */}
                            </TouchableOpacity>
                        )}

                        {value && hasList && isFocused && (
                            <TouchableOpacity onPress={onDropDownPress} style={styles.subActionIconContainer}>
                                {/* <FlipIcon icon={"icon-caret-down-24"} size={24} /> */}
                            </TouchableOpacity>
                        )}
                    </RowView>
                </TouchableWithoutFeedback>

                {feedback && (
                    <RowView justifyContent={"flex-start"}>
                        {/* <FlipIcon
                            icon={feedbackStyle?.icon ?? "icon-info-filled-16"}
                            size={16}
                            containerStyle={styles.feedbackIcon}
                        /> */}
                        <DefaultText Body2 color={feedbackStyle?.color} containerStyle={styles.feedbackContainer}>
                            {feedback?.text}
                        </DefaultText>
                    </RowView>
                )}
            </View>
        );
    }
);
const styles = StyleSheet.create({
    labelContainer: {
        paddingVertical: FlipStyles.adjustScale(6)
    },
    textContainer: {
        paddingVertical: FlipStyles.adjustScaleHeight(13),
        paddingHorizontal: FlipStyles.adjustScale(24),
        borderRadius: FlipStyles.adjustScale(8)
    },
    textInput: {
        flex: 1,
        fontSize: FlipStyles.adjustScale(17),
        lineHeight: FlipStyles.adjustScale(22),
        padding: 0,
        margin: 0,
        fontFamily: "Pretendard-Medium"
    },
    subActionIconContainer: {
        marginLeft: FlipStyles.adjustScale(24)
    },
    unitContainer: {
        marginLeft: FlipStyles.adjustScale(8)
    },
    timeContainer: {
        marginLeft: FlipStyles.adjustScale(4)
    },
    feedbackContainer: {
        paddingVertical: FlipStyles.adjustScale(6)
    },
    feedbackIcon: {
        marginRight: FlipStyles.adjustScale(4)
    },
    searchIconContainer: {
        marginRight: FlipStyles.adjustScale(8)
    },
    isRequireTextContainer: {
        fontSize: FlipStyles.adjustScale(18),
        marginLeft: FlipStyles.adjustScale(2)
    }
});

export default FormInput;