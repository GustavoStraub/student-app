import { Stack } from "expo-router/stack";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { setupDatabase } from "./db/initializer";

export default function Layout() {
  useEffect(() => {
    setupDatabase();
  }, []);
  return (
    <GestureHandlerRootView>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
