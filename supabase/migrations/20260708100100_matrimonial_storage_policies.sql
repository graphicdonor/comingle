-- Storage policies for matrimonial-photos bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public matrimonial photo read'
  ) then
    execute 'create policy "Public matrimonial photo read" on storage.objects for select using (bucket_id = ''matrimonial-photos'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload matrimonial photo'
  ) then
    execute 'create policy "Users upload matrimonial photo" on storage.objects for insert with check (bucket_id = ''matrimonial-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update matrimonial photo'
  ) then
    execute 'create policy "Users update matrimonial photo" on storage.objects for update using (bucket_id = ''matrimonial-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete matrimonial photo'
  ) then
    execute 'create policy "Users delete matrimonial photo" on storage.objects for delete using (bucket_id = ''matrimonial-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
