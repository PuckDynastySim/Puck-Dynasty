import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Calendar, User, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  id: string;
  milestone_type: string;
  milestone_date: string;
  season_year: number;
  milestone_value: number;
  description: string;
  player: {
    first_name: string;
    last_name: string;
    player_position: string;
  };
}

const milestoneTypeLabels = {
  'first_goal': 'First Career Goal',
  'first_assist': 'First Career Assist',
  'first_point': 'First Career Point',
  '100_points': '100 Career Points',
  '200_points': '200 Career Points',
  '500_points': '500 Career Points',
  '100_goals': '100 Career Goals',
  '500_games': '500 Games Played',
  'hat_trick': 'Hat Trick',
  'shutout': 'Shutout',
  'game_winner': 'Game Winning Goal'
};

const milestoneColors = {
  'first_goal': 'bg-green-100 text-green-800',
  'first_assist': 'bg-blue-100 text-blue-800', 
  'first_point': 'bg-purple-100 text-purple-800',
  '100_points': 'bg-amber-100 text-amber-800',
  '200_points': 'bg-orange-100 text-orange-800',
  '500_points': 'bg-red-100 text-red-800',
  '100_goals': 'bg-emerald-100 text-emerald-800',
  '500_games': 'bg-indigo-100 text-indigo-800',
  'hat_trick': 'bg-yellow-100 text-yellow-800',
  'shutout': 'bg-cyan-100 text-cyan-800',
  'game_winner': 'bg-pink-100 text-pink-800'
};

export function MilestonesTab() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        let query = supabase
          .from('career_milestones')
          .select(`
            id,
            milestone_type,
            milestone_date,
            season_year,
            milestone_value,
            description,
            player:players(first_name, last_name, player_position)
          `)
          .order('milestone_date', { ascending: false });

        if (selectedType !== "all") {
          query = query.eq('milestone_type', selectedType);
        }

        if (selectedSeason !== "all") {
          query = query.eq('season_year', parseInt(selectedSeason));
        }

        const { data, error } = await query;

        if (error) throw error;
        setMilestones(data || []);
      } catch (error) {
        console.error('Error fetching milestones:', error);
        toast({
          title: "Error",
          description: "Failed to load career milestones",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [selectedType, selectedSeason, toast]);

  const seasons = [...new Set(milestones.map(milestone => milestone.season_year))].sort((a, b) => b - a);
  const milestoneTypes = [...new Set(milestones.map(milestone => milestone.milestone_type))];

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(6)].map((_, i) => (
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
            <Star className="h-6 w-6 text-yellow-500" />
            Career Milestones
          </h2>
          <p className="text-muted-foreground">Significant achievements and career moments</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by milestone type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Milestones</SelectItem>
            {milestoneTypes.map(type => (
              <SelectItem key={type} value={type}>
                {milestoneTypeLabels[type as keyof typeof milestoneTypeLabels] || type}
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

      {milestones.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Milestones Found</CardTitle>
            <CardDescription>
              {selectedType !== "all" || selectedSeason !== "all" 
                ? "No milestones match your current filters" 
                : "No career milestones recorded yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Career milestones like first goals, career point totals, and special achievements 
              will be tracked and displayed here as they occur during gameplay.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {milestones.map((milestone) => (
            <Card key={milestone.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <Badge 
                        variant="secondary"
                        className={milestoneColors[milestone.milestone_type as keyof typeof milestoneColors] || ''}
                      >
                        {milestoneTypeLabels[milestone.milestone_type as keyof typeof milestoneTypeLabels] || milestone.milestone_type}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-semibold">
                          {milestone.player.first_name} {milestone.player.last_name}
                        </span>
                        <Badge variant="outline">{milestone.player.player_position}</Badge>
                      </div>
                      
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{new Date(milestone.milestone_date).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline">{milestone.season_year} Season</Badge>
                    {milestone.milestone_value && (
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span className="text-sm font-semibold">{milestone.milestone_value}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}