import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Trophy, 
  Calendar, 
  Play, 
  Plus,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Zap
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hockey-arena-hero.jpg";

interface DashboardStats {
  totalLeagues: number;
  totalTeams: number;
  totalPlayers: number;
  totalGames: number;
  gamesSimulatedToday: number;
  activeUsers: number;
  teamsWithoutGMs: number;
  incompleteTeams: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  action?: string;
}

interface RecentActivity {
  action: string;
  time: string;
  badge: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeagues: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalGames: 0,
    gamesSimulatedToday: 0,
    activeUsers: 0,
    teamsWithoutGMs: 0,
    incompleteTeams: 0,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [leaguePhase, setLeaguePhase] = useState("Pre-Season");
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load leagues
      const { data: leagues } = await supabase
        .from('leagues')
        .select('*')
        .eq('is_active', true);

      // Load teams
      const { data: teams } = await supabase
        .from('teams')
        .select('*, profiles:gm_user_id(display_name)');

      // Load players
      const { data: players } = await supabase
        .from('players')
        .select('id, team_id');

      // Load games
      const { data: games } = await supabase
        .from('games')
        .select('*');

      // Load user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      const teamsWithoutGMs = teams?.filter(team => !team.gm_user_id).length || 0;
      const incompleteTeams = teams?.filter(team => {
        const playerCount = players?.filter(p => p.team_id === team.id).length || 0;
        return playerCount < 20; // Assuming 20 players minimum
      }).length || 0;

      setStats({
        totalLeagues: leagues?.length || 0,
        totalTeams: teams?.length || 0,
        totalPlayers: players?.length || 0,
        totalGames: games?.length || 0,
        gamesSimulatedToday: games?.filter(g => 
          g.status === 'completed' && 
          new Date(g.game_date).toDateString() === new Date().toDateString()
        ).length || 0,
        activeUsers: profiles?.length || 0,
        teamsWithoutGMs,
        incompleteTeams,
      });

      // Generate alerts
      const newAlerts: Alert[] = [];
      if (teamsWithoutGMs > 0) {
        newAlerts.push({
          id: 'no-gm',
          type: 'warning',
          message: `${teamsWithoutGMs} teams without assigned GMs`,
          action: 'Assign GMs'
        });
      }
      if (incompleteTeams > 0) {
        newAlerts.push({
          id: 'incomplete',
          type: 'warning',
          message: `${incompleteTeams} teams need more players`,
          action: 'Generate Players'
        });
      }
      setAlerts(newAlerts);

      // Load recent activity
      await loadRecentActivity();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activities: RecentActivity[] = [];
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get recent leagues
      const { data: recentLeagues } = await supabase
        .from('leagues')
        .select('name, created_at')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      recentLeagues?.forEach(league => {
        activities.push({
          action: `League "${league.name}" created`,
          time: getRelativeTime(league.created_at),
          badge: "League",
          timestamp: league.created_at
        });
      });

      // Get recent teams
      const { data: recentTeams } = await supabase
        .from('teams')
        .select('name, city, created_at')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3);

      recentTeams?.forEach(team => {
        activities.push({
          action: `Team "${team.city} ${team.name}" created`,
          time: getRelativeTime(team.created_at),
          badge: "Team",
          timestamp: team.created_at
        });
      });

      // Get recent player generations (count by recent timestamps)
      const { data: recentPlayers } = await supabase
        .from('players')
        .select('created_at')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false });

      if (recentPlayers && recentPlayers.length > 0) {
        // Group players by creation time (within 1 hour windows)
        const playerGroups: { [key: string]: number } = {};
        recentPlayers.forEach(player => {
          const hourKey = new Date(player.created_at).toISOString().slice(0, 13); // Hour precision
          playerGroups[hourKey] = (playerGroups[hourKey] || 0) + 1;
        });

        // Add activities for significant player generations
        Object.entries(playerGroups)
          .sort(([a], [b]) => b.localeCompare(a))
          .slice(0, 2)
          .forEach(([hourKey, count]) => {
            if (count >= 10) { // Only show if 10+ players generated
              activities.push({
                action: `${count} players generated`,
                time: getRelativeTime(hourKey + ':00:00.000Z'),
                badge: "Players",
                timestamp: hourKey + ':00:00.000Z'
              });
            }
          });
      }

      // Get recent games
      const { data: recentGames } = await supabase
        .from('games')
        .select('created_at, status')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      const scheduledGames = recentGames?.filter(g => g.status === 'scheduled').length || 0;
      const completedGames = recentGames?.filter(g => g.status === 'completed').length || 0;

      if (scheduledGames > 0) {
        const latestScheduled = recentGames?.find(g => g.status === 'scheduled');
        if (latestScheduled) {
          activities.push({
            action: `${scheduledGames} games scheduled`,
            time: getRelativeTime(latestScheduled.created_at),
            badge: "Schedule",
            timestamp: latestScheduled.created_at
          });
        }
      }

      if (completedGames > 0) {
        const latestCompleted = recentGames?.find(g => g.status === 'completed');
        if (latestCompleted) {
          activities.push({
            action: `${completedGames} games simulated`,
            time: getRelativeTime(latestCompleted.created_at),
            badge: "Simulation",
            timestamp: latestCompleted.created_at
          });
        }
      }

      // Sort all activities by timestamp and take the most recent 4
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 4);

      setRecentActivity(sortedActivities);

    } catch (error) {
      console.error('Error loading recent activity:', error);
      setRecentActivity([]); // Set empty array on error
    }
  };

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const simulateOneDay = async () => {
    toast({
      title: "Simulation Started",
      description: "Simulating one day of games...",
    });
    // Simulation logic would go here
  };

  const simulateOneWeek = async () => {
    toast({
      title: "Simulation Started", 
      description: "Simulating one week of games...",
    });
    // Simulation logic would go here
  };

  // Quick action cards for the admin
  const quickActions = [
    {
      title: "User Management",
      description: "Create users and assign GMs",
      icon: Users,
      color: "bg-primary",
      href: "/admin/users"
    },
    {
      title: "Team Creator",
      description: "Create teams and assign divisions",
      icon: Trophy,
      color: "bg-accent",
      href: "/admin/teams"
    },
    {
      title: "Player Generator",
      description: "Generate fictional players",
      icon: Users,
      color: "bg-team-gold",
      href: "/admin/players/generate"
    },
    {
      title: "Create League",
      description: "Set up new simulation league",
      icon: Plus,
      color: "bg-green-600",
      href: "/admin/leagues/new"
    },
  ];

  const statCards = [
    {
      title: "Active Leagues",
      value: stats.totalLeagues,
      description: "Running simulation leagues",
      icon: Trophy,
      trend: "+2 this month",
      color: "text-primary"
    },
    {
      title: "Total Teams",
      value: stats.totalTeams,
      description: "Across all leagues",
      icon: Trophy,
      trend: "+12 this week",
      color: "text-accent"
    },
    {
      title: "Player Pool",
      value: stats.totalPlayers.toLocaleString(),
      description: "Generated fictional players",
      icon: Users,
      trend: "+156 today",
      color: "text-team-gold"
    },
    {
      title: "Games Simulated",
      value: stats.gamesSimulatedToday,
      description: "Today's simulation count",
      icon: Activity,
      trend: "Real-time",
      color: "text-green-600"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl">
          <div 
            className="h-64 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
            <div className="relative h-full flex items-center px-8">
              <div className="max-w-2xl">
                <h1 className="text-4xl font-bold mb-4">
                  Welcome to <span className="text-primary">Hockey Sim Central</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Your complete administration dashboard for managing hockey simulation leagues, 
                  teams, players, and real-time game simulations.
                </p>
                <div className="flex gap-3">
                  <Button 
                    className="btn-hockey"
                    onClick={() => navigate('/admin/leagues/new')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New League
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-primary/20"
                    onClick={() => navigate('/admin/simulation')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* League Status & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                League Status & Alerts
              </CardTitle>
              <CardDescription>Current league phase and important notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">Current Phase</h3>
                    <p className="text-sm text-muted-foreground">Season progression status</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {leaguePhase}
                  </Badge>
                </div>
                
                {alerts.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Alerts</h4>
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border border-orange-200 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm">{alert.message}</span>
                        </div>
                        {alert.action && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs"
                            onClick={() => {
                              if (alert.action === 'Assign GMs') {
                                navigate('/admin/users');
                              } else if (alert.action === 'Generate Players') {
                                navigate('/admin/players/generate');
                              }
                            }}
                          >
                            {alert.action}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 border border-green-200 bg-green-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">All systems operational</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Simulation Control
              </CardTitle>
              <CardDescription>Run game simulations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={simulateOneDay} 
                className="w-full"
                disabled={loading}
              >
                <Play className="w-4 h-4 mr-2" />
                Simulate 1 Day
              </Button>
              <Button 
                onClick={simulateOneWeek} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Simulate 1 Week
              </Button>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Last simulation: {stats.gamesSimulatedToday} games today
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="card-rink stat-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs text-green-500">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="card-rink stat-card cursor-pointer group"
                onClick={() => navigate(action.href)}
              >
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest system actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{activity.badge}</Badge>
                        <span className="text-sm">{activity.action}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs">Activity from the last 24 hours will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Status
              </CardTitle>
              <CardDescription>Current system health and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Database", status: "Operational", color: "bg-green-500" },
                  { name: "Simulation Engine", status: "Running", color: "bg-green-500" },
                  { name: "Player Generator", status: "Active", color: "bg-green-500" },
                  { name: "Schedule Builder", status: "Ready", color: "bg-green-500" },
                ].map((system, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${system.color}`} />
                      <span className="text-sm font-medium">{system.name}</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600/20">
                      {system.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}