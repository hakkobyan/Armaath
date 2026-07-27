import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { z } from "zod";
import { useRouter } from "expo-router";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ScreenContainer } from "@/components/ScreenContainer";
import { colors } from "@/lib/theme";
import { signIn } from "@/services/auth.service";
import { loginSchema } from "@/utils/validation";
type Form = z.infer<typeof loginSchema>;
export default function Login() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const submit = async (v: Form) => {
    const { error } = await signIn(v.email.trim(), v.password);
    if (error)
      setError("root", {
        message: error.message.includes("Invalid login")
          ? "Email or password is incorrect."
          : "Unable to sign in. Check your connection and try again.",
      });
  };
  return (
    <ScreenContainer
      contentContainerStyle={[styles.root, desktop && styles.rootDesktop]}
    >
      <View style={styles.orbPurple} />
      <View style={styles.orbMint} />
      <View style={[styles.hero, desktop && styles.heroDesktop]}>
        <View style={[styles.mark, desktop && styles.markDesktop]}>
          <Text style={[styles.markText, desktop && styles.markTextDesktop]}>
            A
          </Text>
        </View>
        <Text style={[styles.logo, desktop && styles.logoDesktop]}>
          ARMATH TBILISI
        </Text>
        <Text style={[styles.title, desktop && styles.titleDesktop]}>
          Welcome back
        </Text>
        <Text style={[styles.subtitle, desktop && styles.subtitleDesktop]}>
          Learn, build, and create together.
        </Text>
        {desktop ? (
          <View style={styles.desktopNote}>
            <Text style={styles.desktopNoteTitle}>Your learning hub</Text>
            <Text style={styles.desktopNoteText}>
              Lessons, groups and conversations in one calm workspace.
            </Text>
          </View>
        ) : null}
      </View>
      <View style={[styles.form, desktop && styles.formDesktop]}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Password"
              secureTextEntry
              autoComplete="current-password"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.password?.message}
            />
          )}
        />
        {errors.root?.message ? (
          <Text style={styles.error}>{errors.root.message}</Text>
        ) : null}
        <Button
          title="Log in"
          loading={isSubmitting}
          disabled={isSubmitting}
          onPress={handleSubmit(submit)}
        />
        <Button
          title="Forgot password?"
          variant="secondary"
          onPress={() => router.push("/(auth)/forgot-password")}
        />
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>NEW TO ARMATH?</Text>
          <View style={styles.line} />
        </View>
        <Button
          title="Create student account"
          variant="secondary"
          onPress={() => router.push("/(auth)/register")}
        />
      </View>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  root: {
    maxWidth: 520,
    alignSelf: "stretch",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 24,
    overflow: "hidden",
  },
  rootDesktop: {
    width: "100%",
    alignSelf: "center",
    maxWidth: 1120,
    minHeight: 680,
    flexDirection: "row",
    alignItems: "stretch",
    padding: 24,
    gap: 24,
  },
  orbPurple: {
    position: "absolute",
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "#E5E0FF",
    top: -100,
    right: -90,
  },
  orbMint: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#DDF7EF",
    bottom: -70,
    left: -75,
  },
  hero: { alignItems: "center", gap: 8 },
  heroDesktop: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    padding: 52,
    borderRadius: 30,
    backgroundColor: colors.primary,
    overflow: "hidden",
  },
  mark: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#6757E8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#4536AA",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  markText: { color: "#fff", fontSize: 29, fontWeight: "900" },
  markDesktop: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },
  markTextDesktop: { color: colors.primary, fontSize: 34 },
  logo: { color: "#6757E8", fontSize: 13, fontWeight: "900", letterSpacing: 3 },
  logoDesktop: { color: "#DCD8FF" },
  title: { fontSize: 30, fontWeight: "900", color: "#172033" },
  titleDesktop: { color: "#FFFFFF", fontSize: 46, marginTop: 10 },
  subtitle: { color: "#667085", fontSize: 14 },
  subtitleDesktop: { color: "#E9E7FF", fontSize: 18 },
  desktopNote: {
    marginTop: 64,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,.12)",
    gap: 6,
    maxWidth: 390,
  },
  desktopNoteTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  desktopNoteText: { color: "#E9E7FF", fontSize: 15, lineHeight: 22 },
  form: {
    gap: 12,
    backgroundColor: "rgba(255,255,255,.72)",
    borderRadius: 24,
    padding: 14,
  },
  formDesktop: {
    width: 460,
    alignSelf: "center",
    gap: 15,
    padding: 34,
    borderWidth: 1,
    borderColor: "#E7E9F0",
    shadowColor: "#25304A",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 2,
  },
  line: { height: 1, backgroundColor: "#E4E7EC", flex: 1 },
  or: { fontSize: 12, fontWeight: "800", letterSpacing: 1, color: "#98A2B3" },
  error: { color: "#C83D55", textAlign: "center", fontWeight: "600" },
});
