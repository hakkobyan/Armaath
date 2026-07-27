import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  type PressableProps,
} from "react-native";
import { colors, radii, shadows } from "@/lib/theme";
export function Button({
  title,
  loading = false,
  variant = "primary",
  style,
  disabled,
  ...props
}: PressableProps & {
  title: string;
  loading?: boolean;
  variant?: "primary" | "danger" | "secondary";
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={(state) => [
        styles.base,
        desktop && styles.baseDesktop,
        styles[variant],
        state.pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === "function" ? style(state) : style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? colors.primary : colors.white}
        />
      ) : (
        <Text
          style={[
            styles.text,
            desktop && styles.textDesktop,
            variant === "secondary" && styles.secondaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    ...shadows.button,
  },
  baseDesktop: { minHeight: 52 },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    shadowOpacity: 0,
  },
  text: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  textDesktop: { fontSize: 16 },
  secondaryText: { color: colors.primaryDark },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
});
