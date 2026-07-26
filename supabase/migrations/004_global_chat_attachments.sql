alter table public.chat_rooms alter column group_id drop not null;
alter table public.chat_rooms alter column created_by drop not null;
alter table public.chat_rooms add column if not exists room_type text not null default 'group';
alter table public.chat_rooms drop constraint if exists chat_rooms_room_type_check;
alter table public.chat_rooms add constraint chat_rooms_room_type_check check(room_type in('group','global'));
alter table public.chat_rooms add constraint chat_rooms_shape_check check((room_type='group' and group_id is not null) or (room_type='global' and group_id is null));
create unique index if not exists one_global_chat_room on public.chat_rooms(room_type) where room_type='global';

insert into public.chat_rooms(group_id,name,created_by,room_type)
select null,'All Students',null,'global'
where not exists(select 1 from public.chat_rooms where room_type='global');

alter table public.messages add column if not exists attachment_path text;
alter table public.messages add column if not exists attachment_name text;
alter table public.messages add column if not exists attachment_type text;
alter table public.messages add column if not exists attachment_size bigint;
alter table public.messages drop constraint if exists messages_content_check;
alter table public.messages add constraint messages_content_or_attachment_check check((length(trim(content)) between 1 and 2000) or attachment_path is not null);
alter table public.messages add constraint messages_attachment_size_check check(attachment_size is null or attachment_size between 0 and 10485760);

create or replace function public.can_access_chat_room(rid uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select exists(
    select 1
    from public.chat_rooms room
    where room.id=rid
      and (
        (room.room_type='global' and exists(select 1 from public.profiles where id=auth.uid() and role in('student','teacher')))
        or (room.room_type='group' and public.can_access_group(room.group_id))
      )
  )
$$;

create or replace function public.can_access_profile(pid uuid)
returns boolean
language sql
stable
security definer
set search_path=''
as $$
  select pid=auth.uid()
    or exists(
      select 1 from public.profiles me
      join public.profiles target on target.id=pid
      where me.id=auth.uid()
        and ((me.role='teacher' and target.role in('student','teacher')) or (me.role='student' and target.role='student'))
    )
    or exists(
      select 1 from public.group_members mine
      join public.groups g on g.id=mine.group_id
      where mine.student_id=auth.uid() and g.teacher_id=pid
    )
$$;

drop policy if exists rooms_read on public.chat_rooms;
drop policy if exists rooms_insert on public.chat_rooms;
drop policy if exists rooms_update on public.chat_rooms;
create policy rooms_read on public.chat_rooms for select to authenticated using(public.can_access_chat_room(id));
create policy rooms_insert on public.chat_rooms for insert to authenticated with check(room_type='group' and public.is_teacher_of(group_id) and created_by=auth.uid());
create policy rooms_update on public.chat_rooms for update to authenticated using(room_type='group' and public.is_teacher_of(group_id)) with check(room_type='group' and public.is_teacher_of(group_id));

drop policy if exists messages_read on public.messages;
drop policy if exists messages_insert on public.messages;
drop policy if exists messages_update on public.messages;
create policy messages_read on public.messages for select to authenticated using(public.can_access_chat_room(chat_room_id));
create policy messages_insert on public.messages for insert to authenticated with check(sender_id=auth.uid() and public.can_access_chat_room(chat_room_id));
create policy messages_update on public.messages for update to authenticated using(sender_id=auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role='teacher') and public.can_access_chat_room(chat_room_id)) with check(is_deleted=true and public.can_access_chat_room(chat_room_id));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('chat-attachments','chat-attachments',false,10485760,array['image/jpeg','image/png','image/webp','image/gif','image/heic','application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists chat_attachments_insert on storage.objects;
drop policy if exists chat_attachments_select on storage.objects;
drop policy if exists chat_attachments_delete on storage.objects;
create policy chat_attachments_insert on storage.objects for insert to authenticated with check(bucket_id='chat-attachments' and (storage.foldername(name))[2]=auth.uid()::text and public.can_access_chat_room(((storage.foldername(name))[1])::uuid));
create policy chat_attachments_select on storage.objects for select to authenticated using(bucket_id='chat-attachments' and public.can_access_chat_room(((storage.foldername(name))[1])::uuid));
create policy chat_attachments_delete on storage.objects for delete to authenticated using(bucket_id='chat-attachments' and ((storage.foldername(name))[2]=auth.uid()::text or exists(select 1 from public.profiles where id=auth.uid() and role='teacher') and public.can_access_chat_room(((storage.foldername(name))[1])::uuid)));

grant execute on function public.can_access_chat_room(uuid) to authenticated;
