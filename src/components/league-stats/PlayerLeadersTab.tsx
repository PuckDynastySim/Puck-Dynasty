import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsTable } from "./StatsTable";
import { supabase } from "@/integrations/supabase/client";

export function PlayerLeadersTab() {
  const [category, setCategory] = useState("points");

  const { data: playerStats, isLoading } = useQuery({
    queryKey: ["player-leaders", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_season_stats")
        .select(`
          *,
          players!inner(
            first_name,
            last_name,
            player_position
          ),
          teams!inner(
            name,
            city,
            abbreviation
          )
        `)
        .order(category, { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });

  const getColumns = (cat: string) => {
    const baseColumns = [
      { key: "rank", label: "Rank", sortable: false },
      { key: "player", label: "Player", sortable: true },
      { key: "position", label: "Pos", sortable: true },
      { key: "team", label: "Team", sortable: true },
      { key: "games_played", label: "GP", sortable: true },
    ];

    const categoryColumns = {
      points: [
        { key: "goals", label: "G", sortable: true },
        { key: "assists", label: "A", sortable: true },
        { key: "points", label: "PTS", sortable: true },
        { key: "plus_minus", label: "+/-", sortable: true },
      ],
      goals: [
        { key: "goals", label: "G", sortable: true },
        { key: "shots", label: "S", sortable: true },
        { key: "shooting_percentage", label: "S%", sortable: true },
        { key: "powerplay_goals", label: "PPG", sortable: true },
      ],
      assists: [
        { key: "assists", label: "A", sortable: true },
        { key: "powerplay_assists", label: "PPA", sortable: true },
        { key: "points", label: "PTS", sortable: true },
        { key: "plus_minus", label: "+/-", sortable: true },
      ],
      plusminus: [
        { key: "plus_minus", label: "+/-", sortable: true },
        { key: "goals", label: "G", sortable: true },
        { key: "assists", label: "A", sortable: true },
        { key: "points", label: "PTS", sortable: true },
      ],
      shots: [
        { key: "shots", label: "S", sortable: true },
        { key: "goals", label: "G", sortable: true },
        { key: "shooting_percentage", label: "S%", sortable: true },
        { key: "points", label: "PTS", sortable: true },
      ],
    };

    return [...baseColumns, ...categoryColumns[cat as keyof typeof categoryColumns]];
  };

  const formatRowData = (data: any[]) => {
    return data.map((player, index) => ({
      rank: index + 1,
      player: `${player.players.first_name} ${player.players.last_name}`,
      position: player.players.player_position,
      team: player.teams.abbreviation,
      games_played: player.games_played,
      goals: player.goals,
      assists: player.assists,
      points: player.points,
      plus_minus: player.plus_minus > 0 ? `+${player.plus_minus}` : player.plus_minus,
      shots: player.shots,
      shooting_percentage: `${player.shooting_percentage}%`,
      powerplay_goals: player.powerplay_goals,
      powerplay_assists: player.powerplay_assists,
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Player Leaders</CardTitle>
          <CardDescription>
            Top performing players across all statistical categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList>
              <TabsTrigger value="points">Points</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="assists">Assists</TabsTrigger>
              <TabsTrigger value="plus_minus">+/-</TabsTrigger>
              <TabsTrigger value="shots">Shots</TabsTrigger>
            </TabsList>

            <TabsContent value={category} className="mt-6">
              <StatsTable
                data={playerStats ? formatRowData(playerStats) : []}
                columns={getColumns(category)}
                isLoading={isLoading}
                searchPlaceholder="Search players..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}