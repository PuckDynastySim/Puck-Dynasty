import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Trophy, 
  Plus, 
  Users,
  MapPin,
  Shield,
  RefreshCw,
  Edit
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  division?: string;
  conference?: string;
  league_id: string;
  gm_user_id?: string;
  created_at: string;
  gm_name?: string;
  league_name?: string;
  player_count?: number;
}

interface League {
  id: string;
  name: string;
  league_type: string;
}

const NHL_TEAM_NAMES = [
  "Avalanche", "Blackhawks", "Blue Jackets", "Blues", "Bruins", "Canadiens",
  "Canucks", "Capitals", "Devils", "Ducks", "Flames", "Flyers", "Golden Knights",
  "Hurricanes", "Islanders", "Jets", "Kings", "Kraken", "Lightning", "Maple Leafs",
  "Oilers", "Panther", "Penguins", "Predators", "Rangers", "Red Wings", "Sabres",
  "Senators", "Sharks", "Stars", "Wild", "Coyotes"
];

const CITIES = [
  "Boston", "New York", "Chicago", "Los Angeles", "Philadelphia", "Toronto",
  "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg",
  "Detroit", "Tampa Bay", "Pittsburgh", "Washington", "Nashville", "Dallas",
  "St. Louis", "Colorado", "Arizona", "Carolina", "Florida", "Vegas",
  "Seattle", "Columbus", "New Jersey", "Buffalo", "San Jose", "Anaheim",
  "Minnesota", "Long Island"
];

const DIVISIONS = ["Atlantic", "Metropolitan", "Central", "Pacific"];
const CONFERENCES = ["Eastern", "Western"];

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const { toast } = useToast();

  const [newTeam, setNewTeam] = useState({
    name: "",
    city: "",
    abbreviation: "",
    division: "",
    conference: "",
    league_id: "",
    gm_user_id: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load teams with league and GM info
      const { data: teamsData } = await supabase
        .from('teams')
        .select(`
          *,
          leagues!teams_league_id_fkey(name)
        `);

      // Load leagues
      const { data: leaguesData } = await supabase
        .from('leagues')
        .select('*');

      // Load users with GM role
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select(`
          user_id
        `)
        .eq('role', 'gm');

      // Load profiles for GM users
      const { data: gmProfiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userRoles?.map(ur => ur.user_id) || []);

      // Load GM info for teams
      const { data: teamGMs } = await supabase
        .from('profiles')
        .select('*');

      // Load player counts per team
      const { data: playerCounts } = await supabase
        .from('players')
        .select('team_id')
        .not('team_id', 'is', null);

      const playerCountMap = playerCounts?.reduce((acc, p) => {
        acc[p.team_id] = (acc[p.team_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const enrichedTeams = teamsData?.map(team => {
        const gmProfile = teamGMs?.find(gm => gm.user_id === team.gm_user_id);
        return {
          ...team,
          gm_name: gmProfile?.display_name || gmProfile?.email || 'Unassigned',
          league_name: team.leagues?.name || 'Unknown League',
          player_count: playerCountMap[team.id] || 0
        };
      }) || [];

      setTeams(enrichedTeams);
      setLeagues(leaguesData || []);
      setUsers(gmProfiles || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomTeam = () => {
    const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
    const randomName = NHL_TEAM_NAMES[Math.floor(Math.random() * NHL_TEAM_NAMES.length)];
    const randomDivision = DIVISIONS[Math.floor(Math.random() * DIVISIONS.length)];
    const randomConference = CONFERENCES[Math.floor(Math.random() * CONFERENCES.length)];
    
    // Generate abbreviation from city and team name
    const cityAbbr = randomCity.slice(0, 2).toUpperCase();
    const nameAbbr = randomName.slice(0, 1).toUpperCase();
    const abbreviation = cityAbbr + nameAbbr;

    setNewTeam({
      ...newTeam,
      name: randomName,
      city: randomCity,
      abbreviation: abbreviation,
      division: randomDivision,
      conference: randomConference
    });
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.city || !newTeam.league_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('teams')
        .insert({
          name: newTeam.name,
          city: newTeam.city,
          abbreviation: newTeam.abbreviation || newTeam.name.slice(0, 3).toUpperCase(),
          division: newTeam.division || null,
          conference: newTeam.conference || null,
          league_id: newTeam.league_id,
          gm_user_id: newTeam.gm_user_id || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team created successfully"
      });

      setCreateTeamOpen(false);
      setNewTeam({
        name: "",
        city: "",
        abbreviation: "",
        division: "",
        conference: "",
        league_id: "",
        gm_user_id: ""
      });
      loadData();
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Team Management</h1>
            <p className="text-muted-foreground">Create teams, assign divisions, and manage GM assignments</p>
          </div>
          <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button className="btn-hockey">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Add a new team to a league with division and GM assignment
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="league">League *</Label>
                    <Select value={newTeam.league_id} onValueChange={(value) => setNewTeam({...newTeam, league_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select league" />
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
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={newTeam.city}
                      onChange={(e) => setNewTeam({...newTeam, city: e.target.value})}
                      placeholder="Boston"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Team Name *</Label>
                    <Input
                      id="name"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                      placeholder="Bruins"
                    />
                  </div>
                  <div>
                    <Label htmlFor="abbreviation">Abbreviation</Label>
                    <Input
                      id="abbreviation"
                      value={newTeam.abbreviation}
                      onChange={(e) => setNewTeam({...newTeam, abbreviation: e.target.value})}
                      placeholder="BOS"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="conference">Conference</Label>
                    <Select value={newTeam.conference} onValueChange={(value) => setNewTeam({...newTeam, conference: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select conference" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONFERENCES.map(conf => (
                          <SelectItem key={conf} value={conf}>
                            {conf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="division">Division</Label>
                    <Select value={newTeam.division} onValueChange={(value) => setNewTeam({...newTeam, division: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select division" />
                      </SelectTrigger>
                      <SelectContent>
                        {DIVISIONS.map(div => (
                          <SelectItem key={div} value={div}>
                            {div}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="gm">General Manager</Label>
                    <Select value={newTeam.gm_user_id} onValueChange={(value) => setNewTeam({...newTeam, gm_user_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select GM (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No GM (AI Controlled)</SelectItem>
                        {users.map(user => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.display_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomTeam}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate Random Team
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleCreateTeam} className="flex-1">
                  Create Team
                </Button>
                <Button variant="outline" onClick={() => setCreateTeamOpen(false)}>
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams with GMs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.filter(t => t.gm_user_id).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Controlled</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.filter(t => !t.gm_user_id).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Leagues</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leagues.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teams</CardTitle>
            <CardDescription>Manage all teams across leagues</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Conference</TableHead>
                  <TableHead>General Manager</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{team.city} {team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.abbreviation}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{team.league_name}</TableCell>
                    <TableCell>
                      {team.division ? (
                        <Badge variant="outline">{team.division}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {team.conference ? (
                        <Badge variant="outline">{team.conference}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {team.gm_user_id ? (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-primary" />
                          {team.gm_name}
                        </div>
                      ) : (
                        <Badge variant="secondary">AI Controlled</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {team.player_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}