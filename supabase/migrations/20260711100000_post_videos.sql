-- Short-form video attachments on posts (capture or upload, capped at 15s
-- client-side). A post has either an image or a video, never both — the
-- existing image_url column is untouched; these two are additive.
alter table posts add column if not exists video_url text;
alter table posts add column if not exists video_thumbnail_url text;

-- Storage policies for the post-videos bucket (created via the Storage API,
-- same as post-images/community-covers/matrimonial-photos) — identical
-- shape to post-images: public read, owner-scoped write by the first path
-- segment ({author_id}/{filename}).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public post video read'
  ) then
    execute 'create policy "Public post video read" on storage.objects for select using (bucket_id = ''post-videos'')';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload post video'
  ) then
    execute 'create policy "Users upload post video" on storage.objects for insert with check (bucket_id = ''post-videos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users update post video'
  ) then
    execute 'create policy "Users update post video" on storage.objects for update using (bucket_id = ''post-videos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete post video'
  ) then
    execute 'create policy "Users delete post video" on storage.objects for delete using (bucket_id = ''post-videos'' and auth.uid()::text = (storage.foldername(name))[1])';
  end if;
end $$;
