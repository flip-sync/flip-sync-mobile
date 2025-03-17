import { useFlipTheme } from "@/common";
import { Header } from "@/components/base/Header";
import RowView from "@/components/base/RowView";
import DefaultText from "@/components/base/Text";
import FormInput from "@/components/base/TextInput/FormTextInput";
import ImageUpload from "@/components/ScoreRoom/ImageUpload";
import { useScore } from "@/hooks/score";
import { useCheckDevice } from "@/hooks/useCheckDevice";
import FlipStyles from "@/styles";
import { useNavigation } from "expo-router";
import { useExpoRouter } from "expo-router/build/global-state/router-store";
import { useCallback, useEffect, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, StatusBar, View, TouchableOpacity, Alert } from "react-native";
export type tImageItem = {
    uri: string;
    order: number;
};
const logFormData = (formData: FormData) => {
    for (const pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
    }
};
const uriToBlob = async (uri: string) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error("Blob 변환 오류:", error);
        return null;
    }
};
export default function CreateRoomModal() {
    const theme = useFlipTheme();
    const navigation = useNavigation();
    const router = useExpoRouter();
    const { createScore } = useScore();
    const [scoreTitle, setScoreTitle] = useState("");
    const [singer, setSinger] = useState("");
    const [code, setCode] = useState("");
    const [uploading, setUploading] = useState<boolean>(false);
    const [images, setImages] = useState<tImageItem[]>([]);
    const { isTablet } = useCheckDevice();
    const handleScoreRoom = async () => {
        try {
            const formData = new FormData();
            console.log(scoreTitle, singer, code);
            formData.append("title", scoreTitle);
            formData.append("singer", singer);
            formData.append("code", code);
            for (let index = 0; index < images.length; index++) {
                const image = images[index];
                const blob = await uriToBlob(image.uri);
                if (blob) {
                    formData.append(`imageList[${index}].file`, {
                        uri: image.uri,
                        name: `image_${Date.now()}_${index}.jpg`,
                        type: "image/jpeg"
                    } as unknown as File);

                    formData.append(`imageList[${index}].order`, image.order.toString());
                }
            }
            logFormData(formData);
            const result = await createScore({ groupId: "1", formData: formData });
            console.log(result);
        } catch (error) {
            console.log(error);
            Alert.alert("악보 업로드에 실패했습니다.");
            router.reload();
        }
    };
    const handleSelectImage = (selectedImages: tImageItem[]) => {
        setImages(prevImages => [...prevImages, ...selectedImages]);
    };
    const handleDeleteImage = (uri: string) => {
        setImages(prevImages => prevImages.filter(image => image.uri !== uri));
    };
    useEffect(() => {
        console.log(singer);
    }, [singer]);
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
                        onPress={handleScoreRoom}
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
                    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
                    backgroundColor: theme.white
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
                    <ImageUpload
                        images={images}
                        handleSelectImage={handleSelectImage}
                        handleDeleteImage={handleDeleteImage}
                    />
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
