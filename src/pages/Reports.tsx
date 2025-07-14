import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, BarChart3, TrendingUp, Users, Trophy, Calendar } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface ReportData {
  totalLeagues: number;
  totalTeams: number;
  totalPlayers: number;
  totalGames: number;
  completedGames: number;
  averageTeamSize: number;
  leagueBreakdown: Array<{
    type: string;
    count: number;
  }>;
  gamesByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export default function Reports() {
  const [data, setData] = useState<ReportData>({
    totalLeagues: 0,
    totalTeams: 0,
    totalPlayers: 0,
    totalGames: 0,
    completedGames: 0,
    averageTeamSize: 0,
    leagueBreakdown: [],
    gamesByStatus: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      // Load leagues
      const { data: leagues } = await supabase
        .from('leagues')
        .select('league_type');

      // Load teams
      const { data: teams } = await supabase
        .from('teams')
        .select('id, league_id');

      // Load players
      const { data: players } = await supabase
        .from('players')
        .select('id, team_id');

      // Load games
      const { data: games } = await supabase
        .from('games')
        .select('status');

      const leagueBreakdown = leagues?.reduce((acc: any[], league) => {
        const existing = acc.find(item => item.type === league.league_type);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ type: league.league_type, count: 1 });
        }
        return acc;
      }, []) || [];

      const gamesByStatus = games?.reduce((acc: any[], game) => {
        const existing = acc.find(item => item.status === game.status);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ status: game.status, count: 1 });
        }
        return acc;
      }, []) || [];

      const averageTeamSize = teams?.length 
        ? Math.round((players?.length || 0) / teams.length) 
        : 0;

      setData({
        totalLeagues: leagues?.length || 0,
        totalTeams: teams?.length || 0,
        totalPlayers: players?.length || 0,
        totalGames: games?.length || 0,
        completedGames: games?.filter(g => g.status === 'completed').length || 0,
        averageTeamSize,
        leagueBreakdown,
        gamesByStatus,
      });

    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    {
      title: "Total Leagues",
      value: data.totalLeagues,
      icon: Trophy,
      description: "Active simulation leagues",
      color: "text-primary"
    },
    {
      title: "Teams",
      value: data.totalTeams,
      icon: Users,
      description: "Teams across all leagues",
      color: "text-accent"
    },
    {
      title: "Players",
      value: data.totalPlayers.toLocaleString(),
      icon: Users,
      description: "Generated players",
      color: "text-team-gold"
    },
    {
      title: "Games Simulated",
      value: data.completedGames,
      icon: Calendar,
      description: `${data.totalGames} total games`,
      color: "text-green-600"
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">League statistics and performance metrics</p>
          </div>
          <Badge variant="outline" className="text-sm">
            <FileText className="w-4 h-4 mr-1" />
            Analytics
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* League Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                League Breakdown
              </CardTitle>
              <CardDescription>Distribution by league type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.leagueBreakdown.map((league, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="capitalize">
                        {league.type}
                      </Badge>
                      <span className="text-sm font-medium">{league.count} leagues</span>
                    </div>
                    <div className="w-24 bg-muted h-2 rounded-full">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(league.count / data.totalLeagues) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Game Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Game Status Overview
              </CardTitle>
              <CardDescription>Current simulation progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.gamesByStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={status.status === 'completed' ? 'default' : 'outline'}
                        className="capitalize"
                      >
                        {status.status}
                      </Badge>
                      <span className="text-sm font-medium">{status.count} games</span>
                    </div>
                    <div className="w-24 bg-muted h-2 rounded-full">
                      <div 
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(status.count / data.totalGames) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <Card>
          <CardHeader>
            <CardTitle>League Health Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{data.averageTeamSize}</div>
                <p className="text-sm text-muted-foreground">Average Team Size</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">
                  {data.totalGames > 0 ? Math.round((data.completedGames / data.totalGames) * 100) : 0}%
                </div>
                <p className="text-sm text-muted-foreground">Games Completed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-team-gold">
                  {data.totalTeams > 0 ? Math.round(data.totalPlayers / data.totalTeams) : 0}
                </div>
                <p className="text-sm text-muted-foreground">Players per Team</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}