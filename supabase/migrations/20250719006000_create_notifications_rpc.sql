-- Create RPC function to get user notifications
create or replace function get_user_notifications()
returns table (
  id uuid,
  title text,
  message text,
  type text,
  is_read boolean,
  action_url text,
  action_label text,
  created_at timestamptz
)
language sql
security definer
as $$
  select 
    n.id,
    n.title,
    n.message,
    n.type,
    n.is_read,
    n.action_url,
    n.action_label,
    n.created_at
  from public.notifications n
  where n.user_id = auth.uid()
  order by n.created_at desc;
$$;
