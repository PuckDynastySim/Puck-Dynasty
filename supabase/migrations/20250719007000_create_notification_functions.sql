-- RPC function to mark notification as read
create or replace function mark_notification_read(notification_id uuid)
returns void
language sql
security definer
as $$
  update public.notifications 
  set is_read = true, updated_at = now()
  where id = notification_id and user_id = auth.uid();
$$;

-- RPC function to mark all notifications as read
create or replace function mark_all_notifications_read()
returns void
language sql
security definer
as $$
  update public.notifications 
  set is_read = true, updated_at = now()
  where user_id = auth.uid() and is_read = false;
$$;

-- RPC function to delete notification
create or replace function delete_notification(notification_id uuid)
returns void
language sql
security definer
as $$
  delete from public.notifications 
  where id = notification_id and user_id = auth.uid();
$$;

-- RPC function to get unread count
create or replace function get_unread_notification_count()
returns integer
language sql
security definer
as $$
  select count(*)::integer
  from public.notifications
  where user_id = auth.uid() and is_read = false;
$$;
