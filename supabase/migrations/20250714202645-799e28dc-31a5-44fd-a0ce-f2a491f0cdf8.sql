-- Create season_champions table
CREATE TABLE public.season_champions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  champion_team_id UUID NOT NULL,
  runner_up_team_id UUID,
  playoff_series_length INTEGER DEFAULT 7,
  championship_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_awards table
CREATE TABLE public.player_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  award_type TEXT NOT NULL,
  player_id UUID NOT NULL,
  team_id UUID NOT NULL,
  stats_snapshot JSONB,
  voting_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create draft_history table
CREATE TABLE public.draft_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL,
  draft_year INTEGER NOT NULL,
  draft_round INTEGER NOT NULL,
  pick_number INTEGER NOT NULL,
  overall_pick INTEGER NOT NULL,
  team_id UUID NOT NULL,
  player_id UUID NOT NULL,
  draft_position TEXT NOT NULL,
  player_development_rating INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create season_archives table
CREATE TABLE public.season_archives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL,
  season_year INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'completed',
  total_games_played INTEGER DEFAULT 0,
  total_players INTEGER DEFAULT 0,
  champion_team_id UUID,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career_milestones table
CREATE TABLE public.career_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_date DATE NOT NULL DEFAULT CURRENT_DATE,
  game_id UUID,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  milestone_value INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add is_archived column to existing tables
ALTER TABLE public.player_season_stats ADD COLUMN is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.team_standings ADD COLUMN is_archived BOOLEAN DEFAULT false;
ALTER TABLE public.team_standings ADD COLUMN playoff_position INTEGER;
ALTER TABLE public.team_standings ADD COLUMN final_ranking INTEGER;
ALTER TABLE public.team_standings ADD COLUMN eliminated_round TEXT;

-- Enable RLS on new tables
ALTER TABLE public.season_champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.season_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for season_champions
CREATE POLICY "Everyone can view season champions" 
ON public.season_champions 
FOR SELECT 
USING (true);

CREATE POLICY "League managers can manage season champions" 
ON public.season_champions 
FOR ALL 
USING (can_manage_league(auth.uid(), league_id));

-- Create RLS policies for player_awards
CREATE POLICY "Everyone can view player awards" 
ON public.player_awards 
FOR SELECT 
USING (true);

CREATE POLICY "League managers can manage player awards" 
ON public.player_awards 
FOR ALL 
USING (can_manage_league(auth.uid(), league_id));

-- Create RLS policies for draft_history
CREATE POLICY "Everyone can view draft history" 
ON public.draft_history 
FOR SELECT 
USING (true);

CREATE POLICY "League managers can manage draft history" 
ON public.draft_history 
FOR ALL 
USING (can_manage_league(auth.uid(), league_id));

-- Create RLS policies for season_archives
CREATE POLICY "Everyone can view season archives" 
ON public.season_archives 
FOR SELECT 
USING (true);

CREATE POLICY "League managers can manage season archives" 
ON public.season_archives 
FOR ALL 
USING (can_manage_league(auth.uid(), league_id));

-- Create RLS policies for career_milestones
CREATE POLICY "Everyone can view career milestones" 
ON public.career_milestones 
FOR SELECT 
USING (true);

CREATE POLICY "League managers can manage career milestones" 
ON public.career_milestones 
FOR ALL 
USING ((EXISTS ( SELECT 1
   FROM players p
  WHERE ((p.id = career_milestones.player_id) AND can_manage_league(auth.uid(), p.league_id)))));

-- Create updated_at triggers
CREATE TRIGGER update_season_champions_updated_at
  BEFORE UPDATE ON public.season_champions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_awards_updated_at
  BEFORE UPDATE ON public.player_awards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_draft_history_updated_at
  BEFORE UPDATE ON public.draft_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_season_archives_updated_at
  BEFORE UPDATE ON public.season_archives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_milestones_updated_at
  BEFORE UPDATE ON public.career_milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();