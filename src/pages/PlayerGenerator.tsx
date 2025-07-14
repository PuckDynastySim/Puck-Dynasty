import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Zap, Trophy, Users, Loader2, Shield, AlertCircle } from "lucide-react";

const PlayerGenerator = () => {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playerCount, setPlayerCount] = useState(30);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [leagues, setLeagues] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedLeagueData, setSelectedLeagueData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    const { data: leaguesData } = await supabase
      .from('leagues')
      .select('*')
      .order('name');
    setLeagues(leaguesData || []);
  };

  const handleLeagueChange = async (leagueId: string) => {
    setSelectedLeague(leagueId);
    setSelectedTeam("");
    
    const league = leagues.find(l => l.id === leagueId);
    setSelectedLeagueData(league);
    
    if (leagueId) {
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId)
        .order('name');
      setTeams(teamsData || []);
    } else {
      setTeams([]);
    }
  };

  const getAgeRange = (leagueType: string) => {
    switch (leagueType) {
      case 'pro':
        return { min: 18, max: 40 };
      case 'farm':
        return { min: 16, max: 35 };
      case 'junior':
        return { min: 16, max: 21 };
      default:
        return { min: 18, max: 40 };
    }
  };

  const positions = [
    { value: "C", label: "Center", min: 4, max: 6 },
    { value: "LW", label: "Left Wing", min: 4, max: 6 },
    { value: "RW", label: "Right Wing", min: 4, max: 6 },
    { value: "D", label: "Defense", min: 6, max: 8 },
    { value: "G", label: "Goalie", min: 2, max: 3 }
  ];

  const generateRandomPlayer = (position: string) => {
    const namesByNationality = {
      "Canada": {
        firstNames: ["Connor", "Tyler", "Jake", "Matt", "Ryan", "Brad", "Nathan", "Brandon", "Alex", "Kevin", "Justin", "Scott", "Jason", "Mark", "Steve", "Dan", "Tom", "Mike", "Chris", "David"],
        lastNames: ["MacDonald", "Campbell", "Stewart", "Morrison", "Robertson", "Thomson", "Clark", "Lewis", "Walker", "Hall", "Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson"]
      },
      "USA": {
        firstNames: ["Mike", "John", "Dave", "Steve", "Bob", "Tom", "Jim", "Dan", "Mark", "Paul", "Chris", "Kevin", "Justin", "Brad", "Scott", "Jason", "Tyler", "Ryan", "Alex", "Brandon"],
        lastNames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Garcia", "Martinez"]
      },
      "Sweden": {
        firstNames: ["Erik", "Lars", "Mikael", "Henrik", "Niklas", "Viktor", "Patrik", "Magnus", "Sven", "Johan", "Anders", "Mats", "Per", "Stefan", "Ulf", "Elias", "Filip", "Alexander", "William", "Oscar"],
        lastNames: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson", "Pettersson", "Jonsson", "Jansson", "Hansson", "Bengtsson", "Jorgensen"]
      },
      "Finland": {
        firstNames: ["Jani", "Mikko", "Jukka", "Ville", "Antti", "Sami", "Juha", "Timo", "Kari", "Pekka", "Mika", "Petri", "Risto", "Esa", "Jarmo", "Aleksi", "Eetu", "Kaapo", "Jesse", "Arttu"],
        lastNames: ["Koivu", "Selanne", "Kurri", "Rinne", "Rask", "Barkov", "Laine", "Aho", "Granlund", "Donskoi", "Vatanen", "Lehkonen", "Armia", "Heiskanen", "Kakko", "Lundell", "Puustinen"]
      },
      "Russia": {
        firstNames: ["Alexander", "Sergei", "Dmitri", "Andrei", "Pavel", "Igor", "Evgeni", "Vladimir", "Alexei", "Nikolai", "Viktor", "Mikhail", "Oleg", "Kirill", "Nikita", "Ivan", "Artem", "Roman", "Denis", "Maxim"],
        lastNames: ["Petrov", "Volkov", "Smirnov", "Popov", "Fedorov", "Morozov", "Kozlov", "Sokolov", "Lebedev", "Novikov", "Kuznetsov", "Orlov", "Ovechkin", "Malkin", "Kucherov", "Panarin", "Vasilevskiy"]
      },
      "Czech Republic": {
        firstNames: ["Pavel", "Petr", "Jan", "Tomas", "Martin", "Jakub", "Michal", "David", "Lukas", "Ondrej", "Filip", "Patrik", "Radek", "Adam", "Matej", "Dominik", "Daniel", "Marek", "Vojtech"],
        lastNames: ["Dvorak", "Novak", "Svoboda", "Novotny", "Prochazka", "Krejci", "Havel", "Moravec", "Pokorny", "Pospisil", "Pastrnak", "Voracek", "Hertl", "Necas", "Zacha", "Rittich"]
      },
      "Slovakia": {
        firstNames: ["Peter", "Martin", "Michal", "Tomas", "Jan", "Pavol", "Lukas", "Marek", "Juraj", "Stanislav", "Roman", "Miroslav", "Zdeno", "Andrej", "Erik", "Samuel", "Adam", "Patrik"],
        lastNames: ["Halak", "Hossa", "Gaborik", "Chara", "Sekera", "Tatar", "Cernak", "Fehervary", "Zigo", "Slafkovsky", "Nemec", "Ruzicka", "Studenic", "Kelemen", "Chromiak", "Mesar"]
      },
      "Germany": {
        firstNames: ["Leon", "Tim", "Tobias", "Marcel", "Dominik", "Matthias", "Moritz", "Philipp", "Dennis", "Marco", "Yannic", "Korbinian", "Lukas", "Felix", "Maximilian", "Jonas", "Nico", "Tom"],
        lastNames: ["Draisaitl", "Kahun", "Rieder", "Goc", "Holzer", "Seidenberg", "Ehrhoff", "Sturm", "Krupp", "Muller", "Pfoser", "Reichel", "Seider", "Stutzle", "Michaelis", "Bokk"]
      },
      "Switzerland": {
        firstNames: ["Nino", "Roman", "Timo", "Nico", "Kevin", "Yannick", "Gaetan", "Damien", "Vincent", "Luca", "Sven", "Philipp", "Dean", "Marco", "Pius", "Noah", "Andres", "Joel"],
        lastNames: ["Niederreiter", "Josi", "Meier", "Hischier", "Fiala", "Weber", "Haas", "Brunner", "Praplan", "Kurashev", "Andrighetto", "Loeffel", "Kukan", "Berra", "Suter", "Rod"]
      },
      "Norway": {
        firstNames: ["Mats", "Andreas", "Patrick", "Mathis", "Thomas", "Jonas", "Martin", "Ole", "Kristian", "Henrik", "Lars", "Sondre", "Tobias", "Emil", "Alexander", "Marcus", "Even", "Markus"],
        lastNames: ["Zuccarello", "Martinsen", "Thoresen", "Olimb", "Vaagan", "Holos", "Nymo", "Forsberg", "Bonsaksen", "Rosseli", "Salsten", "Olsen", "Hansen", "Bjornstad", "Granberg"]
      },
      "Denmark": {
        firstNames: ["Lars", "Mikkel", "Frederik", "Nicklas", "Oliver", "Mathias", "Jannik", "Alexander", "Magnus", "Joachim", "Sebastian", "Nikolaj", "Rasmus", "Andreas", "Malte", "Mads", "Emil"],
        lastNames: ["Eller", "Boedker", "Andersen", "Jensen", "Bjorkstrand", "Bau", "Hansen", "Madsen", "Mortensen", "Ehlers", "Reimer", "From", "Askerov", "Olesen", "Larsen", "Nielsen"]
      }
    };

    const nationalities = [
      "Canada", "USA", "Sweden", "Finland", "Russia", "Czech Republic", 
      "Slovakia", "Germany", "Switzerland", "Norway", "Denmark"
    ];

    const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
    const names = namesByNationality[nationality as keyof typeof namesByNationality] || namesByNationality["Canada"];
    
    const firstName = names.firstNames[Math.floor(Math.random() * names.firstNames.length)];
    const lastName = names.lastNames[Math.floor(Math.random() * names.lastNames.length)];
    
    // Age based on league type
    const ageRange = getAgeRange(selectedLeagueData?.league_type || 'pro');
    const age = Math.floor(Math.random() * (ageRange.max - ageRange.min + 1)) + ageRange.min;

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

    return {
      first_name: firstName,
      last_name: lastName,
      age,
      nationality,
      player_position: position,
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
            team_id: selectedTeam === 'free_agents' ? null : selectedTeam || null,
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
                <Select value={selectedLeague} onValueChange={handleLeagueChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a league" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.filter(league => league.id && league.id.trim()).map(league => (
                      <SelectItem key={league.id} value={league.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant={league.league_type === 'pro' ? 'default' : league.league_type === 'farm' ? 'secondary' : 'outline'}>
                            {league.league_type.toUpperCase()}
                          </Badge>
                          {league.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedLeagueData && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    Age range: {getAgeRange(selectedLeagueData.league_type).min}-{getAgeRange(selectedLeagueData.league_type).max} years
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team (Optional)</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to specific team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_agents">Free Agents</SelectItem>
                    {teams.filter(team => team.id && team.id.trim()).map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center gap-2">
                          {team.is_ai_controlled && (
                            <Badge variant="secondary" className="text-xs">AI</Badge>
                          )}
                          {team.city} {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Draft Eligibility Info */}
              {selectedLeagueData && (
                <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                  <h4 className="font-semibold text-info mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Draft Eligibility Rules
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {selectedLeagueData.league_type === 'pro' && (
                      <>
                        <div>• Players must be 18+ to be draft eligible</div>
                        <div>• Pro league allows ages 18-40</div>
                      </>
                    )}
                    {selectedLeagueData.league_type === 'farm' && (
                      <>
                        <div>• Farm league allows ages 16-35</div>
                        <div>• Linked to parent pro organization</div>
                      </>
                    )}
                    {selectedLeagueData.league_type === 'junior' && (
                      <>
                        <div>• Junior league: Ages 16-21 only</div>
                        <div>• Not draft eligible until age 18</div>
                        <div>• All teams are AI-controlled</div>
                      </>
                    )}
                  </div>
                </div>
              )}

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
                    <h3 className="font-semibold">Tiered League System</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Age-appropriate generation for Pro (18+), Farm (16+), and Junior (16-21) leagues
                  </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PlayerGenerator;