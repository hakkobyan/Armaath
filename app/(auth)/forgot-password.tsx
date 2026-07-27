import { zodResolver } from "@hookform/resolvers/zod";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ScreenContainer } from "@/components/ScreenContainer";
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
      <ScreenContainer contentContainerStyle={styles.center}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.message}>
          If an account exists for this address, you will receive a password
          recovery link. Open it on this device.
        </Text>
        <Button
          title="Back to login"
          onPress={() => router.replace("/(auth)/login")}
        />
      </ScreenContainer>
    );
  return (
    <ScreenContainer contentContainerStyle={styles.center}>
      <View style={styles.heading}>
        <Text style={styles.kicker}>ACCOUNT RECOVERY</Text>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.message}>
          Enter the email address used for your account.
        </Text>
      </View>
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
    gap: 20,
  },
  heading: { gap: 8 },
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
