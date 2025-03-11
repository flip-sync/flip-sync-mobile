import { useFlipTheme } from "@/common";
import DefaultButton from "@/components/base/Button";
import { Header } from "@/components/base/Header";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import RowView from "@/components/base/RowView";
import DefaultText from "@/components/base/Text";
import DefaultInput from "@/components/base/TextInput";
import FormInput from "@/components/base/TextInput/FormTextInput";
import ImageUpload from "@/components/ScoreRoom/ImageUpload";
import { useRoom } from "@/hooks/room";
import { useScore } from "@/hooks/score";
import { useCheckDevice } from "@/hooks/useCheckDevice";
import FlipStyles from "@/styles";
import { useNavigation, useRouter } from "expo-router";
import { useExpoRouter } from "expo-router/build/global-state/router-store";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, StatusBar, View, TouchableOpacity, Alert } from "react-native";

export default function CreateRoomModal() {
    const theme = useFlipTheme();
    const navigation = useNavigation();
    const router = useExpoRouter();
    const { createScore } = useScore();
    const [scoreTitle, setScoreTitle] = useState("");
    const [singer, setSinger] = useState("");
    const [code, setCode] = useState("");
    const { isTablet } = useCheckDevice();
    const handleCreateRoom = useCallback(async () => {
        try {
            const formData = new FormData();
            formData.append("title", scoreTitle);
            formData.append("singer", singer);
            formData.append("code", code);

            const result = await createScore({ groupId: "1", formData: formData });
        } catch (error) {
            Alert.alert("방 생성에 실패했습니다.");
            router.reload();
        }
    }, [scoreTitle, singer, code]);
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            header: () => (
                <Header title="악보등록">
                    <TouchableOpacity
                        style={{
                            paddingHorizontal: FlipStyles.adjustScale(16),
                            paddingVertical: FlipStyles.adjustScale(17),
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        onPress={handleCreateRoom}
                    >
                        <DefaultText Button2>전송</DefaultText>
                    </TouchableOpacity>
                </Header>
            )
        });
    }, [navigation]);
    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
                }
            ]}
        >
            <View style={styles.formbox}>
                <FormInput placeholder="악보제목" value={scoreTitle} onChangeText={text => setScoreTitle(text)} />
                <RowView>
                    <FormInput
                        style={{
                            minWidth: FlipStyles.windowWidth / 2 - FlipStyles.adjustScale(96)
                        }}
                        placeholder="가수"
                        value={singer}
                        onChangeText={text => setSinger(text)}
                    />
                    <FormInput
                        style={{
                            minWidth: FlipStyles.windowWidth / 2 - FlipStyles.adjustScale(96)
                        }}
                        placeholder="코드"
                        value={code}
                        onChangeText={text => setCode(text)}
                    />
                </RowView>
                <View
                    style={{
                        width: "100%",
                        height: FlipStyles.adjustScale(300)
                    }}
                >
                    <ImageUpload />
                </View>
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    formbox: {
        gap: FlipStyles.adjustScale(16),
        paddingTop: FlipStyles.adjustScale(32),
        paddingHorizontal: FlipStyles.adjustScale(40)
    }
});
