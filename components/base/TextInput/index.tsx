
import { forwardRef } from "react";
import {
    StyleSheet,
    TextInput,
    TextInputProps} from "react-native"
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




const DefaultInput = forwardRef<TextInput, TextInputProps>((props,ref)=>{
    return (
        <TextInput 
            ref={ref}
            style={[styles.textInput,props.style]}
            {...props}
        />
    )
})

const styles = StyleSheet.create({
    labelContainer: {
        paddingVertical: FlipStyles.adjustScale(6)
    },
    textContainer: {
        paddingVertical: FlipStyles.adjustScale(12.5),
        paddingHorizontal: FlipStyles.adjustScale(16),
        borderRadius: FlipStyles.adjustScale(8)
    },
    textInput: {
        flex: 1,
        fontSize: FlipStyles.adjustScale(18),
        height: FlipStyles.adjustScale(24),
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

export default DefaultInput;
