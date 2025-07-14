import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, User, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlayerAward {
  id: string;
  season_year: number;
  award_type: string;
  voting_points: number;
  player: {
    first_name: string;
    last_name: string;
    player_position: string;
  };
  team: {
    name: string;
    city: string;
    abbreviation: string;
  };
  stats_snapshot: any;
}

const awardTypeLabels = {
  'mvp': 'Most Valuable Player',
  'rookie_of_year': 'Rookie of the Year',
  'top_scorer': 'Leading Scorer',
  'best_defenseman': 'Best Defenseman',
  'best_goalie': 'Best Goaltender',
  'most_improved': 'Most Improved Player'
};

export function AwardsHistoryTab() {
  const [awards, setAwards] = useState<PlayerAward[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAward, setSelectedAward] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        let query = supabase
          .from('player_awards')
          .select(`
            id,
            season_year,
            award_type,
            voting_points,
            stats_snapshot,
            player:players(first_name, last_name, player_position),
            team:teams(name, city, abbreviation)
          `)
          .order('season_year', { ascending: false })
          .order('award_type');

        if (selectedAward !== "all") {
          query = query.eq('award_type', selectedAward);
        }

        if (selectedSeason !== "all") {
          query = query.eq('season_year', parseInt(selectedSeason));
        }

        const { data, error } = await query;

        if (error) throw error;
        setAwards(data || []);
      } catch (error) {
        console.error('Error fetching awards:', error);
        toast({
          title: "Error",
          description: "Failed to load awards history",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, [selectedAward, selectedSeason, toast]);

  const seasons = [...new Set(awards.map(award => award.season_year))].sort((a, b) => b - a);
  const awardTypes = [...new Set(awards.map(award => award.award_type))];

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
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
            <Award className="h-6 w-6 text-amber-500" />
            Award Winners
          </h2>
          <p className="text-muted-foreground">League award recipients by season</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={selectedAward} onValueChange={setSelectedAward}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by award" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Awards</SelectItem>
            {awardTypes.map(type => (
              <SelectItem key={type} value={type}>
                {awardTypeLabels[type as keyof typeof awardTypeLabels] || type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {seasons.map(season => (
              <SelectItem key={season} value={season.toString()}>
                {season}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {awards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Awards Found</CardTitle>
            <CardDescription>
              {selectedAward !== "all" || selectedSeason !== "all" 
                ? "No awards match your current filters" 
                : "No award data available yet"}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {awards.map((award) => (
            <Card key={award.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    {awardTypeLabels[award.award_type as keyof typeof awardTypeLabels] || award.award_type}
                  </CardTitle>
                  <Badge variant="outline">{award.season_year}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">
                        {award.player.first_name} {award.player.last_name}
                      </span>
                      <Badge variant="secondary">{award.player.player_position}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {award.team.city} {award.team.name} ({award.team.abbreviation})
                    </p>
                  </div>
                  {award.voting_points > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Voting Points</p>
                      <p className="font-semibold">{award.voting_points}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}