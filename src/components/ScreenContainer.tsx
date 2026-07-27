import type { PropsWithChildren } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  type ScrollViewProps,
} from "react-native";
import { colors } from "@/lib/theme";
export function ScreenContainer({
  children,
  contentContainerStyle,
  ...props
}: PropsWithChildren<ScrollViewProps>) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...props}
        contentContainerStyle={[styles.content, contentContainerStyle]}
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
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 18,
    flexGrow: 1,
  },
});
