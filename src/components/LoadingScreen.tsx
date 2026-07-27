import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@/lib/theme";

export function LoadingScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.mark}>
        <Text style={styles.markText}>A</Text>
      </View>
      <ActivityIndicator size="small" color={colors.primary} />
      <Text style={styles.text}>Loading Armath…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.background,
  },
  mark: {
    width: 52,
    height: 52,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  markText: { color: colors.white, fontSize: 25, fontWeight: "900" },
  text: { color: colors.muted, fontSize: 14, fontWeight: "700" },
});
