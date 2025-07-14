import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsTable } from "./StatsTable";
import { supabase } from "@/integrations/supabase/client";

export function StandingsTab() {
  const [view, setView] = useState("overall");

  const { data: standings, isLoading } = useQuery({
    queryKey: ["standings", view],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_standings")
        .select(`
          *,
          teams!inner(
            name,
            city,
            abbreviation,
            division,
            conference,
            leagues!inner(name, league_type)
          )
        `)
        .order("points", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const columns = [
    { key: "rank", label: "Rank", sortable: false },
    { key: "team", label: "Team", sortable: true },
    { key: "games_played", label: "GP", sortable: true },
    { key: "wins", label: "W", sortable: true },
    { key: "losses", label: "L", sortable: true },
    { key: "overtime_losses", label: "OTL", sortable: true },
    { key: "points", label: "PTS", sortable: true },
    { key: "goals_for", label: "GF", sortable: true },
    { key: "goals_against", label: "GA", sortable: true },
    { key: "goal_differential", label: "DIFF", sortable: true },
  ];

  const formatRowData = (data: any[]) => {
    return data.map((team, index) => ({
      rank: index + 1,
      team: `${team.teams.city} ${team.teams.name}`,
      games_played: team.games_played,
      wins: team.wins,
      losses: team.losses,
      overtime_losses: team.overtime_losses,
      points: team.points,
      goals_for: team.goals_for,
      goals_against: team.goals_against,
      goal_differential: team.goal_differential > 0 ? `+${team.goal_differential}` : team.goal_differential,
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Standings</CardTitle>
          <CardDescription>
            Current standings for all teams across leagues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="division">By Division</TabsTrigger>
              <TabsTrigger value="conference">By Conference</TabsTrigger>
              <TabsTrigger value="league">By League</TabsTrigger>
            </TabsList>

            <TabsContent value="overall" className="mt-6">
              <StatsTable
                data={standings ? formatRowData(standings) : []}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search teams..."
              />
            </TabsContent>

            <TabsContent value="division" className="mt-6">
              <div className="text-center text-muted-foreground py-8">
                Division standings will be available when divisions are configured
              </div>
            </TabsContent>

            <TabsContent value="conference" className="mt-6">
              <div className="text-center text-muted-foreground py-8">
                Conference standings will be available when conferences are configured
              </div>
            </TabsContent>

            <TabsContent value="league" className="mt-6">
              <StatsTable
                data={standings ? formatRowData(standings) : []}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search teams..."
                groupBy="league"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}