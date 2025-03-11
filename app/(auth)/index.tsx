import { StyleSheet, TouchableOpacity, View } from "react-native";

import FlipStyles from "@/styles";
import FormInput from "@/components/base/TextInput/FormTextInput";
import { useState } from "react";
import { useFlipTheme } from "@/common";
import { PrimaryButton } from "@/components/base/Button";
import RowView from "@/components/base/RowView";
import DefaultText from "@/components/base/Text";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignIn() {
    const theme = useFlipTheme();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { signIn } = useAuth();
    const handlePressLogin = async () => {
        try {
            const result = await signIn({ email, password });
            AsyncStorage.setItem("token", JSON.stringify(result.data));
            router.replace("/(score)/(tabs)");
        } catch (error) {
            console.log(error);
        }
    };
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
                <FormInput
                    placeholder="영문, 숫자 8자리"
                    value={password}
                    onChangeText={v => setPassword(v)}
                    label="비밀번호"
                    secureTextEntry
                    hasClearButton
                    onClearPress={() => setPassword("")}
                    autoCapitalize="none"
                />

                <PrimaryButton
                    style={styles.button}
                    disabled={email === "" || password === ""}
                    onPress={handlePressLogin}
                >
                    로그인
                </PrimaryButton>
                <RowView
                    justifyContent="center"
                    style={{ marginTop: FlipStyles.adjustScale(24), gap: FlipStyles.adjustScale(48), width: "100%" }}
                >
                    <TouchableOpacity
                        style={[
                            styles.bottomButton,
                            {
                                alignItems: "flex-end"
                            }
                        ]}
                        onPress={() => {
                            router.push("/signup");
                        }}
                    >
                        <DefaultText Button2 weight="400" color={theme.gray4}>
                            회원가입
                        </DefaultText>
                    </TouchableOpacity>
                    <View
                        style={{
                            width: FlipStyles.adjustScale(1),
                            backgroundColor: theme.gray6,
                            height: FlipStyles.adjustScale(22)
                        }}
                    />
                    <TouchableOpacity
                        style={[
                            styles.bottomButton,
                            {
                                alignItems: "flex-start"
                            }
                        ]}
                    >
                        <DefaultText Button2 weight="400" color={theme.gray4}>
                            비밀번호 찾기
                        </DefaultText>
                    </TouchableOpacity>
                </RowView>
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
        width: "100%",
        maxWidth: FlipStyles.adjustScale(417),
        paddingHorizontal: FlipStyles.adjustScale(24),
        gap: FlipStyles.adjustScale(16)
    },
    textInput: {
        flex: 1,
        fontSize: FlipStyles.adjustScale(17),
        lineHeight: FlipStyles.adjustScale(22)
    },
    button: {
        marginTop: FlipStyles.adjustScale(16)
    },
    bottomButton: {
        height: FlipStyles.adjustScale(22),
        width: FlipStyles.adjustScale(90)
    }
});
