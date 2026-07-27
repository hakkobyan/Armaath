import { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type TextInputProps,
} from "react-native";
import { colors, radii } from "@/lib/theme";
export const Input = forwardRef<
  TextInput,
  TextInputProps & { label: string; error?: string }
>(({ label, error, ...props }, ref) => {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, desktop && styles.labelDesktop]}>
        {label}
      </Text>
      <TextInput
        ref={ref}
        style={[
          styles.input,
          desktop && styles.inputDesktop,
          error && styles.invalid,
        ]}
        placeholderTextColor={colors.subtle}
        {...props}
      />
      {error ? (
        <Text style={[styles.error, desktop && styles.errorDesktop]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});
Input.displayName = "Input";
const styles = StyleSheet.create({
  wrap: { gap: 7 },
  label: { fontSize: 14, fontWeight: "700", color: colors.inkSoft },
  labelDesktop: { fontSize: 15 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  inputDesktop: { minHeight: 52, fontSize: 16 },
  invalid: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  error: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  errorDesktop: { fontSize: 14 },
});
