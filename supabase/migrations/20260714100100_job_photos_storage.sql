-- Storage policies for job-photos bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public job photo read'
  ) then
    execute 'create policy "Public job photo read" on storage.objects for select using (bucket_id = ''job-photos'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload job photo'
  ) then
    execute 'create policy "Users upload job photo" on storage.objects for insert with check (bucket_id = ''job-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update job photo'
  ) then
    execute 'create policy "Users update job photo" on storage.objects for update using (bucket_id = ''job-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete job photo'
  ) then
    execute 'create policy "Users delete job photo" on storage.objects for delete using (bucket_id = ''job-photos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
