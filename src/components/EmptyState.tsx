import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  type StyleProp,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";
import { colors, radii, typography } from "@/lib/theme";

export function EmptyState({
  title,
  message,
  style,
  icon = "sparkles-outline",
}: {
  title: string;
  message: string;
  style?: StyleProp<ViewStyle>;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <View style={[styles.root, style]}>
      <View style={styles.icon}>
        <Ionicons name={icon} size={23} color={colors.mint} />
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
    justifyContent: "center",
    gap: 9,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mintSoft,
  },
  title: { ...typography.section, fontSize: 17, textAlign: "center" },
  titleDesktop: { fontSize: 20 },
  message: { ...typography.caption, textAlign: "center", maxWidth: 460 },
  messageDesktop: { fontSize: 15, lineHeight: 22 },
});
