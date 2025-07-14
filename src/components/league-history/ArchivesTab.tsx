import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, Calendar, Users, Trophy, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SeasonArchive {
  id: string;
  season_year: number;
  start_date: string;
  end_date: string;
  status: string;
  total_games_played: number;
  total_players: number;
  archived_at: string;
  champion_team?: {
    name: string;
    city: string;
    abbreviation: string;
  };
}

export function ArchivesTab() {
  const [archives, setArchives] = useState<SeasonArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const { data, error } = await supabase
          .from('season_archives')
          .select(`
            id,
            season_year,
            start_date,
            end_date,
            status,
            total_games_played,
            total_players,
            archived_at,
            champion_team:teams(name, city, abbreviation)
          `)
          .order('season_year', { ascending: false });

        if (error) throw error;
        setArchives(data || []);
      } catch (error) {
        console.error('Error fetching archives:', error);
        toast({
          title: "Error",
          description: "Failed to load season archives",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchArchives();
  }, [toast]);

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
            <Archive className="h-6 w-6 text-purple-500" />
            Season Archives
          </h2>
          <p className="text-muted-foreground">Complete historical data from completed seasons</p>
        </div>
        <Badge variant="secondary">{archives.length} Archived Seasons</Badge>
      </div>

      {archives.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Archived Seasons</CardTitle>
            <CardDescription>
              Completed seasons will be archived here for historical reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              When seasons are marked as complete, they will appear in this archive with full statistical data, 
              playoff results, and championship information preserved for future reference.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {archives.map((archive) => (
            <Card key={archive.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {archive.season_year} Season
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={archive.status === 'completed' ? 'default' : 'secondary'}>
                      {archive.status}
                    </Badge>
                    {archive.champion_team && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        Champions: {archive.champion_team.abbreviation}
                      </Badge>
                    )}
                  </div>
                </div>
                {archive.start_date && archive.end_date && (
                  <CardDescription>
                    {new Date(archive.start_date).toLocaleDateString()} - {new Date(archive.end_date).toLocaleDateString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{archive.total_games_played}</p>
                    <p className="text-sm text-muted-foreground">Games Played</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{archive.total_players}</p>
                    <p className="text-sm text-muted-foreground">Total Players</p>
                  </div>
                  {archive.champion_team && (
                    <div className="text-center md:col-span-2">
                      <p className="font-semibold text-primary">
                        {archive.champion_team.city} {archive.champion_team.name}
                      </p>
                      <p className="text-sm text-muted-foreground">Season Champions</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Archive className="h-4 w-4" />
                    Archived: {new Date(archive.archived_at).toLocaleDateString()}
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}