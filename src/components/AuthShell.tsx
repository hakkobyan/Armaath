import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "@/components/ScreenContainer";
import { colors, shadows, typography } from "@/lib/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function AuthShell({
  eyebrow,
  title,
  description,
  icon = "sparkles-outline",
  children,
}: PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  icon?: IconName;
}>) {
  return (
    <ScreenContainer contentContainerStyle={styles.root}>
      <View style={styles.orbPurple} />
      <View style={styles.orbMint} />
      <View style={styles.heading}>
        <View style={styles.icon}>
          <Ionicons name={icon} size={25} color={colors.primary} />
        </View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    justifyContent: "center",
    paddingVertical: 32,
    overflow: "hidden",
  },
  orbPurple: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -110,
    right: -100,
    backgroundColor: colors.primarySoft,
  },
  orbMint: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    left: -90,
    bottom: -70,
    backgroundColor: colors.mintSoft,
  },
  heading: { alignItems: "center", gap: 7, paddingHorizontal: 12 },
  icon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  eyebrow: typography.eyebrow,
  title: { ...typography.title, textAlign: "center" },
  description: { ...typography.body, textAlign: "center", maxWidth: 480 },
  card: {
    width: "100%",
    gap: 14,
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
});
