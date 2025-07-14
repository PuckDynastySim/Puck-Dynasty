import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Champion {
  id: string;
  season_year: number;
  championship_date: string;
  playoff_series_length: number;
  champion_team: {
    name: string;
    city: string;
    abbreviation: string;
  };
  runner_up_team?: {
    name: string;
    city: string;
    abbreviation: string;
  };
}

export function ChampionsHistoryTab() {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const { data, error } = await supabase
          .from('season_champions')
          .select(`
            id,
            season_year,
            championship_date,
            playoff_series_length,
            champion_team:teams!season_champions_champion_team_id_fkey(name, city, abbreviation),
            runner_up_team:teams!season_champions_runner_up_team_id_fkey(name, city, abbreviation)
          `)
          .order('season_year', { ascending: false });

        if (error) throw error;
        setChampions(data || []);
      } catch (error) {
        console.error('Error fetching champions:', error);
        toast({
          title: "Error",
          description: "Failed to load championship history",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChampions();
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

  if (champions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Championship History
          </CardTitle>
          <CardDescription>No championship data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Championship winners will appear here once seasons are completed and archived.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Championship History
          </h2>
          <p className="text-muted-foreground">Complete record of league champions</p>
        </div>
        <Badge variant="secondary">{champions.length} Champions</Badge>
      </div>

      <div className="grid gap-4">
        {champions.map((champion) => (
          <Card key={champion.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {champion.season_year} Champions
                </CardTitle>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {champion.championship_date ? 
                    new Date(champion.championship_date).toLocaleDateString() :
                    `${champion.season_year} Season`
                  }
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-primary">
                    {champion.champion_team.city} {champion.champion_team.name}
                  </h3>
                  <Badge variant="secondary">{champion.champion_team.abbreviation}</Badge>
                </div>
                {champion.runner_up_team && (
                  <div className="text-right space-y-1">
                    <p className="text-sm text-muted-foreground">Runner-up</p>
                    <p className="font-medium">
                      {champion.runner_up_team.city} {champion.runner_up_team.name}
                    </p>
                  </div>
                )}
              </div>
              
              {champion.playoff_series_length && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {champion.playoff_series_length}-game championship series
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}