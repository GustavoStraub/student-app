import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { colors } from "../theme/colorPalette";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Cronogramas",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="bookmark" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="resumos"
        options={{
          title: "Resumos",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="book" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="form"
        options={{
          title: "Novo Cronograma",
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
