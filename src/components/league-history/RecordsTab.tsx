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
        const processedPlayerRecords: {[key: string]: PlayerRecord[]} = {};
        const processedTeamRecords: {[key: string]: TeamRecord[]} = {};
        
        // Fetch player records for goals
        const { data: goalRecords } = await supabase
          .from("player_season_stats")
          .select("goals, season_year, player_id, team_id")
          .order("goals", { ascending: false })
          .limit(10);

        if (goalRecords?.length > 0) {
          // Get player and team info for goal records
          const playerIds = [...new Set(goalRecords.map(r => r.player_id))];
          const teamIds = [...new Set(goalRecords.map(r => r.team_id))];
          
          const { data: players } = await supabase
            .from("players")
            .select("id, first_name, last_name, player_position")
            .in("id", playerIds);
            
          const { data: teams } = await supabase
            .from("teams")
            .select("id, city, name")
            .in("id", teamIds);

          processedPlayerRecords.goals = goalRecords
            .filter(record => record.goals > 0)
            .map(record => {
              const player = players?.find(p => p.id === record.player_id);
              const team = teams?.find(t => t.id === record.team_id);
              return {
                player_name: player ? `${player.first_name} ${player.last_name}` : 'Unknown Player',
                team_name: team ? `${team.city} ${team.name}` : 'Unknown Team',
                season_year: record.season_year,
                value: record.goals,
                position: player?.player_position || ''
              };
            });
        }

        // Fetch player records for points
        const { data: pointRecords } = await supabase
          .from("player_season_stats")
          .select("points, season_year, player_id, team_id")
          .order("points", { ascending: false })
          .limit(10);

        if (pointRecords?.length > 0) {
          // Get player and team info for point records
          const playerIds = [...new Set(pointRecords.map(r => r.player_id))];
          const teamIds = [...new Set(pointRecords.map(r => r.team_id))];
          
          const { data: players } = await supabase
            .from("players")
            .select("id, first_name, last_name, player_position")
            .in("id", playerIds);
            
          const { data: teams } = await supabase
            .from("teams")
            .select("id, city, name")
            .in("id", teamIds);

          processedPlayerRecords.points = pointRecords
            .filter(record => record.points && record.points > 0)
            .map(record => {
              const player = players?.find(p => p.id === record.player_id);
              const team = teams?.find(t => t.id === record.team_id);
              return {
                player_name: player ? `${player.first_name} ${player.last_name}` : 'Unknown Player',
                team_name: team ? `${team.city} ${team.name}` : 'Unknown Team',
                season_year: record.season_year,
                value: record.points || 0,
                position: player?.player_position || ''
              };
            });
        }

        // Fetch team records for wins
        const { data: winRecords } = await supabase
          .from("team_standings")
          .select("wins, season_year, team_id")
          .order("wins", { ascending: false })
          .limit(10);

        if (winRecords?.length > 0) {
          const teamIds = [...new Set(winRecords.map(r => r.team_id))];
          const { data: teams } = await supabase
            .from("teams")
            .select("id, city, name")
            .in("id", teamIds);

          processedTeamRecords.wins = winRecords
            .filter(record => record.wins > 0)
            .map(record => {
              const team = teams?.find(t => t.id === record.team_id);
              return {
                team_name: team ? `${team.city} ${team.name}` : 'Unknown Team',
                season_year: record.season_year,
                value: record.wins
              };
            });
        }

        // Fetch team records for points
        const { data: teamPointRecords } = await supabase
          .from("team_standings")
          .select("points, season_year, team_id")
          .order("points", { ascending: false })
          .limit(10);

        if (teamPointRecords?.length > 0) {
          const teamIds = [...new Set(teamPointRecords.map(r => r.team_id))];
          const { data: teams } = await supabase
            .from("teams")
            .select("id, city, name")
            .in("id", teamIds);

          processedTeamRecords.points = teamPointRecords
            .filter(record => record.points && record.points > 0)
            .map(record => {
              const team = teams?.find(t => t.id === record.team_id);
              return {
                team_name: team ? `${team.city} ${team.name}` : 'Unknown Team',
                season_year: record.season_year,
                value: record.points || 0
              };
            });
        }

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