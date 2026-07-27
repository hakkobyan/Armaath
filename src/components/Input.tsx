import { forwardRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type TextInputProps,
} from "react-native";
import { colors } from "@/lib/theme";
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
        placeholderTextColor="#8a8a9b"
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
  label: { fontSize: 14, fontWeight: "700", color: colors.ink },
  labelDesktop: { fontSize: 16 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
    shadowColor: "#25304A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  inputDesktop: { minHeight: 56, fontSize: 17 },
  invalid: { borderColor: colors.danger, backgroundColor: "#FFF8F8" },
  error: { color: colors.danger, fontSize: 13, fontWeight: "600" },
  errorDesktop: { fontSize: 14 },
});
