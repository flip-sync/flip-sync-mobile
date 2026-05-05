import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom"
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: true,
          title: "회원가입"
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          headerShown: true,
          title: "비밀번호 재설정"
        }}
      />
      <Stack.Screen name="organization-select" options={{ headerShown: false }} />
    </Stack>
  );
}
