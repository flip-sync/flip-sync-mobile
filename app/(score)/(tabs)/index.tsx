import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Link } from "expo-router";
import FlipStyles from "@/styles";
import DefaultText from "@/components/base/Text";
import RowView from "@/components/base/RowView";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFlipTheme } from "@/common";
import { RoomCard } from "@/components/RoomList/RoomCard";
import { useState } from "react";
import ReactNativeModal from "react-native-modal";
import { useCheckDevice } from "@/hooks/useCheckDevice";

const Tab = createBottomTabNavigator();
const data = Array.from({ length: 30 }, (_, i) => ({ id: i, text: `Item ${i + 1}` }));
export default function RoomList() {
    const theme = useFlipTheme();
    const { isTablet } = useCheckDevice();
    const [visible, setVisible] = useState(false);
    const onPressRoomCard = () => {
        setVisible(true);
    };
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.primaryLight
                }
            ]}
        >
            <RowView style={styles.header} justifyContent="flex-end">
                <DefaultText Button2>최신순</DefaultText>
            </RowView>
            <FlatList
                style={[
                    styles.roomList,
                    {
                        backgroundColor: theme.primaryLight
                    }
                ]}
                numColumns={isTablet ? 2 : 1}
                contentContainerStyle={{
                    paddingInline: FlipStyles.basePadding
                }}
                data={data}
                renderItem={() => {
                    return <RoomCard onPressEvent={onPressRoomCard} />;
                }}
            />
            <ReactNativeModal
                isVisible={visible}
                onBackdropPress={() => setVisible(false)}
                style={isTablet ? styles.tabletModalStyle : styles.fullScreenModalStyle}
                animationIn={isTablet ? "fadeIn" : "slideInLeft"}
                animationOut={isTablet ? "fadeOut" : "slideOutLeft"}
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalText}>{isTablet ? "태블릿 기본 모달" : "모바일 풀스크린 모달"}</Text>
                    <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
                        <Text style={styles.buttonText}>닫기</Text>
                    </TouchableOpacity>
                </View>
            </ReactNativeModal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: FlipStyles.basePadding
    },
    header: {
        padding: FlipStyles.basePadding
    },
    roomList: {
        flex: 1
    },
    button: { padding: 15, backgroundColor: "#3498db", borderRadius: 8 },
    buttonText: { color: "#fff", fontSize: 16 },
    modalContent: {
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        width: FlipStyles.windowWidth,
        height: FlipStyles.windowHeight
    },
    modalText: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
    closeButton: { marginTop: 20, padding: 15, backgroundColor: "#e74c3c", borderRadius: 8 },

    // 모바일 풀스크린 모달
    fullScreenModalStyle: { margin: 0, justifyContent: "flex-end" },

    // 태블릿 기본 모달 (중앙 정렬, 작은 크기)
    tabletModalStyle: { alignSelf: "center", width: 300, height: 200, borderRadius: 10 }
});
