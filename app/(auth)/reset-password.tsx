import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import { z } from "zod";
import { Button } from "@/components/Button";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/Input";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { colors } from "@/lib/theme";
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
      <AuthShell
        eyebrow="LINK EXPIRED"
        title="Invalid recovery link"
        description="This link is invalid or has expired. Request a new password recovery email."
        icon="alert-circle-outline"
      >
        <Button
          title="Request new link"
          onPress={() => router.replace("/(auth)/forgot-password")}
        />
        <Button
          title="Back to login"
          variant="secondary"
          onPress={() => router.replace("/(auth)/login")}
        />
      </AuthShell>
    );
  return (
    <AuthShell
      eyebrow="ACCOUNT RECOVERY"
      title="Choose a new password"
      description="Use at least 6 characters and do not reuse an old password."
      icon="lock-closed-outline"
    >
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
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, textAlign: "center", fontWeight: "600" },
});
