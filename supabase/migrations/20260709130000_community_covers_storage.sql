-- Storage policies for community-covers bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public community cover read'
  ) then
    execute 'create policy "Public community cover read" on storage.objects for select using (bucket_id = ''community-covers'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload community cover'
  ) then
    execute 'create policy "Users upload community cover" on storage.objects for insert with check (bucket_id = ''community-covers'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update community cover'
  ) then
    execute 'create policy "Users update community cover" on storage.objects for update using (bucket_id = ''community-covers'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete community cover'
  ) then
    execute 'create policy "Users delete community cover" on storage.objects for delete using (bucket_id = ''community-covers'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
