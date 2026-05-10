import { tImageItem } from "@/app/(score)/createScoreModal";
import { useFlipTheme } from "@/common";
import FlipStyles from "@/styles";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import DefaultText from "../base/Text";
import DefaultImage from "../base/imgs/FlipImage";
import FlipIcon from "../base/imgs/FlipIcon";

type ImageUploadProps = {
    images: tImageItem[];
    autoOpen?: boolean;
    handleSelectImage: (image: tImageItem[]) => void;
    handleDeleteImage: (uri: string) => void;
    handleMoveImage: (uri: string, direction: "left" | "right") => void;
};

const ImageUpload = ({ images, autoOpen = false, handleSelectImage, handleDeleteImage, handleMoveImage }: ImageUploadProps) => {
    const theme = useFlipTheme();
    const hasTriggeredAutoOpen = useRef(false);

    const pickImages = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsMultipleSelection: true,
            quality: 0.82
        });

        if (result.canceled) {
            return;
        }

        const selectedImages = result.assets.map((asset, index) => ({
            uri: asset.uri,
            order: images.length + index + 1,
            fileName: asset.fileName,
            mimeType: asset.mimeType,
            fileSize: asset.fileSize
        }));

        handleSelectImage(selectedImages);
    };

    useEffect(() => {
        if (!autoOpen || hasTriggeredAutoOpen.current) {
            return;
        }

        hasTriggeredAutoOpen.current = true;
        void pickImages();
    }, [autoOpen]);

    return (
        <View style={styles.container}>
            <FlatList
                data={[{ order: 0, uri: "upload" }, ...images]}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                keyExtractor={item => `${item.uri}-${item.order}`}
                renderItem={({ item, index }) => {
                    if (index === 0) {
                        return (
                            <TouchableOpacity
                                style={[
                                    styles.imageUploadButton,
                                    {
                                        backgroundColor: theme.gray8,
                                        borderColor: theme.gray6
                                    }
                                ]}
                                onPress={pickImages}
                            >
                                <FlipIcon size={16} icon="icon-score-add" />
                                <DefaultText Body2 color={theme.gray4}>
                                    악보 추가
                                </DefaultText>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <View style={styles.imageContainer}>
                            <DefaultImage uri={item.uri} style={styles.image} />
                            <View style={styles.badge}>
                                <DefaultText Button3 weight="700" color={theme.white}>
                                    {item.order}
                                </DefaultText>
                            </View>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteImage(item.uri)}>
                                <FlipIcon size={24} icon="icon-delete" />
                            </TouchableOpacity>
                            <View style={styles.moveButtonRow}>
                                <TouchableOpacity
                                    style={[styles.moveButton, { backgroundColor: theme.white }]}
                                    onPress={() => handleMoveImage(item.uri, "left")}
                                >
                                    <DefaultText Button3 weight="700" color={theme.gray2}>
                                        이전
                                    </DefaultText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.moveButton, { backgroundColor: theme.white }]}
                                    onPress={() => handleMoveImage(item.uri, "right")}
                                >
                                    <DefaultText Button3 weight="700" color={theme.gray2}>
                                        다음
                                    </DefaultText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
};

export default ImageUpload;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    listContent: {
        gap: FlipStyles.adjustScale(16),
        paddingVertical: FlipStyles.adjustScale(8)
    },
    imageContainer: {
        position: "relative",
        width: FlipStyles.adjustScale(273),
        height: FlipStyles.adjustScale(216),
        gap: FlipStyles.adjustScale(8)
    },
    image: {
        width: FlipStyles.adjustScale(273),
        height: FlipStyles.adjustScale(192),
        borderRadius: FlipStyles.adjustScale(8)
    },
    badge: {
        position: "absolute",
        left: FlipStyles.adjustScale(8),
        top: FlipStyles.adjustScale(8),
        width: FlipStyles.adjustScale(28),
        height: FlipStyles.adjustScale(28),
        borderRadius: FlipStyles.adjustScale(14),
        backgroundColor: "#111827",
        justifyContent: "center",
        alignItems: "center"
    },
    deleteButton: {
        position: "absolute",
        right: FlipStyles.adjustScale(4),
        top: FlipStyles.adjustScale(4),
        zIndex: 1
    },
    moveButtonRow: {
        flexDirection: "row",
        gap: FlipStyles.adjustScale(8)
    },
    moveButton: {
        minWidth: FlipStyles.adjustScale(68),
        height: FlipStyles.adjustScale(32),
        borderRadius: FlipStyles.adjustScale(16),
        justifyContent: "center",
        alignItems: "center"
    },
    imageUploadButton: {
        flexDirection: "row",
        gap: FlipStyles.adjustScale(4),
        width: FlipStyles.adjustScale(273),
        height: FlipStyles.adjustScale(192),
        borderRadius: FlipStyles.adjustScale(8),
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});
