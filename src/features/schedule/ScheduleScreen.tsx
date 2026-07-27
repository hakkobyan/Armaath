import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DateTimeField } from "@/components/DateTimeField";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { PageHeader } from "@/components/PageHeader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentGroup } from "@/hooks/useCurrentGroup";
import { colors } from "@/lib/theme";
import {
  getSchedule,
  removeSchedule,
  saveSchedule,
} from "@/services/schedule.service";
import type { ScheduleItem, ScheduleStatus } from "@/types/models";
import { formatDate, formatTime } from "@/utils/date";
import { scheduleSchema } from "@/utils/validation";

type Form = z.infer<typeof scheduleSchema>;

const statusTones: Record<
  ScheduleStatus,
  { backgroundColor: string; color: string }
> = {
  scheduled: { backgroundColor: colors.primarySoft, color: colors.primaryDark },
  changed: { backgroundColor: colors.amberSoft, color: colors.amber },
  cancelled: { backgroundColor: colors.dangerSoft, color: colors.danger },
  completed: { backgroundColor: colors.successSoft, color: colors.success },
};

function newLessonDefaults(): Form {
  const start = new Date();
  start.setSeconds(0, 0);
  start.setMinutes(0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  return {
    group_id: "",
    title: "",
    description: "",
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    status: "scheduled",
  };
}

export function ScheduleScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const { profile } = useAuth();
  const groups = useCurrentGroup();
  const ids = groups.data?.map((group) => group.id) ?? [];
  const query = useQuery({
    queryKey: ["schedule", ids],
    queryFn: () => getSchedule(ids),
    enabled: ids.length > 0,
  });
  const queryClient = useQueryClient();
  const form = useForm<Form>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: newLessonDefaults(),
  });
  const [visible, setVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<string>();

  const open = (item?: ScheduleItem) => {
    form.reset(
      item
        ? {
            group_id: item.group_id,
            title: item.title,
            description: item.description ?? "",
            starts_at: item.starts_at,
            ends_at: item.ends_at,
            status: item.status,
          }
        : { ...newLessonDefaults(), group_id: groups.data?.[0]?.id ?? "" },
    );
    setEditing(item?.id);
    setVisible(true);
  };
  const mutation = useMutation({
    mutationFn: (values: Form) =>
      saveSchedule({
        ...values,
        room: null,
        id: editing,
        teacher_id: profile!.id,
      }),
    onSuccess: async () => {
      setVisible(false);
      await queryClient.invalidateQueries({ queryKey: ["schedule"] });
    },
  });
  const remove = useMutation({
    mutationFn: removeSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule"] }),
  });
  const scheduleDays = React.useMemo(() => {
    const result = new Map<string, ScheduleItem[]>();
    for (const item of query.data ?? []) {
      const date = formatDate(item.starts_at);
      result.set(date, [...(result.get(date) ?? []), item]);
    }
    return [...result.entries()];
  }, [query.data]);

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="LEARNING PLAN"
        title="Schedule"
        description="See every lesson, change plans, and keep your groups on track."
        action={
          profile?.role === "teacher" ? (
            <Button title="Add lesson" onPress={() => open()} />
          ) : undefined
        }
      />

      {query.isError ? (
        <Text style={styles.error}>
          Schedule could not be loaded. Check your connection.
        </Text>
      ) : null}
      {!query.isLoading && !query.data?.length ? (
        <EmptyState
          icon="calendar-clear-outline"
          title="No lessons"
          message="There are no schedule items for your groups."
        />
      ) : (
        scheduleDays.map(([date, items]) => (
          <View key={date} style={styles.day}>
            <View style={styles.dateRow}>
              <View style={styles.dateIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={17}
                  color={colors.primary}
                />
              </View>
              <Text style={[styles.date, desktop && styles.dateDesktop]}>
                {date}
              </Text>
            </View>
            <View style={styles.lessonGrid}>
              {items.map((item) => {
                const tone = statusTones[item.status];
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.lessonCell,
                      desktop && styles.lessonCellDesktop,
                    ]}
                  >
                    <Card style={styles.lessonCard}>
                      <View style={styles.lessonHeader}>
                        <Text
                          style={[
                            styles.lesson,
                            desktop && styles.lessonDesktop,
                            item.status === "cancelled" && styles.cancelled,
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.status,
                            desktop && styles.statusDesktop,
                            tone,
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                      <View style={styles.metaRow}>
                        <Ionicons
                          name="time-outline"
                          size={17}
                          color={colors.muted}
                        />
                        <Text
                          style={[styles.meta, desktop && styles.metaDesktop]}
                        >
                          {item.groups?.name} · {formatTime(item.starts_at)}–
                          {formatTime(item.ends_at)}
                        </Text>
                      </View>
                      {item.profiles ? (
                        <Text style={styles.muted}>
                          {item.profiles.first_name} {item.profiles.last_name}
                        </Text>
                      ) : null}
                      {item.description ? (
                        <Text style={styles.description}>
                          {item.description}
                        </Text>
                      ) : null}
                      {profile?.role === "teacher" ? (
                        <View style={styles.actions}>
                          <Pressable
                            hitSlop={8}
                            onPress={() => open(item)}
                            style={({ pressed }) => [
                              styles.actionButton,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={styles.link}>Edit</Text>
                          </Pressable>
                          {item.status !== "cancelled" ? (
                            <Pressable
                              hitSlop={8}
                              style={({ pressed }) => [
                                styles.actionButton,
                                pressed && styles.pressed,
                              ]}
                              onPress={() =>
                                mutation.mutate({
                                  ...item,
                                  description: item.description ?? "",
                                  status: "cancelled",
                                })
                              }
                            >
                              <Text style={styles.link}>Cancel</Text>
                            </Pressable>
                          ) : null}
                          <Pressable
                            hitSlop={8}
                            style={({ pressed }) => [
                              styles.actionButton,
                              pressed && styles.pressed,
                            ]}
                            onPress={() => remove.mutate(item.id)}
                          >
                            <Text style={styles.danger}>Delete</Text>
                          </Pressable>
                        </View>
                      ) : null}
                    </Card>
                  </View>
                );
              })}
            </View>
          </View>
        ))
      )}

      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <ScreenContainer contentContainerStyle={styles.formContainer}>
          <PageHeader
            eyebrow="LESSON DETAILS"
            title={editing ? "Edit lesson" : "New lesson"}
            description="Choose a group, date, time, and lesson status."
          />
          <Text style={styles.label}>Group</Text>
          <View style={styles.choices}>
            {groups.data?.map((group) => {
              const selected = form.watch("group_id") === group.id;
              return (
                <Pressable
                  key={group.id}
                  onPress={() =>
                    form.setValue("group_id", group.id, {
                      shouldValidate: true,
                    })
                  }
                  style={({ pressed }) => [
                    styles.choice,
                    selected && styles.selected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[styles.choiceText, selected && styles.selectedText]}
                  >
                    {group.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {form.formState.errors.group_id ? (
            <Text style={styles.error}>
              {form.formState.errors.group_id.message}
            </Text>
          ) : null}
          {(["title", "description"] as const).map((name) => (
            <Controller
              key={name}
              control={form.control}
              name={name}
              render={({ field: { value, onChange, onBlur } }) => (
                <Input
                  label={name === "title" ? "Title" : "Description"}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={form.formState.errors[name]?.message}
                />
              )}
            />
          ))}
          <Controller
            control={form.control}
            name="starts_at"
            render={({ field: { value, onChange } }) => (
              <DateTimeField
                label="Starts at"
                value={value}
                onChange={onChange}
                error={form.formState.errors.starts_at?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="ends_at"
            render={({ field: { value, onChange } }) => (
              <DateTimeField
                label="Ends at"
                value={value}
                onChange={onChange}
                error={form.formState.errors.ends_at?.message}
              />
            )}
          />
          <Text style={styles.label}>Status</Text>
          <View style={styles.choices}>
            {(
              [
                "scheduled",
                "changed",
                "cancelled",
                "completed",
              ] as ScheduleStatus[]
            ).map((status) => {
              const selected = form.watch("status") === status;
              return (
                <Pressable
                  key={status}
                  style={({ pressed }) => [
                    styles.choice,
                    selected && styles.selected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => form.setValue("status", status)}
                >
                  <Text
                    style={[
                      styles.choiceText,
                      styles.capitalize,
                      selected && styles.selectedText,
                    ]}
                  >
                    {status}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {mutation.error ? (
            <Text style={styles.error}>Could not save this lesson.</Text>
          ) : null}
          <View style={styles.formActions}>
            <View style={styles.formAction}>
              <Button
                title="Save lesson"
                loading={mutation.isPending}
                disabled={mutation.isPending}
                onPress={form.handleSubmit((values) => mutation.mutate(values))}
              />
            </View>
            <View style={styles.formAction}>
              <Button
                title="Close"
                variant="secondary"
                onPress={() => setVisible(false)}
              />
            </View>
          </View>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formContainer: { width: "100%", maxWidth: 720, alignSelf: "center" },
  day: { gap: 10, marginTop: 2 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  date: { fontSize: 15, fontWeight: "800", color: colors.ink },
  dateDesktop: { fontSize: 18 },
  lessonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  lessonCell: { width: "100%" },
  lessonCellDesktop: { width: "48%", flexGrow: 1, minWidth: 360 },
  lessonCard: { height: "100%" },
  lessonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  lesson: { flex: 1, fontSize: 16, fontWeight: "800", color: colors.ink },
  lessonDesktop: { fontSize: 19 },
  status: {
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    textTransform: "capitalize",
    overflow: "hidden",
  },
  statusDesktop: { fontSize: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { flex: 1, fontSize: 13, fontWeight: "700", color: colors.inkSoft },
  metaDesktop: { fontSize: 15 },
  cancelled: { textDecorationLine: "line-through", color: colors.danger },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  description: { fontSize: 14, lineHeight: 20, color: colors.inkSoft },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 5 },
  actionButton: {
    minHeight: 36,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  link: { color: colors.primaryDark, fontSize: 13, fontWeight: "800" },
  danger: { color: colors.danger, fontSize: 13, fontWeight: "800" },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  label: { fontSize: 14, fontWeight: "800", color: colors.ink },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  choice: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  choiceText: { color: colors.inkSoft, fontSize: 14, fontWeight: "700" },
  selected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  selectedText: { color: colors.primaryDark },
  capitalize: { textTransform: "capitalize" },
  formActions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  formAction: { flex: 1, minWidth: 180 },
  pressed: { opacity: 0.7 },
});
