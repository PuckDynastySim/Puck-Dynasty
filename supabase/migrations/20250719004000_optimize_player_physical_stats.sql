-- Add indexes for height and weight columns for better query performance
create index if not exists idx_players_height on public.players(height);
create index if not exists idx_players_weight on public.players(weight);

-- Add a composite index for height and weight together (useful for filtering)
create index if not exists idx_players_height_weight on public.players(height, weight);

-- Update existing players with default values if they don't have height/weight
-- (This is safe to run even if no players exist)
update public.players 
set 
  height = case 
    when player_position = 'G' then 73    -- 6'1" for goalies
    when player_position = 'D' then 72    -- 6'0" for defensemen  
    else 70                               -- 5'10" for forwards
  end,
  weight = case 
    when player_position = 'G' then 200   -- 200 lbs for goalies
    when player_position = 'D' then 210   -- 210 lbs for defensemen
    else 185                              -- 185 lbs for forwards
  end
where height is null or weight is null;
