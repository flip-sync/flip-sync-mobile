import { Stack } from "expo-router";
import { CompactHeader } from "@/components/base/CompactHeader";

export default function LegalLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                animation: "fade_from_bottom"
            }}
        >
            <Stack.Screen
                name="privacy-policy"
                options={{
                    header: () => <CompactHeader title="개인정보처리방침" />
                }}
            />
            <Stack.Screen
                name="account-deletion"
                options={{
                    header: () => <CompactHeader title="계정 삭제 안내" />
                }}
            />
        </Stack>
    );
}
