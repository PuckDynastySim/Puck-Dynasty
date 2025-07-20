-- Create notifications table
create table if not exists public.notifications (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    title text not null,
    message text not null,
    type text not null check (type in ('info', 'success', 'warning', 'error', 'system')),
    is_read boolean default false,
    action_url text, -- Optional URL for action button
    action_label text, -- Optional label for action button
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.notifications enable row level security;

-- Create policies for notifications
create policy "Users can view their own notifications" on public.notifications
    for select using (auth.uid() = user_id);

create policy "Users can update their own notifications" on public.notifications
    for update using (auth.uid() = user_id);

create policy "System can create notifications for any user" on public.notifications
    for insert with check (true);

create policy "Users can delete their own notifications" on public.notifications
    for delete using (auth.uid() = user_id);

-- Create indexes for performance
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_created_at on public.notifications(created_at desc);
create index if not exists idx_notifications_is_read on public.notifications(is_read);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read) where is_read = false;

-- Create updated_at trigger
create trigger handle_updated_at
    before update on public.notifications
    for each row
    execute procedure public.handle_updated_at();

-- Insert some sample notifications for testing
-- Note: These would typically be created by system events
insert into public.notifications (user_id, title, message, type, action_url, action_label) values
(
    (select id from auth.users limit 1), -- Get first user, or use a specific user_id
    'Welcome to Puck Dynasty!',
    'Your dynasty simulation is ready. Start by creating leagues and generating players.',
    'info',
    '/league-creation',
    'Create League'
),
(
    (select id from auth.users limit 1),
    'Season Simulation Complete',
    'The 2024-25 regular season has finished. Playoffs are ready to begin!',
    'success',
    '/simulation-engine',
    'Start Playoffs'
),
(
    (select id from auth.users limit 1),
    'Player Contract Expiring',
    'Connor McDavid''s contract expires in 30 days. Consider renewal negotiations.',
    'warning',
    '/player-management',
    'View Players'
),
(
    (select id from auth.users limit 1),
    'Database Backup Complete',
    'Your dynasty data has been successfully backed up.',
    'system',
    null,
    null
);
