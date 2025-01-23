import { useFlipTheme } from "@/common";
import FormInput from "@/components/base/TextInput/FormTextInput";
import FlipStyles from "@/styles";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SignUp() {
    const theme = useFlipTheme();

    const [email, setEmail] = useState("");
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.white
                }
            ]}
        >
            <View style={styles.wrapper}>
                <FormInput
                    placeholder="example@flipsync.co.kr"
                    value={email}
                    onChangeText={v => setEmail(v)}
                    label="아이디"
                    hasClearButton
                    onClearPress={() => setEmail("")}
                    autoCapitalize="none"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    wrapper: {
        flex: 1,
        paddingTop: FlipStyles.adjustScale(32),
        width: "100%",
        maxWidth: FlipStyles.adjustScale(417),
        paddingHorizontal: FlipStyles.adjustScale(24),
        gap: FlipStyles.adjustScale(16)
    }
});
