import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Calendar, 
  Play, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Download,
  Settings,
  Clock,
  Home,
  MapPin
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, isWeekend, addWeeks, isSameDay } from "date-fns";

interface Team {
  id: string;
  name: string;
  city: string;
  division?: string;
  conference?: string;
  league_id: string;
}

interface League {
  id: string;
  name: string;
  games_per_team: number;
}

interface Game {
  id?: string;
  home_team_id: string;
  away_team_id: string;
  game_date: string;
  game_time: string;
  league_id: string;
  home_team?: Team;
  away_team?: Team;
  is_back_to_back?: boolean;
  week_number?: number;
}

interface ScheduleStats {
  total_games: number;
  games_per_team: number;
  home_away_balance: { [teamId: string]: { home: number; away: number } };
  back_to_back_games: number;
  weeks_covered: number;
  inter_conference_games: number;
}

export default function ScheduleBuilder() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [schedule, setSchedule] = useState<Game[]>([]);
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const [scheduleConfig, setScheduleConfig] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'),
    games_per_team: 82,
    auto_balance_home_away: true,
    avoid_back_to_back: true,
    inter_conference_ratio: 30, // percentage
    game_time: "19:00",
    include_weekends: true,
    max_games_per_day: 16
  });

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadTeams();
    }
  }, [selectedLeague]);

  const loadLeagues = async () => {
    try {
      const { data } = await supabase
        .from('leagues')
        .select('*')
        .eq('is_active', true);
      
      setLeagues(data || []);
    } catch (error) {
      console.error('Error loading leagues:', error);
      toast({
        title: "Error",
        description: "Failed to load leagues",
        variant: "destructive"
      });
    }
  };

  const loadTeams = async () => {
    try {
      const { data } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', selectedLeague);
      
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive"
      });
    }
  };

  const generateSchedule = async () => {
    if (!selectedLeague || teams.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please select a league with at least 2 teams",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    
    try {
      const newSchedule = createBalancedSchedule();
      setSchedule(newSchedule);
      calculateStats(newSchedule);
      
      toast({
        title: "Success",
        description: `Generated ${newSchedule.length} games with balanced scheduling`
      });
    } catch (error) {
      console.error('Error generating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to generate schedule",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const createBalancedSchedule = (): Game[] => {
    const games: Game[] = [];
    const startDate = new Date(scheduleConfig.start_date);
    let currentDate = new Date(startDate);
    
    // Calculate games needed per team matchup
    const totalTeams = teams.length;
    const totalGamesNeeded = (scheduleConfig.games_per_team * totalTeams) / 2;
    const gamesPerMatchup = Math.floor(totalGamesNeeded / (totalTeams * (totalTeams - 1) / 2));
    
    // Track home/away balance
    const homeAwayBalance: { [teamId: string]: { home: number; away: number } } = {};
    teams.forEach(team => {
      homeAwayBalance[team.id] = { home: 0, away: 0 };
    });

    // Track team schedules for back-to-back detection
    const teamSchedules: { [teamId: string]: string[] } = {};
    teams.forEach(team => {
      teamSchedules[team.id] = [];
    });

    // Generate round-robin matchups
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const team1 = teams[i];
        const team2 = teams[j];
        
        // Determine if it's an inter-conference game
        const isInterConference = team1.conference !== team2.conference;
        
        // Generate multiple games for this matchup
        for (let gameNum = 0; gameNum < gamesPerMatchup; gameNum++) {
          // Alternate home/away for balance
          const isTeam1Home = gameNum % 2 === 0;
          
          // Find suitable date
          const gameDate = findNextAvailableDate(
            currentDate,
            isTeam1Home ? team1.id : team2.id,
            isTeam1Home ? team2.id : team1.id,
            teamSchedules
          );

          const game: Game = {
            home_team_id: isTeam1Home ? team1.id : team2.id,
            away_team_id: isTeam1Home ? team2.id : team1.id,
            game_date: format(gameDate, 'yyyy-MM-dd'),
            game_time: scheduleConfig.game_time,
            league_id: selectedLeague,
            home_team: isTeam1Home ? team1 : team2,
            away_team: isTeam1Home ? team2 : team1,
            week_number: getWeekNumber(gameDate, startDate)
          };

          games.push(game);
          
          // Update tracking
          homeAwayBalance[game.home_team_id].home++;
          homeAwayBalance[game.away_team_id].away++;
          teamSchedules[game.home_team_id].push(game.game_date);
          teamSchedules[game.away_team_id].push(game.game_date);
          
          currentDate = addDays(gameDate, 1);
        }
      }
    }

    // Sort games by date
    games.sort((a, b) => new Date(a.game_date).getTime() - new Date(b.game_date).getTime());
    
    // Mark back-to-back games
    markBackToBackGames(games);
    
    return games;
  };

  const findNextAvailableDate = (
    startDate: Date,
    homeTeamId: string,
    awayTeamId: string,
    teamSchedules: { [teamId: string]: string[] }
  ): Date => {
    let candidateDate = new Date(startDate);
    
    while (true) {
      const dateStr = format(candidateDate, 'yyyy-MM-dd');
      
      // Skip if weekend not included
      if (!scheduleConfig.include_weekends && isWeekend(candidateDate)) {
        candidateDate = addDays(candidateDate, 1);
        continue;
      }

      // Check if teams are available (no back-to-back if avoiding)
      const homeTeamHasGame = teamSchedules[homeTeamId].includes(dateStr) ||
        teamSchedules[homeTeamId].includes(format(addDays(candidateDate, -1), 'yyyy-MM-dd'));
      const awayTeamHasGame = teamSchedules[awayTeamId].includes(dateStr) ||
        teamSchedules[awayTeamId].includes(format(addDays(candidateDate, -1), 'yyyy-MM-dd'));
      
      if (scheduleConfig.avoid_back_to_back && (homeTeamHasGame || awayTeamHasGame)) {
        candidateDate = addDays(candidateDate, 1);
        continue;
      }

      // Check max games per day
      const gamesOnDate = schedule.filter(g => g.game_date === dateStr).length;
      if (gamesOnDate >= scheduleConfig.max_games_per_day) {
        candidateDate = addDays(candidateDate, 1);
        continue;
      }

      return candidateDate;
    }
  };

  const getWeekNumber = (date: Date, startDate: Date): number => {
    const diffTime = Math.abs(date.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  };

  const markBackToBackGames = (games: Game[]) => {
    const teamLastGame: { [teamId: string]: string } = {};
    
    games.forEach(game => {
      const gameDate = game.game_date;
      
      // Check home team
      if (teamLastGame[game.home_team_id]) {
        const daysDiff = Math.abs(
          new Date(gameDate).getTime() - new Date(teamLastGame[game.home_team_id]).getTime()
        ) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 1) {
          game.is_back_to_back = true;
        }
      }
      
      // Check away team
      if (teamLastGame[game.away_team_id]) {
        const daysDiff = Math.abs(
          new Date(gameDate).getTime() - new Date(teamLastGame[game.away_team_id]).getTime()
        ) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 1) {
          game.is_back_to_back = true;
        }
      }
      
      teamLastGame[game.home_team_id] = gameDate;
      teamLastGame[game.away_team_id] = gameDate;
    });
  };

  const calculateStats = (games: Game[]) => {
    const homeAwayBalance: { [teamId: string]: { home: number; away: number } } = {};
    teams.forEach(team => {
      homeAwayBalance[team.id] = { home: 0, away: 0 };
    });

    let backToBackCount = 0;
    let interConferenceCount = 0;
    const weeks = new Set<number>();

    games.forEach(game => {
      homeAwayBalance[game.home_team_id].home++;
      homeAwayBalance[game.away_team_id].away++;
      
      if (game.is_back_to_back) {
        backToBackCount++;
      }
      
      if (game.home_team?.conference !== game.away_team?.conference) {
        interConferenceCount++;
      }
      
      if (game.week_number) {
        weeks.add(game.week_number);
      }
    });

    setStats({
      total_games: games.length,
      games_per_team: games.length > 0 ? Math.round((games.length * 2) / teams.length) : 0,
      home_away_balance: homeAwayBalance,
      back_to_back_games: backToBackCount,
      weeks_covered: weeks.size,
      inter_conference_games: interConferenceCount
    });
  };

  const saveSchedule = async () => {
    if (schedule.length === 0) {
      toast({
        title: "Validation Error",
        description: "No schedule to save",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Clear existing games for this league
      await supabase
        .from('games')
        .delete()
        .eq('league_id', selectedLeague);

      // Insert new games
      const gamesToInsert = schedule.map(game => ({
        home_team_id: game.home_team_id,
        away_team_id: game.away_team_id,
        game_date: game.game_date,
        game_time: game.game_time,
        league_id: game.league_id,
        status: 'scheduled' as const
      }));

      const { error } = await supabase
        .from('games')
        .insert(gamesToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Saved ${schedule.length} games to the database`
      });

    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schedule Builder</h1>
            <p className="text-muted-foreground">Generate balanced schedules with home/away splits and back-to-back detection</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generateSchedule}
              disabled={generating || !selectedLeague}
              className="btn-hockey"
            >
              {generating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4 mr-2" />
              )}
              Generate Schedule
            </Button>
            <Button 
              onClick={saveSchedule}
              disabled={loading || schedule.length === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Save to Database
            </Button>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Schedule Configuration
              </CardTitle>
              <CardDescription>Configure schedule parameters and rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="league">League *</Label>
                  <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues.map(league => (
                        <SelectItem key={league.id} value={league.id}>
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start_date">Season Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={scheduleConfig.start_date}
                    onChange={(e) => setScheduleConfig({...scheduleConfig, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="games_per_team">Games per Team</Label>
                  <Input
                    id="games_per_team"
                    type="number"
                    min="1"
                    max="100"
                    value={scheduleConfig.games_per_team}
                    onChange={(e) => setScheduleConfig({...scheduleConfig, games_per_team: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="game_time">Default Game Time</Label>
                  <Input
                    id="game_time"
                    type="time"
                    value={scheduleConfig.game_time}
                    onChange={(e) => setScheduleConfig({...scheduleConfig, game_time: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto_balance"
                      checked={scheduleConfig.auto_balance_home_away}
                      onCheckedChange={(checked) => 
                        setScheduleConfig({...scheduleConfig, auto_balance_home_away: !!checked})
                      }
                    />
                    <Label htmlFor="auto_balance">Auto-balance home/away (50/50)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="avoid_back_to_back"
                      checked={scheduleConfig.avoid_back_to_back}
                      onCheckedChange={(checked) => 
                        setScheduleConfig({...scheduleConfig, avoid_back_to_back: !!checked})
                      }
                    />
                    <Label htmlFor="avoid_back_to_back">Avoid back-to-back games</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include_weekends"
                      checked={scheduleConfig.include_weekends}
                      onCheckedChange={(checked) => 
                        setScheduleConfig({...scheduleConfig, include_weekends: !!checked})
                      }
                    />
                    <Label htmlFor="include_weekends">Include weekend games</Label>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="inter_conference">Inter-conference %</Label>
                    <Input
                      id="inter_conference"
                      type="number"
                      min="0"
                      max="100"
                      value={scheduleConfig.inter_conference_ratio}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, inter_conference_ratio: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_games_per_day">Max games/day</Label>
                    <Input
                      id="max_games_per_day"
                      type="number"
                      min="1"
                      max="50"
                      value={scheduleConfig.max_games_per_day}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, max_games_per_day: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Schedule Statistics
              </CardTitle>
              <CardDescription>Generated schedule analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Total Games:</div>
                    <div className="font-semibold">{stats.total_games}</div>
                    <div>Games/Team:</div>
                    <div className="font-semibold">{stats.games_per_team}</div>
                    <div>Weeks Covered:</div>
                    <div className="font-semibold">{stats.weeks_covered}</div>
                    <div>Inter-conference:</div>
                    <div className="font-semibold">{stats.inter_conference_games}</div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">Back-to-back Games</span>
                    </div>
                    <Badge variant={stats.back_to_back_games === 0 ? "default" : "destructive"}>
                      {stats.back_to_back_games} detected
                    </Badge>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-sm font-medium mb-2">Teams Status:</div>
                    <div className="text-xs text-green-600">
                      ✓ {teams.length} teams loaded
                    </div>
                    {selectedLeague && (
                      <div className="text-xs text-green-600">
                        ✓ League selected
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Generate a schedule to see statistics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Schedule */}
        {schedule.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Generated Schedule ({schedule.length} games)
              </CardTitle>
              <CardDescription>Preview of the generated balanced schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Away Team</TableHead>
                      <TableHead>Home Team</TableHead>
                      <TableHead>Week</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.slice(0, 50).map((game, index) => (
                      <TableRow key={index}>
                        <TableCell>{format(new Date(game.game_date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {game.game_time}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {game.away_team?.city} {game.away_team?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Home className="w-3 h-3" />
                            {game.home_team?.city} {game.home_team?.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Week {game.week_number}</Badge>
                        </TableCell>
                        <TableCell>
                          {game.is_back_to_back ? (
                            <Badge variant="destructive">B2B</Badge>
                          ) : (
                            <Badge variant="default">Normal</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {schedule.length > 50 && (
                <div className="text-center text-sm text-muted-foreground mt-2">
                  Showing first 50 games of {schedule.length} total games
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}