-- First drop any existing overall_rating column
ALTER TABLE public.players DROP COLUMN IF EXISTS overall_rating;

-- Add new injury column if it doesn't exist
ALTER TABLE public.players 
    ADD COLUMN IF NOT EXISTS injury INTEGER DEFAULT 50 CHECK (injury >= 0 AND injury <= 99);

-- Add other player attributes with their constraints
ALTER TABLE public.players 
    ADD COLUMN IF NOT EXISTS discipline INTEGER CHECK (discipline >= 0 AND discipline <= 99),
    ADD COLUMN IF NOT EXISTS fatigue INTEGER CHECK (fatigue >= 0 AND fatigue <= 99),
    ADD COLUMN IF NOT EXISTS passing INTEGER CHECK (passing >= 0 AND passing <= 99),
    ADD COLUMN IF NOT EXISTS shooting INTEGER CHECK (shooting >= 0 AND shooting <= 99),
    ADD COLUMN IF NOT EXISTS defense INTEGER CHECK (defense >= 0 AND defense <= 99),
    ADD COLUMN IF NOT EXISTS puck_control INTEGER CHECK (puck_control >= 0 AND puck_control <= 99),
    ADD COLUMN IF NOT EXISTS checking INTEGER CHECK (checking >= 0 AND checking <= 99),
    ADD COLUMN IF NOT EXISTS fighting INTEGER CHECK (fighting >= 0 AND fighting <= 99),
    ADD COLUMN IF NOT EXISTS poise INTEGER CHECK (poise >= 0 AND poise <= 99),
    ADD COLUMN IF NOT EXISTS movement INTEGER CHECK (movement >= 0 AND movement <= 99),
    ADD COLUMN IF NOT EXISTS rebound_control INTEGER CHECK (rebound_control >= 0 AND rebound_control <= 99),
    ADD COLUMN IF NOT EXISTS vision INTEGER CHECK (vision >= 0 AND vision <= 99),
    ADD COLUMN IF NOT EXISTS aggressiveness INTEGER CHECK (aggressiveness >= 0 AND aggressiveness <= 99),
    ADD COLUMN IF NOT EXISTS flexibility INTEGER CHECK (flexibility >= 0 AND flexibility <= 99);

-- Add back the overall_rating as a stored generated column
ALTER TABLE public.players ADD COLUMN overall_rating INTEGER GENERATED ALWAYS AS (
    CASE 
        WHEN player_position = 'G' THEN
            (COALESCE(movement, 0) + COALESCE(rebound_control, 0) + COALESCE(puck_control, 0) +
             COALESCE(vision, 0) + COALESCE(aggressiveness, 0) + COALESCE(poise, 0) +
             COALESCE(discipline, 0) + COALESCE(injury, 0) + COALESCE(fatigue, 0) + 
             COALESCE(flexibility, 0)) / 10
        ELSE
            (COALESCE(passing, 0) + COALESCE(shooting, 0) + COALESCE(puck_control, 0) +
             COALESCE(defense, 0) + COALESCE(checking, 0) + COALESCE(poise, 0) +
             COALESCE(discipline, 0) + COALESCE(injury, 0) + COALESCE(fatigue, 0) + 
             COALESCE(fighting, 0)) / 10
    END
) STORED;
