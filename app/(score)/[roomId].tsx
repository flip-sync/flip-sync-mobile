import { useActiveOrganizationSession, useFlipTheme } from "@/common";
import { Header } from "@/components/base/Header";
import DefaultText from "@/components/base/Text";
import { RoomQuickActionMenu } from "@/components/ScoreRoom/RoomQuickActionMenu";
import { RoomSidebar } from "@/components/ScoreRoom/RoomSidebar";
import { ScoreSummaryCard } from "@/components/ScoreRoom/ScoreSummaryCard";
import { ScoreViewerModal } from "@/components/ScoreRoom/ScoreViewerModal";
import { useRoom } from "@/hooks/room";
import { getScoreListQueryKey, useScore, useScoreDetail } from "@/hooks/score";
import { useSharedScoreSync } from "@/hooks/score/useSharedScoreSync";
import FlipStyles from "@/styles";
import { tScoreList, tScoreSummary } from "@/api/score/types";
import { IApiResponse, IPagination } from "@/api/types";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { createURL } from "expo-linking";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Share, StyleSheet, TouchableOpacity, View } from "react-native";

export default function Room() {
    const theme = useFlipTheme();
    const navigation = useNavigation();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { roomId } = useLocalSearchParams<{ roomId?: string }>();
    const groupId = Number(roomId);
    const activeOrganization = useActiveOrganizationSession();
    const activeOrganizationId = activeOrganization?.id;

    const { roomSummary, groupDetail } = useRoom({
        groupId
    });
    const { scoreList, nextScoreList, hasNextScoreList, isFetchingNextScoreList, isLoadingScoreList } = useScore({
        groupId
    });

    const [selectedScoreId, setSelectedScoreId] = useState<number | null>(null);
    const [viewerPageIndex, setViewerPageIndex] = useState(0);
    const [sharedModeActive, setSharedModeActive] = useState(false);
    const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const { scoreDetail, isLoadingScoreDetail } = useScoreDetail({
        groupId,
        scoreId: selectedScoreId ?? undefined,
        enabled: selectedScoreId != null
    });
    const { connectedUsers, lastSharedScoreMessage, sendSharedViewMessage } = useSharedScoreSync({
        groupId,
        enabled: Number.isFinite(groupId)
    });

    const roomTitle = roomSummary?.data.name ?? "채팅방";
    const creatorId = roomSummary?.data.creatorId;
    const isCreator = roomSummary?.data.currentUserIsCreator ?? false;
    const currentUserId = roomSummary?.data.currentUserId;
    const groupMembers = groupDetail?.data ?? [];
    const scores = useMemo(() => scoreList?.pages.flatMap(page => page.data.content) ?? [], [scoreList?.pages]);
    const participantCountLabel = `${connectedUsers.length}/${Math.max(groupMembers.length, connectedUsers.length || 1)}명`;
    const prependScoreSummaryToCache = useCallback(
        (scoreSummary: tScoreSummary) => {
            queryClient.setQueryData<InfiniteData<IApiResponse<IPagination<tScoreList>>, number>>(
                getScoreListQueryKey(activeOrganizationId, groupId),
                current => {
                    if (!current?.pages.length) {
                        return current;
                    }

                    const existingScoreIds = new Set(
                        current.pages.flatMap(page => page.data.content).map(scoreItem => scoreItem.id)
                    );
                    if (existingScoreIds.has(scoreSummary.id)) {
                        return current;
                    }

                    const [firstPage, ...restPages] = current.pages;
                    const pageSize = firstPage.data.pageable.pageSize || firstPage.data.size || 10;
                    const nextContent = [scoreSummary, ...firstPage.data.content].slice(0, pageSize);
                    const nextTotalElements = firstPage.data.totalElements + 1;
                    const nextTotalPages = Math.max(firstPage.data.totalPages, Math.ceil(nextTotalElements / pageSize));

                    return {
                        ...current,
                        pages: [
                            {
                                ...firstPage,
                                data: {
                                    ...firstPage.data,
                                    content: nextContent,
                                    empty: nextContent.length === 0,
                                    last:
                                        current.pages.length === 1
                                            ? nextTotalElements <= pageSize
                                            : firstPage.data.last,
                                    numberOfElements: nextContent.length,
                                    totalElements: nextTotalElements,
                                    totalPages: nextTotalPages
                                }
                            },
                            ...restPages
                        ]
                    };
                }
            );
        },
        [activeOrganizationId, groupId, queryClient]
    );

    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            header: () => (
                <Header title={roomTitle} subtitle={participantCountLabel}>
                    <TouchableOpacity
                        style={[styles.menuButton, { borderColor: theme.gray7 }]}
                        onPress={() => setIsSidebarVisible(true)}
                    >
                        <View style={[styles.menuBar, { backgroundColor: theme.gray2 }]} />
                        <View style={[styles.menuBar, { backgroundColor: theme.gray2 }]} />
                        <View style={[styles.menuBar, { backgroundColor: theme.gray2 }]} />
                    </TouchableOpacity>
                </Header>
            )
        });
    }, [navigation, participantCountLabel, roomTitle, theme.gray2, theme.gray7]);

    useEffect(() => {
        if (!lastSharedScoreMessage) {
            return;
        }

        if (lastSharedScoreMessage.type === "SCORE_CREATED") {
            if (lastSharedScoreMessage.scoreSummary) {
                prependScoreSummaryToCache(lastSharedScoreMessage.scoreSummary);
                return;
            }

            void queryClient.invalidateQueries({
                queryKey: getScoreListQueryKey(activeOrganizationId, groupId)
            });
            return;
        }

        if (lastSharedScoreMessage.type !== "SYNC_SCORE_VIEW") {
            return;
        }

        if (!lastSharedScoreMessage.active || !lastSharedScoreMessage.scoreId) {
            setSharedModeActive(false);
            setSelectedScoreId(null);
            setViewerPageIndex(0);
            return;
        }

        setSharedModeActive(true);
        setSelectedScoreId(lastSharedScoreMessage.scoreId);
        setViewerPageIndex(lastSharedScoreMessage.pageIndex ?? 0);
    }, [activeOrganizationId, groupId, lastSharedScoreMessage, prependScoreSummaryToCache, queryClient]);

    const openScoreUpload = useCallback(
        (autoPick = false) => {
            setIsActionMenuVisible(false);
            router.push({
                pathname: "/(score)/createScoreModal",
                params: {
                    roomId: String(groupId),
                    ...(autoPick ? { autoPick: "true" } : {})
                }
            });
        },
        [groupId, router]
    );

    const openLocalViewer = useCallback((scoreId: number) => {
        setIsActionMenuVisible(false);
        setSharedModeActive(false);
        setSelectedScoreId(scoreId);
        setViewerPageIndex(0);
    }, []);

    const openSharedViewer = useCallback(
        (scoreId: number) => {
            setIsActionMenuVisible(false);
            setSharedModeActive(true);
            setSelectedScoreId(scoreId);
            setViewerPageIndex(0);
            sendSharedViewMessage({
                type: "SYNC_SCORE_VIEW",
                scoreId,
                pageIndex: 0,
                active: true
            });
        },
        [sendSharedViewMessage]
    );

    const handleViewerPageChange = (nextPageIndex: number) => {
        setViewerPageIndex(nextPageIndex);

        if (sharedModeActive && isCreator && selectedScoreId != null) {
            sendSharedViewMessage({
                type: "SYNC_SCORE_VIEW",
                scoreId: selectedScoreId,
                pageIndex: nextPageIndex,
                active: true
            });
        }
    };

    const closeViewer = () => {
        if (sharedModeActive && isCreator) {
            sendSharedViewMessage({
                type: "SYNC_SCORE_VIEW",
                scoreId: selectedScoreId,
                pageIndex: viewerPageIndex,
                active: false
            });
        }

        if (!sharedModeActive || isCreator) {
            setSharedModeActive(false);
            setSelectedScoreId(null);
            setViewerPageIndex(0);
        }
    };

    const handleInvite = useCallback(async () => {
        try {
            const inviteLink = createURL(`/invite/${groupId}`);
            await Share.share({
                message: `${roomTitle} 방에 초대합니다.\n방 번호: ${groupId}\n초대 링크: ${inviteLink}\n앱이 설치되어 있다면 링크를 열어 바로 입장할 수 있습니다.`
            });
        } catch {
            Alert.alert("초대 실패", "초대 메시지를 공유하지 못했습니다.");
        }
    }, [groupId, roomTitle]);

    const renderScoreCard = useCallback(
        ({ item }: { item: tScoreSummary }) => (
            <ScoreSummaryCard
                title={item.title}
                singer={item.singer}
                code={item.code}
                uploadedUserName={item.uploadedUserName}
                uploadedUserProfileImageUrl={item.uploadedUserProfileImageUrl}
                thumbnail={item.thumbnail}
                isMine={item.uploadedUserId === currentUserId}
                showSharedAction={isCreator}
                onPress={() => openLocalViewer(item.id)}
                onPressSharedAction={() => openSharedViewer(item.id)}
            />
        ),
        [currentUserId, isCreator, openLocalViewer, openSharedViewer]
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.gray8 }]}>
            {isLoadingScoreList ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={scores}
                    inverted
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    initialNumToRender={8}
                    maxToRenderPerBatch={6}
                    windowSize={7}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 1
                    }}
                    keyExtractor={item => `score-${item.id}`}
                    renderItem={renderScoreCard}
                    onEndReached={() => {
                        if (hasNextScoreList) {
                            nextScoreList();
                        }
                    }}
                    onEndReachedThreshold={0.2}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <DefaultText Body2 color={theme.gray5}>
                                아직 공유된 악보가 없습니다. 아래 + 버튼으로 첫 악보를 올려보세요.
                            </DefaultText>
                        </View>
                    }
                    ListFooterComponent={
                        isFetchingNextScoreList ? <ActivityIndicator size="small" color={theme.primary} /> : null
                    }
                />
            )}

            <RoomQuickActionMenu
                visible={isActionMenuVisible}
                onToggle={() => setIsActionMenuVisible(prev => !prev)}
                onOpenArchive={() => {
                    setIsActionMenuVisible(false);
                    router.push({
                        pathname: "/(score)/(tabs)/Score"
                    });
                }}
                onOpenImageUpload={() => openScoreUpload(true)}
                onOpenScoreRegister={() => openScoreUpload(false)}
                onOpenScoreSend={() => {
                    setIsActionMenuVisible(false);
                    router.push({
                        pathname: "/(score)/(tabs)/Score",
                        params: {
                            mode: "send",
                            roomId: String(groupId)
                        }
                    });
                }}
            />

            <RoomSidebar
                visible={isSidebarVisible}
                groupId={groupId}
                roomTitle={roomTitle}
                creatorId={creatorId}
                connectedMembers={connectedUsers}
                groupMembers={groupMembers}
                onClose={() => setIsSidebarVisible(false)}
                onInvite={handleInvite}
            />

            <ScoreViewerModal
                visible={selectedScoreId != null}
                scoreDetail={scoreDetail?.data ?? null}
                pageIndex={viewerPageIndex}
                sharedModeActive={sharedModeActive}
                isCreator={isCreator}
                onClose={closeViewer}
                onPageChange={handleViewerPageChange}
            />

            {selectedScoreId != null && isLoadingScoreDetail && (
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
    list: {
        flex: 1
    },
    listContent: {
        gap: FlipStyles.adjustScale(18),
        paddingHorizontal: FlipStyles.adjustScale(20),
        paddingTop: FlipStyles.adjustScale(150),
        paddingBottom: FlipStyles.adjustScale(24)
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    emptyContainer: {
        flex: 1,
        minHeight: FlipStyles.adjustScale(260),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(36)
    },
    viewerLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#00000060",
        alignItems: "center",
        justifyContent: "center"
    },
    menuButton: {
        width: FlipStyles.adjustScale(48),
        height: FlipStyles.adjustScale(48),
        borderRadius: FlipStyles.adjustScale(12),
        borderWidth: 1,
        marginRight: FlipStyles.adjustScale(12),
        alignItems: "center",
        justifyContent: "center",
        gap: FlipStyles.adjustScale(4)
    },
    menuBar: {
        width: FlipStyles.adjustScale(18),
        height: FlipStyles.adjustScale(2),
        borderRadius: FlipStyles.adjustScale(1)
    }
});


