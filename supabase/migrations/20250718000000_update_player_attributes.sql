-- Drop the generated column and recreate it as a regular column
ALTER TABLE players DROP COLUMN overall_rating;
ALTER TABLE players ADD COLUMN overall_rating INTEGER;

-- Now we can rename injury_resistance to injury
ALTER TABLE players
RENAME COLUMN injury_resistance TO injury;

-- Add check constraint for injury values if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'injury_range_check'
  ) THEN
    ALTER TABLE players
    ADD CONSTRAINT injury_range_check CHECK (injury >= 0 AND injury <= 99);
  END IF;
END $$;

-- Add new attribute columns
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS movement smallint CHECK (movement >= 0 AND movement <= 99),
  ADD COLUMN IF NOT EXISTS vision smallint CHECK (vision >= 0 AND vision <= 99),
  ADD COLUMN IF NOT EXISTS aggressiveness smallint CHECK (aggressiveness >= 0 AND aggressiveness <= 99),
  ADD COLUMN IF NOT EXISTS flexibility smallint CHECK (flexibility >= 0 AND flexibility <= 99),
  ADD COLUMN IF NOT EXISTS rebound_control smallint CHECK (rebound_control >= 0 AND rebound_control <= 99),
  ADD COLUMN IF NOT EXISTS discipline smallint CHECK (discipline >= 0 AND discipline <= 99),
  ADD COLUMN IF NOT EXISTS fatigue smallint CHECK (fatigue >= 0 AND fatigue <= 99),
  ADD COLUMN IF NOT EXISTS passing smallint CHECK (passing >= 0 AND passing <= 99),
  ADD COLUMN IF NOT EXISTS shooting smallint CHECK (shooting >= 0 AND shooting <= 99),
  ADD COLUMN IF NOT EXISTS defense smallint CHECK (defense >= 0 AND defense <= 99),
  ADD COLUMN IF NOT EXISTS puck_control smallint CHECK (puck_control >= 0 AND puck_control <= 99),
  ADD COLUMN IF NOT EXISTS checking smallint CHECK (checking >= 0 AND checking <= 99),
  ADD COLUMN IF NOT EXISTS fighting smallint CHECK (fighting >= 0 AND fighting <= 99),
  ADD COLUMN IF NOT EXISTS poise smallint CHECK (poise >= 0 AND poise <= 99);

-- Add check constraint to ensure proper attributes based on position
ALTER TABLE players
ADD CONSTRAINT check_player_attributes
CHECK (
  (
    player_position::text = 'G' AND 
    movement IS NOT NULL AND
    rebound_control IS NOT NULL AND
    vision IS NOT NULL AND
    aggressiveness IS NOT NULL AND
    flexibility IS NOT NULL AND
    puck_control IS NOT NULL AND
    discipline IS NOT NULL AND
    injury IS NOT NULL AND
    fatigue IS NOT NULL AND
    poise IS NOT NULL
  ) OR (
    player_position::text != 'G' AND
    passing IS NOT NULL AND
    shooting IS NOT NULL AND
    defense IS NOT NULL AND
    checking IS NOT NULL AND
    fighting IS NOT NULL AND
    puck_control IS NOT NULL AND
    discipline IS NOT NULL AND
    injury IS NOT NULL AND
    fatigue IS NOT NULL AND
    poise IS NOT NULL
  )
);

-- The overall_rating column already exists from earlier

-- Create a function to calculate overall rating based on position
CREATE OR REPLACE FUNCTION calculate_player_overall()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.player_position::text = 'G' THEN
    -- Goalie overall calculation
    NEW.overall_rating = (
      NEW.movement * 1.2 +
      NEW.rebound_control * 1.2 +
      NEW.vision * 1.0 +
      NEW.aggressiveness * 0.8 +
      NEW.flexibility * 1.0 +
      NEW.puck_control * 0.8 +
      NEW.discipline * 0.8 +
      NEW.injury * 0.7 +
      NEW.fatigue * 0.8 +
      NEW.poise * 0.9
    ) / 10;
  ELSE
    -- Skater overall calculation
    NEW.overall_rating = (
      NEW.passing * 1.1 +
      NEW.shooting * 1.1 +
      NEW.defense * 1.0 +
      NEW.checking * 0.9 +
      NEW.fighting * 0.6 +
      NEW.puck_control * 1.1 +
      NEW.discipline * 0.8 +
      NEW.injury * 0.7 +
      NEW.fatigue * 0.8 +
      NEW.poise * 0.9
    ) / 10;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS update_player_overall ON players;
CREATE TRIGGER update_player_overall
  BEFORE INSERT OR UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION calculate_player_overall();

-- Update existing records to ensure they have proper attributes
UPDATE players
SET 
  -- Shared attributes
  discipline = COALESCE(discipline, floor(random() * 70 + 30)::smallint),
  injury = COALESCE(injury, floor(random() * 70 + 30)::smallint),
  fatigue = COALESCE(fatigue, floor(random() * 70 + 30)::smallint),
  poise = COALESCE(poise, floor(random() * 70 + 30)::smallint),
  puck_control = COALESCE(puck_control, floor(random() * 70 + 30)::smallint)
WHERE player_position::text = ANY (ARRAY['C', 'LW', 'RW', 'D']);

UPDATE players
SET
  -- Player-specific attributes
  passing = COALESCE(passing, floor(random() * 70 + 30)::smallint),
  shooting = COALESCE(shooting, floor(random() * 70 + 30)::smallint),
  defense = COALESCE(defense, floor(random() * 70 + 30)::smallint),
  checking = COALESCE(checking, floor(random() * 70 + 30)::smallint),
  fighting = COALESCE(fighting, floor(random() * 70 + 30)::smallint)
WHERE player_position::text = ANY (ARRAY['C', 'LW', 'RW', 'D']);

UPDATE players
SET
  -- Goalie-specific attributes
  movement = COALESCE(movement, floor(random() * 70 + 30)::smallint),
  rebound_control = COALESCE(rebound_control, floor(random() * 70 + 30)::smallint),
  vision = COALESCE(vision, floor(random() * 70 + 30)::smallint),
  aggressiveness = COALESCE(aggressiveness, floor(random() * 70 + 30)::smallint),
  flexibility = COALESCE(flexibility, floor(random() * 70 + 30)::smallint)
WHERE player_position::text = 'G';

-- Add draft eligibility trigger
CREATE OR REPLACE FUNCTION public.check_draft_eligibility()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT public.is_draft_eligible(NEW.age) THEN
        RAISE EXCEPTION 'Player must be 18 or older to be draft eligible';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
