import { Stack } from "expo-router";

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function ScoreTabLayout() {
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
            <Stack.Screen name="[roomId]" />
        </Stack>
    );
}
