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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PrimaryButton } from "../base/Button";
import DefaultImage from "../base/imgs/FlipImage";
import FlipStyles from "@/styles";
import { useFlipTheme } from "@/common";
import DefaultText from "../base/Text";
import FlipIcon from "../base/imgs/FlipIcon";
import { tImageItem } from "@/app/(score)/createScoreModal";

// ✅ 이미지 타입 정의

const ImageUpload: React.FC<{
    images: tImageItem[];
    handleSelectImage: (image: tImageItem[]) => void;
    handleDeleteImage: (uri: string) => void;
}> = ({ images, handleSelectImage, handleDeleteImage }) => {
    const theme = useFlipTheme();

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
            console.log(selectedImages, "selectedImages");
            handleSelectImage(selectedImages); // 기존 이미지에 추가
        }
    };

    // ✅ 이미지 업로드

    return (
        <View style={styles.container}>
            {/* ✅ 이미지 순서 변경 가능 */}
            <GestureHandlerRootView>
                <FlatList
                    data={[{ order: 0, uri: "upload" }, ...images]}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: FlipStyles.adjustScale(16) }}
                    keyExtractor={(item, index) => `image-${index}`}
                    renderItem={({ item, index }) => {
                        if (index === 0) {
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.imageUploadBtn,
                                        {
                                            backgroundColor: theme.gray8
                                        }
                                    ]}
                                    onPress={pickImages}
                                >
                                    <FlipIcon size={16} icon="icon-score-add" />
                                    <DefaultText Body2 color={theme.gray4}>
                                        악보추가
                                    </DefaultText>
                                </TouchableOpacity>
                            );
                        }
                        return (
                            <View style={[styles.imageContainer]}>
                                <TouchableOpacity onPress={() => handleDeleteImage(item.uri)} style={[styles.closeBtn]}>
                                    <FlipIcon size={24} icon="icon-delete" />
                                </TouchableOpacity>
                                <DefaultImage uri={item.uri} style={styles.image} />
                            </View>
                        );
                    }}
                />
            </GestureHandlerRootView>
        </View>
    );
};

export default ImageUpload;

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", padding: 10 },
    imageContainer: {
        alignItems: "center",
        position: "relative",
        height: FlipStyles.adjustScale(192),
        width: FlipStyles.adjustScale(273)
    },
    closeBtn: {
        zIndex: 1,
        position: "absolute",
        top: FlipStyles.adjustScale(4),
        width: FlipStyles.adjustScale(24),
        height: FlipStyles.adjustScale(24),
        right: FlipStyles.adjustScale(4),
        justifyContent: "center",
        alignItems: "center"
    },
    image: {
        width: FlipStyles.adjustScale(273),
        height: FlipStyles.adjustScale(192),
        borderRadius: FlipStyles.adjustScale(8)
    },
    orderText: { fontSize: FlipStyles.adjustScale(14), fontWeight: "bold" },
    activeImage: { opacity: 0.8 },
    imageUploadBtn: {
        flexDirection: "row",
        gap: FlipStyles.adjustScale(4),
        width: FlipStyles.adjustScale(273),
        borderRadius: FlipStyles.adjustScale(8),
        height: FlipStyles.adjustScale(192),
        borderWidth: FlipStyles.adjustScale(1),
        borderColor: "#E6E0E9",
        justifyContent: "center",
        alignItems: "center"
    }
});
