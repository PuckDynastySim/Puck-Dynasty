import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsTable } from "./StatsTable";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function ScheduleTab() {
  const [view, setView] = useState("upcoming");

  const { data: games, isLoading } = useQuery({
    queryKey: ["schedule", view],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from("games")
        .select(`
          *,
          home_teams:teams!home_team_id(name, city, abbreviation),
          away_teams:teams!away_team_id(name, city, abbreviation),
          leagues(name, league_type)
        `)
        .order("game_date", { ascending: view === "upcoming" });

      if (view === "upcoming") {
        query = query.gte("game_date", today);
      } else {
        query = query.lt("game_date", today);
      }

      query = query.limit(50);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string, homeScore?: number, awayScore?: number) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="secondary">Live</Badge>;
      case "completed":
        return <Badge variant="default">Final</Badge>;
      case "postponed":
        return <Badge variant="destructive">Postponed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns = [
    { key: "date", label: "Date", sortable: true },
    { key: "time", label: "Time", sortable: true },
    { key: "away_team", label: "Away", sortable: true },
    { key: "home_team", label: "Home", sortable: true },
    { key: "score", label: "Score", sortable: false },
    { key: "status", label: "Status", sortable: true },
    { key: "league", label: "League", sortable: true },
  ];

  const formatRowData = (data: any[]) => {
    return data.map((game) => ({
      date: format(new Date(game.game_date), "MMM dd"),
      time: game.game_time ? format(new Date(`2000-01-01T${game.game_time}`), "h:mm a") : "TBD",
      away_team: `${game.away_teams.city} ${game.away_teams.name}`,
      home_team: `${game.home_teams.city} ${game.home_teams.name}`,
      score: game.status === "completed" 
        ? `${game.away_score} - ${game.home_score}`
        : game.status === "in_progress"
        ? `${game.away_score} - ${game.home_score}`
        : "-",
      status: getStatusBadge(game.status, game.home_score, game.away_score),
      league: game.leagues.name,
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Game Schedule</CardTitle>
          <CardDescription>
            Upcoming games and recent results across all leagues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={view} onValueChange={setView}>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="recent">Recent Results</TabsTrigger>
            </TabsList>

            <TabsContent value={view} className="mt-6">
              <StatsTable
                data={games ? formatRowData(games) : []}
                columns={columns}
                isLoading={isLoading}
                searchPlaceholder="Search teams..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}