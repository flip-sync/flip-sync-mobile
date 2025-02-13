import { authApi } from "@/api/auth";
import { useFlipTheme } from "@/common";
import { PrimaryButton } from "@/components/base/Button";
import FormInput from "@/components/base/TextInput/FormTextInput";
import { useAuth } from "@/hooks/auth";
import FlipStyles from "@/styles";
import { formatTwoDigits } from "@/utils/formatter";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
export type tRemainTime = {
    minutes: number;
    seconds: number;
};
const EMAIL_VALID_TIME = 5;
export const EMAIL_VALID_LENGTH = 6;
export default function SignUp() {
    const theme = useFlipTheme();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordCheck, setPasswordCheck] = useState("");
    const [nickname, setNickname] = useState("");
    const [isReload, setIsReload] = useState(false);
    const [validNumber, setValidNumber] = useState("");
    const [isValidation, setIsValidation] = useState(false);
    const [isValidationSuccess, setIsValidationSuccess] = useState(false);
    const [emailValidRemainTime, setEmailValidRemainTime] = useState<tRemainTime>({
        minutes: EMAIL_VALID_TIME,
        seconds: 0
    });

    const { checkVerifyEmail, signUp } = useAuth();
    const requestVerifyEmaill = async () => {
        try {
            await authApi.requestVerifyEmaill(email);
        } catch (error) {
            console.error(error);
        }
    };
    const handelPressValid = async () => {
        if (!isReload) setIsReload(true);
        if (!isValidation) setIsValidation(true);
        requestVerifyEmaill();
    };
    const handelPressReValid = async () => {
        if (!isReload) setIsReload(true);
        setEmailValidRemainTime({ minutes: EMAIL_VALID_TIME, seconds: 0 });
        requestVerifyEmaill();
    };
    const handlePressCheckValid = async () => {
        try {
            const result = await checkVerifyEmail({
                email,
                code: validNumber
            });
            if (result.code === "200_0") {
                setIsValidationSuccess(true);
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handlePressSignUp = async () => {
        try {
            const result = await signUp({
                email,
                password,
                passwordConfirm: passwordCheck,
                name: nickname
            });
            if (result.code === "200_0") {
                router.replace("/(auth)");
            }
        } catch (error) {
            if (isAxiosError(error)) {
                if (error.code === "401_1") {
                    console.log("인증코드가 틀렸습니다.");
                }
                if (error.code === "404_1") {
                    console.log("인증받지 않은 이메일입니다.");
                }
                if (error.code === "409_0") {
                    console.log("이미 가입된 이메일입니다.");
                }
            }
        }
    };
    useEffect(() => {
        if (isValidation) {
            const startTime = dayjs();
            const interval = setInterval(() => {
                const currentTime = dayjs();
                const elapsedSeconds = currentTime.diff(startTime, "second");
                const remainingSeconds = Math.max(0, EMAIL_VALID_TIME * 60 - elapsedSeconds);

                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;

                setEmailValidRemainTime({ minutes, seconds });

                if (remainingSeconds === 0) {
                    clearInterval(interval);
                }
            }, 1000);

            setIsReload(false);
            return () => clearInterval(interval);
        }
    }, [isValidation, isReload]);
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
                    disabled={isValidation}
                    label="이메일"
                    validText="인증요청"
                    hasValidButton
                    onValidPress={handelPressValid}
                    autoCapitalize="none"
                />
                {!isValidationSuccess && isValidation && (
                    <>
                        <FormInput
                            placeholder="숫자 6자리"
                            value={validNumber}
                            onChangeText={v => setValidNumber(v)}
                            time={`${formatTwoDigits(emailValidRemainTime?.minutes ?? 0)}:${formatTwoDigits(
                                emailValidRemainTime?.seconds ?? 0
                            )}`}
                            label="인증번호"
                            hasValidButton
                            validText={isValidation ? "재전송" : "인증요청"}
                            onValidPress={handelPressReValid}
                            autoCapitalize="none"
                        />
                        <PrimaryButton
                            style={styles.button}
                            disabled={email === "" || validNumber === "" || validNumber.length < EMAIL_VALID_LENGTH}
                            onPress={handlePressCheckValid}
                        >
                            인증하기
                        </PrimaryButton>
                    </>
                )}
                {isValidationSuccess && (
                    <>
                        <FormInput
                            placeholder="비밀번호 입력"
                            value={password}
                            onChangeText={v => setPassword(v)}
                            label="비밀번호"
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <FormInput
                            placeholder="비밀번호 재입력"
                            value={passwordCheck}
                            onChangeText={v => setPasswordCheck(v)}
                            label="비밀번호 확인"
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <FormInput
                            placeholder="이름 입력"
                            value={nickname}
                            onChangeText={v => setNickname(v)}
                            label="이름"
                            autoCapitalize="none"
                        />
                        <PrimaryButton
                            style={styles.button}
                            disabled={password === "" || passwordCheck === "" || nickname === ""}
                            onPress={handlePressSignUp}
                        >
                            가입하기
                        </PrimaryButton>
                    </>
                )}
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
    button: {
        marginTop: FlipStyles.adjustScale(16)
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
