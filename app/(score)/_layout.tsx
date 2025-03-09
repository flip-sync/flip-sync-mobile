import { useFlipTheme } from "@/common";
import FlipIcon from "@/components/base/imgs/FlipIcon";
import RowView from "@/components/base/RowView";
import DefaultText from "@/components/base/Text";
import FlipStyles from "@/styles";
import { Stack, useRouter } from "expo-router";
import { useExpoRouter } from "expo-router/build/global-state/router-store";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, TouchableOpacity, View } from "react-native";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function ScoreTabLayout() {
    const theme = useFlipTheme();
    const router = useExpoRouter();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "fade_from_bottom"
            }}
        >
            <Stack.Screen
                name="(tabs)"
                options={{
                    title: "악보 공유방"
                }}
            />

            <Stack.Screen
                name="modal"
                options={{
                    presentation: "transparentModal",
                    animation: "fade",
                    contentStyle: {
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#00000090"
                    }
                }}
            />
            <Stack.Screen
                name="createRoomModal"
                options={{
                    headerTitle: "",
                    headerShown: false,
                    presentation: "fullScreenModal",
                    animation: "fade"
                }}
            />
        </Stack>
    );
}
