import { useFlipTheme } from "@/common";
import DefaultButton from "@/components/base/Button";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import RowView from "@/components/base/RowView";
import DefaultText from "@/components/base/Text";
import DefaultInput from "@/components/base/TextInput";
import FormInput from "@/components/base/TextInput/FormTextInput";
import { useRoom } from "@/hooks/room";
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
    const { createRoom } = useRoom();
    const [roomName, setRoomName] = useState("");
    const { isTablet } = useCheckDevice();
    const handleCreateRoom = useCallback(async () => {
        if (!roomName.trim()) {
            Alert.alert("방 이름을 입력하세요.");
            return;
        }
        try {
            const result = await createRoom({ name: roomName });
        } catch (error) {
            Alert.alert("방 생성에 실패했습니다.");
            router.reload();
        }
        // ✅ form action으로 데이터 전송 (예제: API 요청)
    }, [roomName]);
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            header: () => (
                <RowView>
                    <RowView
                        justifyContent="flex-start"
                        style={{
                            gap: FlipStyles.adjustScale(20)
                        }}
                    >
                        <TouchableOpacity
                            style={{
                                display: "flex",
                                width: FlipStyles.adjustScale(48),
                                height: FlipStyles.adjustScale(48),
                                justifyContent: "center",
                                alignItems: "center"
                            }}
                            onPress={() => router.goBack()}
                        >
                            <FlipIcon icon="icon-back" size={24} />
                        </TouchableOpacity>
                        <DefaultText
                            Title4
                            style={{
                                paddingVertical: FlipStyles.adjustScale(16)
                            }}
                        >
                            방 만들기
                        </DefaultText>
                    </RowView>
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
                        <DefaultText Button2>생성</DefaultText>
                    </TouchableOpacity>
                </RowView>
            )
        });
    }, [navigation, roomName]);
    return (
        <SafeAreaView
            style={[
                styles.container,
                {
                    backgroundColor: theme.primaryLight,
                    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
                }
            ]}
        >
            <View style={styles.formbox}>
                <FormInput
                    placeholder="방 제목을 입력해주세요."
                    value={roomName}
                    onChangeText={text => setRoomName(text)}
                />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    formbox: {
        paddingTop: FlipStyles.adjustScale(32),
        paddingHorizontal: FlipStyles.adjustScale(40)
    }
});
