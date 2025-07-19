
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Wand2, Trash2, Save, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Coach {
  id?: string;
  first_name: string;
  last_name: string;
  nationality: string;
  offense_specialty: number;
  defense_specialty: number;
  powerplay_specialty: number;
  penalty_kill_specialty: number;
  line_management: number;
  motivation: number;
  league_id: string;
  team_id?: string;
}

interface League {
  id: string;
  name: string;
  league_type: string;
}

export default function CoachGenerator() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [generationCount, setGenerationCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const nationalities = ["Canada", "USA", "Sweden", "Finland", "Russia", "Czech Republic", "Slovakia"];

  useEffect(() => {
    loadLeagues();
  }, []);

  const loadLeagues = async () => {
    try {
      const { data: leaguesData, error } = await supabase
        .from('leagues')
        .select('*')
        .order('name');

      if (error) throw error;

      if (leaguesData) {
        setLeagues(leaguesData);
        // If there's only one league, select it automatically
        if (leaguesData.length === 1) {
          setSelectedLeague(leaguesData[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading leagues:', error);
      toast({
        title: "Error",
        description: "Failed to load leagues",
        variant: "destructive"
      });
    }
  };

  const generateRandomCoach = (): Omit<Coach, 'league_id'> => {
    const namesByNationality = {
      "Canada": {
        firstNames: ["Connor", "Tyler", "Jake", "Matt", "Ryan", "Brad", "Mike", "Steve", "Dave", "Mark", "Scott", "Kevin", "Jason", "Tom", "Dan"],
        lastNames: ["MacDonald", "Campbell", "Stewart", "Morrison", "Robertson", "Thomson", "Clark", "Lewis", "Walker", "Hall", "Smith", "Johnson", "Williams"]
      },
      "USA": {
        firstNames: ["Mike", "John", "Dave", "Steve", "Bob", "Tom", "Jim", "Dan", "Mark", "Paul", "Chris", "Kevin", "Justin", "Brad", "Scott"],
        lastNames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson"]
      },
      "Sweden": {
        firstNames: ["Erik", "Lars", "Mikael", "Henrik", "Niklas", "Viktor", "Patrik", "Magnus", "Sven", "Johan", "Anders", "Mats", "Per", "Stefan", "Ulf"],
        lastNames: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson", "Pettersson", "Jonsson"]
      },
      "Finland": {
        firstNames: ["Jani", "Mikko", "Jukka", "Ville", "Antti", "Sami", "Juha", "Timo", "Kari", "Pekka", "Mika", "Petri", "Risto", "Esa", "Jarmo"],
        lastNames: ["Koivu", "Selanne", "Kurri", "Rinne", "Rask", "Barkov", "Laine", "Aho", "Granlund", "Donskoi", "Vatanen", "Lehkonen", "Armia"]
      },
      "Russia": {
        firstNames: ["Alexander", "Sergei", "Dmitri", "Andrei", "Pavel", "Igor", "Evgeni", "Vladimir", "Alexei", "Nikolai", "Viktor", "Mikhail", "Oleg"],
        lastNames: ["Petrov", "Volkov", "Smirnov", "Popov", "Fedorov", "Morozov", "Kozlov", "Sokolov", "Lebedev", "Novikov", "Kuznetsov", "Orlov"]
      },
      "Czech Republic": {
        firstNames: ["Pavel", "Petr", "Jan", "Tomas", "Martin", "Jakub", "Michal", "David", "Lukas", "Ondrej", "Filip", "Patrik", "Radek"],
        lastNames: ["Dvorak", "Novak", "Svoboda", "Novotny", "Prochazka", "Krejci", "Havel", "Moravec", "Pokorny", "Pospisil", "Pastrnak", "Voracek"]
      },
      "Slovakia": {
        firstNames: ["Peter", "Martin", "Michal", "Tomas", "Jan", "Pavol", "Lukas", "Marek", "Juraj", "Stanislav", "Roman", "Miroslav", "Zdeno"],
        lastNames: ["Halak", "Hossa", "Gaborik", "Chara", "Sekera", "Tatar", "Cernak", "Fehervary", "Zigo", "Slafkovsky", "Nemec", "Ruzicka"]
      }
    };

    const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
    const names = namesByNationality[nationality as keyof typeof namesByNationality] || namesByNationality["Canada"];
    
    return {
      first_name: names.firstNames[Math.floor(Math.random() * names.firstNames.length)],
      last_name: names.lastNames[Math.floor(Math.random() * names.lastNames.length)],
      nationality,
      offense_specialty: Math.floor(Math.random() * 50) + 40,
      defense_specialty: Math.floor(Math.random() * 50) + 40,
      powerplay_specialty: Math.floor(Math.random() * 50) + 40,
      penalty_kill_specialty: Math.floor(Math.random() * 50) + 40,
      line_management: Math.floor(Math.random() * 50) + 40,
      motivation: Math.floor(Math.random() * 50) + 40,
    };
  };

  const generateCoaches = () => {
    if (!selectedLeague) {
      toast({
        title: "Error",
        description: "Please select a league first",
        variant: "destructive"
      });
      return;
    }

    const newCoaches = Array.from({ length: generationCount }, () => ({
      ...generateRandomCoach(),
      league_id: selectedLeague
    }));
    setCoaches(newCoaches);
    
    toast({
      title: "Coaches Generated",
      description: `Generated ${generationCount} coaches. Review and save if satisfied.`,
    });
  };

  const saveCoaches = async () => {
    if (!selectedLeague) {
      toast({
        title: "Error",
        description: "Please select a league",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Saving coaches:', coaches);
      
      const { data, error } = await supabase
        .from('coaches')
        .insert(coaches)
        .select('*');

      if (error) throw error;
      
      console log('Saved coaches:', data);

      toast({
        title: "Success",
        description: `${coaches.length} coaches saved to the league`,
      });
      
      setCoaches([]);
    } catch (error) {
      console.error('Error saving coaches:', error);
      toast({
        title: "Error",
        description: "Failed to save coaches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCoaches = () => {
    setCoaches([]);
    toast({
      title: "Coaches Cleared",
      description: "All generated coaches have been cleared",
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Coach Generator</h1>
            <p className="text-muted-foreground">Generate coaching staff for your simulation leagues</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <UserPlus className="w-4 h-4 mr-1" />
            Admin Tool
          </Badge>
        </div>

        {/* Generation Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Generation Settings
            </CardTitle>
            <CardDescription>Configure coach generation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="league">Target League</Label>
                {loading ? (
                  <div className="flex items-center justify-center p-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues.map((league) => (
                        <SelectItem key={league.id} value={league.id}>
                          {league.name} ({league.league_type.toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="count">Number of Coaches</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="50"
                  value={generationCount}
                  onChange={(e) => setGenerationCount(Number(e.target.value))}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={generateCoaches} className="w-full" disabled={!selectedLeague}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Coaches
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Coaches */}
        {coaches.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Coaches ({coaches.length})</CardTitle>
                  <CardDescription>Review the generated coaches before saving</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearCoaches}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                  <Button onClick={saveCoaches} disabled={loading || !selectedLeague}>
                    <Save className="w-4 h-4 mr-2" />
                    Save to League
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coaches.map((coach, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">{coach.first_name} {coach.last_name}</h4>
                        <p className="text-sm text-muted-foreground">{coach.nationality}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Offense:</span>
                          <span className="font-medium">{coach.offense_specialty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Defense:</span>
                          <span className="font-medium">{coach.defense_specialty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PP:</span>
                          <span className="font-medium">{coach.powerplay_specialty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PK:</span>
                          <span className="font-medium">{coach.penalty_kill_specialty}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lines:</span>
                          <span className="font-medium">{coach.line_management}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Motivation:</span>
                          <span className="font-medium">{coach.motivation}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
