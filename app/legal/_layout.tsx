import { Stack } from "expo-router";

export default function LegalLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerShadowVisible: false,
                animation: "fade_from_bottom"
            }}
        >
            <Stack.Screen
                name="privacy-policy"
                options={{
                    title: "개인정보처리방침"
                }}
            />
            <Stack.Screen
                name="account-deletion"
                options={{
                    title: "계정 삭제 안내"
                }}
            />
        </Stack>
    );
}
