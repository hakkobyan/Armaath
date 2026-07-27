import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, radii, shadows } from "@/lib/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function ActionTile({
  icon,
  title,
  description,
  tone = "primary",
  onPress,
  style,
}: {
  icon: IconName;
  title: string;
  description: string;
  tone?: "primary" | "warm";
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const warm = tone === "warm";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        warm && styles.rootWarm,
        style,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.icon, warm && styles.iconWarm]}>
        <Ionicons
          name={icon}
          size={22}
          color={warm ? colors.coral : colors.primary}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={[styles.arrow, warm && styles.arrowWarm]}>
        <Ionicons
          name="arrow-forward"
          size={18}
          color={warm ? colors.coral : colors.primary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  rootWarm: { borderColor: colors.coralBorder },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  iconWarm: { backgroundColor: colors.coralSoft },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  description: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  arrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  arrowWarm: { backgroundColor: colors.coralSoft },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
