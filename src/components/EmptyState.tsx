import {
  StyleSheet,
  type StyleProp,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { colors } from "@/lib/theme";
export function EmptyState({
  title,
  message,
  style,
}: {
  title: string;
  message: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <View style={[styles.root, style]}>
      <View style={styles.icon}>
        <Text style={styles.spark}>✦</Text>
      </View>
      <Text style={[styles.title, desktop && styles.titleDesktop]}>
        {title}
      </Text>
      <Text style={[styles.message, desktop && styles.messageDesktop]}>
        {message}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    padding: 24,
    alignItems: "center",
    gap: 9,
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
  title: { fontSize: 17, fontWeight: "800", color: colors.ink },
  titleDesktop: { fontSize: 21 },
  message: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  messageDesktop: { fontSize: 16, lineHeight: 23 },
});
