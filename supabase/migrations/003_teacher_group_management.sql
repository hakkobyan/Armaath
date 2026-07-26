-- Teachers may browse student profiles so they can assign registered students.
-- Students retain the narrower same-group profile visibility rules.
create or replace function public.can_access_profile(pid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    pid = auth.uid()
    or exists (
      select 1
      from public.profiles me
      join public.profiles target on target.id = pid
      where me.id = auth.uid()
        and me.role = 'teacher'
        and target.role in ('student', 'teacher')
    )
    or exists (
      select 1
      from public.group_members mine
      join public.group_members theirs on theirs.group_id = mine.group_id
      where mine.student_id = auth.uid()
        and theirs.student_id = pid
    )
    or exists (
      select 1
      from public.group_members mine
      join public.groups g on g.id = mine.group_id
      where mine.student_id = auth.uid()
        and g.teacher_id = pid
    )
$$;

-- Atomically creates/updates a teacher-owned group, its chat room, and members.
-- This is SECURITY DEFINER, so every authorization and role check is explicit.
create or replace function public.save_teacher_group(
  target_group_id uuid,
  group_name text,
  group_description text,
  student_ids uuid[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  saved_group_id uuid;
begin
  if caller_id is null or not exists (
    select 1 from public.profiles where id = caller_id and role = 'teacher'
  ) then
    raise exception 'Only teachers can manage groups';
  end if;

  if nullif(trim(group_name), '') is null or length(trim(group_name)) > 100 then
    raise exception 'Group name must contain 1 to 100 characters';
  end if;

  if coalesce(length(group_description), 0) > 500 then
    raise exception 'Group description is too long';
  end if;

  if exists (
    select 1
    from unnest(coalesce(student_ids, '{}'::uuid[])) requested(id)
    left join public.profiles p on p.id = requested.id and p.role = 'student'
    where p.id is null
  ) then
    raise exception 'One or more selected users are not students';
  end if;

  if target_group_id is null then
    insert into public.groups(name, description, teacher_id)
    values (trim(group_name), nullif(trim(group_description), ''), caller_id)
    returning id into saved_group_id;

    insert into public.chat_rooms(group_id, name, created_by)
    values (saved_group_id, trim(group_name), caller_id);
  else
    select id into saved_group_id
    from public.groups
    where id = target_group_id and teacher_id = caller_id
    for update;

    if saved_group_id is null then
      raise exception 'Group not found or access denied';
    end if;

    update public.groups
    set name = trim(group_name), description = nullif(trim(group_description), '')
    where id = saved_group_id;

    update public.chat_rooms set name = trim(group_name)
    where group_id = saved_group_id;
  end if;

  delete from public.group_members where group_id = saved_group_id;

  insert into public.group_members(group_id, student_id)
  select saved_group_id, requested.id
  from (select distinct unnest(coalesce(student_ids, '{}'::uuid[])) as id) requested;

  return saved_group_id;
end
$$;

revoke all on function public.save_teacher_group(uuid,text,text,uuid[]) from public;
grant execute on function public.save_teacher_group(uuid,text,text,uuid[]) to authenticated;
