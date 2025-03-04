import { StyleSheet, Text, View } from "react-native";

import { Link } from "expo-router";
import FlipStyles from "@/styles";
import DefaultText from "@/components/base/Text";
import RowView from "@/components/base/RowView";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFlipTheme } from "@/common";

const Tab = createBottomTabNavigator();

export default function RoomList() {
    const theme = useFlipTheme();
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.white
                }
            ]}
        >
            <RowView justifyContent="space-between">
                <DefaultText Title1>내정보</DefaultText>
                <DefaultText Button2>최신순</DefaultText>
            </RowView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: FlipStyles.adjustScale(40)
    }
});
