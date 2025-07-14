import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building, Users, ArrowRight, Link } from "lucide-react";

interface OrganizationTeam {
  id: string;
  name: string;
  city: string;
  league_type: string;
  league_name: string;
  parent_team_id?: string;
  is_ai_controlled: boolean;
  player_count: number;
}

interface OrganizationViewProps {
  userId?: string;
  showAllOrganizations?: boolean;
}

export default function OrganizationView({ userId, showAllOrganizations = false }: OrganizationViewProps) {
  const [organizations, setOrganizations] = useState<Record<string, OrganizationTeam[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProTeam, setSelectedProTeam] = useState("");
  const [availableFarmTeams, setAvailableFarmTeams] = useState<OrganizationTeam[]>([]);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, [userId, showAllOrganizations]);

  const loadOrganizations = async () => {
    try {
      // Load teams with league and parent info
      let query = supabase
        .from('teams')
        .select(`
          *,
          leagues!teams_league_id_fkey(name, league_type),
          parent_teams:teams!parent_team_id(name, city, league_id)
        `);

      // Filter by GM if not showing all organizations
      if (!showAllOrganizations && userId) {
        query = query.eq('gm_user_id', userId);
      }

      const { data: teamsData } = await query;

      // Load player counts
      const { data: playerCounts } = await supabase
        .from('players')
        .select('team_id')
        .not('team_id', 'is', null);

      const playerCountMap = playerCounts?.reduce((acc, p) => {
        acc[p.team_id] = (acc[p.team_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Group teams by organization
      const organizationMap: Record<string, OrganizationTeam[]> = {};
      
      teamsData?.forEach(team => {
        const orgTeam: OrganizationTeam = {
          id: team.id,
          name: team.name,
          city: team.city,
          league_type: team.leagues?.league_type || 'pro',
          league_name: team.leagues?.name || 'Unknown',
          parent_team_id: team.parent_team_id,
          is_ai_controlled: team.is_ai_controlled,
          player_count: playerCountMap[team.id] || 0
        };

        // Find the root organization (pro team)
        const rootId = team.parent_team_id || team.id;
        
        if (!organizationMap[rootId]) {
          organizationMap[rootId] = [];
        }
        
        organizationMap[rootId].push(orgTeam);
      });

      // Sort teams within each organization (pro first, then farm)
      Object.keys(organizationMap).forEach(orgId => {
        organizationMap[orgId].sort((a, b) => {
          if (a.league_type === 'pro' && b.league_type !== 'pro') return -1;
          if (a.league_type !== 'pro' && b.league_type === 'pro') return 1;
          return 0;
        });
      });

      setOrganizations(organizationMap);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUnlinkedFarmTeams = async () => {
    const { data: farmTeams } = await supabase
      .from('teams')
      .select(`
        *,
        leagues!teams_league_id_fkey(name, league_type)
      `)
      .eq('leagues.league_type', 'farm')
      .is('parent_team_id', null);

    setAvailableFarmTeams(farmTeams?.map(team => ({
      id: team.id,
      name: team.name,
      city: team.city,
      league_type: team.leagues?.league_type || 'farm',
      league_name: team.leagues?.name || 'Unknown',
      is_ai_controlled: team.is_ai_controlled,
      player_count: 0
    })) || []);
  };

  const handleLinkTeam = async (farmTeamId: string) => {
    if (!selectedProTeam) return;

    try {
      const { error } = await supabase
        .from('teams')
        .update({ parent_team_id: selectedProTeam })
        .eq('id', farmTeamId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Farm team linked successfully"
      });

      setLinkDialogOpen(false);
      loadOrganizations();
    } catch (error) {
      console.error('Error linking team:', error);
      toast({
        title: "Error",
        description: "Failed to link team",
        variant: "destructive"
      });
    }
  };

  const getLeagueTypeBadge = (leagueType: string) => {
    switch (leagueType) {
      case 'pro':
        return <Badge variant="default">PRO</Badge>;
      case 'farm':
        return <Badge variant="secondary">FARM</Badge>;
      case 'junior':
        return <Badge variant="outline">JUNIOR</Badge>;
      default:
        return <Badge variant="outline">{leagueType.toUpperCase()}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building className="h-6 w-6" />
            Hockey Organizations
          </h2>
          <p className="text-muted-foreground">
            {showAllOrganizations ? 'All team organizations' : 'Your team organizations'}
          </p>
        </div>
        
        {showAllOrganizations && (
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={loadUnlinkedFarmTeams}>
                <Link className="w-4 h-4 mr-2" />
                Link Farm Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Farm Team to Organization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Pro Team</label>
                  <Select value={selectedProTeam} onValueChange={setSelectedProTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pro team" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(organizations).map(([orgId, teams]) => {
                        const proTeam = teams.find(t => t.league_type === 'pro');
                        if (proTeam) {
                          return (
                            <SelectItem key={orgId} value={proTeam.id}>
                              {proTeam.city} {proTeam.name}
                            </SelectItem>
                          );
                        }
                        return null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Available Farm Teams</label>
                  <div className="space-y-2 mt-2">
                    {availableFarmTeams.map(team => (
                      <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="font-medium">{team.city} {team.name}</div>
                          <div className="text-sm text-muted-foreground">{team.league_name}</div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleLinkTeam(team.id)}
                          disabled={!selectedProTeam}
                        >
                          Link
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(organizations).map(([orgId, teams]) => {
          const proTeam = teams.find(t => t.league_type === 'pro');
          const farmTeam = teams.find(t => t.league_type === 'farm');
          
          return (
            <Card key={orgId} className="card-rink">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {proTeam ? `${proTeam.city} ${proTeam.name}` : 'Unknown Organization'}
                </CardTitle>
                <CardDescription>
                  {teams.length} team{teams.length !== 1 ? 's' : ''} in organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {teams.map(team => (
                  <div key={team.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getLeagueTypeBadge(team.league_type)}
                      <div>
                        <div className="font-medium">{team.city} {team.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {team.league_name} • {team.player_count} players
                        </div>
                      </div>
                    </div>
                    {team.is_ai_controlled && (
                      <Badge variant="outline" className="text-xs">AI</Badge>
                    )}
                  </div>
                ))}
                
                {proTeam && farmTeam && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <ArrowRight className="h-4 w-4" />
                    Farm system connected
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {Object.keys(organizations).length === 0 && (
        <Card className="card-rink">
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Organizations Found</h3>
            <p className="text-muted-foreground">
              {showAllOrganizations 
                ? 'No team organizations have been created yet.'
                : 'You are not assigned to any team organizations.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}