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
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Zap, Trophy, Users, Loader2 } from "lucide-react";

const PlayerGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playerCount, setPlayerCount] = useState(30);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const { toast } = useToast();

  const positions = [
    { value: "C", label: "Center", min: 4, max: 6 },
    { value: "LW", label: "Left Wing", min: 4, max: 6 },
    { value: "RW", label: "Right Wing", min: 4, max: 6 },
    { value: "D", label: "Defense", min: 6, max: 8 },
    { value: "G", label: "Goalie", min: 2, max: 3 }
  ];

  const generateRandomPlayer = (position: string) => {
    const firstNames = [
      "Connor", "Nathan", "Tyler", "Brandon", "Alex", "Ryan", "Jake", "Matt", "David", "Mike",
      "Chris", "Kevin", "Justin", "Brad", "Scott", "Jason", "Mark", "Steve", "Dan", "Tom",
      "Erik", "Lars", "Mikael", "Henrik", "Niklas", "Viktor", "Patrik", "Magnus", "Sven", "Johan"
    ];
    
    const lastNames = [
      "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
      "Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson",
      "MacDonald", "Campbell", "Stewart", "Morrison", "Robertson", "Thomson", "Clark", "Lewis", "Walker", "Hall"
    ];

    const nationalities = [
      "Canada", "USA", "Sweden", "Finland", "Russia", "Czech Republic", 
      "Slovakia", "Germany", "Switzerland", "Norway", "Denmark"
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
    const age = Math.floor(Math.random() * 15) + 18; // 18-32 years old

    // Generate realistic ratings based on position
    const baseRating = Math.floor(Math.random() * 30) + 50; // 50-80 base
    const variance = 15;

    const generateStat = (positionBonus = 0) => {
      return Math.max(25, Math.min(95, baseRating + positionBonus + Math.floor(Math.random() * variance) - variance/2));
    };

    let stats = {
      shooting: generateStat(),
      passing: generateStat(),
      defense: generateStat(),
      puck_control: generateStat(),
      checking: generateStat(),
      movement: generateStat(),
      vision: generateStat(),
      poise: generateStat(),
      aggressiveness: generateStat(),
      discipline: generateStat(),
      fighting: generateStat(),
      flexibility: generateStat(),
      injury_resistance: generateStat(),
      fatigue: generateStat(),
      rebound_control: position === 'G' ? generateStat(20) : generateStat(-10)
    };

    // Position-specific adjustments
    if (position === 'G') {
      stats.rebound_control = generateStat(25);
      stats.poise = generateStat(15);
      stats.flexibility = generateStat(20);
      stats.shooting = generateStat(-20);
      stats.checking = generateStat(-30);
    } else if (position === 'D') {
      stats.defense = generateStat(15);
      stats.checking = generateStat(10);
      stats.poise = generateStat(10);
    } else { // Forwards
      stats.shooting = generateStat(10);
      stats.puck_control = generateStat(10);
      stats.movement = generateStat(5);
    }

    // Calculate overall rating
    const overallRating = Math.round(
      Object.values(stats).reduce((sum: number, stat: number) => sum + stat, 0) / Object.values(stats).length
    );

    return {
      first_name: firstName,
      last_name: lastName,
      age,
      nationality,
      player_position: position,
      overall_rating: overallRating,
      ...stats
    };
  };

  const generatePlayers = async () => {
    if (!selectedLeague) {
      toast({
        title: "Error",
        description: "Please select a league first",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      const players = [];
      let currentProgress = 0;

      // Generate players for each position
      for (const position of positions) {
        const count = Math.floor(playerCount * (position.min + position.max) / 2 / 25); // Distribute across positions
        
        for (let i = 0; i < count; i++) {
          const player = generateRandomPlayer(position.value);
          players.push({
            ...player,
            league_id: selectedLeague,
            team_id: selectedTeam || null,
            status: 'active'
          });
          
          currentProgress += 1;
          setProgress((currentProgress / playerCount) * 100);
          
          // Small delay to show progress
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      // Fill remaining slots with random positions
      while (players.length < playerCount) {
        const randomPosition = positions[Math.floor(Math.random() * positions.length)];
        const player = generateRandomPlayer(randomPosition.value);
        players.push({
          ...player,
          league_id: selectedLeague,
          team_id: selectedTeam || null,
          status: 'active'
        });
        
        currentProgress += 1;
        setProgress((currentProgress / playerCount) * 100);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Insert players into database
      const { error } = await supabase
        .from('players')
        .insert(players);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Generated ${players.length} players successfully`,
      });
      
      setProgress(100);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Player Generator</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Generation Form */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Generate Players
              </CardTitle>
              <CardDescription>
                Create realistic fictional players with detailed attributes for your league
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

              <div className="space-y-2">
                <Label htmlFor="team">Team (Optional)</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to specific team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Free Agents</SelectItem>
                    <SelectItem value="team-1">Toronto Maple Leafs</SelectItem>
                    <SelectItem value="team-2">Montreal Canadiens</SelectItem>
                    <SelectItem value="team-3">Boston Bruins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count">Number of Players</Label>
                <Input
                  id="count"
                  type="number"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(parseInt(e.target.value) || 30)}
                  min={1}
                  max={1000}
                />
              </div>

              {generating && (
                <div className="space-y-2">
                  <Label>Generation Progress</Label>
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">
                    Generating realistic players... {Math.round(progress)}%
                  </p>
                </div>
              )}

              <Button 
                onClick={generatePlayers} 
                className="w-full btn-hockey"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Players...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate {playerCount} Players
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Position Distribution */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Position Distribution
              </CardTitle>
              <CardDescription>
                Realistic hockey team composition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{position.value}</Badge>
                      <span className="font-medium">{position.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {position.min}-{position.max} per team
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Realistic Attributes</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                15+ detailed player attributes including shooting, defense, and position-specific skills
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">International Players</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Players from 11+ hockey nations with culturally appropriate names
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-team-gold" />
                <h3 className="font-semibold">Smart Generation</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Position-specific attribute bonuses and realistic age distribution
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PlayerGenerator;