import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/lib/theme";
export function Card({
  children,
  tone = "default",
}: PropsWithChildren<{ tone?: "default" | "purple" | "mint" | "coral" }>) {
  return <View style={[styles.card, styles[tone]]}>{children}</View>;
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 22,
    gap: 12,
    borderWidth: 1,
    borderColor: "#ECEEF3",
    shadowColor: "#25304A",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  default: {},
  purple: { backgroundColor: colors.primarySoft, borderColor: "#DDD7FF" },
  mint: { backgroundColor: colors.mintSoft, borderColor: "#CBEFE4" },
  coral: { backgroundColor: colors.coralSoft, borderColor: "#FFDCD5" },
});
