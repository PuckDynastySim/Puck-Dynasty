import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { 
  Users, 
  Edit, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  UserX
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  player_position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  overall_rating: number;
  status: 'active' | 'injured' | 'suspended' | 'retired';
  team_id?: string;
  league_id: string;
  shooting?: number;
  passing?: number;
  defense?: number;
  puck_control?: number;
  checking?: number;
  movement?: number;
  vision?: number;
  poise?: number;
  aggressiveness?: number;
  discipline?: number;
  fighting?: number;
  flexibility?: number;
  injury_resistance?: number;
  fatigue?: number;
  rebound_control?: number;
  team_name?: string;
  team_city?: string;
  league_name?: string;
  league_type?: string;
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
  league_type: string;
}

export default function PlayerManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPlayerOpen, setEditPlayerOpen] = useState(false);
  const [deletePlayerOpen, setDeletePlayerOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    age: 18,
    nationality: "",
    player_position: "C" as 'C' | 'LW' | 'RW' | 'D' | 'G',
    status: "active" as 'active' | 'injured' | 'suspended' | 'retired',
    team_id: "",
    shooting: 50,
    passing: 50,
    defense: 50,
    puck_control: 50,
    checking: 50,
    movement: 50,
    vision: 50,
    poise: 50,
    aggressiveness: 50,
    discipline: 50,
    fighting: 50,
    flexibility: 50,
    injury_resistance: 50,
    fatigue: 50,
    rebound_control: 50,
  });

  const positions = ['C', 'LW', 'RW', 'D', 'G'];
  const nationalities = ["Canada", "USA", "Sweden", "Finland", "Russia", "Czech Republic", "Slovakia", "Germany", "Switzerland"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load players with team and league info
      const { data: playersData } = await supabase
        .from('players')
        .select(`
          *,
          teams(name, city, league_id),
          leagues(name, league_type)
        `)
        .order('last_name');

      // Load teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      // Load leagues
      const { data: leaguesData } = await supabase
        .from('leagues')
        .select('*')
        .order('name');

      const enrichedPlayers = playersData?.map(player => ({
        ...player,
        team_name: player.teams?.name,
        team_city: player.teams?.city,
        league_name: player.leagues?.name,
        league_type: player.leagues?.league_type,
      })) || [];

      setPlayers(enrichedPlayers);
      setTeams(teamsData || []);
      setLeagues(leaguesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load player data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setEditForm({
      first_name: player.first_name,
      last_name: player.last_name,
      age: player.age,
      nationality: player.nationality,
      player_position: player.player_position,
      status: player.status,
      team_id: player.team_id || "free_agents",
      shooting: player.shooting || 50,
      passing: player.passing || 50,
      defense: player.defense || 50,
      puck_control: player.puck_control || 50,
      checking: player.checking || 50,
      movement: player.movement || 50,
      vision: player.vision || 50,
      poise: player.poise || 50,
      aggressiveness: player.aggressiveness || 50,
      discipline: player.discipline || 50,
      fighting: player.fighting || 50,
      flexibility: player.flexibility || 50,
      injury_resistance: player.injury_resistance || 50,
      fatigue: player.fatigue || 50,
      rebound_control: player.rebound_control || 50,
    });
    setEditPlayerOpen(true);
  };

  const handleUpdatePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      // Debug log to catch potential UUID errors
      console.log('Updating player with team_id:', editForm.team_id);
      const updateData = {
        ...editForm,
        team_id: editForm.team_id === "free_agents" ? null : editForm.team_id
      };
      console.log('Final updateData.team_id:', updateData.team_id);
      
      const { error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', selectedPlayer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Player updated successfully"
      });

      setEditPlayerOpen(false);
      setSelectedPlayer(null);
      loadData();
    } catch (error) {
      console.error('Error updating player:', error);
      toast({
        title: "Error",
        description: "Failed to update player",
        variant: "destructive"
      });
    }
  };

  const handleDeletePlayer = (player: Player) => {
    setSelectedPlayer(player);
    setDeletePlayerOpen(true);
  };

  const confirmDeletePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', selectedPlayer.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Player deleted successfully"
      });

      setDeletePlayerOpen(false);
      setSelectedPlayer(null);
      loadData();
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive"
      });
    }
  };

  const filteredPlayers = players.filter(player => {
    const matchesSearch = `${player.first_name} ${player.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = !positionFilter || positionFilter === "all-positions" || player.player_position === positionFilter;
    const matchesTeam = !teamFilter || teamFilter === "all-teams" || 
      (teamFilter === "free_agents" ? !player.team_id : player.team_id === teamFilter);
    const matchesLeague = !leagueFilter || leagueFilter === "all-leagues" || player.league_id === leagueFilter;
    
    return matchesSearch && matchesPosition && matchesTeam && matchesLeague;
  });

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
            <h1 className="text-3xl font-bold">Player Management</h1>
            <p className="text-muted-foreground">Manage player rosters, attributes, and assignments</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <Users className="w-4 h-4 mr-1" />
            {filteredPlayers.length} Players
          </Badge>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Player</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-positions">All Positions</SelectItem>
                    {positions.map(pos => (
                      <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="league">League</Label>
                <Select value={leagueFilter} onValueChange={setLeagueFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All leagues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-leagues">All Leagues</SelectItem>
                    {leagues.map(league => (
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Select value={teamFilter} onValueChange={setTeamFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-teams">All Teams</SelectItem>
                    <SelectItem value="free_agents">Free Agents</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.city} {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setPositionFilter("");
                    setTeamFilter("");
                    setLeagueFilter("");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players Table */}
        <Card>
          <CardHeader>
            <CardTitle>Players ({filteredPlayers.length})</CardTitle>
            <CardDescription>Manage player information and attributes</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{player.first_name} {player.last_name}</div>
                        <div className="text-sm text-muted-foreground">{player.nationality}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{player.player_position}</Badge>
                    </TableCell>
                    <TableCell>{player.age}</TableCell>
                    <TableCell>
                      {player.team_name ? (
                        <div className="text-sm">
                          <div className="font-medium">{player.team_city} {player.team_name}</div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <UserX className="w-3 h-3" />
                          Free Agent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={player.league_type === 'pro' ? 'default' : player.league_type === 'farm' ? 'secondary' : 'outline'}>
                          {player.league_type?.toUpperCase()}
                        </Badge>
                        {player.league_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="font-medium">{player.overall_rating || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          player.status === 'active' ? 'default' : 
                          player.status === 'injured' ? 'destructive' : 
                          player.status === 'suspended' ? 'secondary' : 'outline'
                        }
                      >
                        {player.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditPlayer(player)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeletePlayer(player)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Player Dialog */}
        <Dialog open={editPlayerOpen} onOpenChange={setEditPlayerOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Player</DialogTitle>
              <DialogDescription>
                Update player information and attributes
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="16"
                      max="45"
                      value={editForm.age}
                      onChange={(e) => setEditForm({...editForm, age: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select value={editForm.player_position} onValueChange={(value: any) => setEditForm({...editForm, player_position: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map(pos => (
                          <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Select value={editForm.nationality} onValueChange={(value) => setEditForm({...editForm, nationality: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {nationalities.map(nat => (
                        <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value: any) => setEditForm({...editForm, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="injured">Injured</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="team">Team</Label>
                  <Select value={editForm.team_id} onValueChange={(value) => setEditForm({...editForm, team_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Free Agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free_agents">Free Agent</SelectItem>
                      {teams.filter(team => team.league_id === selectedPlayer?.league_id).map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.city} {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-4">
                <h3 className="font-semibold">Player Attributes</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    'shooting', 'passing', 'defense', 'puck_control', 'checking', 'movement',
                    'vision', 'poise', 'aggressiveness', 'discipline', 'fighting', 'flexibility',
                    'injury_resistance', 'fatigue', 'rebound_control'
                  ].map((attr) => (
                    <div key={attr}>
                      <Label htmlFor={attr} className="capitalize">
                        {attr.replace('_', ' ')}
                      </Label>
                      <Input
                        id={attr}
                        type="number"
                        min="25"
                        max="99"
                        value={editForm[attr as keyof typeof editForm] as number}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          [attr]: parseInt(e.target.value) || 50
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditPlayerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePlayer}>
                Update Player
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Player Confirmation */}
        <AlertDialog open={deletePlayerOpen} onOpenChange={setDeletePlayerOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Player
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedPlayer?.first_name} {selectedPlayer?.last_name}"? 
                This action cannot be undone and will remove all player data including statistics.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeletePlayer}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Player
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}