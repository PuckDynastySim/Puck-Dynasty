import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsTable } from "./StatsTable";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export function InjuriesTab() {
  const { data: injuries, isLoading } = useQuery({
    queryKey: ["injuries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("player_injuries")
        .select(`
          *,
          players!inner(
            first_name,
            last_name,
            player_position,
            teams!inner(
              name,
              city,
              abbreviation
            )
          )
        `)
        .eq("is_active", true)
        .order("injury_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "minor":
        return <Badge variant="secondary">Minor</Badge>;
      case "moderate":
        return <Badge variant="outline">Moderate</Badge>;
      case "major":
        return <Badge variant="destructive">Major</Badge>;
      case "season-ending":
        return <Badge variant="destructive">Season-Ending</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const columns = [
    { key: "player", label: "Player", sortable: true },
    { key: "position", label: "Pos", sortable: true },
    { key: "team", label: "Team", sortable: true },
    { key: "injury_type", label: "Injury", sortable: true },
    { key: "severity", label: "Severity", sortable: true },
    { key: "injury_date", label: "Date", sortable: true },
    { key: "expected_return", label: "Expected Return", sortable: true },
  ];

  const formatRowData = (data: any[]) => {
    return data.map((injury) => ({
      player: `${injury.players.first_name} ${injury.players.last_name}`,
      position: injury.players.player_position,
      team: injury.players.teams.abbreviation,
      injury_type: injury.injury_type,
      severity: getSeverityBadge(injury.severity),
      injury_date: format(new Date(injury.injury_date), "MMM dd, yyyy"),
      expected_return: injury.expected_return_date 
        ? format(new Date(injury.expected_return_date), "MMM dd, yyyy")
        : "Unknown",
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Injuries</CardTitle>
          <CardDescription>
            Active player injuries across all leagues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatsTable
            data={injuries ? formatRowData(injuries) : []}
            columns={columns}
            isLoading={isLoading}
            searchPlaceholder="Search players..."
          />
        </CardContent>
      </Card>
    </div>
  );
}