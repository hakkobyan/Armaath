import type { ReactNode } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { colors, radii, shadows, typography } from "@/lib/theme";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  stackOnPhone = true,
  variant = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  stackOnPhone?: boolean;
  variant?: "default" | "hero";
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const stacked = stackOnPhone && width < 520;

  return (
    <View
      style={[
        styles.root,
        variant === "hero" && styles.hero,
        desktop && variant === "hero" && styles.heroDesktop,
        stacked && styles.rootStacked,
      ]}
    >
      {variant === "hero" ? (
        <>
          <View style={styles.heroOrbLarge} />
          <View style={styles.heroOrbSmall} />
        </>
      ) : null}
      <View style={[styles.copy, variant === "hero" && styles.heroContent]}>
        {eyebrow ? (
          <Text
            style={[styles.eyebrow, variant === "hero" && styles.heroEyebrow]}
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text
          style={[
            styles.title,
            desktop && styles.titleDesktop,
            variant === "hero" && styles.heroTitle,
          ]}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={[
              styles.description,
              desktop && styles.descriptionDesktop,
              variant === "hero" && styles.heroDescription,
            ]}
          >
            {description}
          </Text>
        ) : null}
      </View>
      {action ? (
        <View style={[styles.action, variant === "hero" && styles.heroContent]}>
          {action}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  rootStacked: { flexDirection: "column", alignItems: "stretch" },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  eyebrow: typography.eyebrow,
  title: typography.title,
  titleDesktop: { fontSize: 36 },
  description: { ...typography.caption, maxWidth: 620 },
  descriptionDesktop: { fontSize: 15, lineHeight: 22 },
  action: { flexShrink: 0 },
  hero: {
    minHeight: 148,
    padding: 20,
    borderRadius: radii.xl,
    backgroundColor: colors.primaryDeep,
    overflow: "hidden",
    ...shadows.floating,
  },
  heroDesktop: { minHeight: 176, padding: 28 },
  heroContent: { zIndex: 2 },
  heroEyebrow: { color: colors.primaryBorder },
  heroTitle: { color: colors.white },
  heroDescription: { color: colors.onPrimaryMuted },
  heroOrbLarge: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -58,
    top: -106,
    backgroundColor: colors.primary,
    opacity: 0.55,
  },
  heroOrbSmall: {
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    right: 90,
    bottom: -58,
    backgroundColor: colors.coral,
    opacity: 0.42,
  },
});
