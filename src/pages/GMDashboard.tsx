import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, BarChart3, Trophy, Clock, Zap } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Team = Tables<"teams">;
type Player = Tables<"players">;
type Game = Tables<"games">;
type League = Tables<"leagues">;

const GMDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [upcomingGames, setUpcomingGames] = useState<Game[]>([]);
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlineGMs, setOnlineGMs] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    
    fetchTeamData();
    setupRealtimeSubscriptions();
  }, [user]);

  const fetchTeamData = async () => {
    if (!user) return;

    try {
      // Fetch team managed by this GM
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .select(`
          *,
          leagues (*)
        `)
        .eq("gm_user_id", user.id)
        .single();

      if (teamError) {
        if (teamError.code === 'PGRST116') {
          toast({
            title: "No Team Assigned",
            description: "You are not currently assigned as a GM for any team.",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      setTeam(teamData);
      setLeague(teamData.leagues);

      // Fetch team players
      const { data: playersData } = await supabase
        .from("players")
        .select("*")
        .eq("team_id", teamData.id)
        .order("overall_rating", { ascending: false });

      setPlayers(playersData || []);

      // Fetch upcoming games
      const { data: gamesData } = await supabase
        .from("games")
        .select(`
          *,
          home_team:teams!games_home_team_id_fkey(city, name, abbreviation),
          away_team:teams!games_away_team_id_fkey(city, name, abbreviation)
        `)
        .or(`home_team_id.eq.${teamData.id},away_team_id.eq.${teamData.id}`)
        .eq("status", "scheduled")
        .order("game_date")
        .limit(5);

      setUpcomingGames(gamesData || []);
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast({
        title: "Error",
        description: "Failed to load team data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user || !team) return;

    // Subscribe to GM presence
    const presenceChannel = supabase.channel('gm_presence');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        const gms = Object.values(newState).flat();
        setOnlineGMs(gms);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('GM joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('GM left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            team_id: team?.id,
            team_name: `${team?.city} ${team?.name}`,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Subscribe to game updates
    const gameChannel = supabase
      .channel('game_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `home_team_id=eq.${team?.id},away_team_id=eq.${team?.id}`,
        },
        (payload) => {
          console.log('Game update:', payload);
          fetchTeamData(); // Refresh data when games update
          
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Game Update",
              description: "One of your team's games has been updated!",
            });
          }
        }
      )
      .subscribe();

    return () => {
      presenceChannel.unsubscribe();
      gameChannel.unsubscribe();
    };
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'G': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'D': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'C': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'LW': case 'RW': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getOverallRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-green-500';
    if (rating >= 75) return 'text-yellow-500';
    if (rating >= 65) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded-md w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-md"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">No Team Assigned</h1>
          <p className="text-muted-foreground mb-6">
            You are not currently assigned as a General Manager for any team. 
            Contact your league commissioner to get assigned to a team.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">GM Dashboard</h1>
            <p className="text-muted-foreground">
              Managing {team.city} {team.name} • {league?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="text-green-500 border-green-500/20">
              {onlineGMs.length} GMs Online
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Roster Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{players.length}</div>
              <p className="text-xs text-muted-foreground">Active Players</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Games</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingGames.length}</div>
              <p className="text-xs text-muted-foreground">Next 5 Games</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {players.length > 0 
                  ? Math.round(players.reduce((sum, p) => sum + (p.overall_rating || 0), 0) / players.length)
                  : 0
                }
              </div>
              <p className="text-xs text-muted-foreground">Team Average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Game</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {upcomingGames.length > 0 
                  ? new Date(upcomingGames[0].game_date).toLocaleDateString()
                  : 'TBD'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {upcomingGames.length > 0 && (
                  <>
                    vs {upcomingGames[0].home_team_id === team.id 
                      ? `${(upcomingGames[0] as any).away_team?.city} ${(upcomingGames[0] as any).away_team?.name}`
                      : `${(upcomingGames[0] as any).home_team?.city} ${(upcomingGames[0] as any).home_team?.name}`
                    }
                  </>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="roster" className="space-y-6">
          <TabsList>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Roster</CardTitle>
                <CardDescription>
                  Manage your team's players and lineup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {players.map((player) => (
                    <div 
                      key={player.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Badge className={getPositionColor(player.player_position)}>
                          {player.player_position}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {player.first_name} {player.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Age {player.age} • {player.nationality}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getOverallRatingColor(player.overall_rating || 0)}`}>
                          {player.overall_rating || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Overall</div>
                      </div>
                    </div>
                  ))}
                  
                  {players.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="mx-auto h-12 w-12 mb-4" />
                      <p>No players assigned to this team yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Games</CardTitle>
                <CardDescription>
                  Your team's schedule and recent results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingGames.map((game) => {
                    const isHome = game.home_team_id === team.id;
                    const opponent = isHome 
                      ? (game as any).away_team 
                      : (game as any).home_team;
                    
                    return (
                      <div 
                        key={game.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-[80px]">
                            <div className="font-medium">
                              {new Date(game.game_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {game.game_time || 'TBD'}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">
                              {isHome ? 'vs' : '@'} {opponent?.city} {opponent?.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {isHome ? 'Home' : 'Away'} Game
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-blue-500 border-blue-500/20">
                          {game.status}
                        </Badge>
                      </div>
                    );
                  })}

                  {upcomingGames.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="mx-auto h-12 w-12 mb-4" />
                      <p>No upcoming games scheduled.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Position Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['G', 'D', 'C', 'LW', 'RW'].map((position) => {
                      const count = players.filter(p => p.player_position === position).length;
                      return (
                        <div key={position} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getPositionColor(position)}>
                              {position}
                            </Badge>
                            <span className="text-sm">
                              {position === 'G' ? 'Goalies' : 
                               position === 'D' ? 'Defense' :
                               position === 'C' ? 'Centers' :
                               position === 'LW' ? 'Left Wings' : 'Right Wings'}
                            </span>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Online GMs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {onlineGMs.map((gm, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{gm.team_name}</span>
                      </div>
                    ))}
                    {onlineGMs.length === 0 && (
                      <p className="text-sm text-muted-foreground">No other GMs online</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GMDashboard;