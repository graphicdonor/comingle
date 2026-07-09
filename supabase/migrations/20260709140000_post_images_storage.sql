-- Storage policies for post-images bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public post image read'
  ) then
    execute 'create policy "Public post image read" on storage.objects for select using (bucket_id = ''post-images'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload post image'
  ) then
    execute 'create policy "Users upload post image" on storage.objects for insert with check (bucket_id = ''post-images'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update post image'
  ) then
    execute 'create policy "Users update post image" on storage.objects for update using (bucket_id = ''post-images'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete post image'
  ) then
    execute 'create policy "Users delete post image" on storage.objects for delete using (bucket_id = ''post-images'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
