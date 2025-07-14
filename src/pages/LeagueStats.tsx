import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StandingsTab } from "@/components/league-stats/StandingsTab";
import { PlayerLeadersTab } from "@/components/league-stats/PlayerLeadersTab";
import { GoalieLeadersTab } from "@/components/league-stats/GoalieLeadersTab";
import { ScheduleTab } from "@/components/league-stats/ScheduleTab";
import { InjuriesTab } from "@/components/league-stats/InjuriesTab";
import { TransactionsTab } from "@/components/league-stats/TransactionsTab";
import { PowerRankingsTab } from "@/components/league-stats/PowerRankingsTab";
import { Trophy, Target, Shield, Calendar, AlertTriangle, ArrowRightLeft, TrendingUp } from "lucide-react";

export default function LeagueStats() {
  const [activeTab, setActiveTab] = useState("standings");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">League Statistics</h1>
        <p className="text-muted-foreground">
          Comprehensive statistics and information across all leagues
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
          <TabsTrigger value="standings" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Standings</span>
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Players</span>
          </TabsTrigger>
          <TabsTrigger value="goalies" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Goalies</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="injuries" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Injuries</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="rankings" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Rankings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standings" className="space-y-6">
          <StandingsTab />
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <PlayerLeadersTab />
        </TabsContent>

        <TabsContent value="goalies" className="space-y-6">
          <GoalieLeadersTab />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <ScheduleTab />
        </TabsContent>

        <TabsContent value="injuries" className="space-y-6">
          <InjuriesTab />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionsTab />
        </TabsContent>

        <TabsContent value="rankings" className="space-y-6">
          <PowerRankingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}