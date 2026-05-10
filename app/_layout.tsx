import "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { Dimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import styles from "@/styles";
import { ThemeProvider } from "@/styles/theme";
import AppUpdateGate from "@/components/AppUpdateGate";
import { CompactHeader } from "@/components/base/CompactHeader";
import {
  ACTIVE_ORGANIZATION_STORAGE_KEY,
  ActiveOrganizationSession,
  clearActiveOrganizationSession,
  clearAuthSession,
  getActiveOrganizationSession,
  getAuthSession,
  setActiveOrganizationSession,
  setAuthSession,
  subscribeActiveOrganizationSession,
  subscribeAuthSession,
  TokenResDto
} from "@/common";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

const queryClient = new QueryClient();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [authSession, setAuthSessionState] = useState<TokenResDto | null>(getAuthSession());
  const [activeOrganizationSession, setActiveOrganizationSessionState] =
    useState<ActiveOrganizationSession | null>(getActiveOrganizationSession());
  const [authReady, setAuthReady] = useState(false);
  const [loaded, error] = useFonts({
    Pretendard: require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-Regular": require("../assets/fonts/Pretendard-Regular.ttf"),
    "Pretendard-Medium": require("../assets/fonts/Pretendard-Medium.ttf"),
    "Pretendard-SemiBold": require("../assets/fonts/Pretendard-SemiBold.ttf"),
    "Pretendard-Bold": require("../assets/fonts/Pretendard-Bold.ttf"),
    "Pretendard-ExtraBold": require("../assets/fonts/Pretendard-ExtraBold.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", status => {
      styles.setNewDimension(status.window.width, status.window.height);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    return subscribeAuthSession(session => {
      setAuthSessionState(session);
    });
  }, []);

  useEffect(() => {
    return subscribeActiveOrganizationSession(session => {
      setActiveOrganizationSessionState(session);
    });
  }, []);

  useEffect(() => {
    const hydrateToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken) {
        try {
          const parsedToken = JSON.parse(storedToken) as TokenResDto;

          if (parsedToken.accessToken) {
            setAuthSession(parsedToken);
          } else {
            clearAuthSession();
          }
        } catch {
          clearAuthSession();
        }
      } else {
        clearAuthSession();
      }

      const storedOrganization = await AsyncStorage.getItem(ACTIVE_ORGANIZATION_STORAGE_KEY);
      if (storedOrganization) {
        try {
          const parsedOrganization = JSON.parse(storedOrganization) as ActiveOrganizationSession;
          if (parsedOrganization.id) {
            setActiveOrganizationSession(parsedOrganization);
          } else {
            clearActiveOrganizationSession();
          }
        } catch {
          clearActiveOrganizationSession();
        }
      } else {
        clearActiveOrganizationSession();
      }

      setAuthReady(true);
    };

    hydrateToken();
  }, []);

  useEffect(() => {
    if (loaded && authReady) {
      SplashScreen.hideAsync();
    }
  }, [authReady, loaded]);

  if (!loaded || !authReady) {
    return null;
  }

  return (
    <RootLayoutNav
      authSession={authSession}
      activeOrganizationSession={activeOrganizationSession}
    />
  );
}

function RootLayoutNav({
  authSession,
  activeOrganizationSession
}: {
  authSession: TokenResDto | null;
  activeOrganizationSession: ActiveOrganizationSession | null;
}) {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const topSegment = segments[0];
    const topSegmentKey = String(topSegment ?? "");
    const secondSegment = segments[1] ?? "index";
    const secondSegmentKey = String(secondSegment);
    const isLegalRoute = topSegmentKey === "legal";
    const isSupportRoute = topSegmentKey === "support";
    const isAppInfoRoute = topSegmentKey === "app-info";
    const isInviteRoute = topSegmentKey === "invite" || (topSegmentKey === "mob" && secondSegmentKey === "invite");
    const isOrganizationSelectionRoute =
      topSegmentKey === "(auth)" && secondSegment === "organization-select";
    const isPublicAuthRoute = topSegmentKey === "(auth)" && secondSegment !== "organization-select";

    if (isInviteRoute || isLegalRoute || isSupportRoute || isAppInfoRoute) {
      return;
    }

    if (authSession?.accessToken) {
      if (!activeOrganizationSession?.id) {
        if (!isOrganizationSelectionRoute) {
          router.replace("/(auth)/organization-select");
        }
        return;
      }

      if (topSegmentKey !== "(score)" && !isOrganizationSelectionRoute) {
        router.replace("/(score)/(tabs)");
      }
      return;
    }

    if (!isPublicAuthRoute) {
      router.replace("/(auth)");
    }
  }, [activeOrganizationSession, authSession, router, segments]);

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <StatusBar style="dark" translucent={false} backgroundColor="#FFFFFF" />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="app-info"
                options={{
                  headerShown: true,
                  header: () => <CompactHeader title="앱 정보" />
                }}
              />
              <Stack.Screen
                name="support"
                options={{
                  headerShown: true,
                  header: () => <CompactHeader title="고객 지원" />
                }}
              />
            </Stack>
            <AppUpdateGate />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
