
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  RefreshCw,
  Users,
  Bot,
  Crown
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  city: string;
  abbreviation: string;
  league_id: string;
  conference?: string;
  division?: string;
  is_ai_controlled: boolean;
  gm_user_id?: string;
  parent_team_id?: string;
  created_at: string;
  league_name?: string;
  league_type?: string;
  gm_display_name?: string;
  gm_email?: string;
}

interface League {
  id: string;
  name: string;
  league_type: string;
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [deleteTeamOpen, setDeleteTeamOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const { toast } = useToast();

  const [newTeam, setNewTeam] = useState({
    name: "",
    city: "",
    abbreviation: "",
    league_id: "",
    conference: "",
    division: "",
    is_ai_controlled: true
  });

  const [editForm, setEditForm] = useState({
    name: "",
    city: "",
    abbreviation: "",
    conference: "",
    division: "",
    is_ai_controlled: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // First, let's get the leagues data
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select('*')
        .order('name');

      if (leaguesError) {
        console.error('Error fetching leagues:', leaguesError);
        throw leaguesError;
      }

      // Then load teams with their relationships
      // Load teams with league info only first
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          leagues!inner (
            name,
            league_type
          )
        `)
        .order('name');

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        console.error('Full error details:', JSON.stringify(teamsError, null, 2));
        throw teamsError;
      }

      // For now, we'll handle teams without detailed GM info
      const gmData = teamsData?.reduce((acc: any, team) => {
        if (team.gm_user_id) {
          acc[team.gm_user_id] = {
            display_name: 'GM',
            email: 'Contact admin for details'
          };
        }
        return acc;
      }, {}) || {};

      console.log('Raw leagues data:', leaguesData);
      console.log('Raw teams data:', teamsData);
      console.log('GM data:', gmData);

      const enrichedTeams = teamsData?.map(team => ({
        ...team,
        league_name: team.leagues?.name,
        league_type: team.leagues?.league_type,
        gm_display_name: team.gm_user_id ? gmData[team.gm_user_id]?.display_name : undefined,
        gm_email: team.gm_user_id ? gmData[team.gm_user_id]?.email : undefined,
      })) || [];

      console.log('Enriched teams:', enrichedTeams); // Debug log

      setTeams(enrichedTeams);
      setLeagues(leaguesData || []);
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

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.city || !newTeam.abbreviation || !newTeam.league_id) {
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
        .insert([newTeam]);

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
        league_id: "",
        conference: "",
        division: "",
        is_ai_controlled: true
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

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setEditForm({
      name: team.name,
      city: team.city,
      abbreviation: team.abbreviation,
      conference: team.conference || "",
      division: team.division || "",
      is_ai_controlled: team.is_ai_controlled
    });
    setEditTeamOpen(true);
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam) return;

    try {
      const { error } = await supabase
        .from('teams')
        .update(editForm)
        .eq('id', selectedTeam.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team updated successfully"
      });

      setEditTeamOpen(false);
      setSelectedTeam(null);
      loadData();
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team);
    setDeleteTeamOpen(true);
  };

  const confirmDeleteTeam = async () => {
    if (!selectedTeam) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', selectedTeam.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team deleted successfully"
      });

      setDeleteTeamOpen(false);
      setSelectedTeam(null);
      loadData();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      });
    }
  };

  const fixAIControlStatus = async (teamId: string, hasGM: boolean) => {
    try {
      // If team has a GM, set is_ai_controlled to false
      // If team has no GM, set is_ai_controlled to true
      const { error } = await supabase
        .from('teams')
        .update({ is_ai_controlled: !hasGM })
        .eq('id', teamId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team AI control status fixed"
      });

      loadData();
    } catch (error) {
      console.error('Error fixing AI control status:', error);
      toast({
        title: "Error",
        description: "Failed to fix AI control status",
        variant: "destructive"
      });
    }
  };

  const getTeamStatusBadge = (team: Team) => {
    const hasGM = !!team.gm_user_id;
    const isAIControlled = team.is_ai_controlled;
    
    // Check for inconsistent state
    if (hasGM && isAIControlled) {
      return (
        <div className="flex items-center gap-2">
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Inconsistent
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fixAIControlStatus(team.id, hasGM)}
            className="text-xs"
          >
            Fix
          </Button>
        </div>
      );
    }
    
    if (hasGM) {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <Crown className="w-3 h-3" />
          Human GM
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Bot className="w-3 h-3" />
        AI Controlled
      </Badge>
    );
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
            <p className="text-muted-foreground">Manage teams across all leagues</p>
          </div>
          <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
            <DialogTrigger asChild>
              <Button className="btn-hockey">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Add a new team to a league
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Team Name *</Label>
                    <Input
                      id="name"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                      placeholder="Hurricanes"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={newTeam.city}
                      onChange={(e) => setNewTeam({...newTeam, city: e.target.value})}
                      placeholder="Carolina"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="abbreviation">Abbreviation *</Label>
                    <Input
                      id="abbreviation"
                      value={newTeam.abbreviation}
                      onChange={(e) => setNewTeam({...newTeam, abbreviation: e.target.value.toUpperCase()})}
                      placeholder="CAR"
                      maxLength={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="league">League *</Label>
                    <Select value={newTeam.league_id} onValueChange={(value) => setNewTeam({...newTeam, league_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select league" />
                      </SelectTrigger>
                      <SelectContent>
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="conference">Conference</Label>
                    <Input
                      id="conference"
                      value={newTeam.conference}
                      onChange={(e) => setNewTeam({...newTeam, conference: e.target.value})}
                      placeholder="Eastern"
                    />
                  </div>
                  <div>
                    <Label htmlFor="division">Division</Label>
                    <Input
                      id="division"
                      value={newTeam.division}
                      onChange={(e) => setNewTeam({...newTeam, division: e.target.value})}
                      placeholder="Metropolitan"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateTeam} className="w-full">
                  Create Team
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
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams with GMs</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
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
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.filter(t => t.is_ai_controlled && !t.gm_user_id).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inconsistent Status</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {teams.filter(t => t.gm_user_id && t.is_ai_controlled).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teams ({teams.length})</CardTitle>
            <CardDescription>Manage team information and assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead>Conference/Division</TableHead>
                  <TableHead>GM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{team.city} {team.name}</div>
                        <div className="text-sm text-muted-foreground">{team.abbreviation}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={team.league_type === 'pro' ? 'default' : team.league_type === 'farm' ? 'secondary' : 'outline'}>
                          {team.league_type?.toUpperCase()}
                        </Badge>
                        {team.league_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {team.conference && <div>Conf: {team.conference}</div>}
                        {team.division && <div>Div: {team.division}</div>}
                        {!team.conference && !team.division && <span className="text-muted-foreground">None</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {team.gm_user_id ? (
                        <div className="text-sm">
                          <div className="font-medium">{team.gm_display_name || 'Unknown GM'}</div>
                          <div className="text-muted-foreground">{team.gm_email}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No GM Assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getTeamStatusBadge(team)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditTeam(team)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteTeam(team)}
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

        {/* Edit Team Dialog */}
        <Dialog open={editTeamOpen} onOpenChange={setEditTeamOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team</DialogTitle>
              <DialogDescription>
                Update team information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_name">Team Name</Label>
                  <Input
                    id="edit_name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_city">City</Label>
                  <Input
                    id="edit_city"
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_abbreviation">Abbreviation</Label>
                  <Input
                    id="edit_abbreviation"
                    value={editForm.abbreviation}
                    onChange={(e) => setEditForm({...editForm, abbreviation: e.target.value.toUpperCase()})}
                    maxLength={3}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_is_ai_controlled">AI Controlled</Label>
                  <Select 
                    value={editForm.is_ai_controlled.toString()} 
                    onValueChange={(value) => setEditForm({...editForm, is_ai_controlled: value === 'true'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes (AI Controlled)</SelectItem>
                      <SelectItem value="false">No (Human GM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_conference">Conference</Label>
                  <Input
                    id="edit_conference"
                    value={editForm.conference}
                    onChange={(e) => setEditForm({...editForm, conference: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit_division">Division</Label>
                  <Input
                    id="edit_division"
                    value={editForm.division}
                    onChange={(e) => setEditForm({...editForm, division: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleUpdateTeam} className="w-full">
                Update Team
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Team Confirmation */}
        <AlertDialog open={deleteTeamOpen} onOpenChange={setDeleteTeamOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Team
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedTeam?.city} {selectedTeam?.name}"? 
                This action cannot be undone and will remove all team data including players, statistics, and game history.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteTeam}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Team
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
