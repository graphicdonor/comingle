-- Lets a viewer manually flag a post for moderation review, separate from
-- the automated pre-publish AI pipeline. A report never hides the post
-- itself (that's a human decision, not an automatic takedown) — it queues
-- the post into the *same* admin moderation queue AI holds already use, so
-- there's one review surface instead of a second one just for reports.
create table if not exists post_reports (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references posts(id) on delete cascade not null,
  reporter_id uuid references profiles(id) on delete cascade not null,
  reason      text not null check (reason in ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
  details     text,
  status      text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at  timestamptz default now() not null,
  reviewed_at timestamptz,
  unique (post_id, reporter_id)
);
create index if not exists idx_post_reports_post on post_reports (post_id, status);

alter table post_reports enable row level security;
create policy "Users can report a post once" on post_reports for insert with check (auth.uid() = reporter_id);
create policy "Reporters can see their own reports" on post_reports for select using (auth.uid() = reporter_id);

-- One pending queue item per reported post, no matter how many people
-- report it — a viral controversial post being reported by 50 people
-- should not flood the queue with 50 duplicate entries. Each report is
-- still recorded in post_reports regardless.
create or replace function enqueue_post_report_for_review()
returns trigger language plpgsql security definer as $$
declare
  v_author_id uuid;
  v_community_slug text;
  v_log_id uuid;
  v_already_pending boolean;
begin
  select posts.author_id, communities.slug into v_author_id, v_community_slug
  from posts join communities on communities.id = posts.community_id
  where posts.id = new.post_id;

  select exists(
    select 1 from moderation_queue mq
    join moderation_logs ml on ml.id = mq.log_id
    where ml.content_type = 'post' and ml.content_id = new.post_id::text and mq.status = 'pending'
  ) into v_already_pending;

  if not v_already_pending and v_author_id is not null then
    insert into moderation_logs (content_type, content_id, user_id, input_text, decision, context_link)
    values (
      'post', new.post_id::text, v_author_id,
      'Reported as ' || new.reason || coalesce(': ' || new.details, ''),
      'hold_for_review',
      case when v_community_slug is not null then '/communities/' || v_community_slug else '/communities' end
    )
    returning id into v_log_id;

    insert into moderation_queue (log_id, status) values (v_log_id, 'pending');
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enqueue_post_report on post_reports;
create trigger trg_enqueue_post_report
  after insert on post_reports
  for each row execute function enqueue_post_report_for_review();
