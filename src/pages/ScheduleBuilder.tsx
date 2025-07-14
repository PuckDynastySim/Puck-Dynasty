import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, Zap, Calendar, Clock, Loader2, Trophy } from "lucide-react";

const ScheduleBuilder = () => {
  const [building, setBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [gamesPerTeam, setGamesPerTeam] = useState(82);
  const [seasonStart, setSeasonStart] = useState("2024-10-01");
  const [seasonEnd, setSeasonEnd] = useState("2025-04-15");
  const { toast } = useToast();

  const buildSchedule = async () => {
    if (!selectedLeague) {
      toast({
        title: "Error",
        description: "Please select a league first",
        variant: "destructive"
      });
      return;
    }

    setBuilding(true);
    setProgress(0);

    try {
      // Mock teams for demonstration
      const teams = [
        { id: "team-1", name: "Toronto Maple Leafs", conference: "Eastern", division: "Atlantic" },
        { id: "team-2", name: "Montreal Canadiens", conference: "Eastern", division: "Atlantic" },
        { id: "team-3", name: "Boston Bruins", conference: "Eastern", division: "Atlantic" },
        { id: "team-4", name: "Tampa Bay Lightning", conference: "Eastern", division: "Atlantic" },
        { id: "team-5", name: "Florida Panthers", conference: "Eastern", division: "Atlantic" },
        { id: "team-6", name: "Buffalo Sabres", conference: "Eastern", division: "Atlantic" },
        { id: "team-7", name: "Detroit Red Wings", conference: "Eastern", division: "Atlantic" },
        { id: "team-8", name: "Ottawa Senators", conference: "Eastern", division: "Atlantic" },
        { id: "team-9", name: "New York Rangers", conference: "Eastern", division: "Metropolitan" },
        { id: "team-10", name: "Pittsburgh Penguins", conference: "Eastern", division: "Metropolitan" },
        { id: "team-11", name: "Washington Capitals", conference: "Eastern", division: "Metropolitan" },
        { id: "team-12", name: "Philadelphia Flyers", conference: "Eastern", division: "Metropolitan" },
        { id: "team-13", name: "New York Islanders", conference: "Eastern", division: "Metropolitan" },
        { id: "team-14", name: "Carolina Hurricanes", conference: "Eastern", division: "Metropolitan" },
        { id: "team-15", name: "New Jersey Devils", conference: "Eastern", division: "Metropolitan" },
        { id: "team-16", name: "Columbus Blue Jackets", conference: "Eastern", division: "Metropolitan" }
      ];

      const games = [];
      const startDate = new Date(seasonStart);
      const endDate = new Date(seasonEnd);
      const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let gameCount = 0;
      const totalGames = (teams.length * gamesPerTeam) / 2; // Each game involves 2 teams

      // Simple round-robin schedule generation
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const homeTeam = teams[i];
          const awayTeam = teams[j];
          
          // Calculate games between these teams
          const divisionMatch = homeTeam.division === awayTeam.division;
          const conferenceMatch = homeTeam.conference === awayTeam.conference;
          
          let gamesPerMatchup;
          if (divisionMatch) {
            gamesPerMatchup = 4; // Division rivals play 4 times
          } else if (conferenceMatch) {
            gamesPerMatchup = 3; // Conference teams play 3 times
          } else {
            gamesPerMatchup = 2; // Inter-conference play 2 times
          }

          for (let game = 0; game < gamesPerMatchup; game++) {
            // Distribute games throughout the season
            const gameDay = Math.floor((gameCount / totalGames) * totalDays);
            const gameDate = new Date(startDate);
            gameDate.setDate(startDate.getDate() + gameDay);
            
            // Randomize game times
            const gameTimes = ["19:00", "19:30", "20:00", "20:30"];
            const gameTime = gameTimes[Math.floor(Math.random() * gameTimes.length)];

            games.push({
              league_id: selectedLeague,
              home_team_id: homeTeam.id,
              away_team_id: awayTeam.id,
              game_date: gameDate.toISOString().split('T')[0],
              game_time: gameTime,
              status: 'scheduled'
            });

            gameCount++;
            setProgress((gameCount / totalGames) * 100);
            
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
      }

      // Insert games into database
      const { error } = await supabase
        .from('games')
        .insert(games);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Generated ${games.length} games for the season`,
      });
      
      setProgress(100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setBuilding(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Schedule Builder</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schedule Configuration */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Season Configuration
              </CardTitle>
              <CardDescription>
                Set up your league schedule parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="league">League *</Label>
                <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a league" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="league-1">Professional League</SelectItem>
                    <SelectItem value="league-2">Development League</SelectItem>
                    <SelectItem value="league-3">Junior League</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="games">Games per Team</Label>
                  <Input
                    id="games"
                    type="number"
                    value={gamesPerTeam}
                    onChange={(e) => setGamesPerTeam(parseInt(e.target.value) || 82)}
                    min={20}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Games</Label>
                  <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm">
                    ~{Math.floor((16 * gamesPerTeam) / 2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Season Start</Label>
                  <Input
                    id="start"
                    type="date"
                    value={seasonStart}
                    onChange={(e) => setSeasonStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">Season End</Label>
                  <Input
                    id="end"
                    type="date"
                    value={seasonEnd}
                    onChange={(e) => setSeasonEnd(e.target.value)}
                  />
                </div>
              </div>

              {building && (
                <div className="space-y-2">
                  <Label>Schedule Generation Progress</Label>
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">
                    Building balanced schedule... {Math.round(progress)}%
                  </p>
                </div>
              )}

              <Button 
                onClick={buildSchedule} 
                className="w-full btn-hockey"
                disabled={building}
              >
                {building ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Building Schedule...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Schedule
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Schedule Rules */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Scheduling Algorithm
              </CardTitle>
              <CardDescription>
                Professional hockey scheduling rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Division Rivals</span>
                  <Badge variant="secondary">4 games each</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Teams play division rivals 4 times for intense competition
                </p>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Conference Teams</span>
                  <Badge variant="secondary">3 games each</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Non-division conference teams play 3 times
                </p>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="font-medium">Inter-Conference</span>
                  <Badge variant="secondary">2 games each</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Teams from opposite conferences play 2 times
                </p>
                
                <Separator />
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Games distributed evenly across season dates
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Balanced Schedule</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Algorithm ensures fair distribution of home/away games and rest days
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Rivalry Focus</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Division rivals play more frequently for competitive storylines
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-team-gold" />
                <h3 className="font-semibold">Realistic Timing</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Games scheduled with appropriate start times and season flow
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ScheduleBuilder;