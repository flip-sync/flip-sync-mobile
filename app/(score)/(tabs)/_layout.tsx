import { StyleSheet, Text, View } from "react-native";

import { Link } from "expo-router";
import FlipStyles from "@/styles";
import DefaultText from "@/components/base/Text";
import RowView from "@/components/base/RowView";
import { Tabs } from "expo-router";
import { useFlipTheme } from "@/common";
import FlipIcon from "@/components/base/imgs/FlipIcon";

export default function HomeTabLayout() {
    const theme = useFlipTheme();
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.primary,
                headerShown: false,
                tabBarStyle: {
                    height: FlipStyles.adjustScale(65)
                }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "악보공유방",
                    tabBarIcon: ({ color }) => <FlipIcon icon="icon-users" color={color} size={24} />
                }}
            />
            <Tabs.Screen
                name="Score"
                options={{
                    title: "악보창고",
                    tabBarIcon: ({ color }) => <FlipIcon icon="icon-score" color={color} size={24} />
                }}
            />
            <Tabs.Screen
                name="MyInfo"
                options={{
                    title: "마이페이지",
                    tabBarIcon: ({ color }) => <FlipIcon icon="icon-profile" size={24} />
                }}
            />
        </Tabs>
    );
}
