import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  type PressableProps,
} from "react-native";
import { colors } from "@/lib/theme";
export function Button({
  title,
  loading = false,
  variant = "primary",
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
      style={({ pressed }) => [
        styles.base,
        desktop && styles.baseDesktop,
        styles[variant],
        pressed && styles.pressed,
        props.disabled && styles.disabled,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "secondary" ? colors.primary : "#fff"}
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
    minHeight: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#352A82",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  baseDesktop: { minHeight: 56 },
  primary: { backgroundColor: colors.primary },
  danger: { backgroundColor: colors.danger },
  secondary: { backgroundColor: colors.primarySoft, shadowOpacity: 0 },
  text: { color: "#fff", fontSize: 14, fontWeight: "800", letterSpacing: 0.2 },
  textDesktop: { fontSize: 17 },
  secondaryText: { color: colors.primaryDark },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.5 },
});
