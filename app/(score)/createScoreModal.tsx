import { useFlipTheme } from "@/common";
import { SCORE_CODE_OPTIONS } from "@/common/scoreCodes";
import { Header } from "@/components/base/Header";
import RowView from "@/components/base/RowView";
import DefaultText from "@/components/base/Text";
import FormInput from "@/components/base/TextInput/FormTextInput";
import { ScoreCodeDropdown } from "@/components/ScoreLibrary/ScoreCodeDropdown";
import ImageUpload from "@/components/ScoreRoom/ImageUpload";
import { useOrganizationScoreLibrary, useScore } from "@/hooks/score";
import FlipStyles from "@/styles";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type tImageItem = {
    uri: string;
    order: number;
};

const normalizeOrders = (images: tImageItem[]) => images.map((image, index) => ({ ...image, order: index + 1 }));

export default function CreateScoreModal() {
    const theme = useFlipTheme();
    const navigation = useNavigation();
    const router = useRouter();
    const { roomId, autoPick, mode } = useLocalSearchParams<{ roomId?: string; autoPick?: string; mode?: string }>();
    const groupId = useMemo(() => Number(roomId), [roomId]);
    const shouldAutoPick = autoPick === "true";
    const isLibraryMode = mode === "library";
    const { createScore } = useScore({
        groupId
    });
    const { createOrganizationScore } = useOrganizationScoreLibrary({
        enabled: isLibraryMode
    });

    const [scoreTitle, setScoreTitle] = useState("");
    const [singer, setSinger] = useState("");
    const [code, setCode] = useState("");
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<tImageItem[]>([]);

    const handleSelectImage = useCallback((selectedImages: tImageItem[]) => {
        setImages(prevImages => normalizeOrders([...prevImages, ...selectedImages]));
    }, []);

    const handleDeleteImage = useCallback((uri: string) => {
        setImages(prevImages => normalizeOrders(prevImages.filter(image => image.uri !== uri)));
    }, []);

    const handleMoveImage = useCallback((uri: string, direction: "left" | "right") => {
        setImages(prevImages => {
            const currentIndex = prevImages.findIndex(image => image.uri === uri);
            if (currentIndex < 0) {
                return prevImages;
            }

            const nextIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
            if (nextIndex < 0 || nextIndex >= prevImages.length) {
                return prevImages;
            }

            const nextImages = [...prevImages];
            [nextImages[currentIndex], nextImages[nextIndex]] = [nextImages[nextIndex], nextImages[currentIndex]];
            return normalizeOrders(nextImages);
        });
    }, []);

    const handleCreateScore = useCallback(async () => {
        if (!isLibraryMode && (!Number.isFinite(groupId) || groupId <= 0)) {
            Alert.alert("방 정보를 찾을 수 없습니다.");
            return;
        }

        if (!scoreTitle.trim() || !singer.trim() || !code.trim()) {
            Alert.alert("악보 제목, 가수, 코드를 모두 입력해 주세요.");
            return;
        }

        if (images.length === 0) {
            Alert.alert("한 장 이상의 악보 이미지를 추가해 주세요.");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("title", scoreTitle.trim());
            formData.append("singer", singer.trim());
            formData.append("code", code.trim());

            images.forEach((image, index) => {
                formData.append(`imageList[${index}].file`, {
                    uri: image.uri,
                    name: `score_${Date.now()}_${index}.jpg`,
                    type: "image/jpeg"
                } as unknown as File);
                formData.append(`imageList[${index}].order`, String(image.order));
            });

            if (isLibraryMode) {
                await createOrganizationScore({
                    formData
                });
            } else {
                await createScore({
                    groupId,
                    formData
                });
            }

            Alert.alert(isLibraryMode ? "악보 창고에 등록했습니다." : "악보를 등록했습니다.");
            router.back();
        } catch (error) {
            const message = error instanceof Error ? error.message : "악보 등록에 실패했습니다.";
            Alert.alert(isLibraryMode ? "악보 창고 등록 실패" : "악보 등록 실패", message);
        } finally {
            setUploading(false);
        }
    }, [code, createOrganizationScore, createScore, groupId, images, isLibraryMode, router, scoreTitle, singer]);

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            header: () => (
                <Header title={isLibraryMode ? "악보 창고 등록" : "악보 등록"}>
                    <TouchableOpacity disabled={uploading} style={styles.headerAction} onPress={handleCreateScore}>
                        <DefaultText Button2 color={uploading ? theme.gray4 : theme.gray1}>
                            {uploading ? "등록 중" : "등록"}
                        </DefaultText>
                    </TouchableOpacity>
                </Header>
            )
        });
    }, [handleCreateScore, isLibraryMode, navigation, theme.gray1, theme.gray4, uploading]);

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
            <View style={styles.formBox}>
                <FormInput placeholder="악보 제목" value={scoreTitle} onChangeText={setScoreTitle} />
                <RowView alignItems="flex-start" style={styles.metaRow}>
                    <FormInput style={styles.halfInput} placeholder="가수" value={singer} onChangeText={setSinger} />
                    <ScoreCodeDropdown
                        value={code}
                        onChange={setCode}
                        options={SCORE_CODE_OPTIONS}
                        placeholder="코드 선택"
                        searchPlaceholder="코드 검색"
                        containerStyle={styles.codeSelector}
                    />
                </RowView>
                <View style={styles.uploadGuide}>
                    <DefaultText Body2 weight="700" color={theme.gray2}>
                        악보 이미지
                    </DefaultText>
                    <DefaultText Button3 color={theme.gray5}>
                        여러 장을 올린 뒤 좌우 버튼으로 순서를 조정할 수 있습니다.
                    </DefaultText>
                </View>
                <View style={styles.uploadArea}>
                    <ImageUpload
                        images={images}
                        autoOpen={shouldAutoPick}
                        handleSelectImage={handleSelectImage}
                        handleDeleteImage={handleDeleteImage}
                        handleMoveImage={handleMoveImage}
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
    formBox: {
        gap: FlipStyles.adjustScale(16),
        paddingTop: FlipStyles.adjustScale(32),
        paddingHorizontal: FlipStyles.adjustScale(24)
    },
    headerAction: {
        paddingHorizontal: FlipStyles.adjustScale(16),
        paddingVertical: FlipStyles.adjustScale(17),
        justifyContent: "center",
        alignItems: "center"
    },
    metaRow: {
        gap: FlipStyles.adjustScale(12)
    },
    halfInput: {
        minWidth: FlipStyles.windowWidth / 2 - FlipStyles.adjustScale(80)
    },
    codeSelector: {
        flex: 1,
        minWidth: FlipStyles.windowWidth / 2 - FlipStyles.adjustScale(80)
    },
    uploadGuide: {
        gap: FlipStyles.adjustScale(4)
    },
    uploadArea: {
        width: "100%",
        minHeight: FlipStyles.adjustScale(320)
    }
});
