-- Storage policies for housing-photos bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public housing photo read'
  ) then
    execute 'create policy "Public housing photo read" on storage.objects for select using (bucket_id = ''housing-photos'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload housing photo'
  ) then
    execute 'create policy "Users upload housing photo" on storage.objects for insert with check (bucket_id = ''housing-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update housing photo'
  ) then
    execute 'create policy "Users update housing photo" on storage.objects for update using (bucket_id = ''housing-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete housing photo'
  ) then
    execute 'create policy "Users delete housing photo" on storage.objects for delete using (bucket_id = ''housing-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
