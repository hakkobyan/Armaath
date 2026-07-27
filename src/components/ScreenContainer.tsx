import type { PropsWithChildren } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  type ScrollViewProps,
} from "react-native";
import { colors } from "@/lib/theme";
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
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 10,
    flexGrow: 1,
  },
  contentDesktop: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 18,
  },
});
