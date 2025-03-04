import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import DefaultInput, { tFeedbackStyle, tInputFeedback } from ".";
import { useFlipTheme } from "@/common";
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle
} from "react-native";
import DefaultText, { FONT_WEIGHT } from "../Text";
import FlipStyles from "@/styles";
import RowView from "../RowView";

export type FormTextInputProps = {
    value?: string;
    label?: string;
    placeholder?: string;
    unit?: string;
    time?: string;
    validText?: string;
    feedback?: tInputFeedback | null;
    isError?: boolean;
    isSearch?: boolean;
    isOptional?: boolean;
    isRequired?: boolean;
    hasClearButton?: boolean;
    hasValidButton?: boolean;
    hasBorder?: boolean;
    hasList?: boolean;
    disabled?: boolean;
    inputPointerEventsNone?: "box-none" | "none" | "box-only" | "auto";
    containerStyle?: StyleProp<ViewStyle>;
    textContainerStyle?: StyleProp<ViewStyle>;
    isDefaultReverseStyle?: boolean;
    style?: StyleProp<ViewStyle>;
    onChangeText?: (value: string) => void;
    onClearPress?: () => void;
    onValidPress?: () => void;
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
            validText,
            feedback,
            isError,
            isSearch,
            isOptional = false,
            isRequired = false,
            hasClearButton,
            hasValidButton,
            hasBorder = true,
            hasList,
            disabled,
            inputPointerEventsNone,
            containerStyle,
            textContainerStyle,
            isDefaultReverseStyle = false,
            style,
            onChangeText,
            onClearPress,
            onValidPress,
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
                    <View
                        style={[
                            styles.textContainer,
                            textContainerStyle,
                            {
                                backgroundColor:
                                    !isError && !isFocused && hasBorder && !isDefaultReverseStyle
                                        ? disabled
                                            ? theme.gray8
                                            : theme.white
                                        : theme.white
                            },
                            hasBorder && { borderWidth: FlipStyles.adjustScale(1.5), borderColor }
                        ]}
                    >
                        {disabled && (
                            <View style={[styles.disabledContainer, { backgroundColor: "transparent" }]}></View>
                        )}
                        <DefaultInput
                            ref={textInputRef}
                            value={value}
                            onChangeText={onChangeText}
                            placeholder={placeholder}
                            textContentType="emailAddress"
                            placeholderTextColor={theme.gray7}
                            style={[
                                {
                                    fontFamily: value ? "Pretendard-Medium" : "Pretendard-Regular",
                                    width: "80%",
                                    color: theme.gray2,
                                    textDecorationLine: "none",
                                    height: FlipStyles.adjustScale(22),
                                    fontSize: FlipStyles.adjustScale(17),
                                    lineHeight: FlipStyles.adjustScale(22),
                                    padding: 0,
                                    margin: 0
                                },
                                style
                            ]}
                            editable={!disabled}
                            onFocus={() => controlFocus(true)}
                            onBlur={() => controlFocus(false)}
                            {...props}
                        />

                        <View
                            style={{
                                position: "absolute",
                                gap: FlipStyles.adjustScale(8),
                                height: FlipStyles.adjustScale(48),
                                justifyContent: "center",
                                flexDirection: "row",
                                alignItems: "center",
                                right: FlipStyles.adjustScale(24)
                            }}
                        >
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
                                    <Text>삭제</Text>
                                </TouchableOpacity>
                            )}
                            {hasValidButton && !disabled && (
                                <TouchableOpacity
                                    onPress={onValidPress}
                                    style={[
                                        styles.validIconContainer,
                                        {
                                            backgroundColor: theme.gray8
                                        }
                                    ]}
                                >
                                    <DefaultText Button3 color={theme.gray4}>
                                        {validText}
                                    </DefaultText>
                                </TouchableOpacity>
                            )}

                            {value && hasList && isFocused && (
                                <TouchableOpacity
                                    onPress={onDropDownPress}
                                    style={styles.subActionIconContainer}
                                ></TouchableOpacity>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>

                {feedback && (
                    <RowView justifyContent={"flex-start"}>
                        <DefaultText Body2 containerStyle={styles.feedbackContainer}>
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
        position: "relative",
        backgroundColor: "#000000",
        paddingVertical: FlipStyles.adjustScale(13),
        paddingHorizontal: FlipStyles.adjustScale(24),
        borderRadius: FlipStyles.adjustScale(8)
    },
    disabledContainer: {
        top: 0,
        left: 0,
        zIndex: 1,
        bottom: 0,
        right: 0,
        position: "absolute"
    },
    subActionIconContainer: {
        marginLeft: FlipStyles.adjustScale(24)
    },
    validIconContainer: {
        paddingVertical: FlipStyles.adjustScale(4),
        paddingHorizontal: FlipStyles.adjustScale(6),
        borderRadius: FlipStyles.adjustScale(4)
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
