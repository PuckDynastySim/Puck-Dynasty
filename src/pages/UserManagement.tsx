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
  UserPlus, 
  Mail, 
  Shield, 
  UserX, 
  Users,
  Eye,
  EyeOff,
  RefreshCw,
  Trophy
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
  roles: string[];
  assigned_team?: string;
  status: 'active' | 'inactive';
}

interface Team {
  id: string;
  name: string;
  city: string;
  league_id: string;
  gm_user_id?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [assignGMOpen, setAssignGMOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [creatingUser, setCreatingUser] = useState(false);
  const { toast } = useToast();

  const [newUser, setNewUser] = useState({
    email: "",
    display_name: "",
    password: "",
    role: "gm" as "admin" | "gm" | "user"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading user management data...');
      
      // Load user roles first
      console.log('Fetching user roles...');
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        toast({
          title: "Error Loading Roles",
          description: rolesError.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log('User roles loaded:', userRoles?.length || 0);

      // Load profiles
      console.log('Fetching profiles...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Don't return here, continue with empty profiles
      }
      
      console.log('Profiles loaded:', profiles?.length || 0);

      // Load teams
      console.log('Fetching teams...');
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*');
      
      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
        throw new Error(`Failed to load teams: ${teamsError.message}`);
      }
      
      console.log('Teams loaded:', teamsData?.length || 0);

      // Load leagues
      console.log('Fetching leagues...');
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select('*');
      
      if (leaguesError) {
        console.error('Error fetching leagues:', leaguesError);
        throw new Error(`Failed to load leagues: ${leaguesError.message}`);
      }
      
      console.log('Leagues loaded:', leaguesData?.length || 0);

      // Create a map of user roles for easier lookup
      const rolesByUser = userRoles?.reduce((acc, role) => {
        if (!acc[role.user_id]) {
          acc[role.user_id] = [];
        }
        acc[role.user_id].push(role.role);
        return acc;
      }, {} as Record<string, string[]>) || {};

      // Get all unique user IDs from roles (this ensures we catch all users with roles)
      const allUserIds = [...new Set(userRoles?.map(role => role.user_id) || [])];
      
      // Create users array from roles and profiles
      const usersWithRoles = allUserIds.map(userId => {
        const profile = profiles?.find(p => p.user_id === userId);
        const userRolesForUser = rolesByUser[userId] || [];
        const assignedTeam = teamsData?.find(t => t.gm_user_id === userId);
        
        return {
          id: userId,
          email: profile?.email || 'No email found',
          display_name: profile?.display_name || 'No name set',
          created_at: profile?.created_at || new Date().toISOString(),
          roles: userRolesForUser,
          assigned_team: assignedTeam ? `${assignedTeam.city} ${assignedTeam.name}` : undefined,
          status: 'active' as const
        };
      });

      console.log('Combined users data:', usersWithRoles.length);
      console.log('Users with roles:', usersWithRoles);
      
      setUsers(usersWithRoles);
      setTeams(teamsData || []);
      setLeagues(leaguesData || []);
      
      toast({
        title: "Data Loaded Successfully",
        description: `Loaded ${usersWithRoles.length} users, ${teamsData?.length || 0} teams`
      });
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error Loading Data",
        description: error.message || "Failed to load user management data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.display_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setCreatingUser(true);

    try {
      console.log('Calling create-admin-user function with:', {
        email: newUser.email,
        display_name: newUser.display_name,
        role: newUser.role
      });

      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          email: newUser.email,
          password: newUser.password,
          display_name: newUser.display_name,
          role: newUser.role
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function invocation error:', error);
        
        let errorMessage = "Failed to create user";
        let errorDetails = error.message || "Unknown error occurred";
        
        if (data?.error) {
          errorMessage = data.error;
          errorDetails = data.debug || data.details || "No additional details available";
        }

        toast({
          title: errorMessage,
          description: errorDetails,
          variant: "destructive"  
        });
        
        return;
      }

      if (data?.error) {
        console.error('Function returned error:', data);
        
        let errorMessage = data.error;
        let errorDetails = data.debug || data.details || "No additional details available";

        toast({
          title: errorMessage,
          description: errorDetails,
          variant: "destructive"
        });
        
        return;
      }

      if (!data?.success) {
        console.error('Function did not return success:', data);
        toast({
          title: "Error",
          description: data?.debug || "User creation failed for unknown reason",
          variant: "destructive"
        });
        return;
      }

      console.log('User created successfully:', data.user);

      toast({
        title: "Success",
        description: `User "${newUser.display_name}" created successfully with ${newUser.role} role`
      });

      setCreateUserOpen(false);
      setNewUser({ email: "", display_name: "", password: "", role: "gm" });
      
      // Add a longer delay before reloading to ensure all database operations are complete
      setTimeout(() => {
        loadData();
      }, 2000);
      
    } catch (error: any) {
      console.error('Unexpected error creating user:', error);
      
      let errorMessage = "An unexpected error occurred";
      let errorDetails = error.message || "Please try again or contact support";
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = "Network Error";
        errorDetails = "Unable to connect to the server. Please check your internet connection and try again.";
      }
      
      toast({
        title: errorMessage,
        description: errorDetails,
        variant: "destructive"
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleAssignGM = async () => {
    if (!selectedUser || !selectedTeam) return;

    try {
      console.log('Assigning GM:', selectedUser.id, 'to team:', selectedTeam);

      // Update both gm_user_id and is_ai_controlled in the same transaction
      const { error } = await supabase
        .from('teams')
        .update({ 
          gm_user_id: selectedUser.id,
          is_ai_controlled: false  // Set to false when assigning a human GM
        })
        .eq('id', selectedTeam);

      if (error) {
        console.error('Error assigning GM:', error);
        throw error;
      }

      console.log('GM assigned successfully');

      toast({
        title: "Success",
        description: "GM assigned successfully"
      });

      setAssignGMOpen(false);
      setSelectedUser(null);
      setSelectedTeam("");
      loadData();
    } catch (error: any) {
      console.error('Error assigning GM:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign GM",
        variant: "destructive"
      });
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      // In a real app, you'd send a password reset email
      // For now, we'll just show a success message
      toast({
        title: "Password Reset",
        description: "Password reset email would be sent (demo mode)"
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    // This would update user status in a real implementation
    toast({
      title: "Status Updated",
      description: `User ${currentStatus === 'active' ? 'deactivated' : 'activated'} (demo mode)`
    });
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
            <h1 className="text-3xl font-bold">User & GM Management</h1>
            <p className="text-muted-foreground">Create, invite, and manage users and GMs for your leagues</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
              <DialogTrigger asChild>
                <Button className="btn-hockey">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Add a new user to the system and assign their role
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="display_name">Display Name *</Label>
                    <Input
                      id="display_name"
                      value={newUser.display_name}
                      onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Temporary Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Temporary password"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUser.role} onValueChange={(value: any) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="gm">GM</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleCreateUser} 
                    className="w-full"
                    disabled={creatingUser}
                  >
                    {creatingUser && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                    {creatingUser ? 'Creating User...' : 'Create User'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active GMs</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.roles.includes('gm')).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teams with GMs</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.filter(t => t.gm_user_id).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Teams</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teams.filter(t => !t.gm_user_id).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({users.length})</CardTitle>
            <CardDescription>Manage all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No users found. Create a new user to get started.</p>
                <Button
                  onClick={() => setCreateUserOpen(true)}
                  className="mt-4 btn-hockey"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create First User
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Assigned Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.display_name || 'Unnamed User'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map(role => (
                              <Badge key={role} variant="secondary">
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">No roles</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.assigned_team || 'None'}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setAssignGMOpen(true);
                            }}
                          >
                            <Trophy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPassword(user.id)}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserStatus(user.id, user.status)}
                          >
                            {user.status === 'active' ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Assign GM Dialog */}
        <Dialog open={assignGMOpen} onOpenChange={setAssignGMOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign GM to Team</DialogTitle>
              <DialogDescription>
                Select a team for {selectedUser?.display_name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team">Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.filter(t => !t.gm_user_id).map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.city} {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAssignGM} className="w-full">
                Assign GM
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
