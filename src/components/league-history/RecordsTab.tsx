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
        // Since the historical data relationships are still being set up,
        // we'll show placeholder data for now
        const processedPlayerRecords: {[key: string]: PlayerRecord[]} = {};
        const processedTeamRecords: {[key: string]: TeamRecord[]} = {};
        
        // Placeholder data for demonstration
        processedPlayerRecords.goals = [
          { player_name: "Sample Player 1", team_name: "Sample Team", season_year: 2024, value: 50, position: "C" },
          { player_name: "Sample Player 2", team_name: "Sample Team 2", season_year: 2024, value: 45, position: "RW" }
        ];
        
        processedPlayerRecords.points = [
          { player_name: "Sample Player 3", team_name: "Sample Team", season_year: 2024, value: 95, position: "C" },
          { player_name: "Sample Player 4", team_name: "Sample Team 3", season_year: 2024, value: 88, position: "LW" }
        ];
        
        processedTeamRecords.wins = [
          { team_name: "Sample Team", season_year: 2024, value: 58 },
          { team_name: "Sample Team 2", season_year: 2024, value: 55 }
        ];
        
        processedTeamRecords.points = [
          { team_name: "Sample Team", season_year: 2024, value: 125 },
          { team_name: "Sample Team 2", season_year: 2024, value: 118 }
        ];

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