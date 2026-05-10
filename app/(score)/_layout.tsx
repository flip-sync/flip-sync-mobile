import { Stack } from "expo-router";

import { CompactHeader } from "@/components/base/CompactHeader";

export default function ScoreTabLayout() {
    return (
        <Stack
            screenOptions={{
                animation: "fade_from_bottom"
            }}
        >
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                    title: "악보공유방"
                }}
            />

            <Stack.Screen
                name="modal"
                options={{
                    headerShown: false,
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
            <Stack.Screen
                name="createScoreModal"
                options={{
                    headerTitle: "",
                    headerShown: false,
                    presentation: "fullScreenModal",
                    animation: "fade"
                }}
            />
            <Stack.Screen
                name="organization-info"
                options={{
                    headerShown: true,
                    header: () => <CompactHeader title="소속 정보" />
                }}
            />
            <Stack.Screen
                name="app-info"
                options={{
                    headerShown: true,
                    header: () => <CompactHeader title="앱 정보" />
                }}
            />
            <Stack.Screen
                name="[roomId]"
                options={{
                    headerShown: true
                }}
            />
        </Stack>
    );
}
