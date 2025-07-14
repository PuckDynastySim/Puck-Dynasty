-- Create player game statistics table
CREATE TABLE public.player_game_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  game_id UUID NOT NULL,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  points INTEGER GENERATED ALWAYS AS (goals + assists) STORED,
  shots INTEGER NOT NULL DEFAULT 0,
  plus_minus INTEGER NOT NULL DEFAULT 0,
  penalty_minutes INTEGER NOT NULL DEFAULT 0,
  powerplay_goals INTEGER NOT NULL DEFAULT 0,
  powerplay_assists INTEGER NOT NULL DEFAULT 0,
  shorthanded_goals INTEGER NOT NULL DEFAULT 0,
  shorthanded_assists INTEGER NOT NULL DEFAULT 0,
  game_winner BOOLEAN NOT NULL DEFAULT false,
  faceoff_wins INTEGER NOT NULL DEFAULT 0,
  faceoff_losses INTEGER NOT NULL DEFAULT 0,
  hits INTEGER NOT NULL DEFAULT 0,
  blocked_shots INTEGER NOT NULL DEFAULT 0,
  takeaways INTEGER NOT NULL DEFAULT 0,
  giveaways INTEGER NOT NULL DEFAULT 0,
  ice_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create goalie game statistics table
CREATE TABLE public.goalie_game_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  game_id UUID NOT NULL,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  shots_faced INTEGER NOT NULL DEFAULT 0,
  saves INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  save_percentage DECIMAL(5,3) GENERATED ALWAYS AS (
    CASE WHEN shots_faced > 0 THEN ROUND((saves::DECIMAL / shots_faced::DECIMAL), 3) ELSE 0 END
  ) STORED,
  goals_against_average DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  shutout BOOLEAN NOT NULL DEFAULT false,
  win BOOLEAN NOT NULL DEFAULT false,
  loss BOOLEAN NOT NULL DEFAULT false,
  overtime_loss BOOLEAN NOT NULL DEFAULT false,
  ice_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team standings table
CREATE TABLE public.team_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  overtime_losses INTEGER NOT NULL DEFAULT 0,
  points INTEGER GENERATED ALWAYS AS (wins * 2 + overtime_losses) STORED,
  games_played INTEGER GENERATED ALWAYS AS (wins + losses + overtime_losses) STORED,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  goal_differential INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  powerplay_goals INTEGER NOT NULL DEFAULT 0,
  powerplay_opportunities INTEGER NOT NULL DEFAULT 0,
  penalty_kill_goals_against INTEGER NOT NULL DEFAULT 0,
  penalty_kill_opportunities INTEGER NOT NULL DEFAULT 0,
  shots_for INTEGER NOT NULL DEFAULT 0,
  shots_against INTEGER NOT NULL DEFAULT 0,
  faceoff_wins INTEGER NOT NULL DEFAULT 0,
  faceoff_losses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, league_id, season_year)
);

-- Create player season statistics table  
CREATE TABLE public.player_season_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  games_played INTEGER NOT NULL DEFAULT 0,
  goals INTEGER NOT NULL DEFAULT 0,
  assists INTEGER NOT NULL DEFAULT 0,
  points INTEGER GENERATED ALWAYS AS (goals + assists) STORED,
  shots INTEGER NOT NULL DEFAULT 0,
  shooting_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN shots > 0 THEN ROUND((goals::DECIMAL / shots::DECIMAL * 100), 2) ELSE 0 END
  ) STORED,
  plus_minus INTEGER NOT NULL DEFAULT 0,
  penalty_minutes INTEGER NOT NULL DEFAULT 0,
  powerplay_goals INTEGER NOT NULL DEFAULT 0,
  powerplay_assists INTEGER NOT NULL DEFAULT 0,
  powerplay_points INTEGER GENERATED ALWAYS AS (powerplay_goals + powerplay_assists) STORED,
  shorthanded_goals INTEGER NOT NULL DEFAULT 0,
  shorthanded_assists INTEGER NOT NULL DEFAULT 0,
  game_winners INTEGER NOT NULL DEFAULT 0,
  faceoff_wins INTEGER NOT NULL DEFAULT 0,
  faceoff_losses INTEGER NOT NULL DEFAULT 0,
  faceoff_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN (faceoff_wins + faceoff_losses) > 0 
    THEN ROUND((faceoff_wins::DECIMAL / (faceoff_wins + faceoff_losses)::DECIMAL * 100), 2) 
    ELSE 0 END
  ) STORED,
  hits INTEGER NOT NULL DEFAULT 0,
  blocked_shots INTEGER NOT NULL DEFAULT 0,
  takeaways INTEGER NOT NULL DEFAULT 0,
  giveaways INTEGER NOT NULL DEFAULT 0,
  average_ice_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, team_id, league_id, season_year)
);

-- Create power rankings table
CREATE TABLE public.power_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  season_year INTEGER NOT NULL DEFAULT EXTRACT(year FROM CURRENT_DATE),
  ranking INTEGER NOT NULL,
  previous_ranking INTEGER,
  rating_score DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  trend VARCHAR(10) NOT NULL DEFAULT 'stable', -- 'up', 'down', 'stable'
  ranking_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, league_id, week_number, season_year)
);

-- Create waiver wire table
CREATE TABLE public.waiver_wire (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  league_id UUID NOT NULL,
  placed_by_team_id UUID,
  waiver_priority INTEGER NOT NULL DEFAULT 999,
  claim_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'claimed', 'cleared', 'cancelled'
  claimed_by_team_id UUID,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trade block table
CREATE TABLE public.trade_block (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  team_id UUID NOT NULL,
  league_id UUID NOT NULL,
  asking_price TEXT,
  trade_interest TEXT,
  available_until DATE,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high'
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'traded', 'removed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.player_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goalie_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_season_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.power_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiver_wire ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_block ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for viewing (everyone can view)
CREATE POLICY "Everyone can view player game stats" ON public.player_game_stats FOR SELECT USING (true);
CREATE POLICY "Everyone can view goalie game stats" ON public.goalie_game_stats FOR SELECT USING (true);
CREATE POLICY "Everyone can view team standings" ON public.team_standings FOR SELECT USING (true);
CREATE POLICY "Everyone can view player season stats" ON public.player_season_stats FOR SELECT USING (true);
CREATE POLICY "Everyone can view power rankings" ON public.power_rankings FOR SELECT USING (true);
CREATE POLICY "Everyone can view waiver wire" ON public.waiver_wire FOR SELECT USING (true);
CREATE POLICY "Everyone can view trade block" ON public.trade_block FOR SELECT USING (true);

-- Create RLS policies for management (league managers only)
CREATE POLICY "League managers can manage player game stats" ON public.player_game_stats FOR ALL USING (can_manage_league(auth.uid(), league_id));
CREATE POLICY "League managers can manage goalie game stats" ON public.goalie_game_stats FOR ALL USING (can_manage_league(auth.uid(), league_id));
CREATE POLICY "League managers can manage team standings" ON public.team_standings FOR ALL USING (can_manage_league(auth.uid(), league_id));
CREATE POLICY "League managers can manage player season stats" ON public.player_season_stats FOR ALL USING (can_manage_league(auth.uid(), league_id));
CREATE POLICY "League managers can manage power rankings" ON public.power_rankings FOR ALL USING (can_manage_league(auth.uid(), league_id));
CREATE POLICY "League managers can manage waiver wire" ON public.waiver_wire FOR ALL USING (can_manage_league(auth.uid(), league_id));
CREATE POLICY "League managers can manage trade block" ON public.trade_block FOR ALL USING (can_manage_league(auth.uid(), league_id));

-- Create update triggers for timestamp columns
CREATE TRIGGER update_player_game_stats_updated_at BEFORE UPDATE ON public.player_game_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goalie_game_stats_updated_at BEFORE UPDATE ON public.goalie_game_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_standings_updated_at BEFORE UPDATE ON public.team_standings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_player_season_stats_updated_at BEFORE UPDATE ON public.player_season_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_waiver_wire_updated_at BEFORE UPDATE ON public.waiver_wire FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trade_block_updated_at BEFORE UPDATE ON public.trade_block FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_player_game_stats_player_id ON public.player_game_stats(player_id);
CREATE INDEX idx_player_game_stats_game_id ON public.player_game_stats(game_id);
CREATE INDEX idx_player_game_stats_league_id ON public.player_game_stats(league_id);
CREATE INDEX idx_goalie_game_stats_player_id ON public.goalie_game_stats(player_id);
CREATE INDEX idx_goalie_game_stats_game_id ON public.goalie_game_stats(game_id);
CREATE INDEX idx_team_standings_league_id ON public.team_standings(league_id);
CREATE INDEX idx_team_standings_season_year ON public.team_standings(season_year);
CREATE INDEX idx_player_season_stats_league_id ON public.player_season_stats(league_id);
CREATE INDEX idx_player_season_stats_season_year ON public.player_season_stats(season_year);
CREATE INDEX idx_power_rankings_league_id ON public.power_rankings(league_id);
CREATE INDEX idx_waiver_wire_league_id ON public.waiver_wire(league_id);
CREATE INDEX idx_trade_block_league_id ON public.trade_block(league_id);