-- Create sample notifications function that works without auth
create or replace function get_sample_notifications()
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
    gen_random_uuid() as id,
    title,
    message,
    type,
    is_read,
    action_url,
    action_label,
    created_at
  from (
    values 
      ('Welcome to Puck Dynasty!', 'Your dynasty simulation is ready. Start by creating leagues and generating players.', 'info', false, '/league-creation', 'Create League', now() - interval '10 minutes'),
      ('Season Simulation Complete', 'The 2024-25 regular season has finished. Playoffs are ready to begin!', 'success', false, '/simulation-engine', 'Start Playoffs', now() - interval '1 hour'),
      ('Player Contract Expiring', 'Connor McDavid''s contract expires in 30 days. Consider renewal negotiations.', 'warning', true, '/player-management', 'View Players', now() - interval '2 hours'),
      ('Database Backup Complete', 'Your dynasty data has been successfully backed up.', 'system', true, null, null, now() - interval '1 day'),
      ('Trade Proposal', 'Toronto Maple Leafs has proposed a trade. Review the details.', 'info', false, '/trades', 'Review Trade', now() - interval '30 minutes'),
      ('Player Injury', 'Alex Ovechkin has suffered a lower body injury.', 'error', false, '/roster-management', 'View Roster', now() - interval '45 minutes')
  ) as notifications(title, message, type, is_read, action_url, action_label, created_at);
$$;
