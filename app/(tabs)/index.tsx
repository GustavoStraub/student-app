import { Button, Text, StyleSheet, View } from "react-native";
import { colors } from "../theme/colorPalette";
import { useRouter } from "expo-router";

export default function Index() {
  const { push } = useRouter();
  return <View style={styles.container}></View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.secondaryBackground,
    padding: 20,
  },
});
