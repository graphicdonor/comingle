-- Storage policies for business-photos bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public business photo read'
  ) then
    execute 'create policy "Public business photo read" on storage.objects for select using (bucket_id = ''business-photos'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload business photo'
  ) then
    execute 'create policy "Users upload business photo" on storage.objects for insert with check (bucket_id = ''business-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update business photo'
  ) then
    execute 'create policy "Users update business photo" on storage.objects for update using (bucket_id = ''business-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete business photo'
  ) then
    execute 'create policy "Users delete business photo" on storage.objects for delete using (bucket_id = ''business-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
