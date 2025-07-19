-- Create player contracts table
CREATE TABLE public.player_contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL,
    team_id UUID NOT NULL,
    league_id UUID NOT NULL,
    salary INTEGER NOT NULL DEFAULT 0,
    contract_length INTEGER NOT NULL DEFAULT 1,
    contract_year INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waived', 'minors', 'injured_reserve')),
    signed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player injuries table
CREATE TABLE public.player_injuries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    player_id UUID NOT NULL,
    injury_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'major')),
    expected_return_date DATE,
    injury_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team lines table
CREATE TABLE public.team_lines (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL,
    league_id UUID NOT NULL,
    line_type TEXT NOT NULL CHECK (line_type IN ('line1', 'line2', 'line3', 'line4', 'pp1', 'pp2', 'pk1', 'pk2', 'extra_attacker')),
    position TEXT NOT NULL CHECK (position IN ('lw', 'c', 'rw', 'ld', 'rd', 'g')),
    player_id UUID NOT NULL,
    line_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(team_id, line_type, position, line_order)
);

-- Create team strategy table
CREATE TABLE public.team_strategy (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL UNIQUE,
    league_id UUID NOT NULL,
    forecheck_intensity INTEGER NOT NULL DEFAULT 50 CHECK (forecheck_intensity >= 0 AND forecheck_intensity <= 100),
    defensive_pressure INTEGER NOT NULL DEFAULT 50 CHECK (defensive_pressure >= 0 AND defensive_pressure <= 100),
    offensive_style INTEGER NOT NULL DEFAULT 50 CHECK (offensive_style >= 0 AND offensive_style <= 100),
    pp_style TEXT NOT NULL DEFAULT 'balanced' CHECK (pp_style IN ('aggressive', 'balanced', 'conservative')),
    pk_style TEXT NOT NULL DEFAULT 'pressure' CHECK (pk_style IN ('pressure', 'box', 'aggressive')),
    line_matching BOOLEAN NOT NULL DEFAULT false,
    pull_goalie_threshold INTEGER NOT NULL DEFAULT 90 CHECK (pull_goalie_threshold >= 0 AND pull_goalie_threshold <= 300),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transaction log table
CREATE TABLE public.transaction_log (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    league_id UUID NOT NULL,
    player_id UUID NOT NULL,
    from_team_id UUID,
    to_team_id UUID,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('trade', 'waiver_claim', 'call_up', 'send_down', 'sign', 'release')),
    transaction_details JSONB,
    processed_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.player_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_strategy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_log ENABLE ROW LEVEL SECURITY;

-- Create policies for player_contracts
CREATE POLICY "Everyone can view player contracts" 
ON public.player_contracts 
FOR SELECT 
USING (true);

CREATE POLICY "League managers can manage player contracts" 
ON public.player_contracts 
FOR ALL 
USING (can_manage_league(auth.uid(), league_id));

-- Create policies for player_injuries
CREATE POLICY "Everyone can view player injuries" 
ON public.player_injuries 
FOR SELECT 
USING (true);

CREATE POLICY "League managers can manage player injuries" 
ON public.player_injuries 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.players p 
        WHERE p.id = player_id 
        AND can_manage_league(auth.uid(), p.league_id)
    )
);

-- Create policies for team_lines
CREATE POLICY "Everyone can view team lines" 
ON public.team_lines 
FOR SELECT 
USING (true);

CREATE POLICY "League managers and team GMs can manage team lines" 
ON public.team_lines 
FOR ALL 
USING (
    can_manage_league(auth.uid(), league_id) OR 
    EXISTS (
        SELECT 1 FROM public.teams t 
        WHERE t.id = team_id 
        AND t.gm_user_id = auth.uid()
    )
);

-- Create policies for team_strategy
CREATE POLICY "Everyone can view team strategy" 
ON public.team_strategy 
FOR SELECT 
USING (true);

CREATE POLICY "League managers and team GMs can manage team strategy" 
ON public.team_strategy 
FOR ALL 
USING (
    can_manage_league(auth.uid(), league_id) OR 
    EXISTS (
        SELECT 1 FROM public.teams t 
        WHERE t.id = team_id 
        AND t.gm_user_id = auth.uid()
    )
);

-- Create policies for transaction_log
CREATE POLICY "Everyone can view transaction log" 
ON public.transaction_log 
FOR SELECT 
USING (true);

CREATE POLICY "League managers can manage transaction log" 
ON public.transaction_log 
FOR ALL 
USING (can_manage_league(auth.uid(), league_id));

-- Create triggers for updated_at
CREATE TRIGGER update_player_contracts_updated_at
BEFORE UPDATE ON public.player_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_injuries_updated_at
BEFORE UPDATE ON public.player_injuries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_lines_updated_at
BEFORE UPDATE ON public.team_lines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_strategy_updated_at
BEFORE UPDATE ON public.team_strategy
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();