import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, User, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlayerRecord {
  player_name: string;
  team_name: string;
  season_year: number;
  value: number;
  position: string;
}

interface TeamRecord {
  team_name: string;
  season_year: number;
  value: number;
}

export function RecordsTab() {
  const [playerRecords, setPlayerRecords] = useState<{[key: string]: PlayerRecord[]}>({});
  const [teamRecords, setTeamRecords] = useState<{[key: string]: TeamRecord[]}>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Fetch player records from season stats
        const { data: playerStats, error: playerError } = await supabase
          .from('player_season_stats')
          .select(`
            goals,
            assists,
            points,
            shots,
            games_played,
            penalty_minutes,
            season_year,
            player:players(first_name, last_name, player_position),
            team:teams(name, city)
          `)
          .order('points', { ascending: false });

        if (playerError) throw playerError;

        // Fetch team records from standings
        const { data: teamStats, error: teamError } = await supabase
          .from('team_standings')
          .select(`
            wins,
            losses,
            points,
            goals_for,
            goals_against,
            season_year,
            team:teams(name, city)
          `)
          .order('points', { ascending: false });

        if (teamError) throw teamError;

        // Process player records
        const processedPlayerRecords: {[key: string]: PlayerRecord[]} = {};
        
        // Goals leaders
        processedPlayerRecords.goals = (playerStats || [])
          .sort((a, b) => b.goals - a.goals)
          .slice(0, 10)
          .map(stat => ({
            player_name: `${stat.player.first_name} ${stat.player.last_name}`,
            team_name: `${stat.team.city} ${stat.team.name}`,
            season_year: stat.season_year,
            value: stat.goals,
            position: stat.player.player_position
          }));

        // Points leaders
        processedPlayerRecords.points = (playerStats || [])
          .sort((a, b) => (b.points || 0) - (a.points || 0))
          .slice(0, 10)
          .map(stat => ({
            player_name: `${stat.player.first_name} ${stat.player.last_name}`,
            team_name: `${stat.team.city} ${stat.team.name}`,
            season_year: stat.season_year,
            value: stat.points || 0,
            position: stat.player.player_position
          }));

        // Process team records
        const processedTeamRecords: {[key: string]: TeamRecord[]} = {};
        
        // Most wins
        processedTeamRecords.wins = (teamStats || [])
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 10)
          .map(stat => ({
            team_name: `${stat.team.city} ${stat.team.name}`,
            season_year: stat.season_year,
            value: stat.wins
          }));

        // Most points
        processedTeamRecords.points = (teamStats || [])
          .sort((a, b) => (b.points || 0) - (a.points || 0))
          .slice(0, 10)
          .map(stat => ({
            team_name: `${stat.team.city} ${stat.team.name}`,
            season_year: stat.season_year,
            value: stat.points || 0
          }));

        setPlayerRecords(processedPlayerRecords);
        setTeamRecords(processedTeamRecords);
      } catch (error) {
        console.error('Error fetching records:', error);
        toast({
          title: "Error",
          description: "Failed to load records",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [toast]);

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-500" />
            League Records
          </h2>
          <p className="text-muted-foreground">All-time statistical leaders and achievements</p>
        </div>
      </div>

      <Tabs defaultValue="player" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="player">Player Records</TabsTrigger>
          <TabsTrigger value="team">Team Records</TabsTrigger>
        </TabsList>

        <TabsContent value="player" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Most Goals (Single Season)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playerRecords.goals?.length > 0 ? (
                  <div className="space-y-3">
                    {playerRecords.goals.slice(0, 5).map((record, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{record.player_name}</span>
                            <Badge variant="outline">{record.position}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {record.team_name} • {record.season_year}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold">
                          {record.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No records available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Most Points (Single Season)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playerRecords.points?.length > 0 ? (
                  <div className="space-y-3">
                    {playerRecords.points.slice(0, 5).map((record, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{record.player_name}</span>
                            <Badge variant="outline">{record.position}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {record.team_name} • {record.season_year}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold">
                          {record.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No records available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Most Wins (Single Season)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamRecords.wins?.length > 0 ? (
                  <div className="space-y-3">
                    {teamRecords.wins.slice(0, 5).map((record, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="font-semibold">{record.team_name}</span>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {record.season_year} Season
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold">
                          {record.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No records available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Most Points (Single Season)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamRecords.points?.length > 0 ? (
                  <div className="space-y-3">
                    {teamRecords.points.slice(0, 5).map((record, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="font-semibold">{record.team_name}</span>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {record.season_year} Season
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold">
                          {record.value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No records available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}