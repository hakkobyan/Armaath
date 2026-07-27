import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";
export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <Text style={styles.spark}>✦</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    padding: 26,
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mintSoft,
  },
  spark: { fontSize: 20, color: colors.mint },
  title: { fontSize: 21, fontWeight: "800", color: colors.ink },
  message: { color: colors.muted, fontSize: 16, textAlign: "center", lineHeight: 23 },
});
