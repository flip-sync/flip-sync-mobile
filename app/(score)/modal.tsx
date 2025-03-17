import { useFlipTheme } from "@/common";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import RowView from "@/components/base/RowView";
import DefaultText from "@/components/base/Text";
import { UserProfileCard } from "@/components/RoomList/UserProfileCard";
import { useRoom } from "@/hooks/room";
import { useCheckDevice } from "@/hooks/useCheckDevice";
import FlipStyles from "@/styles";
import { isAxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export type tError = { response: { code: string; message: string } };
export default function RoomModal() {
    const theme = useFlipTheme();
    const router = useRouter();
    const { groupId } = useLocalSearchParams();
    const { groupDetail, joinRoom } = useRoom({
        groupId: Number(groupId)
    });
    const { isTablet } = useCheckDevice();
    return (
        <View
            style={[
                isTablet ? styles.tabletModalContent : styles.modalContent,
                {
                    backgroundColor: theme.white
                }
            ]}
        >
            <View>
                <RowView
                    style={{
                        padding: FlipStyles.adjustScale(20)
                    }}
                >
                    <RowView
                        alignItems="center"
                        style={{
                            gap: FlipStyles.adjustScale(16)
                        }}
                    >
                        <DefaultText Title3 color={theme.gray1}>
                            {isTablet ? "참여인원" : "참여인원"}
                        </DefaultText>
                        {/* <DefaultText Body1 color={theme.gray4}>
                            4/10
                        </DefaultText> */}
                    </RowView>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FlipIcon icon="icon-close" size={24} />
                    </TouchableOpacity>
                </RowView>
                <View style={styles.profileWrap}>
                    <ScrollView>
                        <View style={styles.profileBox}>
                            {groupDetail?.data.map(v => {
                                return <UserProfileCard key={v.id} name={v.name} />;
                            })}
                        </View>
                    </ScrollView>
                </View>
            </View>
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    onPress={async () => {
                        // router.back();
                        try {
                            const result = await joinRoom(Number(groupId));
                            if (result.code === "200_0") {
                                return router.replace(`/(score)/${groupId}`);
                            }
                        } catch (error) {
                            if (isAxiosError(error)) {
                                if (error?.response?.data?.code === "409_0") {
                                    return router.replace(`/(score)/${groupId}`);
                                }
                            }
                        }
                    }}
                    style={[
                        styles.applyBtn,
                        {
                            backgroundColor: theme.primary
                        }
                    ]}
                >
                    <DefaultText Body1 color={theme.white}>
                        참여하기
                    </DefaultText>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: FlipStyles.basePadding
    },
    header: {
        padding: FlipStyles.basePadding,
        gap: FlipStyles.adjustScale(4)
    },
    roomList: {
        flex: 1
    },
    button: { padding: 15, backgroundColor: "#3498db", borderRadius: 8 },
    profileWrap: {
        maxWidth: FlipStyles.adjustScale(562),
        width: FlipStyles.adjustScale(562),
        maxHeight: FlipStyles.adjustScale(340)
    },
    profileBox: {
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: FlipStyles.adjustScale(20),
        marginTop: FlipStyles.adjustScale(24),
        gap: FlipStyles.adjustScale(16)
    },
    modalContent: {
        padding: 20,
        justifyContent: "space-between",
        width: FlipStyles.windowWidth,
        height: FlipStyles.windowHeight
    },
    tabletModalContent: {
        borderRadius: 10,
        justifyContent: "space-between",
        maxWidth: FlipStyles.adjustScale(562),
        maxHeight: FlipStyles.adjustScale(505),
        height: "100%"
    },
    modalHeader: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    modalText: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    applyBtn: {
        width: FlipStyles.adjustScale(121),
        padding: FlipStyles.adjustScale(13),
        borderRadius: FlipStyles.adjustScale(8),
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-end"
    },
    // 모바일 풀스크린 모달
    fullScreenModalStyle: { margin: 0, justifyContent: "flex-end" },

    // 태블릿 기본 모달 (중앙 정렬, 작은 크기)
    tabletModalStyle: {
        alignSelf: "center",
        width: FlipStyles.adjustScale(562),
        height: FlipStyles.adjustScale(500),
        overflow: "hidden",
        borderRadius: 10,
        backgroundColor: "transparent"
    },
    bottomContainer: {
        padding: FlipStyles.adjustScale(20)
    }
});
