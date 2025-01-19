import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Dimensions } from 'react-native';
import styles from '@/styles';
import { ThemeProvider } from '@/styles/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.ttf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.ttf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.ttf'),
    'Pretendard-ExtraBold': require('../assets/fonts/Pretendard-ExtraBold.ttf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.ttf'),
    ...FontAwesome.font,
  });
  Dimensions.addEventListener("change", status => {
    styles.setNewDimension(status.window.width, status.window.height);
});

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
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

  return <RootLayoutNav />;
}

function RootLayoutNav() {

  return (
    <ThemeProvider >
      <Stack  >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(score)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
