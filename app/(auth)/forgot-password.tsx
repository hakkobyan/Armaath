import { zodResolver } from "@hookform/resolvers/zod";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import { z } from "zod";
import { Button } from "@/components/Button";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/Input";
import { colors } from "@/lib/theme";
import { requestPasswordReset } from "@/services/auth.service";
import { passwordResetRequestSchema } from "@/utils/validation";

type Form = z.infer<typeof passwordResetRequestSchema>;

export default function ForgotPassword() {
  const router = useRouter();
  const [sent, setSent] = React.useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: { email: "" },
  });
  const submit = async (values: Form) => {
    const redirectTo = Linking.createURL("/reset-password");
    const { error } = await requestPasswordReset(
      values.email.trim().toLowerCase(),
      redirectTo,
    );
    if (error) {
      setError("root", {
        message: error.message.includes("rate limit")
          ? "Too many attempts. Please wait before trying again."
          : "Could not send the recovery email. Try again.",
      });
      return;
    }
    setSent(true);
  };
  if (sent)
    return (
      <AuthShell
        eyebrow="RECOVERY EMAIL SENT"
        title="Check your email"
        description="If an account exists for this address, you will receive a recovery link. Open it on this device."
        icon="mail-open-outline"
      >
        <Button
          title="Back to login"
          onPress={() => router.replace("/(auth)/login")}
        />
      </AuthShell>
    );
  return (
    <AuthShell
      eyebrow="ACCOUNT RECOVERY"
      title="Reset password"
      description="Enter the email address used for your account."
      icon="key-outline"
    >
      <Controller
        control={control}
        name="email"
        render={({ field: { value, onChange, onBlur } }) => (
          <Input
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            error={errors.email?.message}
          />
        )}
      />
      {errors.root?.message ? (
        <Text style={styles.error}>{errors.root.message}</Text>
      ) : null}
      <Button
        title="Send recovery link"
        loading={isSubmitting}
        disabled={isSubmitting}
        onPress={handleSubmit(submit)}
      />
      <Button
        title="Back to login"
        variant="secondary"
        disabled={isSubmitting}
        onPress={() => router.back()}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, textAlign: "center", fontWeight: "600" },
});
