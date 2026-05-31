import { tScoreSummary } from "@/api/score/types";
import { useActiveOrganizationSession } from "@/common";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

type QuickAccessState = {
    favoriteScores: tScoreSummary[];
    recentScores: tScoreSummary[];
};

const EMPTY_STATE: QuickAccessState = {
    favoriteScores: [],
    recentScores: []
};

const MAX_FAVORITE_COUNT = 50;
const MAX_RECENT_COUNT = 20;

const getStorageKey = (organizationId: number) => `flipsync:organization-score-quick-access:${organizationId}`;

const uniqueScores = (scores: tScoreSummary[], maxCount: number) => {
    const seen = new Set<number>();
    const result: tScoreSummary[] = [];

    for (const score of scores) {
        if (!seen.has(score.id)) {
            seen.add(score.id);
            result.push(score);
        }

        if (result.length >= maxCount) {
            break;
        }
    }

    return result;
};

const normalizeState = (state: Partial<QuickAccessState>): QuickAccessState => ({
    favoriteScores: uniqueScores(state.favoriteScores ?? [], MAX_FAVORITE_COUNT),
    recentScores: uniqueScores(state.recentScores ?? [], MAX_RECENT_COUNT)
});

export const useOrganizationScoreQuickAccess = () => {
    const activeOrganization = useActiveOrganizationSession();
    const organizationId = activeOrganization?.id;
    const storageKey = organizationId ? getStorageKey(organizationId) : null;
    const [quickAccessState, setQuickAccessState] = useState<QuickAccessState>(EMPTY_STATE);

    useEffect(() => {
        let mounted = true;

        const loadState = async () => {
            if (!storageKey) {
                setQuickAccessState(EMPTY_STATE);
                return;
            }

            try {
                const savedValue = await AsyncStorage.getItem(storageKey);
                const parsedValue = savedValue ? (JSON.parse(savedValue) as Partial<QuickAccessState>) : EMPTY_STATE;

                if (mounted) {
                    setQuickAccessState(normalizeState(parsedValue));
                }
            } catch {
                if (mounted) {
                    setQuickAccessState(EMPTY_STATE);
                }
            }
        };

        void loadState();

        return () => {
            mounted = false;
        };
    }, [storageKey]);

    const updateQuickAccessState = useCallback(
        (updater: (current: QuickAccessState) => QuickAccessState) => {
            if (!storageKey) {
                return;
            }

            setQuickAccessState(current => {
                const nextState = normalizeState(updater(current));
                void AsyncStorage.setItem(storageKey, JSON.stringify(nextState));
                return nextState;
            });
        },
        [storageKey]
    );

    const favoriteScoreIds = useMemo(
        () => new Set(quickAccessState.favoriteScores.map(score => score.id)),
        [quickAccessState.favoriteScores]
    );

    const isFavoriteScore = useCallback((scoreId: number) => favoriteScoreIds.has(scoreId), [favoriteScoreIds]);

    const toggleFavoriteScore = useCallback(
        (score: tScoreSummary) => {
            updateQuickAccessState(current => {
                const exists = current.favoriteScores.some(favoriteScore => favoriteScore.id === score.id);
                const favoriteScores = exists
                    ? current.favoriteScores.filter(favoriteScore => favoriteScore.id !== score.id)
                    : [score, ...current.favoriteScores];

                return {
                    ...current,
                    favoriteScores
                };
            });
        },
        [updateQuickAccessState]
    );

    const registerRecentScore = useCallback(
        (score: tScoreSummary) => {
            updateQuickAccessState(current => ({
                ...current,
                recentScores: [score, ...current.recentScores.filter(recentScore => recentScore.id !== score.id)]
            }));
        },
        [updateQuickAccessState]
    );

    return {
        favoriteScores: quickAccessState.favoriteScores,
        recentScores: quickAccessState.recentScores,
        isFavoriteScore,
        toggleFavoriteScore,
        registerRecentScore
    };
};
