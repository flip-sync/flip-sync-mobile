import { tScoreDetail } from "@/api/score/types";
import { useFlipTheme } from "@/common";
import DefaultImage from "@/components/base/imgs/FlipImage";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
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
    const [isFullScreen, setIsFullScreen] = useState(false);

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

    useEffect(() => {
        if (!visible) {
            setIsFullScreen(false);
        }
    }, [visible]);

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
            : "같이보기 참여 중"
        : "개별 보기";
    const closeButtonText = sharedModeActive && !isCreator ? "나가기" : "닫기";
    const viewerHeight = isFullScreen ? height : height - FlipStyles.adjustScale(96);
    const imageWidth = isFullScreen ? width : width - FlipStyles.adjustScale(24);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="fullScreen"
            transparent={false}
            onRequestClose={onClose}
        >
            <SafeAreaView
                edges={isFullScreen ? [] : ["top", "left", "right", "bottom"]}
                style={[styles.safeArea, { backgroundColor: theme.black }]}
            >
                <StatusBar hidden={isFullScreen} />
                {!isFullScreen && (
                    <View style={styles.header}>
                        <View style={styles.headerTextBlock}>
                            <DefaultText Title4 weight="700" color={theme.white}>
                                {scoreDetail?.title ?? "악보"}
                            </DefaultText>
                            <DefaultText Body2 color={theme.gray6}>
                                {images.length > 0 ? `${pageIndex + 1}/${images.length}` : "0/0"} · {statusText}
                            </DefaultText>
                        </View>
                        <View style={styles.headerActions}>
                            <Pressable onPress={() => setIsFullScreen(true)} style={styles.headerButton}>
                                <DefaultText Button2 weight="700" color={theme.white}>
                                    전체화면
                                </DefaultText>
                            </Pressable>
                            <Pressable onPress={onClose} style={styles.headerButton}>
                                <DefaultText Button2 weight="700" color={theme.white}>
                                    {closeButtonText}
                                </DefaultText>
                            </Pressable>
                        </View>
                    </View>
                )}

                {isFullScreen && (
                    <View style={styles.fullScreenControls}>
                        <Pressable onPress={() => setIsFullScreen(false)} style={styles.floatingButton}>
                            <DefaultText Button3 weight="800" color={theme.white}>
                                원래대로
                            </DefaultText>
                        </Pressable>
                        <Pressable onPress={onClose} style={styles.floatingButton}>
                            <DefaultText Button3 weight="800" color={theme.white}>
                                {closeButtonText}
                            </DefaultText>
                        </Pressable>
                    </View>
                )}

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
                        <View
                            style={[
                                styles.slide,
                                isFullScreen && styles.fullScreenSlide,
                                { width, minHeight: viewerHeight }
                            ]}
                        >
                            <DefaultImage
                                uri={item.url}
                                width={imageWidth}
                                height={viewerHeight}
                                contentFit="contain"
                                style={[styles.image, isFullScreen && styles.fullScreenImage]}
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
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(4)
    },
    headerButton: {
        paddingHorizontal: FlipStyles.adjustScale(12),
        paddingVertical: FlipStyles.adjustScale(8)
    },
    slide: {
        paddingHorizontal: FlipStyles.adjustScale(12),
        alignItems: "center",
        justifyContent: "center"
    },
    fullScreenSlide: {
        paddingHorizontal: 0
    },
    image: {
        borderRadius: FlipStyles.adjustScale(12)
    },
    fullScreenImage: {
        borderRadius: 0
    },
    fullScreenControls: {
        position: "absolute",
        top: FlipStyles.adjustScale(14),
        right: FlipStyles.adjustScale(14),
        zIndex: 20,
        flexDirection: "row",
        gap: FlipStyles.adjustScale(8)
    },
    floatingButton: {
        minHeight: FlipStyles.adjustScale(36),
        borderRadius: FlipStyles.adjustScale(18),
        paddingHorizontal: FlipStyles.adjustScale(12),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#00000099"
    }
});
