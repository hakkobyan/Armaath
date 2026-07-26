-- Apply this migration to projects that already ran 001_initial_schema.sql.
-- Public clients cannot choose an elevated role through user metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, first_name, last_name, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), 'New'),
    coalesce(nullif(new.raw_user_meta_data ->> 'last_name', ''), 'User'),
    'student'
  );
  return new;
end
$$;
