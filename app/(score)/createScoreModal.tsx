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
import { Alert, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type tImageItem = {
    uri: string;
    order: number;
    fileName?: string | null;
    mimeType?: string | null;
    fileSize?: number | null;
};

const MAX_SCORE_IMAGE_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_SCORE_IMAGE_REQUEST_SIZE_BYTES = 50 * 1024 * 1024;

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
    const { createOrganizationScore, sendOrganizationScoreToGroup } = useOrganizationScoreLibrary({
        enabled: isLibraryMode
    });

    const [scoreTitle, setScoreTitle] = useState("");
    const [singer, setSinger] = useState("");
    const [code, setCode] = useState("");
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<tImageItem[]>([]);
    const [saveToLibrary, setSaveToLibrary] = useState(false);

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

        const oversizedImage = images.find(image => (image.fileSize ?? 0) > MAX_SCORE_IMAGE_FILE_SIZE_BYTES);
        if (oversizedImage) {
            Alert.alert("이미지 용량이 너무 큽니다.", "이미지는 한 장당 20MB 이하로 선택해 주세요.");
            return;
        }

        const knownTotalImageSize = images.reduce((total, image) => total + (image.fileSize ?? 0), 0);
        if (knownTotalImageSize > MAX_SCORE_IMAGE_REQUEST_SIZE_BYTES) {
            Alert.alert("이미지 용량이 너무 큽니다.", "한 번에 등록하는 악보 이미지는 총 50MB 이하로 선택해 주세요.");
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
                    name: image.fileName ?? `score_${Date.now()}_${index}.jpg`,
                    type: image.mimeType ?? "image/jpeg"
                } as unknown as File);
                formData.append(`imageList[${index}].order`, String(image.order));
            });

            if (isLibraryMode) {
                await createOrganizationScore({
                    formData
                });
            } else if (saveToLibrary) {
                const organizationScore = await createOrganizationScore({
                    formData
                });
                await sendOrganizationScoreToGroup({
                    scoreId: organizationScore.data,
                    groupId
                });
            } else {
                await createScore({
                    groupId,
                    formData
                });
            }

            Alert.alert(
                isLibraryMode
                    ? "악보 창고에 등록했습니다."
                    : saveToLibrary
                      ? "악보 창고에 저장하고 채팅방에 보냈습니다."
                      : "악보를 등록했습니다."
            );
            router.back();
        } catch (error) {
            const message = error instanceof Error ? error.message : "악보 등록에 실패했습니다.";
            Alert.alert(isLibraryMode ? "악보 창고 등록 실패" : "악보 등록 실패", message);
        } finally {
            setUploading(false);
        }
    }, [
        code,
        createOrganizationScore,
        createScore,
        groupId,
        images,
        isLibraryMode,
        router,
        saveToLibrary,
        scoreTitle,
        sendOrganizationScoreToGroup,
        singer
    ]);

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
            edges={["top", "left", "right", "bottom"]}
            style={[
                styles.container,
                {
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
                        searchPlaceholder="검색하기"
                        containerStyle={styles.codeSelector}
                        dropdownWidth={FlipStyles.adjustScale(260)}
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
                {!isLibraryMode && (
                    <Pressable
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: saveToLibrary }}
                        onPress={() => setSaveToLibrary(current => !current)}
                        style={[styles.libraryCheckRow, { borderColor: theme.gray7, backgroundColor: theme.gray8 }]}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                {
                                    borderColor: saveToLibrary ? theme.primary : theme.gray6,
                                    backgroundColor: saveToLibrary ? theme.primary : theme.white
                                }
                            ]}
                        >
                            {saveToLibrary && (
                                <DefaultText Button3 weight="800" color={theme.white}>
                                    ✓
                                </DefaultText>
                            )}
                        </View>
                        <View style={styles.libraryCheckCopy}>
                            <DefaultText Body2 weight="700" color={theme.gray2}>
                                악보 창고에 등록하시겠습니까?
                            </DefaultText>
                            <DefaultText Button3 color={theme.gray5}>
                                체크하면 악보 창고에 저장한 뒤 현재 채팅방에도 보냅니다.
                            </DefaultText>
                        </View>
                    </Pressable>
                )}
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
    },
    libraryCheckRow: {
        minHeight: FlipStyles.adjustScale(64),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(14),
        paddingHorizontal: FlipStyles.adjustScale(14),
        paddingVertical: FlipStyles.adjustScale(12),
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(12)
    },
    checkbox: {
        width: FlipStyles.adjustScale(22),
        height: FlipStyles.adjustScale(22),
        borderRadius: FlipStyles.adjustScale(6),
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    libraryCheckCopy: {
        flex: 1,
        gap: FlipStyles.adjustScale(2)
    }
});
