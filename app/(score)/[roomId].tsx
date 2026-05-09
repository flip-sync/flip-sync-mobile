import { useActiveOrganizationSession, useFlipTheme } from "@/common";
import { Header } from "@/components/base/Header";
import DefaultText from "@/components/base/Text";
import { OrganizationScoreSendModal } from "@/components/ScoreRoom/OrganizationScoreSendModal";
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
import { useIsFocused } from "@react-navigation/native";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Share,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LATEST_SCROLL_THRESHOLD = FlipStyles.adjustScale(72);
const INVITE_LINK_BASE_URL = "https://fliplyze.com/mob/invite";

type SharedScoreSession = {
    scoreId: number;
    pageIndex: number;
    hostName?: string | null;
};

const compareScoreByNewest = (left: tScoreSummary, right: tScoreSummary) => {
    const createdAtOrder = right.createdAt.localeCompare(left.createdAt);
    if (createdAtOrder !== 0) {
        return createdAtOrder;
    }

    return right.id - left.id;
};

export default function Room() {
    const theme = useFlipTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { roomId } = useLocalSearchParams<{ roomId?: string }>();
    const groupId = Number(roomId);
    const activeOrganization = useActiveOrganizationSession();
    const activeOrganizationId = activeOrganization?.id;

    const {
        roomSummary,
        groupDetail,
        leaveRoom,
        isLeavingRoom,
        transferRoomOwner,
        isTransferringRoomOwner,
        deleteRoom,
        isDeletingRoom
    } = useRoom({
        groupId
    });
    const { scoreList, nextScoreList, hasNextScoreList, isFetchingNextScoreList, isLoadingScoreList } = useScore({
        groupId
    });

    const [selectedScoreId, setSelectedScoreId] = useState<number | null>(null);
    const [viewerPageIndex, setViewerPageIndex] = useState(0);
    const [sharedModeActive, setSharedModeActive] = useState(false);
    const [sharedScoreSession, setSharedScoreSession] = useState<SharedScoreSession | null>(null);
    const [isJoinedSharedView, setIsJoinedSharedView] = useState(false);
    const [isActionMenuVisible, setIsActionMenuVisible] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [isScoreSendModalVisible, setIsScoreSendModalVisible] = useState(false);
    const [showLatestButton, setShowLatestButton] = useState(false);
    const scoreListRef = useRef<FlatList<tScoreSummary>>(null);
    const isNearLatestRef = useRef(true);

    const { scoreDetail, isLoadingScoreDetail } = useScoreDetail({
        groupId,
        scoreId: selectedScoreId ?? undefined,
        enabled: selectedScoreId != null
    });
    const { connectedUsers, lastSharedScoreMessage, sendSharedViewMessage } = useSharedScoreSync({
        groupId,
        enabled: Number.isFinite(groupId) && isFocused
    });

    const roomTitle = roomSummary?.data.name ?? "채팅방";
    const creatorId = roomSummary?.data.creatorId;
    const isCreator = roomSummary?.data.currentUserIsCreator ?? false;
    const currentUserId = roomSummary?.data.currentUserId;
    const groupMembers = groupDetail?.data ?? [];
    const scores = useMemo(
        () => [...(scoreList?.pages.flatMap(page => page.data.content) ?? [])].sort(compareScoreByNewest),
        [scoreList?.pages]
    );
    const participantCountLabel = `${connectedUsers.length}/${Math.max(groupMembers.length, connectedUsers.length || 1)}명`;
    const canJoinSharedView = !isCreator && sharedScoreSession != null && !isJoinedSharedView;
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
            setSharedScoreSession(null);
            setIsJoinedSharedView(false);
            setSharedModeActive(false);
            if (sharedModeActive) {
                setSelectedScoreId(null);
                setViewerPageIndex(0);
            }
            return;
        }

        const nextSession = {
            scoreId: lastSharedScoreMessage.scoreId,
            pageIndex: lastSharedScoreMessage.pageIndex ?? 0,
            hostName: lastSharedScoreMessage.triggeredByUserName
        };
        setSharedScoreSession(nextSession);

        if (isCreator || isJoinedSharedView || sharedModeActive) {
            setIsJoinedSharedView(true);
            setSharedModeActive(true);
            setSelectedScoreId(nextSession.scoreId);
            setViewerPageIndex(nextSession.pageIndex);
        }
    }, [
        activeOrganizationId,
        groupId,
        isCreator,
        isJoinedSharedView,
        lastSharedScoreMessage,
        prependScoreSummaryToCache,
        queryClient,
        sharedModeActive
    ]);

    const openScoreUpload = useCallback(
        () => {
            setIsActionMenuVisible(false);
            router.push({
                pathname: "/(score)/createScoreModal",
                params: {
                    roomId: String(groupId)
                }
            });
        },
        [groupId, router]
    );

    const openScoreSendModal = useCallback(() => {
        setIsActionMenuVisible(false);
        setIsScoreSendModalVisible(true);
    }, []);

    const scrollToLatest = useCallback((animated = true) => {
        isNearLatestRef.current = true;
        setShowLatestButton(false);
        scoreListRef.current?.scrollToOffset({
            offset: 0,
            animated
        });
    }, []);

    const handleScoreListScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const isNearLatest = event.nativeEvent.contentOffset.y <= LATEST_SCROLL_THRESHOLD;
        isNearLatestRef.current = isNearLatest;
        setShowLatestButton(!isNearLatest);
    }, []);

    const handleScoreSent = useCallback(() => {
        isNearLatestRef.current = true;
        void queryClient.invalidateQueries({
            queryKey: getScoreListQueryKey(activeOrganizationId, groupId)
        });
        requestAnimationFrame(() => scrollToLatest());
    }, [activeOrganizationId, groupId, queryClient, scrollToLatest]);

    useEffect(() => {
        if (!isNearLatestRef.current) {
            return;
        }

        requestAnimationFrame(() => scrollToLatest(false));
    }, [scores.length, scrollToLatest]);

    const openLocalViewer = useCallback((scoreId: number) => {
        setIsActionMenuVisible(false);
        setSharedModeActive(false);
        setSelectedScoreId(scoreId);
        setViewerPageIndex(0);
    }, []);

    const openSharedViewer = useCallback(
        (scoreId: number) => {
            setIsActionMenuVisible(false);
            setSharedScoreSession({
                scoreId,
                pageIndex: 0,
                hostName: roomSummary?.data.currentUserName
            });
            setIsJoinedSharedView(true);
            setSharedModeActive(true);
            setSelectedScoreId(scoreId);
            setViewerPageIndex(0);
            sendSharedViewMessage({
                type: "SYNC_SCORE_VIEW",
                scoreId,
                pageIndex: 0,
                active: true,
                triggeredByUserId: currentUserId,
                triggeredByUserName: roomSummary?.data.currentUserName
            });
        },
        [currentUserId, roomSummary?.data.currentUserName, sendSharedViewMessage]
    );

    const joinSharedView = useCallback(() => {
        if (!sharedScoreSession) {
            return;
        }

        setIsJoinedSharedView(true);
        setSharedModeActive(true);
        setSelectedScoreId(sharedScoreSession.scoreId);
        setViewerPageIndex(sharedScoreSession.pageIndex);
    }, [sharedScoreSession]);

    const leaveSharedView = useCallback(() => {
        setIsJoinedSharedView(false);
        setSharedModeActive(false);
        setSelectedScoreId(null);
        setViewerPageIndex(0);
    }, []);

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
            setSharedScoreSession(null);
            setIsJoinedSharedView(false);
        }

        if (sharedModeActive && !isCreator) {
            leaveSharedView();
            return;
        }

        setSharedModeActive(false);
        setSelectedScoreId(null);
        setViewerPageIndex(0);
    };

    const handleInvite = useCallback(async () => {
        try {
            const inviteLink = `${INVITE_LINK_BASE_URL}/${groupId}`;
            await Share.share({
                title: `${roomTitle} 방 초대`,
                url: inviteLink,
                message: `${roomTitle} 방에 초대합니다.\n\n입장하기\n${inviteLink}`
            });
        } catch {
            Alert.alert("초대 실패", "초대 메시지를 공유하지 못했습니다.");
        }
    }, [groupId, roomTitle]);

    const handleLeaveRoom = useCallback(
        async (delegateUserId?: number) => {
            try {
                await leaveRoom({
                    groupId,
                    delegateUserId
                });
                setIsSidebarVisible(false);
                router.replace("/(score)/(tabs)");
            } catch {
                Alert.alert("방 나가기 실패", "방에서 나가지 못했습니다. 잠시 후 다시 시도해주세요.");
            }
        },
        [groupId, leaveRoom, router]
    );

    const handleTransferOwner = useCallback(
        async (delegateUserId: number) => {
            try {
                await transferRoomOwner({
                    groupId,
                    delegateUserId
                });
                Alert.alert("방장 위임 완료", "선택한 멤버에게 방장을 위임했습니다.");
            } catch {
                Alert.alert("방장 위임 실패", "방장을 위임하지 못했습니다. 잠시 후 다시 시도해주세요.");
            }
        },
        [groupId, transferRoomOwner]
    );

    const handleDeleteRoom = useCallback(() => {
        Alert.alert("방 삭제", "방과 공유된 악보가 모두 삭제됩니다. 계속할까요?", [
            {
                text: "취소",
                style: "cancel"
            },
            {
                text: "삭제",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteRoom(groupId);
                        setIsSidebarVisible(false);
                        router.replace("/(score)/(tabs)");
                    } catch {
                        Alert.alert("방 삭제 실패", "방을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
                    }
                }
            }
        ]);
    }, [deleteRoom, groupId, router]);

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
                    ref={scoreListRef}
                    data={scores}
                    inverted
                    style={styles.list}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: FlipStyles.adjustScale(24) + insets.bottom }
                    ]}
                    initialNumToRender={8}
                    maxToRenderPerBatch={6}
                    windowSize={7}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews
                    onScroll={handleScoreListScroll}
                    scrollEventThrottle={16}
                    onContentSizeChange={() => {
                        if (isNearLatestRef.current) {
                            scrollToLatest(false);
                        }
                    }}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 0,
                        autoscrollToTopThreshold: LATEST_SCROLL_THRESHOLD
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

            {canJoinSharedView && (
                <View
                    style={[
                        styles.sharedJoinBanner,
                        {
                            backgroundColor: theme.white,
                            borderColor: theme.primaryLight
                        }
                    ]}
                >
                    <View style={styles.sharedJoinCopy}>
                        <DefaultText Button3 weight="700" color={theme.primary}>
                            같이보기 진행 중
                        </DefaultText>
                        <DefaultText Body2 color={theme.gray2} numberOfLines={1}>
                            {sharedScoreSession.hostName ?? "방장"}님의 화면을 같이 볼 수 있어요.
                        </DefaultText>
                    </View>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={joinSharedView}
                        style={[styles.sharedJoinButton, { backgroundColor: theme.primary }]}
                    >
                        <DefaultText Button2 weight="700" color={theme.white}>
                            참여
                        </DefaultText>
                    </TouchableOpacity>
                </View>
            )}

            {showLatestButton && (
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => scrollToLatest()}
                    style={[
                        styles.latestButton,
                        {
                            bottom: FlipStyles.adjustScale(92) + insets.bottom,
                            backgroundColor: theme.white,
                            borderColor: theme.primaryLight
                        }
                    ]}
                >
                    <DefaultText Button3 weight="800" color={theme.primary}>
                        최신글로 이동
                    </DefaultText>
                </TouchableOpacity>
            )}

            <RoomQuickActionMenu
                visible={isActionMenuVisible}
                onToggle={() => setIsActionMenuVisible(prev => !prev)}
                onOpenScoreRegister={openScoreUpload}
                onOpenScoreSend={openScoreSendModal}
            />

            <OrganizationScoreSendModal
                visible={isScoreSendModalVisible}
                groupId={groupId}
                onClose={() => setIsScoreSendModalVisible(false)}
                onSent={handleScoreSent}
            />

            <RoomSidebar
                visible={isSidebarVisible}
                groupId={groupId}
                roomTitle={roomTitle}
                creatorId={creatorId}
                currentUserId={currentUserId}
                isCreator={isCreator}
                isProcessingRoomAction={isLeavingRoom || isTransferringRoomOwner || isDeletingRoom}
                connectedMembers={connectedUsers}
                groupMembers={groupMembers}
                onClose={() => setIsSidebarVisible(false)}
                onInvite={handleInvite}
                onLeaveRoom={handleLeaveRoom}
                onTransferOwner={handleTransferOwner}
                onDeleteRoom={handleDeleteRoom}
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
        paddingTop: FlipStyles.adjustScale(150)
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
    },
    sharedJoinBanner: {
        position: "absolute",
        top: FlipStyles.adjustScale(14),
        left: FlipStyles.adjustScale(18),
        right: FlipStyles.adjustScale(18),
        zIndex: 30,
        minHeight: FlipStyles.adjustScale(68),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(18),
        paddingHorizontal: FlipStyles.adjustScale(16),
        paddingVertical: FlipStyles.adjustScale(12),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: FlipStyles.adjustScale(12),
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
        elevation: 5
    },
    sharedJoinCopy: {
        flex: 1,
        gap: FlipStyles.adjustScale(4)
    },
    sharedJoinButton: {
        minWidth: FlipStyles.adjustScale(64),
        height: FlipStyles.adjustScale(40),
        borderRadius: FlipStyles.adjustScale(12),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(14)
    },
    latestButton: {
        position: "absolute",
        alignSelf: "center",
        zIndex: 35,
        minHeight: FlipStyles.adjustScale(38),
        borderWidth: 1,
        borderRadius: FlipStyles.adjustScale(999),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: FlipStyles.adjustScale(16),
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 5
    }
});


