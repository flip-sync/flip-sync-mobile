import { Stack } from 'expo-router';


// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

export default function TabLayout() {

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation:'fade_from_bottom',
      }}>
      <Stack.Screen
        name="index"
        options={{
         title:"악보 그룹"
        }}
      />
      <Stack.Screen
        name=":roomId"
       
      />
    </Stack>
  );
}
