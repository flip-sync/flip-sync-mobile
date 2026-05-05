import { tScoreSummary } from "@/api/score/types";
import { useActiveOrganizationSession, useFlipTheme } from "@/common";
import { SCORE_CODE_OPTIONS } from "@/common/scoreCodes";
import { FloatingButton } from "@/components/base/Button/FloatingButton";
import { Header } from "@/components/base/Header";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import DefaultText from "@/components/base/Text";
import { OrganizationScoreCard } from "@/components/ScoreLibrary/OrganizationScoreCard";
import { ScoreCodeDropdown } from "@/components/ScoreLibrary/ScoreCodeDropdown";
import { ScoreViewerModal } from "@/components/ScoreRoom/ScoreViewerModal";
import { useOrganizationScoreDetail, useOrganizationScoreLibrary } from "@/hooks/score";
import { useCheckDevice } from "@/hooks/useCheckDevice";
import { useUserProfile } from "@/hooks/user";
import FlipStyles from "@/styles";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, TextInput, View, useWindowDimensions } from "react-native";

const COPY = {
    warehouseTitle: "악보 창고",
    sendTitle: "악보 보내기",
    sendSubtitle: "공유방으로 보낼 악보를 선택해 주세요.",
    titlePlaceholder: "악보 제목",
    codePlaceholder: "코드",
    singerPlaceholder: "가수",
    search: "검색",
    latest: "최신순",
    empty: "아직 등록된 악보가 없습니다.",
    emptySearch: "검색 결과가 없습니다.",
    sendingTitle: "악보 보내기",
    sendingMessage: (title: string) => `"${title}" 악보를 현재 공유방으로 보낼까요?`,
    cancel: "취소",
    confirmSend: "보내기",
    sendSuccess: "악보를 공유방으로 보냈습니다.",
    sendFailed: "악보 전송에 실패했습니다.",
    deleteTitle: "악보 삭제",
    deleteMessage: (title: string) => `"${title}" 악보를 창고에서 삭제할까요?`,
    deleteConfirm: "삭제",
    deleteSuccess: "악보를 삭제했습니다.",
    deleteFailed: "악보 삭제에 실패했습니다.",
    loading: "악보를 불러오는 중입니다.",
    missingOrganization: "활성 소속이 없어 악보 창고를 불러오지 못했습니다.",
    selectOrganization: "소속 선택하기"
} as const;

type SearchFilters = {
    title: string;
    singer: string;
    code: string;
};

const DEFAULT_FILTERS: SearchFilters = {
    title: "",
    singer: "",
    code: ""
};

export default function OrganizationScoreLibraryScreen() {
    const theme = useFlipTheme();
    const router = useRouter();
    const { isTablet } = useCheckDevice();
    const { width } = useWindowDimensions();
    const activeOrganization = useActiveOrganizationSession();
    const { mode, roomId } = useLocalSearchParams<{ mode?: string; roomId?: string }>();
    const { profile } = useUserProfile();
    const sendMode = mode === "send";
    const groupId = Number(roomId);
    const hasTargetRoom = Number.isFinite(groupId) && groupId > 0;
    const missingOrganization = !activeOrganization?.id;

    const [draftFilters, setDraftFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
    const [selectedScoreId, setSelectedScoreId] = useState<number | null>(null);
    const [viewerPageIndex, setViewerPageIndex] = useState(0);

    const {
        organizationScoreList,
        nextOrganizationScoreList,
        hasNextOrganizationScoreList,
        isFetchingNextOrganizationScoreList,
        isLoadingOrganizationScoreList,
        isRefreshingOrganizationScoreList,
        refetchOrganizationScoreList,
        deleteOrganizationScore,
        isDeletingOrganizationScore,
        sendOrganizationScoreToGroup,
        isSendingOrganizationScoreToGroup
    } = useOrganizationScoreLibrary(appliedFilters);

    const { organizationScoreDetail, isLoadingOrganizationScoreDetail } = useOrganizationScoreDetail({
        scoreId: selectedScoreId ?? undefined,
        enabled: selectedScoreId != null && !sendMode
    });

    const scores = useMemo(
        () => organizationScoreList?.pages.flatMap(page => page.data.content) ?? [],
        [organizationScoreList?.pages]
    );
    const columnCount = isTablet ? 3 : 2;
    const gridGap = FlipStyles.adjustScale(12);
    const cardWidth = useMemo(() => {
        const horizontalPadding = FlipStyles.basePadding * 2;
        const totalGap = gridGap * (columnCount - 1);
        return Math.floor((width - horizontalPadding - totalGap) / columnCount);
    }, [columnCount, gridGap, width]);

    const applySearch = () => {
        setAppliedFilters({
            title: draftFilters.title.trim(),
            singer: draftFilters.singer.trim(),
            code: draftFilters.code.trim()
        });
    };

    const openUploadModal = () => {
        router.push({
            pathname: "/(score)/createScoreModal",
            params: {
                mode: "library"
            }
        });
    };

    const closeViewer = () => {
        setSelectedScoreId(null);
        setViewerPageIndex(0);
    };

    const handlePressScore = (score: tScoreSummary) => {
        if (sendMode && hasTargetRoom) {
            Alert.alert(COPY.sendingTitle, COPY.sendingMessage(score.title), [
                {
                    text: COPY.cancel,
                    style: "cancel"
                },
                {
                    text: COPY.confirmSend,
                    onPress: async () => {
                        try {
                            await sendOrganizationScoreToGroup({
                                scoreId: score.id,
                                groupId
                            });
                            Alert.alert(COPY.sendingTitle, COPY.sendSuccess);
                            router.back();
                        } catch (error) {
                            const message = error instanceof Error ? error.message : COPY.sendFailed;
                            Alert.alert(COPY.sendingTitle, message);
                        }
                    }
                }
            ]);
            return;
        }

        setSelectedScoreId(score.id);
        setViewerPageIndex(0);
    };

    const handleDeleteScore = (score: tScoreSummary) => {
        Alert.alert(COPY.deleteTitle, COPY.deleteMessage(score.title), [
            {
                text: COPY.cancel,
                style: "cancel"
            },
            {
                text: COPY.deleteConfirm,
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteOrganizationScore(score.id);
                        if (selectedScoreId === score.id) {
                            closeViewer();
                        }
                        Alert.alert(COPY.deleteTitle, COPY.deleteSuccess);
                    } catch (error) {
                        const message = error instanceof Error ? error.message : COPY.deleteFailed;
                        Alert.alert(COPY.deleteTitle, message);
                    }
                }
            }
        ]);
    };

    const renderHeader = () => (
        <View style={styles.headerContent}>
            {sendMode ? (
                <Header title={COPY.sendTitle} subtitle={COPY.sendSubtitle} />
            ) : (
                <View style={styles.titleSection}>
                    <DefaultText Title3 weight="700" color={theme.gray1}>
                        {COPY.warehouseTitle}
                    </DefaultText>
                </View>
            )}

            <View style={styles.searchSection}>
                <View style={styles.searchRow}>
                    <View style={[styles.searchField, { borderColor: theme.gray7, backgroundColor: theme.white }]}> 
                        <TextInput
                            value={draftFilters.title}
                            onChangeText={value => setDraftFilters(current => ({ ...current, title: value }))}
                            placeholder={COPY.titlePlaceholder}
                            placeholderTextColor={theme.gray7}
                            style={[styles.searchInput, { color: theme.gray2 }]}
                            returnKeyType="search"
                            onSubmitEditing={applySearch}
                        />
                    </View>
                    <Pressable onPress={applySearch} style={[styles.searchButton, { backgroundColor: theme.primary }]}> 
                        <DefaultText Button3 weight="700" color={theme.white}>
                            {COPY.search}
                        </DefaultText>
                    </Pressable>
                </View>

                <View style={styles.filterToolbar}>
                    <View style={styles.filterGroup}>
                        <ScoreCodeDropdown
                            value={draftFilters.code}
                            onChange={value => setDraftFilters(current => ({ ...current, code: value }))}
                            options={SCORE_CODE_OPTIONS}
                            placeholder={COPY.codePlaceholder}
                            searchPlaceholder="검색하기"
                            allowReset
                            emptyLabel="전체"
                            containerStyle={styles.codeFilter}
                            dropdownWidth={FlipStyles.adjustScale(isTablet ? 300 : 260)}
                        />
                        <View style={[styles.filterField, { borderColor: theme.gray7, backgroundColor: theme.white }]}> 
                            <TextInput
                                value={draftFilters.singer}
                                onChangeText={value => setDraftFilters(current => ({ ...current, singer: value }))}
                                placeholder={COPY.singerPlaceholder}
                                placeholderTextColor={theme.gray7}
                                style={[styles.filterInput, { color: theme.gray2 }]}
                            />
                        </View>
                    </View>

                    <View style={styles.sortRow}>
                        <FlipIcon icon="icon-arrow-up-down" size={16} color={theme.gray4} />
                        <DefaultText Button3 color={theme.gray4}>
                            {COPY.latest}
                        </DefaultText>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.white }]}>
            {isLoadingOrganizationScoreList && scores.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <DefaultText Body2 color={theme.gray5}>
                        {COPY.loading}
                    </DefaultText>
                </View>
            ) : (
                <FlatList
                    data={scores}
                    key={columnCount === 3 ? "organization-score-grid-3" : "organization-score-grid-2"}
                    numColumns={columnCount}
                    keyExtractor={item => `organization-score-${item.id}`}
                    ListHeaderComponentStyle={styles.listHeader}
                    columnWrapperStyle={styles.gridRow}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    renderItem={({ item }) => (
                        <View style={[styles.cardColumn, { width: cardWidth }]}>
                            <OrganizationScoreCard
                                title={item.title}
                                singer={item.singer}
                                code={item.code}
                                thumbnail={item.thumbnail}
                                sendMode={sendMode}
                                onPress={() => handlePressScore(item)}
                                canDelete={!sendMode && profile?.data.id === item.uploadedUserId}
                                onPressDelete={() => handleDeleteScore(item)}
                            />
                        </View>
                    )}
                    onEndReached={() => {
                        if (hasNextOrganizationScoreList) {
                            nextOrganizationScoreList();
                        }
                    }}
                    onEndReachedThreshold={0.3}
                    refreshing={isRefreshingOrganizationScoreList}
                    onRefresh={() => {
                        void refetchOrganizationScoreList();
                    }}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <DefaultText Body2 color={theme.gray5}>
                                {missingOrganization
                                    ? COPY.missingOrganization
                                    : appliedFilters.title || appliedFilters.code || appliedFilters.singer
                                    ? COPY.emptySearch
                                    : COPY.empty}
                            </DefaultText>
                            {missingOrganization && (
                                <Pressable
                                    onPress={() => router.push("/(auth)/organization-select?mode=switch")}
                                    style={[styles.emptyActionButton, { backgroundColor: theme.primary }]}
                                >
                                    <DefaultText Button2 weight="700" color={theme.white}>
                                        {COPY.selectOrganization}
                                    </DefaultText>
                                </Pressable>
                            )}
                        </View>
                    }
                    ListFooterComponent={
                        isFetchingNextOrganizationScoreList ||
                        isSendingOrganizationScoreToGroup ||
                        isDeletingOrganizationScore ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : null
                    }
                />
            )}

            {!sendMode && <FloatingButton onPress={openUploadModal} />}

            <ScoreViewerModal
                visible={selectedScoreId != null}
                scoreDetail={organizationScoreDetail?.data ?? null}
                pageIndex={viewerPageIndex}
                sharedModeActive={false}
                isCreator
                onClose={closeViewer}
                onPageChange={setViewerPageIndex}
            />

            {selectedScoreId != null && isLoadingOrganizationScoreDetail && (
                <View style={styles.viewerLoadingOverlay}>
                    <ActivityIndicator size="large" color={theme.white} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: FlipStyles.adjustScale(12)
    },
    headerContent: {
        zIndex: 40,
        elevation: 40,
        overflow: "visible",
        paddingBottom: FlipStyles.adjustScale(18),
        gap: FlipStyles.adjustScale(16)
    },
    titleSection: {
        paddingHorizontal: FlipStyles.basePadding,
        paddingTop: FlipStyles.adjustScale(20)
    },
    searchSection: {
        zIndex: 50,
        elevation: 50,
        overflow: "visible",
        paddingHorizontal: FlipStyles.basePadding,
        gap: FlipStyles.adjustScale(10)
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(12)
    },
    searchField: {
        flex: 1,
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(10)
    },
    searchInput: {
        flex: 1,
        minHeight: FlipStyles.adjustScale(44),
        paddingHorizontal: FlipStyles.adjustScale(14),
        fontSize: FlipStyles.adjustScale(15),
        fontFamily: "Pretendard-Regular"
    },
    searchButton: {
        minWidth: FlipStyles.adjustScale(78),
        minHeight: FlipStyles.adjustScale(44),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(16),
        borderRadius: FlipStyles.adjustScale(10)
    },
    filterToolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 60,
        elevation: 60,
        gap: FlipStyles.adjustScale(12)
    },
    listHeader: {
        zIndex: 40,
        elevation: 40,
        overflow: "visible"
    },
    filterGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(10)
    },
    codeFilter: {
        width: FlipStyles.adjustScale(80)
    },
    filterField: {
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(10),
        minHeight: FlipStyles.adjustScale(42),
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(14),
        width: FlipStyles.adjustScale(80)
    },
    filterInput: {
        flex: 1,
        fontSize: FlipStyles.adjustScale(14),
        fontFamily: "Pretendard-Regular",
        paddingVertical: 0
    },
    sortRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: FlipStyles.adjustScale(4)
    },
    listContent: {
        paddingBottom: FlipStyles.adjustScale(96),
        gap: FlipStyles.adjustScale(16)
    },
    gridRow: {
        paddingHorizontal: FlipStyles.basePadding,
        zIndex: 0,
        gap: FlipStyles.adjustScale(12)
    },
    cardColumn: {
        flexGrow: 0,
        flexShrink: 0,
        minWidth: 0,
        zIndex: 0
    },
    emptyContainer: {
        minHeight: FlipStyles.adjustScale(220),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(24),
        gap: FlipStyles.adjustScale(12)
    },
    emptyActionButton: {
        minHeight: FlipStyles.adjustScale(40),
        borderRadius: FlipStyles.adjustScale(10),
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: FlipStyles.adjustScale(16)
    },
    viewerLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#00000060",
        alignItems: "center",
        justifyContent: "center"
    }
});
