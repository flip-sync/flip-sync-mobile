import { tScoreDetail } from "@/api/score/types";
import { useFlipTheme } from "@/common";
import DefaultImage from "@/components/base/imgs/FlipImage";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import { useEffect, useMemo, useRef } from "react";
import { FlatList, Modal, Pressable, StyleSheet, useWindowDimensions, View, ViewToken } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScoreViewerModalProps = {
    visible: boolean;
    scoreDetail?: tScoreDetail | null;
    pageIndex: number;
    sharedModeActive: boolean;
    isCreator: boolean;
    onClose: () => void;
    onPageChange: (pageIndex: number) => void;
};

export const ScoreViewerModal = ({
    visible,
    scoreDetail,
    pageIndex,
    sharedModeActive,
    isCreator,
    onClose,
    onPageChange
}: ScoreViewerModalProps) => {
    const theme = useFlipTheme();
    const { width, height } = useWindowDimensions();
    const flatListRef = useRef<FlatList<tScoreDetail["scoreImageList"][number]>>(null);
    const onPageChangeRef = useRef(onPageChange);

    const images = useMemo(
        () => [...(scoreDetail?.scoreImageList ?? [])].sort((left, right) => left.order - right.order),
        [scoreDetail?.scoreImageList]
    );

    useEffect(() => {
        if (!visible || images.length === 0) {
            return;
        }

        flatListRef.current?.scrollToIndex({
            index: Math.max(0, Math.min(pageIndex, images.length - 1)),
            animated: false
        });
    }, [images.length, pageIndex, visible]);

    useEffect(() => {
        onPageChangeRef.current = onPageChange;
    }, [onPageChange]);

    const viewabilityConfigRef = useRef({
        itemVisiblePercentThreshold: 70
    });

    const onViewableItemsChanged = useRef(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            const nextIndex = viewableItems[0]?.index;
            if (typeof nextIndex === "number") {
                onPageChangeRef.current(nextIndex);
            }
        }
    );

    const statusText = sharedModeActive
        ? isCreator
            ? "같이보기 진행 중"
            : "방장이 같이보기를 진행 중"
        : "개별 보기";

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" transparent={false}>
            <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.black }]}>
                <View style={styles.header}>
                    <View style={styles.headerTextBlock}>
                        <DefaultText Title4 weight="700" color={theme.white}>
                            {scoreDetail?.title ?? "악보"}
                        </DefaultText>
                        <DefaultText Body2 color={theme.gray6}>
                            {images.length > 0 ? `${pageIndex + 1}/${images.length}` : "0/0"} · {statusText}
                        </DefaultText>
                    </View>
                    {(isCreator || !sharedModeActive) && (
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <DefaultText Button2 weight="700" color={theme.white}>
                                닫기
                            </DefaultText>
                        </Pressable>
                    )}
                </View>

                <FlatList
                    ref={flatListRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    keyExtractor={item => `score-image-${item.id}`}
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged.current}
                    viewabilityConfig={viewabilityConfigRef.current}
                    scrollEnabled={isCreator || !sharedModeActive}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index
                    })}
                    renderItem={({ item }) => (
                        <View style={[styles.slide, { width, minHeight: height * 0.7 }]}>
                            <DefaultImage
                                uri={item.url}
                                fullWidth
                                aspectRatio={3 / 4}
                                contentFit="contain"
                                style={styles.image}
                            />
                        </View>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1
    },
    header: {
        paddingHorizontal: FlipStyles.adjustScale(20),
        paddingTop: FlipStyles.adjustScale(12),
        paddingBottom: FlipStyles.adjustScale(8),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    headerTextBlock: {
        gap: FlipStyles.adjustScale(4),
        flexShrink: 1
    },
    closeButton: {
        paddingHorizontal: FlipStyles.adjustScale(12),
        paddingVertical: FlipStyles.adjustScale(8)
    },
    slide: {
        paddingHorizontal: FlipStyles.adjustScale(12),
        alignItems: "center",
        justifyContent: "center"
    },
    image: {
        borderRadius: FlipStyles.adjustScale(12)
    }
});
