import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Input } from "@/components/Input";
import { PageHeader } from "@/components/PageHeader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useCurrentGroup } from "@/hooks/useCurrentGroup";
import { colors } from "@/lib/theme";
import {
  deleteTeacherGroup,
  getAllStudents,
  getGroupMembers,
  saveTeacherGroup,
} from "@/services/groups.service";
import type { Group } from "@/types/models";
import { groupSchema } from "@/utils/validation";

type GroupForm = z.infer<typeof groupSchema>;

export function GroupsScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const groups = useCurrentGroup();
  const groupIds = groups.data?.map((group) => group.id) ?? [];
  const students = useQuery({
    queryKey: ["all-students"],
    queryFn: getAllStudents,
  });
  const members = useQuery({
    queryKey: ["group-members", groupIds],
    queryFn: () => getGroupMembers(groupIds),
    enabled: groupIds.length > 0,
  });
  const queryClient = useQueryClient();
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [editing, setEditing] = useState<Group>();
  const [visible, setVisible] = useState(false);
  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: "", description: "" },
  });
  const memberData = members.data;
  const membersByGroup = useMemo(() => {
    const result = new Map<string, typeof memberData>();
    for (const group of groups.data ?? []) {
      result.set(
        group.id,
        memberData?.filter((member) => member.group_id === group.id) ?? [],
      );
    }
    return result;
  }, [groups.data, memberData]);

  const open = (group?: Group) => {
    setEditing(group);
    setSelectedStudents(
      group
        ? (members.data
            ?.filter((member) => member.group_id === group.id)
            .map((member) => member.student_id) ?? [])
        : [],
    );
    form.reset({
      name: group?.name ?? "",
      description: group?.description ?? "",
    });
    setVisible(true);
  };
  const toggleStudent = (id: string) =>
    setSelectedStudents((current) =>
      current.includes(id)
        ? current.filter((studentId) => studentId !== id)
        : [...current, id],
    );
  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["teacher-groups"] }),
      queryClient.invalidateQueries({ queryKey: ["group-members"] }),
      queryClient.invalidateQueries({ queryKey: ["student-count"] }),
      queryClient.invalidateQueries({ queryKey: ["schedule"] }),
      queryClient.invalidateQueries({ queryKey: ["chat-room"] }),
    ]);
  };
  const save = useMutation({
    mutationFn: (values: GroupForm) =>
      saveTeacherGroup({
        id: editing?.id,
        name: values.name,
        description: values.description,
        studentIds: selectedStudents,
      }),
    onSuccess: async () => {
      setVisible(false);
      await invalidate();
    },
  });
  const remove = useMutation({
    mutationFn: deleteTeacherGroup,
    onSuccess: invalidate,
  });
  const confirmDelete = (group: Group) => {
    const message = `Delete ${group.name}? Its schedule and chat history will also be removed.`;
    if (Platform.OS === "web") {
      if (window.confirm(message)) remove.mutate(group.id);
      return;
    }
    Alert.alert("Delete group", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => remove.mutate(group.id),
      },
    ]);
  };

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="TEACHER SPACE"
        title="Groups"
        description="Organize students into focused learning communities."
        action={<Button title="New group" onPress={() => open()} />}
      />
      {groups.isError || students.isError || members.isError ? (
        <Text style={styles.error}>
          Group data could not be loaded. Apply migration 003 and try again.
        </Text>
      ) : null}
      {remove.isError ? (
        <Text style={styles.error}>
          Group could not be deleted. Apply migration
          005_chat_and_delete_permissions.sql.
        </Text>
      ) : null}
      {!groups.isLoading && !groups.data?.length ? (
        <EmptyState
          icon="people-outline"
          title="No groups yet"
          message="Create a group and choose which students belong to it."
        />
      ) : (
        <View style={styles.groupGrid}>
          {groups.data?.map((group) => {
            const groupMembers = membersByGroup.get(group.id) ?? [];
            return (
              <View
                key={group.id}
                style={[styles.groupCell, desktop && styles.groupCellDesktop]}
              >
                <Card style={styles.groupCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <View style={styles.groupTitleRow}>
                        <View style={styles.iconTile}>
                          <Ionicons
                            name="people-outline"
                            size={19}
                            color={colors.primary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.groupName,
                            desktop && styles.groupNameDesktop,
                          ]}
                        >
                          {group.name}
                        </Text>
                      </View>
                      <Text style={styles.muted}>
                        {group.description || "No description"}
                      </Text>
                    </View>
                    <Text style={styles.count}>{groupMembers.length}</Text>
                  </View>
                  <Text style={styles.sectionLabel}>STUDENTS</Text>
                  {groupMembers.length ? (
                    groupMembers.map((member) => (
                      <View key={member.id} style={styles.memberRow}>
                        <View style={styles.memberDot} />
                        <Text style={styles.memberName}>
                          {member.profiles?.first_name}{" "}
                          {member.profiles?.last_name}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.muted}>No students assigned</Text>
                  )}
                  <View style={styles.actions}>
                    <Pressable
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.actionButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => open(group)}
                    >
                      <Text style={styles.link}>Edit members</Text>
                    </Pressable>
                    <Pressable
                      hitSlop={8}
                      style={({ pressed }) => [
                        styles.actionButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => confirmDelete(group)}
                    >
                      <Text style={styles.danger}>Delete</Text>
                    </Pressable>
                  </View>
                </Card>
              </View>
            );
          })}
        </View>
      )}

      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <ScreenContainer contentContainerStyle={styles.formContainer}>
          <PageHeader
            eyebrow="GROUP DETAILS"
            title={editing ? "Edit group" : "Create group"}
            description="Choose the students who should learn together."
          />
          <Controller
            control={form.control}
            name="name"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Group name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Robotics Junior"
                error={form.formState.errors.name?.message}
              />
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field: { value, onChange, onBlur } }) => (
              <Input
                label="Description"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                placeholder="What students will learn"
                error={form.formState.errors.description?.message}
              />
            )}
          />
          <View style={styles.studentHeader}>
            <Text style={styles.groupName}>Choose students</Text>
            <Text style={styles.muted}>{selectedStudents.length} selected</Text>
          </View>
          {students.data?.map((student) => {
            const selected = selectedStudents.includes(student.id);
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                key={student.id}
                style={({ pressed }) => [
                  styles.student,
                  selected && styles.studentSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => toggleStudent(student.id)}
              >
                <View
                  style={[styles.checkbox, selected && styles.checkboxSelected]}
                >
                  {selected ? (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  ) : null}
                </View>
                <View>
                  <Text style={styles.studentName}>
                    {student.first_name} {student.last_name}
                  </Text>
                  <Text style={styles.muted}>Student</Text>
                </View>
              </Pressable>
            );
          })}
          {!students.isLoading && !students.data?.length ? (
            <EmptyState
              icon="person-add-outline"
              title="No students"
              message="Students will appear here after registration."
            />
          ) : null}
          {save.isError ? (
            <Text style={styles.error}>
              Could not save the group. Make sure migration 003 is applied.
            </Text>
          ) : null}
          <View style={styles.formActions}>
            <View style={styles.formAction}>
              <Button
                title={editing ? "Save changes" : "Create group"}
                loading={save.isPending}
                disabled={save.isPending}
                onPress={form.handleSubmit((values) => save.mutate(values))}
              />
            </View>
            <View style={styles.formAction}>
              <Button
                title="Close"
                variant="secondary"
                disabled={save.isPending}
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
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  groupGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  groupCell: { width: "100%" },
  groupCellDesktop: { width: "48%", flexGrow: 1, minWidth: 360 },
  groupCard: { height: "100%" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardInfo: { flex: 1, gap: 6 },
  groupTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconTile: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  groupName: { flex: 1, fontSize: 16, fontWeight: "800", color: colors.ink },
  groupNameDesktop: { fontSize: 19 },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  count: {
    minWidth: 34,
    textAlign: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
    fontWeight: "800",
    overflow: "hidden",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: colors.primary,
    marginTop: 6,
  },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  memberDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.mint,
  },
  memberName: { color: colors.inkSoft, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  actionButton: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  link: { color: colors.primaryDark, fontWeight: "700" },
  danger: { color: colors.danger, fontWeight: "700" },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  student: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  studentSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  studentName: { fontSize: 14, fontWeight: "700", color: colors.ink },
  formActions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  formAction: { flex: 1, minWidth: 180 },
  pressed: { opacity: 0.7 },
});
