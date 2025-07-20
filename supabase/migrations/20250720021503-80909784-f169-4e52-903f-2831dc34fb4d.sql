
-- Add height and weight columns to players table
ALTER TABLE public.players 
ADD COLUMN height integer DEFAULT 72,  -- Default to 6'0" (72 inches)
ADD COLUMN weight integer DEFAULT 180; -- Default to 180 lbs

-- Update the RLS policy on profiles to allow commissioners to view all profiles
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON public.profiles;

CREATE POLICY "Users can view own profile, admins and commissioners can view all"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'commissioner'::app_role)
);
