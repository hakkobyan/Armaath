import type { PropsWithChildren } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  type ScrollViewProps,
} from "react-native";
import { colors, spacing } from "@/lib/theme";
export function ScreenContainer({
  children,
  contentContainerStyle,
  ...props
}: PropsWithChildren<ScrollViewProps>) {
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...props}
        contentContainerStyle={[
          styles.content,
          width >= 900 && styles.contentDesktop,
          contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: {
    width: "100%",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    flexGrow: 1,
  },
  contentDesktop: {
    maxWidth: 1320,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
});
