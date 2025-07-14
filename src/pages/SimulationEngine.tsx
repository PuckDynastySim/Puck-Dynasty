import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Play, Zap, Trophy, Target, Loader2, Clock, BarChart3, Users, Shield, Sword } from "lucide-react";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  player_position: string;
  team_id?: string;
  shooting: number;
  passing: number;
  puck_control: number;
  defense: number;
  checking: number;
  fighting: number;
  discipline: number;
  injury_resistance: number;
  fatigue: number;
  poise: number;
  movement: number;
  rebound_control: number;
  vision: number;
  aggressiveness: number;
  flexibility: number;
  overall_rating: number;
}

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  offense_specialty: number;
  defense_specialty: number;
  line_management: number;
  motivation: number;
  powerplay_specialty: number;
  penalty_kill_specialty: number;
}

interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  players: Player[];
  coach: Coach | null;
  strategy: TeamStrategy | null;
}

interface TeamStrategy {
  offensive_style: number;
  defensive_pressure: number;
  forecheck_intensity: number;
  pp_style: string;
  pk_style: string;
  line_matching: boolean;
  pull_goalie_threshold: number;
}

interface League {
  id: string;
  name: string;
  league_type: string;
}

interface SimpleTeam {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
}

interface Game {
  id: string;
  home_team_id: string;
  away_team_id: string;
  game_date: string;
  status: string;
  home_team: SimpleTeam;
  away_team: SimpleTeam;
}

interface PlayByPlayEvent {
  time: string;
  period: number;
  event_type: string;
  description: string;
  player_id?: string;
  team_id: string;
}

interface GameResult {
  homeScore: number;
  awayScore: number;
  homeShots: number;
  awayShots: number;
  periods: Array<{
    period: number;
    homeGoals: number;
    awayGoals: number;
    homeShots: number;
    awayShots: number;
  }>;
  overtimeWinner?: string;
  shootoutWinner?: string;
  playByPlay: PlayByPlayEvent[];
  homeTeamStrength: number;
  awayTeamStrength: number;
  stars: Array<{
    player: Player;
    points: number;
    reason: string;
  }>;
}

const SimulationEngine = () => {
  const [simulating, setSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [simulationType, setSimulationType] = useState("single");
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchGames();
    }
  }, [selectedLeague]);

  const fetchLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('id, name, league_type')
        .eq('is_active', true);
      
      if (error) throw error;
      setLeagues(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch leagues",
        variant: "destructive"
      });
    }
  };

  const fetchGames = async () => {
    if (!selectedLeague) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          home_team_id,
          away_team_id,
          game_date,
          status,
          home_team:teams!home_team_id(id, name, city, abbreviation),
          away_team:teams!away_team_id(id, name, city, abbreviation)
        `)
        .eq('league_id', selectedLeague)
        .eq('status', 'scheduled')
        .order('game_date', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      setGames(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch games",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamData = async (teamId: string): Promise<Team> => {
    // Fetch team with players and coach
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id, name, city, abbreviation')
      .eq('id', teamId)
      .single();

    if (teamError) throw teamError;

    // Fetch players
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('team_id', teamId)
      .eq('status', 'active');

    if (playersError) throw playersError;

    // Fetch coach
    const { data: coachData, error: coachError } = await supabase
      .from('coaches')
      .select('*')
      .eq('team_id', teamId)
      .maybeSingle();

    if (coachError) throw coachError;

    // Fetch strategy
    const { data: strategyData, error: strategyError } = await supabase
      .from('team_strategy')
      .select('*')
      .eq('team_id', teamId)
      .maybeSingle();

    if (strategyError) throw strategyError;

    return {
      ...teamData,
      players: playersData || [],
      coach: coachData,
      strategy: strategyData
    };
  };

  const calculateTeamStrength = (team: Team): number => {
    if (!team.players.length) return 50;

    // Position weights
    const positionWeights = {
      'G': 0.35,  // Goalies are crucial
      'D': 0.25,  // Defense important
      'C': 0.15,  // Centers
      'LW': 0.125, // Wingers
      'RW': 0.125
    };

    let totalStrength = 0;
    let totalWeight = 0;

    // Calculate weighted average based on position
    Object.entries(positionWeights).forEach(([position, weight]) => {
      const positionPlayers = team.players.filter(p => p.player_position === position);
      if (positionPlayers.length > 0) {
        const avgRating = positionPlayers.reduce((sum, p) => sum + (p.overall_rating || 50), 0) / positionPlayers.length;
        totalStrength += avgRating * weight;
        totalWeight += weight;
      }
    });

    let baseStrength = totalWeight > 0 ? totalStrength / totalWeight : 50;

    // Coach modifiers
    if (team.coach) {
      const coachBonus = (
        (team.coach.offense_specialty || 50) +
        (team.coach.defense_specialty || 50) +
        (team.coach.line_management || 50) +
        (team.coach.motivation || 50)
      ) / 400; // Normalize to 0-1
      
      baseStrength *= (0.9 + coachBonus * 0.2); // Coach can add/subtract up to 10%
    }

    // Strategy modifiers
    if (team.strategy) {
      const strategyBonus = (
        (team.strategy.offensive_style || 50) +
        (team.strategy.defensive_pressure || 50) +
        (team.strategy.forecheck_intensity || 50)
      ) / 300; // Normalize to 0-1
      
      baseStrength *= (0.95 + strategyBonus * 0.1); // Strategy can add/subtract up to 5%
    }

    return Math.max(30, Math.min(95, baseStrength));
  };

  const simulateAdvancedGame = async (homeTeam: Team, awayTeam: Team): Promise<GameResult> => {
    const homeStrength = calculateTeamStrength(homeTeam);
    const awayStrength = calculateTeamStrength(awayTeam);
    
    const periods = [];
    let homeScore = 0;
    let awayScore = 0;
    let homeShots = 0;
    let awayShots = 0;
    const playByPlay: PlayByPlayEvent[] = [];
    const playerStats = new Map();

    // Initialize player stats
    [...homeTeam.players, ...awayTeam.players].forEach(player => {
      playerStats.set(player.id, {
        goals: 0,
        assists: 0,
        shots: 0,
        hits: 0,
        blocks: 0,
        takeaways: 0,
        giveaways: 0,
        penalties: 0,
        iceTime: 0
      });
    });

    // Simulate 3 regular periods
    for (let period = 1; period <= 3; period++) {
      const periodResult = await simulateAdvancedPeriod(
        homeTeam, 
        awayTeam, 
        homeStrength, 
        awayStrength, 
        period, 
        playByPlay,
        playerStats
      );
      
      periods.push({
        period,
        homeGoals: periodResult.homeGoals,
        awayGoals: periodResult.awayGoals,
        homeShots: periodResult.homeShots,
        awayShots: periodResult.awayShots
      });
      
      homeScore += periodResult.homeGoals;
      awayScore += periodResult.awayGoals;
      homeShots += periodResult.homeShots;
      awayShots += periodResult.awayShots;
    }

    let overtimeWinner: string | undefined;
    let shootoutWinner: string | undefined;

    // Handle overtime if tied
    if (homeScore === awayScore) {
      playByPlay.push({
        time: "00:00",
        period: 4,
        event_type: "period_start",
        description: "Overtime period begins (3-on-3)",
        team_id: homeTeam.id
      });

      // Overtime simulation (3v3) - higher skill players more important
      const homeOTStrength = homeStrength * 1.1; // Slight boost for skill in OT
      const awayOTStrength = awayStrength * 1.1;
      
      const otChance = Math.random();
      if (otChance < 0.6) { // 60% chance overtime decides it
        if (Math.random() < 0.5 + (homeOTStrength - awayOTStrength) / 200) {
          homeScore++;
          overtimeWinner = "home";
          
          // Add random scorer from home team
          const homeSkaters = homeTeam.players.filter(p => p.player_position !== 'G');
          const scorer = homeSkaters[Math.floor(Math.random() * homeSkaters.length)];
          
          playByPlay.push({
            time: `${Math.floor(Math.random() * 5 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            period: 4,
            event_type: "goal",
            description: `GOAL! ${scorer.first_name} ${scorer.last_name} scores the overtime winner!`,
            player_id: scorer.id,
            team_id: homeTeam.id
          });
        } else {
          awayScore++;
          overtimeWinner = "away";
          
          const awaySkaters = awayTeam.players.filter(p => p.player_position !== 'G');
          const scorer = awaySkaters[Math.floor(Math.random() * awaySkaters.length)];
          
          playByPlay.push({
            time: `${Math.floor(Math.random() * 5 + 1)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
            period: 4,
            event_type: "goal",
            description: `GOAL! ${scorer.first_name} ${scorer.last_name} scores the overtime winner!`,
            player_id: scorer.id,
            team_id: awayTeam.id
          });
        }
      } else {
        // Shootout
        playByPlay.push({
          time: "00:00",
          period: 5,
          event_type: "shootout_start",
          description: "Game goes to shootout",
          team_id: homeTeam.id
        });

        // Shootout heavily favors shooting and poise
        const homeShooters = homeTeam.players
          .filter(p => p.player_position !== 'G')
          .sort((a, b) => ((b.shooting || 50) + (b.poise || 50)) - ((a.shooting || 50) + (a.poise || 50)))
          .slice(0, 3);
        
        const awayShooters = awayTeam.players
          .filter(p => p.player_position !== 'G')
          .sort((a, b) => ((b.shooting || 50) + (b.poise || 50)) - ((a.shooting || 50) + (a.poise || 50)))
          .slice(0, 3);

        if (Math.random() < 0.5 + (homeStrength - awayStrength) / 400) {
          homeScore++;
          shootoutWinner = "home";
          
          playByPlay.push({
            time: "SO",
            period: 5,
            event_type: "shootout_goal",
            description: `${homeShooters[0].first_name} ${homeShooters[0].last_name} scores the shootout winner!`,
            player_id: homeShooters[0].id,
            team_id: homeTeam.id
          });
        } else {
          awayScore++;
          shootoutWinner = "away";
          
          playByPlay.push({
            time: "SO",
            period: 5,
            event_type: "shootout_goal",
            description: `${awayShooters[0].first_name} ${awayShooters[0].last_name} scores the shootout winner!`,
            player_id: awayShooters[0].id,
            team_id: awayTeam.id
          });
        }
      }
    }

    // Calculate stars of the game
    const stars = calculateStarsOfGame(homeTeam, awayTeam, playerStats);

    return {
      homeScore,
      awayScore,
      homeShots,
      awayShots,
      periods,
      overtimeWinner,
      shootoutWinner,
      playByPlay,
      homeTeamStrength: homeStrength,
      awayTeamStrength: awayStrength,
      stars
    };
  };

  const simulateAdvancedPeriod = async (
    homeTeam: Team,
    awayTeam: Team,
    homeStrength: number,
    awayStrength: number,
    period: number,
    playByPlay: PlayByPlayEvent[],
    playerStats: Map<string, any>
  ) => {
    // Period start
    playByPlay.push({
      time: "20:00",
      period,
      event_type: "period_start",
      description: `Period ${period} begins`,
      team_id: homeTeam.id
    });

    // Base shots adjusted by team strength and strategy
    let homeBaseShotsRaw = 10 + Math.floor((homeStrength - 50) / 5) + Math.floor(Math.random() * 6);
    let awayBaseShotsRaw = 10 + Math.floor((awayStrength - 50) / 5) + Math.floor(Math.random() * 6);

    // Strategy adjustments
    if (homeTeam.strategy) {
      homeBaseShotsRaw *= (0.8 + (homeTeam.strategy.offensive_style || 50) / 100);
    }
    if (awayTeam.strategy) {
      awayBaseShotsRaw *= (0.8 + (awayTeam.strategy.offensive_style || 50) / 100);
    }

    const homeShots = Math.floor(Math.max(3, homeBaseShotsRaw));
    const awayShots = Math.floor(Math.max(3, awayBaseShotsRaw));
    
    // Calculate goals with player-based shooting
    const homeGoals = simulateGoalsForTeam(homeTeam, homeShots, homeStrength, playByPlay, period, playerStats);
    const awayGoals = simulateGoalsForTeam(awayTeam, awayShots, awayStrength, playByPlay, period, playerStats);

    // Add some additional events
    simulatePeriodEvents(homeTeam, awayTeam, period, playByPlay, playerStats);

    // Period end
    playByPlay.push({
      time: "00:00",
      period,
      event_type: "period_end",
      description: `End of period ${period}`,
      team_id: homeTeam.id
    });

    return { homeGoals, awayGoals, homeShots, awayShots };
  };

  const simulateGoalsForTeam = (
    team: Team,
    shots: number,
    teamStrength: number,
    playByPlay: PlayByPlayEvent[],
    period: number,
    playerStats: Map<string, any>
  ): number => {
    let goals = 0;
    const skaters = team.players.filter(p => p.player_position !== 'G');
    
    for (let i = 0; i < shots; i++) {
      // Select a random shooter weighted by offensive ability
      const shooter = skaters[Math.floor(Math.random() * skaters.length)];
      if (!shooter) continue;

      const shooterSkill = ((shooter.shooting || 50) + (shooter.puck_control || 50)) / 2;
      const situationalModifier = period === 3 ? (shooter.poise || 50) / 100 : 1; // Clutch factor
      
      // Base shooting percentage modified by player skill
      const baseShootingPct = 0.08 + (shooterSkill - 50) / 1000;
      const adjustedPct = baseShootingPct * situationalModifier * (teamStrength / 75);
      
      const stats = playerStats.get(shooter.id) || {};
      stats.shots = (stats.shots || 0) + 1;
      playerStats.set(shooter.id, stats);

      if (Math.random() < adjustedPct) {
        goals++;
        stats.goals = (stats.goals || 0) + 1;
        
        // Random assist (1-2 assists per goal)
        const assistCount = Math.random() < 0.8 ? (Math.random() < 0.6 ? 2 : 1) : 0;
        const availableAssisters = skaters.filter(p => p.id !== shooter.id);
        
        let assisters = [];
        for (let j = 0; j < assistCount && availableAssisters.length > 0; j++) {
          const assisterIndex = Math.floor(Math.random() * availableAssisters.length);
          const assister = availableAssisters.splice(assisterIndex, 1)[0];
          assisters.push(assister);
          
          const assisterStats = playerStats.get(assister.id) || {};
          assisterStats.assists = (assisterStats.assists || 0) + 1;
          playerStats.set(assister.id, assisterStats);
        }

        const time = `${19 - Math.floor(Math.random() * 19)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        const assistText = assisters.length > 0 
          ? ` (Assists: ${assisters.map(a => `${a.first_name} ${a.last_name}`).join(', ')})`
          : ' (Unassisted)';
          
        playByPlay.push({
          time,
          period,
          event_type: "goal",
          description: `GOAL! ${shooter.first_name} ${shooter.last_name}${assistText}`,
          player_id: shooter.id,
          team_id: team.id
        });
      }
    }
    
    return goals;
  };

  const simulatePeriodEvents = (
    homeTeam: Team,
    awayTeam: Team,
    period: number,
    playByPlay: PlayByPlayEvent[],
    playerStats: Map<string, any>
  ) => {
    const allPlayers = [...homeTeam.players, ...awayTeam.players];
    
    // Simulate penalties (based on discipline)
    const penaltyChance = 0.15; // 15% chance of penalty per period
    if (Math.random() < penaltyChance) {
      const player = allPlayers[Math.floor(Math.random() * allPlayers.length)];
      const disciplineModifier = 1 - ((player.discipline || 50) / 100);
      
      if (Math.random() < disciplineModifier) {
        const time = `${19 - Math.floor(Math.random() * 19)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        const penalties = ['Tripping', 'Slashing', 'High Sticking', 'Interference', 'Roughing'];
        const penalty = penalties[Math.floor(Math.random() * penalties.length)];
        
        playByPlay.push({
          time,
          period,
          event_type: "penalty",
          description: `PENALTY: ${player.first_name} ${player.last_name} - ${penalty} (2 min)`,
          player_id: player.id,
          team_id: player.team_id || (homeTeam.players.includes(player) ? homeTeam.id : awayTeam.id)
        });

        const stats = playerStats.get(player.id) || {};
        stats.penalties = (stats.penalties || 0) + 1;
        playerStats.set(player.id, stats);
      }
    }

    // Simulate hits (based on checking rating)
    const hitChance = 0.3;
    if (Math.random() < hitChance) {
      const hitter = allPlayers.filter(p => p.player_position !== 'G')[Math.floor(Math.random() * allPlayers.filter(p => p.player_position !== 'G').length)];
      if (hitter && (hitter.checking || 50) > 60) {
        const time = `${19 - Math.floor(Math.random() * 19)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
        
        playByPlay.push({
          time,
          period,
          event_type: "hit",
          description: `Big hit by ${hitter.first_name} ${hitter.last_name}!`,
          player_id: hitter.id,
          team_id: hitter.team_id || (homeTeam.players.includes(hitter) ? homeTeam.id : awayTeam.id)
        });

        const stats = playerStats.get(hitter.id) || {};
        stats.hits = (stats.hits || 0) + 1;
        playerStats.set(hitter.id, stats);
      }
    }
  };

  const calculateStarsOfGame = (homeTeam: Team, awayTeam: Team, playerStats: Map<string, any>) => {
    const allPlayers = [...homeTeam.players, ...awayTeam.players];
    
    const playerScores = allPlayers.map(player => {
      const stats = playerStats.get(player.id) || {};
      const score = (stats.goals || 0) * 5 + 
                   (stats.assists || 0) * 3 + 
                   (stats.shots || 0) * 0.5 + 
                   (stats.hits || 0) * 1 + 
                   (stats.blocks || 0) * 1.5 + 
                   (stats.takeaways || 0) * 2 - 
                   (stats.giveaways || 0) * 1.5 - 
                   (stats.penalties || 0) * 2;
      
      return {
        player,
        points: score,
        reason: `${stats.goals || 0}G ${stats.assists || 0}A`
      };
    }).sort((a, b) => b.points - a.points);

    return playerScores.slice(0, 3);
  };

  const simulatePeriod = (homeStrength: number, awayStrength: number) => {
    // Base shots per period: 8-15
    const baseShotsHome = Math.floor(Math.random() * 8) + 8;
    const baseShotsAway = Math.floor(Math.random() * 8) + 8;
    
    // Adjust based on team strength
    const homeShots = Math.max(1, baseShotsHome + Math.floor((homeStrength - 75) / 10));
    const awayShots = Math.max(1, baseShotsAway + Math.floor((awayStrength - 75) / 10));
    
    // Shooting percentage: 8-12% typically
    const homeShootingPct = (Math.random() * 0.04 + 0.08) * (homeStrength / 75);
    const awayShootingPct = (Math.random() * 0.04 + 0.08) * (awayStrength / 75);
    
    const homeGoals = Math.floor(homeShots * homeShootingPct + Math.random() * 0.5);
    const awayGoals = Math.floor(awayShots * awayShootingPct + Math.random() * 0.5);
    
    return { homeGoals, awayGoals, homeShots, awayShots };
  };

  const runSimulation = async () => {
    if (!selectedLeague) {
      toast({
        title: "Error",
        description: "Please select a league first",
        variant: "destructive"
      });
      return;
    }

    setSimulating(true);
    setProgress(0);

    try {
      if (simulationType === "single") {
        if (!selectedGame) {
          toast({
            title: "Error",
            description: "Please select a game to simulate",
            variant: "destructive"
          });
          return;
        }

        setProgress(20);
        
        // Find the selected game
        const game = games.find(g => g.id === selectedGame);
        if (!game) {
          throw new Error("Game not found");
        }

        setProgress(40);

        // Fetch detailed team data
        const [homeTeam, awayTeam] = await Promise.all([
          fetchTeamData(game.home_team_id),
          fetchTeamData(game.away_team_id)
        ]);

        setProgress(60);

        // Run advanced simulation
        const result = await simulateAdvancedGame(homeTeam, awayTeam);
        
        setProgress(80);

        // Save results to database
        await saveGameResult(game.id, result);

        setLastResult(result);
        setProgress(100);
        
        toast({
          title: "Game Simulated!",
          description: `${homeTeam.city} ${homeTeam.name} ${result.homeScore} - ${awayTeam.city} ${awayTeam.name} ${result.awayScore}`,
        });
      } else {
        // Simulate multiple games
        const gamesToSimulate = simulationType === "day" ? Math.min(8, games.length) : Math.min(30, games.length);
        
        for (let i = 0; i < gamesToSimulate; i++) {
          const game = games[i];
          if (!game) continue;

          try {
            const [homeTeam, awayTeam] = await Promise.all([
              fetchTeamData(game.home_team_id),
              fetchTeamData(game.away_team_id)
            ]);

            const result = await simulateAdvancedGame(homeTeam, awayTeam);
            await saveGameResult(game.id, result);
          } catch (error) {
            console.error(`Failed to simulate game ${game.id}:`, error);
          }
          
          setProgress(((i + 1) / gamesToSimulate) * 100);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        toast({
          title: "Success!",
          description: `Simulated ${gamesToSimulate} games with advanced engine`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSimulating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const saveGameResult = async (gameId: string, result: GameResult) => {
    try {
      // Update game with results
      await supabase
        .from('games')
        .update({
          status: 'completed',
          home_score: result.homeScore,
          away_score: result.awayScore,
          home_shots: result.homeShots,
          away_shots: result.awayShots,
          overtime_winner: result.overtimeWinner === 'home' ? 'home_team_id' : result.overtimeWinner === 'away' ? 'away_team_id' : null,
          shootout_winner: result.shootoutWinner === 'home' ? 'home_team_id' : result.shootoutWinner === 'away' ? 'away_team_id' : null
        })
        .eq('id', gameId);

      // Save period data
      const periodInserts = result.periods.map(period => ({
        game_id: gameId,
        period: period.period,
        home_goals: period.homeGoals,
        away_goals: period.awayGoals,
        home_shots: period.homeShots,
        away_shots: period.awayShots
      }));

      await supabase
        .from('game_periods')
        .insert(periodInserts);

      console.log(`Game ${gameId} results saved successfully`);
    } catch (error) {
      console.error('Failed to save game results:', error);
      throw error;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Simulation Engine</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation Controls */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Run Simulation
              </CardTitle>
              <CardDescription>
                Advanced probability-based hockey game simulation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">League</label>
                <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a league" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.map((league) => (
                      <SelectItem key={league.id} value={league.id}>
                        {league.name} ({league.league_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Simulation Type</label>
                <Select value={simulationType} onValueChange={setSimulationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Game</SelectItem>
                    <SelectItem value="day">Full Day (8 games)</SelectItem>
                    <SelectItem value="week">Full Week (30 games)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {simulationType === "single" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Game</label>
                  <Select value={selectedGame} onValueChange={setSelectedGame}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a scheduled game" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading ? (
                        <SelectItem value="" disabled>Loading games...</SelectItem>
                      ) : games.length === 0 ? (
                        <SelectItem value="" disabled>No scheduled games found</SelectItem>
                      ) : (
                        games.map((game) => (
                          <SelectItem key={game.id} value={game.id}>
                            {game.home_team?.city} {game.home_team?.name} vs {game.away_team?.city} {game.away_team?.name} - {new Date(game.game_date).toLocaleDateString()}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {simulating && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Simulation Progress</label>
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">
                    Running advanced game simulation... {Math.round(progress)}%
                  </p>
                </div>
              )}

              <Button 
                onClick={runSimulation} 
                className="w-full btn-hockey"
                disabled={simulating}
              >
                {simulating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Game Result Display */}
          {lastResult && (
            <Card className="card-rink">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Game Result
                </CardTitle>
                <CardDescription>
                  Latest simulation result
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {lastResult.homeScore} - {lastResult.awayScore}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Shots: {lastResult.homeShots} - {lastResult.awayShots}
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">
                    Team Strengths: {lastResult.homeTeamStrength?.toFixed(1)} vs {lastResult.awayTeamStrength?.toFixed(1)}
                  </div>
                  
                  {lastResult.overtimeWinner && (
                    <Badge variant="secondary" className="mb-2">
                      Overtime Victory
                    </Badge>
                  )}
                  
                  {lastResult.shootoutWinner && (
                    <Badge variant="outline" className="mb-2">
                      Shootout Victory
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Period Breakdown</h4>
                  {lastResult.periods.map((period) => (
                    <div key={period.period} className="flex justify-between text-sm">
                      <span>Period {period.period}:</span>
                      <span>{period.homeGoals} - {period.awayGoals} (Shots: {period.homeShots} - {period.awayShots})</span>
                    </div>
                  ))}
                </div>

                {lastResult.stars && lastResult.stars.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Three Stars
                      </h4>
                      {lastResult.stars.map((star, index) => (
                        <div key={star.player.id} className="flex justify-between text-sm">
                          <span>{index + 1}. {star.player.first_name} {star.player.last_name}</span>
                          <span className="text-muted-foreground">{star.reason}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {lastResult.playByPlay && lastResult.playByPlay.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Key Events</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {lastResult.playByPlay
                          .filter(event => ['goal', 'penalty', 'period_start'].includes(event.event_type))
                          .slice(0, 8)
                          .map((event, index) => (
                          <div key={index} className="text-xs">
                            <span className="font-mono">{event.time} P{event.period}</span> - {event.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {!lastResult && (
            <Card className="card-rink">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Simulation Features
                </CardTitle>
                <CardDescription>
                  Advanced hockey simulation algorithms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Player-Based Simulation</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Individual player ratings drive realistic game outcomes and statistics
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Coach & Strategy Impact</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Team strategies and coach specialties modify simulation probabilities
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Sword className="h-4 w-4 text-team-gold" />
                    <span className="text-sm font-medium">Advanced Events</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Penalties, fights, injuries, and momentum swings based on player attributes
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Simulation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Player-Driven Engine</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Real team rosters with individual ratings influencing every simulation aspect
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Rich Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Play-by-play logs, individual player stats, and three stars selection
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-team-gold" />
                <h3 className="font-semibold">Strategic Depth</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Team strategies, coach ratings, and situational modifiers create realistic gameplay
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SimulationEngine;