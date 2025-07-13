-- Create app role enum for user permissions
CREATE TYPE public.app_role AS ENUM ('admin', 'commissioner', 'gm', 'user');

-- Create league type enum
CREATE TYPE public.league_type AS ENUM ('pro', 'farm', 'junior');

-- Create position enum
CREATE TYPE public.position AS ENUM ('C', 'LW', 'RW', 'D', 'G');

-- Create player status enum
CREATE TYPE public.player_status AS ENUM ('active', 'injured', 'suspended', 'retired');

-- Create game status enum
CREATE TYPE public.game_status AS ENUM ('scheduled', 'in_progress', 'completed', 'postponed');

-- Profiles table for additional user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    display_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Leagues table
CREATE TABLE public.leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type league_type NOT NULL,
    commissioner_id UUID,
    salary_cap INTEGER DEFAULT 80000000,
    max_age INTEGER DEFAULT 45,
    min_age INTEGER DEFAULT 16,
    season_start_date DATE,
    games_per_team INTEGER DEFAULT 82,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Teams table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    abbreviation TEXT NOT NULL,
    gm_user_id UUID,
    division TEXT,
    conference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Players table
CREATE TABLE public.players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position position NOT NULL,
    age INTEGER NOT NULL,
    nationality TEXT DEFAULT 'Canada',
    status player_status DEFAULT 'active',
    
    -- Skater ratings (1-99)
    discipline INTEGER DEFAULT 50 CHECK (discipline BETWEEN 1 AND 99),
    injury_resistance INTEGER DEFAULT 50 CHECK (injury_resistance BETWEEN 1 AND 99),
    fatigue INTEGER DEFAULT 50 CHECK (fatigue BETWEEN 1 AND 99),
    passing INTEGER DEFAULT 50 CHECK (passing BETWEEN 1 AND 99),
    shooting INTEGER DEFAULT 50 CHECK (shooting BETWEEN 1 AND 99),
    defense INTEGER DEFAULT 50 CHECK (defense BETWEEN 1 AND 99),
    puck_control INTEGER DEFAULT 50 CHECK (puck_control BETWEEN 1 AND 99),
    checking INTEGER DEFAULT 50 CHECK (checking BETWEEN 1 AND 99),
    fighting INTEGER DEFAULT 50 CHECK (fighting BETWEEN 1 AND 99),
    poise INTEGER DEFAULT 50 CHECK (poise BETWEEN 1 AND 99),
    
    -- Goalie-specific ratings (1-99)
    movement INTEGER DEFAULT 50 CHECK (movement BETWEEN 1 AND 99),
    rebound_control INTEGER DEFAULT 50 CHECK (rebound_control BETWEEN 1 AND 99),
    vision INTEGER DEFAULT 50 CHECK (vision BETWEEN 1 AND 99),
    aggressiveness INTEGER DEFAULT 50 CHECK (aggressiveness BETWEEN 1 AND 99),
    flexibility INTEGER DEFAULT 50 CHECK (flexibility BETWEEN 1 AND 99),
    
    -- Calculated overall rating
    overall_rating INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN position = 'G' THEN 
                (discipline + injury_resistance + fatigue + poise + movement + rebound_control + vision + aggressiveness + puck_control + flexibility) / 10
            ELSE 
                (discipline + injury_resistance + fatigue + passing + shooting + defense + puck_control + checking + fighting + poise) / 10
        END
    ) STORED,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coaches table
CREATE TABLE public.coaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    nationality TEXT DEFAULT 'Canada',
    
    -- Coach attributes (1-99)
    offense_specialty INTEGER DEFAULT 50 CHECK (offense_specialty BETWEEN 1 AND 99),
    defense_specialty INTEGER DEFAULT 50 CHECK (defense_specialty BETWEEN 1 AND 99),
    powerplay_specialty INTEGER DEFAULT 50 CHECK (powerplay_specialty BETWEEN 1 AND 99),
    penalty_kill_specialty INTEGER DEFAULT 50 CHECK (penalty_kill_specialty BETWEEN 1 AND 99),
    motivation INTEGER DEFAULT 50 CHECK (motivation BETWEEN 1 AND 99),
    line_management INTEGER DEFAULT 50 CHECK (line_management BETWEEN 1 AND 99),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Games table
CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    game_date DATE NOT NULL,
    game_time TIME,
    status game_status DEFAULT 'scheduled',
    
    -- Game results
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    home_shots INTEGER DEFAULT 0,
    away_shots INTEGER DEFAULT 0,
    overtime_winner UUID REFERENCES public.teams(id),
    shootout_winner UUID REFERENCES public.teams(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Game periods table for period-by-period scoring
CREATE TABLE public.game_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    period INTEGER NOT NULL CHECK (period > 0),
    home_goals INTEGER DEFAULT 0,
    away_goals INTEGER DEFAULT 0,
    home_shots INTEGER DEFAULT 0,
    away_shots INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_periods ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Function to check if user is admin or commissioner of a league
CREATE OR REPLACE FUNCTION public.can_manage_league(_user_id UUID, _league_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = _user_id 
        AND ur.role IN ('admin', 'commissioner')
    ) OR EXISTS (
        SELECT 1
        FROM public.leagues l
        WHERE l.id = _league_id 
        AND l.commissioner_id = _user_id
    )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all roles"
    ON public.user_roles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policies for leagues
CREATE POLICY "Everyone can view leagues"
    ON public.leagues FOR SELECT
    USING (true);

CREATE POLICY "Admins and commissioners can manage leagues"
    ON public.leagues FOR ALL
    USING (
        public.has_role(auth.uid(), 'admin') OR 
        auth.uid() = commissioner_id
    );

-- RLS Policies for teams
CREATE POLICY "Everyone can view teams"
    ON public.teams FOR SELECT
    USING (true);

CREATE POLICY "League managers can manage teams"
    ON public.teams FOR ALL
    USING (public.can_manage_league(auth.uid(), league_id));

-- RLS Policies for players
CREATE POLICY "Everyone can view players"
    ON public.players FOR SELECT
    USING (true);

CREATE POLICY "League managers can manage players"
    ON public.players FOR ALL
    USING (public.can_manage_league(auth.uid(), league_id));

-- RLS Policies for coaches
CREATE POLICY "Everyone can view coaches"
    ON public.coaches FOR SELECT
    USING (true);

CREATE POLICY "League managers can manage coaches"
    ON public.coaches FOR ALL
    USING (public.can_manage_league(auth.uid(), league_id));

-- RLS Policies for games
CREATE POLICY "Everyone can view games"
    ON public.games FOR SELECT
    USING (true);

CREATE POLICY "League managers can manage games"
    ON public.games FOR ALL
    USING (public.can_manage_league(auth.uid(), league_id));

-- RLS Policies for game_periods
CREATE POLICY "Everyone can view game periods"
    ON public.game_periods FOR SELECT
    USING (true);

CREATE POLICY "League managers can manage game periods"
    ON public.game_periods FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.games g 
            WHERE g.id = game_id 
            AND public.can_manage_league(auth.uid(), g.league_id)
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leagues_updated_at
    BEFORE UPDATE ON public.leagues
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON public.players
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coaches_updated_at
    BEFORE UPDATE ON public.coaches
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON public.games
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();