import { forwardRef } from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";
import { tIcon } from "../imgs/FlipIcon";
import FlipStyles from "@/styles";
export type tInputFeedback = {
    type: "info" | "success" | "error";
    text: string;
};

export type tFeedbackStyle = {
    color: string;
    icon: tIcon;
};

const DefaultInput = forwardRef<TextInput, TextInputProps>((props, ref) => {
    return <TextInput ref={ref} style={[styles.textInput, props.style]} {...props} />;
});

const styles = StyleSheet.create({
    textInput: {
        flex: 1,
        padding: 0,
        margin: 0,
        fontFamily: "Pretendard-Medium"
    }
});

export default DefaultInput;
