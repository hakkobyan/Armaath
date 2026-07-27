import type { PropsWithChildren } from "react";
import {
  StyleSheet,
  type StyleProp,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { colors } from "@/lib/theme";
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
    borderRadius: 18,
    padding: 13,
    gap: 7,
    borderWidth: 1,
    borderColor: "#ECEEF3",
    shadowColor: "#25304A",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 },
    elevation: 2,
  },
  cardDesktop: { padding: 22, gap: 12 },
  default: {},
  purple: { backgroundColor: colors.primarySoft, borderColor: "#DDD7FF" },
  mint: { backgroundColor: colors.mintSoft, borderColor: "#CBEFE4" },
  coral: { backgroundColor: colors.coralSoft, borderColor: "#FFDCD5" },
});
