import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { Dimensions } from "react-native";
import styles from "@/styles";
import { ThemeProvider } from "@/styles/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from "expo-router";

const queryClient = new QueryClient();
export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: "(auth)"
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [token, setToken] = useState<string>();
    const [loaded, error] = useFonts({
        "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
        "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.ttf"),
        "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
        "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.ttf"),
        "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
        ...FontAwesome.font
    });
    Dimensions.addEventListener("change", status => {
        styles.setNewDimension(status.window.width, status.window.height);
    });
    const getToken = async () => {
        const token = await AsyncStorage.getItem("token");
        if (token) {
            setToken(token);
        }
    };
    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        getToken();
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav token={token} />;
}

function RootLayoutNav({ token }: { token?: string }) {
    const router = useRouter();
    useEffect(() => {
        if (!token) {
            return router.replace("/(auth)/login");
        }
        const parseToken = JSON.parse(token);
        if (parseToken.accessToken) {
            return router.replace("/(score)");
        }
    }, [token]);
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <Stack>
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(score)" options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: "modal" }} />
                </Stack>
            </ThemeProvider>
        </QueryClientProvider>
    );
}
