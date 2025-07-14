import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsTable } from "./StatsTable";
import { supabase } from "@/integrations/supabase/client";

export function GoalieLeadersTab() {
  const [category, setCategory] = useState("save_percentage");

  const { data: goalieStats, isLoading } = useQuery({
    queryKey: ["goalie-leaders", category],
    queryFn: async () => {
      // Get goalies aggregated from game stats
      const { data, error } = await supabase
        .from("goalie_game_stats")
        .select(`
          player_id,
          team_id,
          league_id,
          players!inner(
            first_name,
            last_name
          ),
          teams!inner(
            name,
            city,
            abbreviation
          )
        `);

      if (error) throw error;

      // Aggregate stats by player
      const aggregatedStats = data.reduce((acc: any, game: any) => {
        const playerId = game.player_id;
        if (!acc[playerId]) {
          acc[playerId] = {
            player_id: playerId,
            player: `${game.players.first_name} ${game.players.last_name}`,
            team: game.teams.abbreviation,
            games_played: 0,
            wins: 0,
            losses: 0,
            overtime_losses: 0,
            shots_faced: 0,
            saves: 0,
            goals_against: 0,
            shutouts: 0,
            save_percentage: 0,
            goals_against_average: 0,
          };
        }

        const stats = acc[playerId];
        stats.games_played += 1;
        stats.wins += game.win ? 1 : 0;
        stats.losses += game.loss ? 1 : 0;
        stats.overtime_losses += game.overtime_loss ? 1 : 0;
        stats.shots_faced += game.shots_faced;
        stats.saves += game.saves;
        stats.goals_against += game.goals_against;
        stats.shutouts += game.shutout ? 1 : 0;

        return acc;
      }, {});

      // Calculate percentages and averages
      Object.values(aggregatedStats).forEach((stats: any) => {
        stats.save_percentage = stats.shots_faced > 0 
          ? ((stats.saves / stats.shots_faced) * 100).toFixed(3)
          : "0.000";
        stats.goals_against_average = stats.games_played > 0
          ? (stats.goals_against / stats.games_played).toFixed(2)
          : "0.00";
      });

      return Object.values(aggregatedStats);
    },
  });

  const getColumns = (cat: string) => {
    const baseColumns = [
      { key: "rank", label: "Rank", sortable: false },
      { key: "player", label: "Player", sortable: true },
      { key: "team", label: "Team", sortable: true },
      { key: "games_played", label: "GP", sortable: true },
    ];

    const categoryColumns = {
      save_percentage: [
        { key: "save_percentage", label: "SV%", sortable: true },
        { key: "shots_faced", label: "SA", sortable: true },
        { key: "saves", label: "S", sortable: true },
        { key: "goals_against_average", label: "GAA", sortable: true },
      ],
      goals_against_average: [
        { key: "goals_against_average", label: "GAA", sortable: true },
        { key: "goals_against", label: "GA", sortable: true },
        { key: "save_percentage", label: "SV%", sortable: true },
        { key: "wins", label: "W", sortable: true },
      ],
      wins: [
        { key: "wins", label: "W", sortable: true },
        { key: "losses", label: "L", sortable: true },
        { key: "overtime_losses", label: "OTL", sortable: true },
        { key: "save_percentage", label: "SV%", sortable: true },
      ],
      shutouts: [
        { key: "shutouts", label: "SO", sortable: true },
        { key: "wins", label: "W", sortable: true },
        { key: "save_percentage", label: "SV%", sortable: true },
        { key: "goals_against_average", label: "GAA", sortable: true },
      ],
    };

    return [...baseColumns, ...categoryColumns[cat as keyof typeof categoryColumns]];
  };

  const formatRowData = (data: any[]) => {
    return data.map((goalie, index) => ({
      rank: index + 1,
      ...goalie,
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Goalie Leaders</CardTitle>
          <CardDescription>
            Top performing goalies across all statistical categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList>
              <TabsTrigger value="save_percentage">Save %</TabsTrigger>
              <TabsTrigger value="goals_against_average">GAA</TabsTrigger>
              <TabsTrigger value="wins">Wins</TabsTrigger>
              <TabsTrigger value="shutouts">Shutouts</TabsTrigger>
            </TabsList>

            <TabsContent value={category} className="mt-6">
              <StatsTable
                data={goalieStats ? formatRowData(goalieStats) : []}
                columns={getColumns(category)}
                isLoading={isLoading}
                searchPlaceholder="Search goalies..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}