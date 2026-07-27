import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { Button } from "@/components/Button";
import { AuthShell } from "@/components/AuthShell";
import { Input } from "@/components/Input";
import { colors } from "@/lib/theme";
import { signUpStudent } from "@/services/auth.service";
import { registrationSchema } from "@/utils/validation";

import React from "react";

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const router = useRouter();
  const [success, setSuccess] = React.useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const submit = async (values: RegistrationForm) => {
    const { data, error } = await signUpStudent({
      email: values.email.trim().toLowerCase(),
      password: values.password,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
    });
    if (error) {
      setError("root", {
        message: error.message.includes("already registered")
          ? "An account with this email already exists."
          : "Registration failed. Check your connection and try again.",
      });
      return;
    }
    if (!data.session) setSuccess(true);
  };
  if (success)
    return (
      <AuthShell
        eyebrow="ONE MORE STEP"
        title="Check your email"
        description="We sent a confirmation link to your email. Confirm the address, then return and log in."
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
      eyebrow="STUDENT REGISTRATION"
      title="Create your account"
      description="Join your class, follow lessons, and collaborate with your group."
      icon="person-add-outline"
    >
      <View style={styles.form}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="First name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoComplete="given-name"
              error={errors.firstName?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Last name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoComplete="family-name"
              error={errors.lastName?.message}
            />
          )}
        />
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
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label="Password"
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
              label="Confirm password"
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
          title="Create student account"
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
      </View>
    </AuthShell>
  );
}
const styles = StyleSheet.create({
  form: { gap: 16 },
  error: { color: colors.danger, textAlign: "center", fontWeight: "600" },
});
