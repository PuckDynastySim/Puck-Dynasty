import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Plus, Edit, Trash2, AlertTriangle, RefreshCw, MoveRight } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface League {
  id: string;
  name: string;
  league_type: string;
}

interface Conference {
  id: string;
  name: string;
  league_id: string;
}

interface Division {
  id: string;
  name: string;
  conference_id: string;
}

interface Team {
  id: string;
  name: string;
  city: string;
  division_id?: string;
  conference_id?: string;
}

export default function LeagueAlignment() {
  const [loading, setLoading] = useState(true);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [conferences, setConferences] = useState<Conference[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const { toast } = useToast();

  // Dialog states
  const [newConferenceDialog, setNewConferenceDialog] = useState(false);
  const [editConferenceDialog, setEditConferenceDialog] = useState(false);
  const [deleteConferenceDialog, setDeleteConferenceDialog] = useState(false);
  const [newDivisionDialog, setNewDivisionDialog] = useState(false);
  const [editDivisionDialog, setEditDivisionDialog] = useState(false);
  const [deleteDivisionDialog, setDeleteDivisionDialog] = useState(false);
  const [assignTeamDialog, setAssignTeamDialog] = useState(false);

  // Form states
  const [selectedConference, setSelectedConference] = useState<Conference | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [newConferenceName, setNewConferenceName] = useState("");
  const [newDivisionName, setNewDivisionName] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");

  useEffect(() => {
    loadLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      loadConferencesAndDivisions();
      loadTeams();
    }
  }, [selectedLeague]);

  const loadLeagues = async () => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .order('name');

      if (error) throw error;

      setLeagues(data || []);
      if (data && data.length > 0) {
        setSelectedLeague(data[0].id);
      }
    } catch (error) {
      console.error('Error loading leagues:', error);
      toast({
        title: "Error",
        description: "Failed to load leagues",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConferencesAndDivisions = async () => {
    try {
      // Load conferences
      const { data: conferenceData, error: conferenceError } = await supabase
        .from('conferences')
        .select('*')
        .eq('league_id', selectedLeague)
        .order('name');

      if (conferenceError) throw conferenceError;

      // Load divisions
      const { data: divisionData, error: divisionError } = await supabase
        .from('divisions')
        .select('*')
        .order('name');

      if (divisionError) throw divisionError;

      setConferences(conferenceData || []);
      setDivisions(divisionData || []);
    } catch (error) {
      console.error('Error loading conferences and divisions:', error);
      toast({
        title: "Error",
        description: "Failed to load conferences and divisions",
        variant: "destructive"
      });
    }
  };

  const loadTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', selectedLeague)
        .order('city');

      if (error) throw error;

      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive"
      });
    }
  };

  const handleCreateConference = async () => {
    if (!selectedLeague) {
      toast({
        title: "Error",
        description: "Please select a league first",
        variant: "destructive"
      });
      return;
    }

    if (!newConferenceName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a conference name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('conferences')
        .insert([{ 
          name: newConferenceName.trim(), 
          league_id: selectedLeague 
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        if (error.code === '23505') {
          toast({
            title: "Error",
            description: "A conference with this name already exists in the selected league",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to create conference: ${error.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "Conference created successfully"
      });

      setNewConferenceName("");
      setNewConferenceDialog(false);
      loadConferencesAndDivisions();
    } catch (error) {
      console.error('Error creating conference:', error);
      toast({
        title: "Error",
        description: "Failed to create conference. An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const handleCreateDivision = async () => {
    if (!selectedConference) return;

    try {
      const { error } = await supabase
        .from('divisions')
        .insert([{ 
          name: newDivisionName, 
          conference_id: selectedConference.id 
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Division created successfully"
      });

      setNewDivisionName("");
      setNewDivisionDialog(false);
      loadConferencesAndDivisions();
    } catch (error) {
      console.error('Error creating division:', error);
      toast({
        title: "Error",
        description: "Failed to create division",
        variant: "destructive"
      });
    }
  };

  const handleAssignTeam = async () => {
    if (!selectedTeam || !selectedDivisionId) return;

    try {
      const { error } = await supabase
        .from('teams')
        .update({ division_id: selectedDivisionId })
        .eq('id', selectedTeam.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team assigned successfully"
      });

      setAssignTeamDialog(false);
      setSelectedTeam(null);
      setSelectedDivisionId("");
      loadTeams();
    } catch (error) {
      console.error('Error assigning team:', error);
      toast({
        title: "Error",
        description: "Failed to assign team",
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
            <h1 className="text-3xl font-bold">League Alignment</h1>
            <p className="text-muted-foreground">Configure conferences and divisions</p>
          </div>
        </div>

        {/* League Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select League</CardTitle>
            <CardDescription>Choose a league to configure its alignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a league" />
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

              <Button onClick={() => setNewConferenceDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Conference
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conferences and Divisions */}
        <div className="grid grid-cols-1 gap-6">
          {conferences.map(conference => (
            <Card key={conference.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{conference.name}</CardTitle>
                  <CardDescription>
                    {divisions.filter(d => d.conference_id === conference.id).length} Divisions
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedConference(conference);
                      setNewDivisionDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Division
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedConference(conference);
                      setEditConferenceDialog(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedConference(conference);
                      setDeleteConferenceDialog(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {divisions
                    .filter(division => division.conference_id === conference.id)
                    .map(division => {
                      const divisionTeams = teams.filter(team => team.division_id === division.id);
                      return (
                        <Card key={division.id}>
                          <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{division.name}</CardTitle>
                              <CardDescription>{divisionTeams.length} Teams</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedDivision(division);
                                  setEditDivisionDialog(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedDivision(division);
                                  setDeleteDivisionDialog(true);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="text-sm">
                            {divisionTeams.map(team => (
                              <div key={team.id} className="flex items-center justify-between py-1">
                                <span>{team.city} {team.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTeam(team);
                                    setAssignTeamDialog(true);
                                  }}
                                >
                                  <MoveRight className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Unassigned Teams */}
        <Card>
          <CardHeader>
            <CardTitle>Unassigned Teams</CardTitle>
            <CardDescription>Teams not yet assigned to a division</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {teams
                .filter(team => !team.division_id)
                .map(team => (
                  <Card key={team.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{team.city} {team.name}</div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedTeam(team);
                            setAssignTeamDialog(true);
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Conference Dialog */}
        <Dialog open={newConferenceDialog} onOpenChange={setNewConferenceDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Conference</DialogTitle>
              <DialogDescription>Add a new conference to the league</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="conference_name">Conference Name</Label>
                <Input
                  id="conference_name"
                  value={newConferenceName}
                  onChange={(e) => setNewConferenceName(e.target.value)}
                  placeholder="Enter conference name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewConferenceDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateConference}>
                Create Conference
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Division Dialog */}
        <Dialog open={newDivisionDialog} onOpenChange={setNewDivisionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Division</DialogTitle>
              <DialogDescription>Add a new division to {selectedConference?.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="division_name">Division Name</Label>
                <Input
                  id="division_name"
                  value={newDivisionName}
                  onChange={(e) => setNewDivisionName(e.target.value)}
                  placeholder="Enter division name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewDivisionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateDivision}>
                Create Division
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Team Dialog */}
        <Dialog open={assignTeamDialog} onOpenChange={setAssignTeamDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Team to Division</DialogTitle>
              <DialogDescription>
                Select a division for {selectedTeam?.city} {selectedTeam?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="division">Select Division</Label>
                <Select value={selectedDivisionId} onValueChange={setSelectedDivisionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a division" />
                  </SelectTrigger>
                  <SelectContent>
                    {conferences.map(conference => (
                      <div key={conference.id}>
                        <span className="text-sm font-medium px-2 py-1 block text-muted-foreground">
                          {conference.name}
                        </span>
                        {divisions
                          .filter(division => division.conference_id === conference.id)
                          .map(division => (
                            <SelectItem key={division.id} value={division.id}>
                              {division.name}
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignTeamDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignTeam}>
                Assign Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Conference Confirmation */}
        <AlertDialog open={deleteConferenceDialog} onOpenChange={setDeleteConferenceDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Conference
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedConference?.name}"? 
                This will also delete all divisions within this conference and remove team assignments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (!selectedConference) return;
                  try {
                    const { error } = await supabase
                      .from('conferences')
                      .delete()
                      .eq('id', selectedConference.id);

                    if (error) throw error;

                    toast({
                      title: "Success",
                      description: "Conference deleted successfully"
                    });

                    setDeleteConferenceDialog(false);
                    loadConferencesAndDivisions();
                  } catch (error) {
                    console.error('Error deleting conference:', error);
                    toast({
                      title: "Error",
                      description: "Failed to delete conference",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Delete Conference
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Division Confirmation */}
        <AlertDialog open={deleteDivisionDialog} onOpenChange={setDeleteDivisionDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Division
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedDivision?.name}"? 
                This will remove all team assignments from this division.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (!selectedDivision) return;
                  try {
                    const { error } = await supabase
                      .from('divisions')
                      .delete()
                      .eq('id', selectedDivision.id);

                    if (error) throw error;

                    toast({
                      title: "Success",
                      description: "Division deleted successfully"
                    });

                    setDeleteDivisionDialog(false);
                    loadConferencesAndDivisions();
                  } catch (error) {
                    console.error('Error deleting division:', error);
                    toast({
                      title: "Error",
                      description: "Failed to delete division",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Delete Division
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
