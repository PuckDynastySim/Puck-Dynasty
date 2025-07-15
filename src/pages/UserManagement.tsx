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
      // Load users with their profiles and roles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      // Load user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('*');

      // Load teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*');

      // Load leagues
      const { data: leaguesData } = await supabase
        .from('leagues')
        .select('*');

      // Combine data
      const usersWithRoles = profiles?.map(profile => ({
        id: profile.user_id,
        email: profile.email || '',
        display_name: profile.display_name,
        created_at: profile.created_at,
        roles: userRoles?.filter(ur => ur.user_id === profile.user_id).map(ur => ur.role) || [],
        assigned_team: teamsData?.find(t => t.gm_user_id === profile.user_id)?.name,
        status: 'active' as const
      })) || [];

      setUsers(usersWithRoles);
      setTeams(teamsData || []);
      setLeagues(leaguesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load user data",
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

      if (error) {
        console.error('Function invocation error:', error);
        throw error;
      }

      if (data?.error) {
        console.error('Function returned error:', data.error);
        throw new Error(data.error);
      }

      console.log('User created successfully:', data);

      toast({
        title: "Success",
        description: `User "${newUser.display_name}" created successfully`
      });

      setCreateUserOpen(false);
      setNewUser({ email: "", display_name: "", password: "", role: "gm" });
      loadData();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleAssignGM = async () => {
    if (!selectedUser || !selectedTeam) return;

    try {
      const { error } = await supabase
        .from('teams')
        .update({ gm_user_id: selectedUser.id })
        .eq('id', selectedTeam);

      if (error) throw error;

      toast({
        title: "Success",
        description: "GM assigned successfully"
      });

      setAssignGMOpen(false);
      setSelectedUser(null);
      setSelectedTeam("");
      loadData();
    } catch (error) {
      console.error('Error assigning GM:', error);
      toast({
        title: "Error",
        description: "Failed to assign GM",
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
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
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
                        {user.roles.map(role => (
                          <Badge key={role} variant="secondary">
                            {role}
                          </Badge>
                        ))}
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
