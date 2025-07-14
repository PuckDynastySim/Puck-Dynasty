import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsTable } from "./StatsTable";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function PowerRankingsTab() {
  const { data: rankings, isLoading } = useQuery({
    queryKey: ["power-rankings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("power_rankings")
        .select(`
          *,
          teams!inner(name, city, abbreviation),
          leagues(name)
        `)
        .order("ranking", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const getTrendIcon = (trend: string, ranking: number, previousRanking?: number) => {
    if (!previousRanking) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    if (ranking < previousRanking) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (ranking > previousRanking) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRankingChange = (ranking: number, previousRanking?: number) => {
    if (!previousRanking) return "-";
    
    const change = previousRanking - ranking;
    if (change > 0) return `+${change}`;
    if (change < 0) return change.toString();
    return "-";
  };

  const columns = [
    { key: "ranking", label: "Rank", sortable: true },
    { key: "trend", label: "Trend", sortable: false },
    { key: "team", label: "Team", sortable: true },
    { key: "rating_score", label: "Rating", sortable: true },
    { key: "change", label: "Change", sortable: true },
    { key: "previous_ranking", label: "Last Week", sortable: true },
    { key: "league", label: "League", sortable: true },
  ];

  const formatRowData = (data: any[]) => {
    return data.map((ranking) => ({
      ranking: ranking.ranking,
      trend: getTrendIcon(ranking.trend, ranking.ranking, ranking.previous_ranking),
      team: `${ranking.teams.city} ${ranking.teams.name}`,
      rating_score: ranking.rating_score.toFixed(2),
      change: getRankingChange(ranking.ranking, ranking.previous_ranking),
      previous_ranking: ranking.previous_ranking || "-",
      league: ranking.leagues?.name || "Unknown",
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Power Rankings</CardTitle>
          <CardDescription>
            Algorithm-based team rankings with weekly trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rankings && rankings.length > 0 ? (
            <StatsTable
              data={formatRowData(rankings)}
              columns={columns}
              isLoading={isLoading}
              searchPlaceholder="Search teams..."
            />
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Power Rankings Available</h3>
                <p className="text-sm">
                  Power rankings will be generated after games are played and statistics are available.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}