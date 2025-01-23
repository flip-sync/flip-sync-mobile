import FlipStyles from "@/styles";
import { StyleSheet, TouchableOpacity, TouchableOpacityProps } from "react-native";
import DefaultText from "../Text";
import { useFlipTheme } from "@/common";

type tButtonSize = "small" | "medium" | "large";

type tDefaultButtonProps = {
    size?: tButtonSize;
    textColor?: string;
} & TouchableOpacityProps;

const DefaultButton = ({ children, textColor, ...props }: tDefaultButtonProps) => {
    const theme = useFlipTheme();
    return (
        <TouchableOpacity {...props} style={[style.defaultButtonStyle, props.style]}>
            <DefaultText Button1 weight={"600"} color={textColor ?? theme.gray2}>
                {children}
            </DefaultText>
        </TouchableOpacity>
    );
};

export const PrimaryButton = ({ children, ...props }: TouchableOpacityProps) => {
    const theme = useFlipTheme();
    return (
        <DefaultButton
            {...props}
            style={[
                {
                    backgroundColor: props.disabled ? theme.gray8 : theme.primary,
                    borderColor: props.disabled ? theme.gray8 : theme.primary
                },
                props.style
            ]}
            textColor={props.disabled ? theme.gray6 : theme.white}
        >
            {children}
        </DefaultButton>
    );
};
const style = StyleSheet.create({
    defaultButtonStyle: {
        paddingVertical: FlipStyles.adjustScale(13),
        borderRadius: FlipStyles.adjustScale(8),
        borderWidth: 1,
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center"
    }
});
export default DefaultButton;
