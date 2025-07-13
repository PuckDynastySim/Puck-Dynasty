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
  Clock
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import heroImage from "@/assets/hockey-arena-hero.jpg";

interface DashboardStats {
  totalLeagues: number;
  totalTeams: number;
  totalPlayers: number;
  totalGames: number;
  gamesSimulatedToday: number;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeagues: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalGames: 0,
    gamesSimulatedToday: 0,
    activeUsers: 0,
  });

  // Quick action cards for the admin
  const quickActions = [
    {
      title: "Create New League",
      description: "Set up a new hockey simulation league",
      icon: Plus,
      color: "bg-primary",
      href: "/admin/leagues/new"
    },
    {
      title: "Generate Players",
      description: "Create fictional players for any league",
      icon: Users,
      color: "bg-accent",
      href: "/admin/players/generate"
    },
    {
      title: "Build Schedule",
      description: "Create game schedules for existing leagues",
      icon: Calendar,
      color: "bg-team-gold",
      href: "/admin/schedule/new"
    },
    {
      title: "Run Simulation",
      description: "Simulate games and generate results",
      icon: Play,
      color: "bg-green-600",
      href: "/admin/simulation"
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
                  <Button className="btn-hockey">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New League
                  </Button>
                  <Button variant="outline" className="border-primary/20">
                    <Play className="w-4 h-4 mr-2" />
                    Run Simulation
                  </Button>
                </div>
              </div>
            </div>
          </div>
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
              <Card key={index} className="card-rink stat-card cursor-pointer group">
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
                {[
                  { action: "New league created", time: "2 minutes ago", badge: "League" },
                  { action: "150 players generated", time: "5 minutes ago", badge: "Players" },
                  { action: "Schedule built for NHL Pro", time: "12 minutes ago", badge: "Schedule" },
                  { action: "Game simulation completed", time: "18 minutes ago", badge: "Simulation" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{activity.badge}</Badge>
                      <span className="text-sm">{activity.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
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