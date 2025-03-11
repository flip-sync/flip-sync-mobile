import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import { useNavigation, useRouter } from "expo-router";
import FlipStyles from "@/styles";
import DefaultText from "@/components/base/Text";
import RowView from "@/components/base/RowView";
import { useFlipTheme } from "@/common";
import { useEffect } from "react";
import { Header } from "@/components/base/Header";
import { useScore } from "@/hooks/score";
import { useCheckDevice } from "@/hooks/useCheckDevice";
import { RoomCard } from "@/components/RoomList/RoomCard";
import { ScoreCard } from "@/components/ScoreRoom/ScoreCard";
import { FloatingButton } from "@/components/base/Button/FloatingButton";

export default function Room() {
    const theme = useFlipTheme();
    const navigation = useNavigation();
    const router = useRouter();
    const { scoreList, nextScoreList, hasNextScoreList, isFetchingNextScoreList, isLoadingScoreList } = useScore();
    const { isTablet } = useCheckDevice();
    useEffect(() => {
        navigation.setOptions({
            headerShown: true,
            header: () => <Header title="그룹" />
        });
    }, [navigation]);

    const score = scoreList?.pages.flatMap(page => page.data.content) ?? [];
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.gray8
                }
            ]}
        >
            <FloatingButton onPress={() => router.push("/(score)/createScoreModal")} />
            {/* <RowView justifyContent="space-between">
                <DefaultText Title1>테스트</DefaultText>
                <DefaultText Button2>최신순</DefaultText>
            </RowView> */}
            {/* <FlatList
                data={score}
                style={[
                    {
                        flex: 1
                    }
                ]}
                numColumns={1}
                keyExtractor={item => `score-${item.id}`}
                renderItem={data => {
                    return (
                        <RoomCard title={data.item.name} description={data.item.creatorName} onPressEvent={() => {}} />
                    );
                }}
                onEndReached={() => {
                    if (hasNextScoreList) nextScoreList();
                }}
                ListEmptyComponent={
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <DefaultText Body2 color={theme.gray5}>
                            아직 악보가 없습니다.
                        </DefaultText>
                    </View>
                }
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextScoreList ? <ActivityIndicator size="small" color="#3498db" /> : null
                }
            /> */}
            <ScoreCard />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: FlipStyles.adjustScale(40)
    }
});
