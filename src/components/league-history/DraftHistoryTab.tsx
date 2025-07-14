import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Hash, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DraftPick {
  id: string;
  draft_year: number;
  draft_round: number;
  pick_number: number;
  overall_pick: number;
  draft_position: string;
  player_development_rating: number;
  player: {
    first_name: string;
    last_name: string;
    player_position: string;
    age: number;
    nationality: string;
  };
  team: {
    name: string;
    city: string;
    abbreviation: string;
  };
}

export function DraftHistoryTab() {
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedRound, setSelectedRound] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchDraftHistory = async () => {
      try {
        let query = supabase
          .from('draft_history')
          .select(`
            id,
            draft_year,
            draft_round,
            pick_number,
            overall_pick,
            draft_position,
            player_development_rating,
            player:players(first_name, last_name, player_position, age, nationality),
            team:teams(name, city, abbreviation)
          `)
          .order('draft_year', { ascending: false })
          .order('overall_pick');

        if (selectedYear !== "all") {
          query = query.eq('draft_year', parseInt(selectedYear));
        }

        if (selectedRound !== "all") {
          query = query.eq('draft_round', parseInt(selectedRound));
        }

        const { data, error } = await query;

        if (error) throw error;
        setDraftPicks(data || []);
      } catch (error) {
        console.error('Error fetching draft history:', error);
        toast({
          title: "Error",
          description: "Failed to load draft history",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDraftHistory();
  }, [selectedYear, selectedRound, toast]);

  const draftYears = [...new Set(draftPicks.map(pick => pick.draft_year))].sort((a, b) => b - a);
  const rounds = [...new Set(draftPicks.map(pick => pick.draft_round))].sort((a, b) => a - b);

  const getDevelopmentBadge = (rating: number) => {
    if (rating >= 80) return { variant: "default" as const, label: "Elite" };
    if (rating >= 70) return { variant: "secondary" as const, label: "High" };
    if (rating >= 60) return { variant: "outline" as const, label: "Good" };
    return { variant: "destructive" as const, label: "Bust" };
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(10)].map((_, i) => (
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
            <Users className="h-6 w-6 text-blue-500" />
            Draft History
          </h2>
          <p className="text-muted-foreground">Complete draft records and player development</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Draft Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {draftYears.filter(year => year && !isNaN(year)).map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedRound} onValueChange={setSelectedRound}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Round" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rounds</SelectItem>
            {rounds.filter(round => round && !isNaN(round)).map(round => (
              <SelectItem key={round} value={round.toString()}>
                Round {round}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {draftPicks.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Draft Data Found</CardTitle>
            <CardDescription>
              {selectedYear !== "all" || selectedRound !== "all" 
                ? "No draft picks match your current filters" 
                : "No draft history available yet"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {draftPicks.map((pick) => {
            const developmentBadge = getDevelopmentBadge(pick.player_development_rating);
            
            return (
              <Card key={pick.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        <span className="font-bold text-lg">#{pick.overall_pick}</span>
                        <Badge variant="outline">
                          Round {pick.draft_round}, Pick {pick.pick_number}
                        </Badge>
                        <Badge variant="secondary">{pick.draft_year}</Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                          {pick.player.first_name} {pick.player.last_name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{pick.player.player_position}</Badge>
                          <span>Age {pick.player.age}</span>
                          <span>•</span>
                          <span>{pick.player.nationality}</span>
                        </div>
                      </div>

                      <p className="text-sm">
                        Drafted by: <span className="font-medium">
                          {pick.team.city} {pick.team.name} ({pick.team.abbreviation})
                        </span>
                      </p>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <Badge variant={developmentBadge.variant}>
                          {developmentBadge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Development: {pick.player_development_rating}/100
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}