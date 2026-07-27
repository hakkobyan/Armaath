import type { PropsWithChildren } from "react";
import {
  StyleSheet,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { colors, radii, shadows, spacing } from "@/lib/theme";
export function Card({
  children,
  tone = "default",
  style,
}: PropsWithChildren<{
  tone?: "default" | "purple" | "mint" | "coral";
  style?: StyleProp<ViewStyle>;
}>) {
  const { width } = useWindowDimensions();
  return (
    <View
      style={[
        styles.card,
        width >= 900 && styles.cardDesktop,
        styles[tone],
        style,
      ]}
    >
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardDesktop: { padding: spacing.lg, gap: spacing.md },
  default: {},
  purple: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  mint: { backgroundColor: colors.mintSoft, borderColor: colors.mintBorder },
  coral: { backgroundColor: colors.coralSoft, borderColor: colors.coralBorder },
});
