import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { colors, radii } from "@/lib/theme";
import { formatDate, formatTime } from "@/utils/date";

type PickerMode = "date" | "time";

function parseValue(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
function pad(value: number) {
  return String(value).padStart(2, "0");
}
function toLocalInput(value: string) {
  const date = parseValue(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DateTimeField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [mode, setMode] = useState<PickerMode | null>(null);
  const date = parseValue(value);
  const handleNativeChange = (event: DateTimePickerEvent, next?: Date) => {
    if (Platform.OS === "android") setMode(null);
    if (event.type === "set" && next) onChange(next.toISOString());
  };

  if (Platform.OS === "web")
    return (
      <View style={styles.wrap}>
        <Text style={[styles.label, desktop && styles.labelDesktop]}>
          {label}
        </Text>
        {React.createElement("input", {
          type: "datetime-local",
          value: toLocalInput(value),
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(new Date(event.target.value).toISOString()),
          style: {
            ...webInputStyle,
            ...(desktop ? webInputDesktopStyle : {}),
          },
        })}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          style={styles.control}
          onPress={() => setMode("date")}
        >
          <Text style={styles.controlHint}>DATE</Text>
          <Text style={styles.controlValue}>
            {formatDate(date.toISOString())}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.control}
          onPress={() => setMode("time")}
        >
          <Text style={styles.controlHint}>TIME</Text>
          <Text style={styles.controlValue}>
            {formatTime(date.toISOString())}
          </Text>
        </Pressable>
      </View>
      {mode ? (
        <View style={styles.picker}>
          <DateTimePicker
            value={date}
            mode={mode}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            minuteInterval={5}
            themeVariant={Platform.OS === "ios" ? "light" : undefined}
            textColor={Platform.OS === "ios" ? colors.ink : undefined}
            accentColor={colors.primary}
            onChange={handleNativeChange}
          />
          {Platform.OS === "ios" ? (
            <Pressable style={styles.done} onPress={() => setMode(null)}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const webInputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 46,
  border: `1px solid ${colors.border}`,
  borderRadius: radii.md,
  padding: "0 12px",
  fontSize: 15,
  color: colors.ink,
  backgroundColor: colors.surface,
  boxSizing: "border-box",
};
const webInputDesktopStyle: React.CSSProperties = {
  minHeight: 56,
  padding: "0 16px",
  fontSize: 17,
};
const styles = StyleSheet.create({
  wrap: { gap: 5 },
  label: { fontSize: 14, fontWeight: "700", color: colors.inkSoft },
  labelDesktop: { fontSize: 16 },
  row: { flexDirection: "row", gap: 8 },
  control: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  controlHint: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.primary,
  },
  controlValue: { fontSize: 15, fontWeight: "600", color: colors.ink },
  picker: {
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  done: { alignSelf: "flex-end", padding: 12 },
  doneText: { color: colors.primaryDark, fontSize: 16, fontWeight: "800" },
  error: { color: colors.danger, fontSize: 14 },
});
