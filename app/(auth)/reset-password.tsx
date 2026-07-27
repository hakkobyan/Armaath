import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/hooks/useAuth";
import { signOut, updatePassword } from "@/services/auth.service";
import { newPasswordSchema } from "@/utils/validation";

type Form = z.infer<typeof newPasswordSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const { session, loading, passwordRecovery, completePasswordRecovery } =
    useAuth();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  const submit = async (values: Form) => {
    const { error } = await updatePassword(values.password);
    if (error) {
      setError("root", {
        message:
          "Could not update the password. The recovery link may have expired.",
      });
      return;
    }
    completePasswordRecovery();
    await signOut();
    router.replace("/(auth)/login");
  };
  if (loading || (passwordRecovery && !session)) return <LoadingScreen />;
  if (!passwordRecovery || !session)
    return (
      <ScreenContainer contentContainerStyle={styles.center}>
        <Text style={styles.title}>Invalid recovery link</Text>
        <Text style={styles.message}>
          This link is invalid or has expired. Request a new password recovery
          email.
        </Text>
        <Button
          title="Request new link"
          onPress={() => router.replace("/(auth)/forgot-password")}
        />
        <Button
          title="Back to login"
          variant="secondary"
          onPress={() => router.replace("/(auth)/login")}
        />
      </ScreenContainer>
    );
  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <Text style={styles.kicker}>ACCOUNT RECOVERY</Text>
      <Text style={styles.title}>Choose a new password</Text>
      <Text style={styles.message}>
        Use at least 6 characters and do not reuse an old password.
      </Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="New password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            autoComplete="new-password"
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Confirm new password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
          />
        )}
      />
      {errors.root?.message ? (
        <Text style={styles.error}>{errors.root.message}</Text>
      ) : null}
      <Button
        title="Update password"
        loading={isSubmitting}
        disabled={isSubmitting}
        onPress={handleSubmit(submit)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    justifyContent: "center",
    padding: 28,
    gap: 18,
  },
  kicker: {
    fontSize: 13,
    letterSpacing: 2,
    color: "#5b4cf0",
    fontWeight: "800",
  },
  title: { fontSize: 30, fontWeight: "800", color: "#171721" },
  message: { fontSize: 16, lineHeight: 23, color: "#686879" },
  error: { color: "#b42336", textAlign: "center" },
});
