-- Storage policies for avatars bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public avatar read'
  ) then
    execute 'create policy "Public avatar read" on storage.objects for select using (bucket_id = ''avatars'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload avatar'
  ) then
    execute 'create policy "Users upload avatar" on storage.objects for insert with check (bucket_id = ''avatars'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update avatar'
  ) then
    execute 'create policy "Users update avatar" on storage.objects for update using (bucket_id = ''avatars'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete avatar'
  ) then
    execute 'create policy "Users delete avatar" on storage.objects for delete using (bucket_id = ''avatars'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
