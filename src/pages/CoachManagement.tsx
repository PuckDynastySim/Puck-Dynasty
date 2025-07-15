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
  UserPlus, 
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

interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  nationality: string;
  offense_specialty: number;
  defense_specialty: number;
  powerplay_specialty: number;
  penalty_kill_specialty: number;
  line_management: number;
  motivation: number;
  team_id?: string;
  league_id: string;
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

export default function CoachManagement() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCoachOpen, setEditCoachOpen] = useState(false);
  const [deleteCoachOpen, setDeleteCoachOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");
  const { toast } = useToast();

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    nationality: "",
    team_id: "",
    offense_specialty: 50,
    defense_specialty: 50,
    powerplay_specialty: 50,
    penalty_kill_specialty: 50,
    line_management: 50,
    motivation: 50,
  });

  const nationalities = ["Canada", "USA", "Sweden", "Finland", "Russia", "Czech Republic", "Slovakia", "Germany", "Switzerland"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load coaches with team and league info
      const { data: coachesData } = await supabase
        .from('coaches')
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

      const enrichedCoaches = coachesData?.map(coach => ({
        ...coach,
        team_name: coach.teams?.name,
        team_city: coach.teams?.city,
        league_name: coach.leagues?.name,
        league_type: coach.leagues?.league_type,
      })) || [];

      setCoaches(enrichedCoaches);
      setTeams(teamsData || []);
      setLeagues(leaguesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load coach data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setEditForm({
      first_name: coach.first_name,
      last_name: coach.last_name,
      nationality: coach.nationality,
      team_id: coach.team_id || "",
      offense_specialty: coach.offense_specialty,
      defense_specialty: coach.defense_specialty,
      powerplay_specialty: coach.powerplay_specialty,
      penalty_kill_specialty: coach.penalty_kill_specialty,
      line_management: coach.line_management,
      motivation: coach.motivation,
    });
    setEditCoachOpen(true);
  };

  const handleUpdateCoach = async () => {
    if (!selectedCoach) return;

    try {
      const { error } = await supabase
        .from('coaches')
        .update(editForm)
        .eq('id', selectedCoach.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coach updated successfully"
      });

      setEditCoachOpen(false);
      setSelectedCoach(null);
      loadData();
    } catch (error) {
      console.error('Error updating coach:', error);
      toast({
        title: "Error",
        description: "Failed to update coach",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setDeleteCoachOpen(true);
  };

  const confirmDeleteCoach = async () => {
    if (!selectedCoach) return;

    try {
      const { error } = await supabase
        .from('coaches')
        .delete()
        .eq('id', selectedCoach.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Coach deleted successfully"
      });

      setDeleteCoachOpen(false);
      setSelectedCoach(null);
      loadData();
    } catch (error) {
      console.error('Error deleting coach:', error);
      toast({
        title: "Error",
        description: "Failed to delete coach",
        variant: "destructive"
      });
    }
  };

  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = `${coach.first_name} ${coach.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = !teamFilter || coach.team_id === teamFilter;
    const matchesLeague = !leagueFilter || coach.league_id === leagueFilter;
    
    return matchesSearch && matchesTeam && matchesLeague;
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
            <h1 className="text-3xl font-bold">Coach Management</h1>
            <p className="text-muted-foreground">Manage coaching staff and team assignments</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <UserPlus className="w-4 h-4 mr-1" />
            {filteredCoaches.length} Coaches
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Coach</Label>
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
                <Label htmlFor="league">League</Label>
                <Select value={leagueFilter} onValueChange={setLeagueFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All leagues" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Leagues</SelectItem>
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
                    <SelectItem value="">All Teams</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
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

        {/* Coaches Table */}
        <Card>
          <CardHeader>
            <CardTitle>Coaches ({filteredCoaches.length})</CardTitle>
            <CardDescription>Manage coaching staff and specialties</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coach</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>League</TableHead>
                  <TableHead>Offense</TableHead>
                  <TableHead>Defense</TableHead>
                  <TableHead>Motivation</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoaches.map((coach) => (
                  <TableRow key={coach.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{coach.first_name} {coach.last_name}</div>
                        <div className="text-sm text-muted-foreground">{coach.nationality}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {coach.team_name ? (
                        <div className="text-sm">
                          <div className="font-medium">{coach.team_city} {coach.team_name}</div>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <UserX className="w-3 h-3" />
                          Unassigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={coach.league_type === 'pro' ? 'default' : coach.league_type === 'farm' ? 'secondary' : 'outline'}>
                          {coach.league_type?.toUpperCase()}
                        </Badge>
                        {coach.league_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="font-medium">{coach.offense_specialty}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="font-medium">{coach.defense_specialty}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="font-medium">{coach.motivation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditCoach(coach)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteCoach(coach)}
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

        {/* Edit Coach Dialog */}
        <Dialog open={editCoachOpen} onOpenChange={setEditCoachOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Coach</DialogTitle>
              <DialogDescription>
                Update coach information and specialties
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
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
                  <Label htmlFor="team">Team Assignment</Label>
                  <Select value={editForm.team_id} onValueChange={(value) => setEditForm({...editForm, team_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {teams.filter(team => team.league_id === selectedCoach?.league_id).map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.city} {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Specialties */}
              <div className="space-y-4">
                <h3 className="font-semibold">Coaching Specialties</h3>
                {[
                  { key: 'offense_specialty', label: 'Offense Specialty' },
                  { key: 'defense_specialty', label: 'Defense Specialty' },
                  { key: 'powerplay_specialty', label: 'Power Play Specialty' },
                  { key: 'penalty_kill_specialty', label: 'Penalty Kill Specialty' },
                  { key: 'line_management', label: 'Line Management' },
                  { key: 'motivation', label: 'Motivation' },
                ].map((attr) => (
                  <div key={attr.key}>
                    <Label htmlFor={attr.key}>
                      {attr.label}
                    </Label>
                    <Input
                      id={attr.key}
                      type="number"
                      min="25"
                      max="99"
                      value={editForm[attr.key as keyof typeof editForm] as number}
                      onChange={(e) => setEditForm({
                        ...editForm, 
                        [attr.key]: parseInt(e.target.value) || 50
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCoachOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCoach}>
                Update Coach
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Coach Confirmation */}
        <AlertDialog open={deleteCoachOpen} onOpenChange={setDeleteCoachOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Coach
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedCoach?.first_name} {selectedCoach?.last_name}"? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteCoach}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Coach
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}