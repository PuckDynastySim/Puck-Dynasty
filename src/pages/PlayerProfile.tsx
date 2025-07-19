
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Users, Trophy, Star, Swords, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  player_position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  overall_rating: number;
  status: 'active' | 'injured' | 'suspended' | 'retired';
  team_id?: string;
  league_id: string;
  // Shared attributes
  discipline?: number;
  injury?: number;
  fatigue?: number;
  poise?: number;
  puck_control?: number;
  
  // Player-specific attributes
  passing?: number;
  shooting?: number;
  defense?: number;
  checking?: number;
  fighting?: number;

  // Goalie-specific attributes
  movement?: number;
  rebound_control?: number;
  vision?: number;
  aggressiveness?: number;
  flexibility?: number;
  team_name?: string;
  team_city?: string;
  league_name?: string;
  league_type?: string;
}

interface CareerStats {
  season_year: number;
  team_name: string;
  league_type: string;
  games_played: number;
  goals: number;
  assists: number;
  points: number;
  plus_minus: number;
  penalty_minutes: number;
  shots: number;
  shooting_percentage: number;
  powerplay_points: number;
  shorthanded_points: number;
  game_winning_goals: number;
  games_started: number;
  wins: number;
  losses: number;
  overtime_losses: number;
  shutouts: number;
  save_percentage: number;
  goals_against_average: number;
}

export default function PlayerProfile() {
  const { playerId } = useParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [careerStats, setCareerStats] = useState<CareerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlayer();
  }, [playerId]);

  const loadPlayer = async () => {
    try {
      // Fetch player data
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select(`
          *,
          teams(name, city, league_id),
          leagues(name, league_type)
        `)
        .eq('id', playerId)
        .single();

      if (playerError) throw playerError;

      if (playerData) {
        setPlayer({
          ...playerData,
          team_name: playerData.teams?.name,
          team_city: playerData.teams?.city,
          league_name: playerData.leagues?.name,
          league_type: playerData.leagues?.league_type,
        });
        
        // For now, we'll create placeholder career stats since the table may not exist yet
        // This can be replaced with actual database queries once the player_career_stats table is properly set up
        const defaultStats: CareerStats = {
          season_year: 2025,
          team_name: playerData.teams?.name || 'Free Agent',
          league_type: playerData.leagues?.league_type || 'pro',
          games_played: 0,
          goals: 0,
          assists: 0,
          points: 0,
          plus_minus: 0,
          penalty_minutes: 0,
          shots: 0,
          shooting_percentage: 0,
          powerplay_points: 0,
          shorthanded_points: 0,
          game_winning_goals: 0,
          games_started: 0,
          wins: 0,
          losses: 0,
          overtime_losses: 0,
          shutouts: 0,
          save_percentage: 0,
          goals_against_average: 0
        };
        
        setCareerStats([defaultStats]);
      }
    } catch (error: any) {
      console.error('Error loading player:', error);
      toast({
        title: "Error",
        description: "Failed to load player data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!player) {
    return (
      <AdminLayout>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Player not found</h1>
          <p className="text-muted-foreground">The requested player could not be found.</p>
          <Link to="/player-management">
            <Button className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Player Management
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const playerAttributeGroups = {
    'Offensive Skills': ['passing', 'shooting', 'puck_control'],
    'Defensive Skills': ['defense', 'checking', 'poise'],
    'Physical & Mental': ['discipline', 'injury', 'fatigue', 'fighting']
  };

  const goalieAttributeGroups = {
    'Technical Skills': ['movement', 'rebound_control', 'puck_control'],
    'Mental Skills': ['vision', 'aggressiveness', 'poise'],
    'Physical & Mental': ['discipline', 'injury', 'fatigue', 'flexibility']
  };

  const attributeGroups = player.player_position === 'G' ? goalieAttributeGroups : playerAttributeGroups;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link to="/player-management" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Player Management
            </Link>
            <h1 className="text-3xl font-bold">{player.first_name} {player.last_name}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{player.nationality}</Badge>
              <Badge variant="outline">{player.player_position}</Badge>
              <Badge variant={
                player.status === 'active' ? 'default' : 
                player.status === 'injured' ? 'destructive' : 
                player.status === 'suspended' ? 'secondary' : 'outline'
              }>
                {player.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{player.overall_rating || 'N/A'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Age</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{player.age}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {player.team_name ? (
                  <div className="text-sm">
                    <div className="font-medium">{player.team_city} {player.team_name}</div>
                    <div className="text-muted-foreground text-xs">{player.league_name}</div>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Free Agent</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">League Level</CardTitle>
              <Swords className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={player.league_type === 'pro' ? 'default' : player.league_type === 'farm' ? 'secondary' : 'outline'}>
                {player.league_type?.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Player Attributes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(attributeGroups).map(([groupName, attributes]) => (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle>{groupName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attributes.map(attr => {
                    const value = player[attr as keyof Player] as number;
                    return (
                      <div key={attr} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{attr.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${value || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{value || 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Career Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Career Statistics</CardTitle>
            <CardDescription>Season by season statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {careerStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Season</th>
                      <th className="text-left py-2">Team</th>
                      <th className="text-left py-2">League</th>
                      <th className="text-right py-2">GP</th>
                      {player.player_position !== 'G' ? (
                        <>
                          <th className="text-right py-2">G</th>
                          <th className="text-right py-2">A</th>
                          <th className="text-right py-2">P</th>
                          <th className="text-right py-2">+/-</th>
                          <th className="text-right py-2">PIM</th>
                          <th className="text-right py-2">PPP</th>
                          <th className="text-right py-2">SHP</th>
                          <th className="text-right py-2">GWG</th>
                        </>
                      ) : (
                        <>
                          <th className="text-right py-2">W</th>
                          <th className="text-right py-2">L</th>
                          <th className="text-right py-2">OTL</th>
                          <th className="text-right py-2">SO</th>
                          <th className="text-right py-2">SV%</th>
                          <th className="text-right py-2">GAA</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {careerStats.map((season, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-2">{season.season_year}</td>
                        <td className="py-2">{season.team_name}</td>
                        <td className="py-2">{season.league_type.toUpperCase()}</td>
                        <td className="text-right py-2">{season.games_played}</td>
                        {player.player_position !== 'G' ? (
                          <>
                            <td className="text-right py-2">{season.goals}</td>
                            <td className="text-right py-2">{season.assists}</td>
                            <td className="text-right py-2">{season.points}</td>
                            <td className="text-right py-2">{season.plus_minus}</td>
                            <td className="text-right py-2">{season.penalty_minutes}</td>
                            <td className="text-right py-2">{season.powerplay_points}</td>
                            <td className="text-right py-2">{season.shorthanded_points}</td>
                            <td className="text-right py-2">{season.game_winning_goals}</td>
                          </>
                        ) : (
                          <>
                            <td className="text-right py-2">{season.wins}</td>
                            <td className="text-right py-2">{season.losses}</td>
                            <td className="text-right py-2">{season.overtime_losses}</td>
                            <td className="text-right py-2">{season.shutouts}</td>
                            <td className="text-right py-2">{season.save_percentage?.toFixed(3)}</td>
                            <td className="text-right py-2">{season.goals_against_average?.toFixed(2)}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No career statistics available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
