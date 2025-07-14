-- Create team finances table
CREATE TABLE public.team_finances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  budget BIGINT DEFAULT 50000000,
  revenue_total BIGINT DEFAULT 0,
  expenses_total BIGINT DEFAULT 0,
  ticket_revenue BIGINT DEFAULT 0,
  sponsorship_revenue BIGINT DEFAULT 0,
  concession_revenue BIGINT DEFAULT 0,
  training_expenses BIGINT DEFAULT 0,
  arena_expenses BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create arena infrastructure table
CREATE TABLE public.arena_infrastructure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  seating_capacity INTEGER DEFAULT 18000,
  luxury_boxes INTEGER DEFAULT 20,
  concession_stands INTEGER DEFAULT 15,
  training_facilities_level INTEGER DEFAULT 1,
  medical_facilities_level INTEGER DEFAULT 1,
  arena_quality_rating INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket pricing table
CREATE TABLE public.ticket_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  lower_bowl_price INTEGER DEFAULT 75,
  upper_bowl_price INTEGER DEFAULT 45,
  premium_price INTEGER DEFAULT 150,
  luxury_box_price INTEGER DEFAULT 2500,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create training programs table
CREATE TABLE public.training_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  program_type TEXT NOT NULL,
  investment_level INTEGER DEFAULT 1,
  annual_cost INTEGER NOT NULL,
  effectiveness_bonus INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game revenue table
CREATE TABLE public.game_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL,
  team_id UUID NOT NULL,
  attendance INTEGER DEFAULT 0,
  tickets_sold_lower INTEGER DEFAULT 0,
  tickets_sold_upper INTEGER DEFAULT 0,
  tickets_sold_premium INTEGER DEFAULT 0,
  luxury_boxes_sold INTEGER DEFAULT 0,
  total_ticket_revenue BIGINT DEFAULT 0,
  concession_revenue BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.team_finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arena_infrastructure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for team_finances
CREATE POLICY "Everyone can view team finances" 
ON public.team_finances 
FOR SELECT 
USING (true);

CREATE POLICY "League managers and team GMs can manage team finances" 
ON public.team_finances 
FOR ALL 
USING (
  can_manage_league(auth.uid(), league_id) OR 
  EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = team_finances.team_id 
    AND t.gm_user_id = auth.uid()
  )
);

-- Create RLS policies for arena_infrastructure
CREATE POLICY "Everyone can view arena infrastructure" 
ON public.arena_infrastructure 
FOR SELECT 
USING (true);

CREATE POLICY "League managers and team GMs can manage arena infrastructure" 
ON public.arena_infrastructure 
FOR ALL 
USING (
  can_manage_league(auth.uid(), league_id) OR 
  EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = arena_infrastructure.team_id 
    AND t.gm_user_id = auth.uid()
  )
);

-- Create RLS policies for ticket_pricing
CREATE POLICY "Everyone can view ticket pricing" 
ON public.ticket_pricing 
FOR SELECT 
USING (true);

CREATE POLICY "League managers and team GMs can manage ticket pricing" 
ON public.ticket_pricing 
FOR ALL 
USING (
  can_manage_league(auth.uid(), league_id) OR 
  EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = ticket_pricing.team_id 
    AND t.gm_user_id = auth.uid()
  )
);

-- Create RLS policies for training_programs
CREATE POLICY "Everyone can view training programs" 
ON public.training_programs 
FOR SELECT 
USING (true);

CREATE POLICY "League managers and team GMs can manage training programs" 
ON public.training_programs 
FOR ALL 
USING (
  can_manage_league(auth.uid(), league_id) OR 
  EXISTS (
    SELECT 1 FROM teams t 
    WHERE t.id = training_programs.team_id 
    AND t.gm_user_id = auth.uid()
  )
);

-- Create RLS policies for game_revenue
CREATE POLICY "Everyone can view game revenue" 
ON public.game_revenue 
FOR SELECT 
USING (true);

CREATE POLICY "League managers can manage game revenue" 
ON public.game_revenue 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM games g 
    WHERE g.id = game_revenue.game_id 
    AND can_manage_league(auth.uid(), g.league_id)
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_team_finances_updated_at
  BEFORE UPDATE ON public.team_finances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_arena_infrastructure_updated_at
  BEFORE UPDATE ON public.arena_infrastructure
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ticket_pricing_updated_at
  BEFORE UPDATE ON public.ticket_pricing
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_programs_updated_at
  BEFORE UPDATE ON public.training_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();