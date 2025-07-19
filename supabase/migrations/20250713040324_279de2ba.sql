-- Update column name in leagues table
ALTER TABLE public.leagues
RENAME COLUMN type TO league_type;