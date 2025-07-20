import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Shuffle, Download, Trash2, AlertTriangle, Trophy } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateHeight, generateWeight, formatHeight, formatWeight } from "@/lib/playerPhysicalUtils";

interface GeneratedPlayer {
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  player_position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  height: number;
  weight: number;
  league_id: string;
  team_id: string | null;
  status: 'active' | 'injured' | 'suspended' | 'retired';
  overall_rating: number;
  shooting: number;
  passing: number;
  defense: number;
  puck_control: number;
  checking: number;
  movement: number;
  vision: number;
  poise: number;
  aggressiveness: number;
  discipline: number;
  fighting: number;
  flexibility: number;
  injury: number;
  fatigue: number;
  rebound_control: number;
}

interface Team {
  id: string;
  name: string;
  city: string;
  league_id: string;
}

interface League {
  id: string;
  name: string;
}

export default function PlayerGenerator() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [playerCount, setPlayerCount] = useState(10);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(35);
  const [generatedPlayers, setGeneratedPlayers] = useState<GeneratedPlayer[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: leaguesData } = await supabase
        .from('leagues')
        .select('*')
        .order('name');

      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      setLeagues(leaguesData || []);
      setTeams(teamsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load leagues and teams",
        variant: "destructive"
      });
    }
  };

  const generateRandomPlayer = (league: League, teams: Team[], minAge: number, maxAge: number): GeneratedPlayer => {
    const positions: ('C' | 'LW' | 'RW' | 'D' | 'G')[] = ['C', 'LW', 'RW', 'D', 'G'];
    const position = positions[Math.floor(Math.random() * positions.length)];
    
    // Generate height and weight based on position
    const height = generateHeight(position);
    const weight = generateWeight(position, height);
    
    const firstNamePool = [
      "Connor", "Nathan", "Tyler", "Ryan", "Alex", "Jake", "Logan", "Owen", "Ethan", "Liam",
      "Mason", "Noah", "Lucas", "Jackson", "Aiden", "Jack", "Hunter", "Carter", "Caleb", "Dylan",
      "Brady", "Landon", "Cole", "Blake", "Brayden", "Austin", "Gavin", "Parker", "Wyatt", "Carson"
    ];
    
    const lastNamePool = [
      "Anderson", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Moore", "Taylor",
      "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez",
      "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King", "Wright", "Lopez"
    ];

    const nationalityPool = [
      { name: "Canada", weight: 45 },
      { name: "USA", weight: 25 },
      { name: "Sweden", weight: 8 },
      { name: "Finland", weight: 6 },
      { name: "Russia", weight: 5 },
      { name: "Czech Republic", weight: 4 },
      { name: "Slovakia", weight: 3 },
      { name: "Germany", weight: 2 },
      { name: "Switzerland", weight: 2 }
    ];

    // Weighted nationality selection
    const totalWeight = nationalityPool.reduce((sum, nat) => sum + nat.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    let selectedNationality = "Canada";

    for (const nat of nationalityPool) {
      randomWeight -= nat.weight;
      if (randomWeight <= 0) {
        selectedNationality = nat.name;
        break;
      }
    }

    // Generate base attributes (25-99 range)
    const generateAttribute = () => Math.floor(Math.random() * 75) + 25;

    // Position-specific attribute adjustments
    let attributes = {
      shooting: generateAttribute(),
      passing: generateAttribute(),
      defense: generateAttribute(),
      puck_control: generateAttribute(),
      checking: generateAttribute(),
      movement: generateAttribute(),
      vision: generateAttribute(),
      poise: generateAttribute(),
      aggressiveness: generateAttribute(),
      discipline: generateAttribute(),
      fighting: generateAttribute(),
      flexibility: generateAttribute(),
      injury: generateAttribute(),
      fatigue: generateAttribute(),
      rebound_control: generateAttribute(),
    };

    // Adjust attributes based on position
    switch (position) {
      case 'G': // Goalies
        attributes.rebound_control += Math.floor(Math.random() * 20);
        attributes.poise += Math.floor(Math.random() * 15);
        attributes.movement += Math.floor(Math.random() * 10);
        break;
      case 'D': // Defensemen
        attributes.defense += Math.floor(Math.random() * 20);
        attributes.checking += Math.floor(Math.random() * 15);
        attributes.poise += Math.floor(Math.random() * 10);
        break;
      case 'C': // Centers
        attributes.passing += Math.floor(Math.random() * 15);
        attributes.vision += Math.floor(Math.random() * 15);
        attributes.puck_control += Math.floor(Math.random() * 10);
        break;
      case 'LW':
      case 'RW': // Wingers
        attributes.shooting += Math.floor(Math.random() * 15);
        attributes.movement += Math.floor(Math.random() * 10);
        attributes.aggressiveness += Math.floor(Math.random() * 10);
        break;
    }

    // Cap all attributes at 99
    Object.keys(attributes).forEach(key => {
      attributes[key as keyof typeof attributes] = Math.min(99, attributes[key as keyof typeof attributes]);
    });

    // Calculate overall rating
    const overallRating = Math.round(
      Object.values(attributes).reduce((sum, val) => sum + val, 0) / Object.keys(attributes).length
    );

    return {
      first_name: firstNamePool[Math.floor(Math.random() * firstNamePool.length)],
      last_name: lastNamePool[Math.floor(Math.random() * lastNamePool.length)],
      age: Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge,
      nationality: selectedNationality,
      player_position: position,
      height,
      weight,
      league_id: league.id,
      team_id: null,
      status: 'active' as const,
      overall_rating: overallRating,
      ...attributes
    };
  };

  const handleGeneratePlayers = () => {
    if (!selectedLeague) return;

    console.log('Generating players with settings:', {
      count: playerCount,
      minAge,
      maxAge,
      league: selectedLeague.name
    });

    const newPlayers: GeneratedPlayer[] = [];
    
    for (let i = 0; i < playerCount; i++) {
      const player = generateRandomPlayer(selectedLeague, teams, minAge, maxAge);
      newPlayers.push(player);
    }

    console.log('Generated players sample:', newPlayers.slice(0, 3));
    setGeneratedPlayers(newPlayers);
    
    toast({
      title: "Players Generated",
      description: `Generated ${playerCount} players for ${selectedLeague.name}`
    });
  };

  const handleSavePlayers = async () => {
    if (generatedPlayers.length === 0) return;

    setSaving(true);
    try {
      console.log('Saving players to database:', generatedPlayers.length);
      
      const { data, error } = await supabase
        .from('players')
        .insert(generatedPlayers.map(player => ({
          first_name: player.first_name,
          last_name: player.last_name,
          age: player.age,
          nationality: player.nationality,
          player_position: player.player_position,
          height: player.height,
          weight: player.weight,
          league_id: player.league_id,
          team_id: player.team_id,
          status: player.status,
          overall_rating: player.overall_rating,
          shooting: player.shooting,
          passing: player.passing,
          defense: player.defense,
          puck_control: player.puck_control,
          checking: player.checking,
          movement: player.movement,
          vision: player.vision,
          poise: player.poise,
          aggressiveness: player.aggressiveness,
          discipline: player.discipline,
          fighting: player.fighting,
          flexibility: player.flexibility,
          injury: player.injury,
          fatigue: player.fatigue,
          rebound_control: player.rebound_control
        })))
        .select();

      if (error) {
        console.error('Error saving players:', error);
        throw error;
      }

      console.log('Players saved successfully:', data?.length);

      toast({
        title: "Success",
        description: `${generatedPlayers.length} players saved to ${selectedLeague?.name}`
      });

      setGeneratedPlayers([]);
    } catch (error: any) {
      console.error('Error saving players:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save players",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAll = () => {
    setDeleteAllOpen(true);
  };

  const confirmDeleteAll = () => {
    setGeneratedPlayers([]);
    setDeleteAllOpen(false);
    toast({
      title: "Players Cleared",
      description: "All generated players have been cleared"
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Player Generator</h1>
            <p className="text-muted-foreground">Generate and save new players to the database</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            {generatedPlayers.length} Players
          </Badge>
        </div>

        {/* Generation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              Generation Settings
            </CardTitle>
            <CardDescription>
              Configure the settings for generating new players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="league">League</Label>
                <Select value={selectedLeague?.id} onValueChange={(value) => {
                  const league = leagues.find(l => l.id === value) || null;
                  setSelectedLeague(league);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a league" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.map(league => (
                      <SelectItem key={league.id} value={league.id}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="playerCount">Player Count</Label>
                <Input
                  id="playerCount"
                  type="number"
                  min="1"
                  max="50"
                  value={playerCount}
                  onChange={(e) => setPlayerCount(parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageRange">Age Range</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="16"
                    max="40"
                    placeholder="Min Age"
                    value={minAge}
                    onChange={(e) => setMinAge(parseInt(e.target.value))}
                  />
                  <Input
                    type="number"
                    min="16"
                    max="40"
                    placeholder="Max Age"
                    value={maxAge}
                    onChange={(e) => setMaxAge(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleGeneratePlayers}
              className="mt-4 btn-hockey"
              disabled={!selectedLeague}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Generate Players
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {generatedPlayers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Generated Players Preview ({generatedPlayers.length})
              </CardTitle>
              <CardDescription>
                Review the generated players before saving to the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Showing first 10 players
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSavePlayers}
                      disabled={saving}
                      className="btn-hockey"
                    >
                      {saving ? "Saving..." : "Save All Players"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteAllOpen(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedPlayers.slice(0, 10).map((player, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-semibold">
                              {player.first_name} {player.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {player.nationality} • Age {player.age}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {player.player_position}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Height:</span>
                            <span className="ml-1">{formatHeight(player.height)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="ml-1">{formatWeight(player.weight)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span className="text-sm font-medium">
                            Overall: {player.overall_rating}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1 text-xs">
                          <div>
                            <span className="text-muted-foreground">Shoot:</span>
                            <span className="ml-1">{player.shooting}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Pass:</span>
                            <span className="ml-1">{player.passing}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Def:</span>
                            <span className="ml-1">{player.defense}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {generatedPlayers.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground">
                    ... and {generatedPlayers.length - 10} more players
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Clear All Players
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clear all generated players? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteAll}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
