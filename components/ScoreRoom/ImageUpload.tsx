import React, { useState } from "react";
import {
    View,
    Button,
    Image,
    ActivityIndicator,
    Alert,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Text
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import DefaultButton, { PrimaryButton } from "../base/Button";
import DefaultImage from "../base/imgs/FlipImage";
import FlipStyles from "@/styles";

// ✅ 이미지 타입 정의
interface ImageItem {
    uri: string;
    order: number;
}

const ImageUpload: React.FC = () => {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);

    // ✅ 멀티 이미지 선택
    const pickImages = async (): Promise<void> => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("권한 필요", "이미지를 선택하려면 갤러리 접근 권한이 필요합니다.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true, // ✅ 멀티 선택 가능하도록 설정
            quality: 1
        });

        if (!result.canceled) {
            const selectedImages = result.assets.map((asset, index) => ({
                uri: asset.uri,
                order: images.length + index + 1 // 기존 이미지 개수 이후부터 순번 지정
            }));
            setImages(prevImages => [...prevImages, ...selectedImages]); // 기존 이미지에 추가
        }
    };

    // ✅ 이미지 업로드
    const uploadImages = async (): Promise<void> => {
        if (images.length === 0) {
            Alert.alert("오류", "이미지를 선택해주세요.");
            return;
        }

        setUploading(true);
        const formData = new FormData();

        images.forEach((image, index) => {
            formData.append(`imageList[${index}][file]`, {
                uri: image.uri,
                name: `image_${Date.now()}_${index}.jpg`,
                type: "image/jpeg"
            } as any); // ✅ `File` 타입을 `any`로 캐스팅

            formData.append(`imageList[${index}][order]`, image.order.toString());
        });

        try {
            const response = await fetch("https://example.com/api/upload", {
                method: "POST",
                headers: { "Content-Type": "multipart/form-data" },
                body: formData
            });

            const result = await response.json();
            Alert.alert("업로드 완료", `파일 URL: ${result.url}`);
        } catch (error) {
            console.error("업로드 실패:", error);
            Alert.alert("오류", "이미지 업로드에 실패했습니다.");
        } finally {
            setUploading(false);
        }
    };

    // ✅ 이미지 순서 변경
    const updateImageOrder = (data: ImageItem[]): void => {
        setImages(data.map((item, index) => ({ ...item, order: index + 1 }))); // 순서 재정렬
    };

    return (
        <View style={styles.container}>
            <PrimaryButton onPress={pickImages}>업로드</PrimaryButton>
            {/* ✅ 이미지 순서 변경 가능 */}
            <GestureHandlerRootView>
                <FlatList
                    data={images}
                    horizontal
                    keyExtractor={(item, index) => `image-${index}`}
                    renderItem={({ item }) => {
                        console.log(item);
                        return (
                            <TouchableOpacity style={[styles.imageContainer]}>
                                <DefaultImage uri={item.uri} style={styles.image} />
                                <Text style={styles.orderText}>순서: {item.order}</Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </GestureHandlerRootView>
        </View>
    );
};

export default ImageUpload;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 10 },
    imageContainer: {
        alignItems: "center",
        marginVertical: 5,
        height: FlipStyles.adjustScale(100)
    },
    image: {
        width: FlipStyles.adjustScale(100),
        height: FlipStyles.adjustScale(100),
        borderRadius: FlipStyles.adjustScale(10),
        backgroundColor: "#ccc",
        marginRight: 10
    },
    orderText: { fontSize: FlipStyles.adjustScale(14), fontWeight: "bold" },
    activeImage: { opacity: 0.8 }
});
