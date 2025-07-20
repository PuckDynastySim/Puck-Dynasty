-- Add height and weight columns to players table
alter table public.players 
add column if not exists height integer default 72,  -- Default to 6'0" (72 inches)
add column if not exists weight integer default 180; -- Default to 180 lbs

-- Add comments for clarity
comment on column public.players.height is 'Player height in inches (Imperial)';
comment on column public.players.weight is 'Player weight in pounds (Imperial)';

-- Add constraints for realistic ranges
alter table public.players 
add constraint height_range check (height >= 60 and height <= 84),  -- 5'0" to 7'0"
add constraint weight_range check (weight >= 140 and weight <= 280); -- Realistic hockey player range
