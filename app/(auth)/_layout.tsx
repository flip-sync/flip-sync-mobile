import { Stack } from 'expo-router';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function TabLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: useClientOnlyValue(false, true),
        animation:'fade_from_bottom',
      }}>
      <Stack.Screen
        name="index"
        options={{
         headerShown:false
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title:"회원가입",
         }}
      />
    </Stack>
  );
}
