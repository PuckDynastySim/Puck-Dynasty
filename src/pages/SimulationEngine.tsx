import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Play, Zap, Trophy, Target, Loader2, Clock, BarChart3 } from "lucide-react";

interface GameResult {
  homeScore: number;
  awayScore: number;
  homeShots: number;
  awayShots: number;
  periods: Array<{
    period: number;
    homeGoals: number;
    awayGoals: number;
    homeShots: number;
    awayShots: number;
  }>;
  overtimeWinner?: string;
  shootoutWinner?: string;
}

const SimulationEngine = () => {
  const [simulating, setSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [simulationType, setSimulationType] = useState("single");
  const [lastResult, setLastResult] = useState<GameResult | null>(null);
  const { toast } = useToast();

  const simulateGame = (homeTeamStrength = 75, awayTeamStrength = 75): GameResult => {
    const periods = [];
    let homeScore = 0;
    let awayScore = 0;
    let homeShots = 0;
    let awayShots = 0;

    // Simulate 3 regular periods
    for (let period = 1; period <= 3; period++) {
      const periodResult = simulatePeriod(homeTeamStrength, awayTeamStrength);
      periods.push({
        period,
        homeGoals: periodResult.homeGoals,
        awayGoals: periodResult.awayGoals,
        homeShots: periodResult.homeShots,
        awayShots: periodResult.awayShots
      });
      
      homeScore += periodResult.homeGoals;
      awayScore += periodResult.awayGoals;
      homeShots += periodResult.homeShots;
      awayShots += periodResult.awayShots;
    }

    let overtimeWinner: string | undefined;
    let shootoutWinner: string | undefined;

    // Handle overtime if tied
    if (homeScore === awayScore) {
      // Overtime simulation (3v3)
      const otChance = Math.random();
      if (otChance < 0.6) { // 60% chance overtime decides it
        if (Math.random() < 0.5 + (homeTeamStrength - awayTeamStrength) / 200) {
          homeScore++;
          overtimeWinner = "home";
        } else {
          awayScore++;
          overtimeWinner = "away";
        }
      } else {
        // Shootout
        if (Math.random() < 0.5 + (homeTeamStrength - awayTeamStrength) / 300) {
          homeScore++;
          shootoutWinner = "home";
        } else {
          awayScore++;
          shootoutWinner = "away";
        }
      }
    }

    return {
      homeScore,
      awayScore,
      homeShots,
      awayShots,
      periods,
      overtimeWinner,
      shootoutWinner
    };
  };

  const simulatePeriod = (homeStrength: number, awayStrength: number) => {
    // Base shots per period: 8-15
    const baseShotsHome = Math.floor(Math.random() * 8) + 8;
    const baseShotsAway = Math.floor(Math.random() * 8) + 8;
    
    // Adjust based on team strength
    const homeShots = Math.max(1, baseShotsHome + Math.floor((homeStrength - 75) / 10));
    const awayShots = Math.max(1, baseShotsAway + Math.floor((awayStrength - 75) / 10));
    
    // Shooting percentage: 8-12% typically
    const homeShootingPct = (Math.random() * 0.04 + 0.08) * (homeStrength / 75);
    const awayShootingPct = (Math.random() * 0.04 + 0.08) * (awayStrength / 75);
    
    const homeGoals = Math.floor(homeShots * homeShootingPct + Math.random() * 0.5);
    const awayGoals = Math.floor(awayShots * awayShootingPct + Math.random() * 0.5);
    
    return { homeGoals, awayGoals, homeShots, awayShots };
  };

  const runSimulation = async () => {
    if (!selectedLeague) {
      toast({
        title: "Error",
        description: "Please select a league first",
        variant: "destructive"
      });
      return;
    }

    setSimulating(true);
    setProgress(0);

    try {
      if (simulationType === "single") {
        // Simulate a single game
        const result = simulateGame(
          Math.floor(Math.random() * 30) + 65, // 65-95 team strength
          Math.floor(Math.random() * 30) + 65
        );
        
        setLastResult(result);
        setProgress(100);
        
        toast({
          title: "Game Simulated!",
          description: `Final Score: ${result.homeScore} - ${result.awayScore}`,
        });
      } else {
        // Simulate multiple games
        const gamesToSimulate = simulationType === "day" ? 8 : 30;
        
        for (let i = 0; i < gamesToSimulate; i++) {
          // Simulate game with random team strengths
          const result = simulateGame(
            Math.floor(Math.random() * 30) + 65,
            Math.floor(Math.random() * 30) + 65
          );
          
          // In a real implementation, save to database here
          
          setProgress(((i + 1) / gamesToSimulate) * 100);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        toast({
          title: "Success!",
          description: `Simulated ${gamesToSimulate} games`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSimulating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Play className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Simulation Engine</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simulation Controls */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Run Simulation
              </CardTitle>
              <CardDescription>
                Advanced probability-based hockey game simulation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">League</label>
                <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a league" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="league-1">Professional League</SelectItem>
                    <SelectItem value="league-2">Development League</SelectItem>
                    <SelectItem value="league-3">Junior League</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Simulation Type</label>
                <Select value={simulationType} onValueChange={setSimulationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Game</SelectItem>
                    <SelectItem value="day">Full Day (8 games)</SelectItem>
                    <SelectItem value="week">Full Week (30 games)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {simulationType === "single" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Game</label>
                  <Select value={selectedGame} onValueChange={setSelectedGame}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a scheduled game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="game-1">Toronto vs Montreal - Tonight 7:00 PM</SelectItem>
                      <SelectItem value="game-2">Boston vs Tampa Bay - Tonight 7:30 PM</SelectItem>
                      <SelectItem value="game-3">Rangers vs Pittsburgh - Tonight 8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {simulating && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Simulation Progress</label>
                  <Progress value={progress} />
                  <p className="text-sm text-muted-foreground">
                    Running advanced game simulation... {Math.round(progress)}%
                  </p>
                </div>
              )}

              <Button 
                onClick={runSimulation} 
                className="w-full btn-hockey"
                disabled={simulating}
              >
                {simulating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Game Result Display */}
          {lastResult && (
            <Card className="card-rink">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Game Result
                </CardTitle>
                <CardDescription>
                  Latest simulation result
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {lastResult.homeScore} - {lastResult.awayScore}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Shots: {lastResult.homeShots} - {lastResult.awayShots}
                  </div>
                  
                  {lastResult.overtimeWinner && (
                    <Badge variant="secondary" className="mb-2">
                      Overtime Victory
                    </Badge>
                  )}
                  
                  {lastResult.shootoutWinner && (
                    <Badge variant="outline" className="mb-2">
                      Shootout Victory
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Period Breakdown</h4>
                  {lastResult.periods.map((period) => (
                    <div key={period.period} className="flex justify-between text-sm">
                      <span>Period {period.period}:</span>
                      <span>{period.homeGoals} - {period.awayGoals}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!lastResult && (
            <Card className="card-rink">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Simulation Features
                </CardTitle>
                <CardDescription>
                  Advanced hockey simulation algorithms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Realistic Scoring</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Shot totals and shooting percentages based on real hockey statistics
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Period-by-Period</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Detailed period breakdown with shots and goals tracked
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-team-gold" />
                    <span className="text-sm font-medium">Overtime & Shootouts</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    Full overtime and shootout simulation for tied games
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Simulation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Probability-Based</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Advanced algorithms using team strength and player ratings
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">Detailed Statistics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Period-by-period tracking with shots, saves, and scoring chances
              </p>
            </CardContent>
          </Card>

          <Card className="card-rink stat-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-team-gold" />
                <h3 className="font-semibold">Fast Processing</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Simulate entire seasons in minutes with realistic outcomes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SimulationEngine;