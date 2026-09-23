-- Storage policies for education-photos bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public education photo read'
  ) then
    execute 'create policy "Public education photo read" on storage.objects for select using (bucket_id = ''education-photos'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload education photo'
  ) then
    execute 'create policy "Users upload education photo" on storage.objects for insert with check (bucket_id = ''education-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update education photo'
  ) then
    execute 'create policy "Users update education photo" on storage.objects for update using (bucket_id = ''education-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete education photo'
  ) then
    execute 'create policy "Users delete education photo" on storage.objects for delete using (bucket_id = ''education-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
