import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, TrendingUp, TrendingDown, Building, Users, Zap } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type TeamFinances = Database["public"]["Tables"]["team_finances"]["Row"];
type ArenaInfrastructure = Database["public"]["Tables"]["arena_infrastructure"]["Row"];
type TicketPricing = Database["public"]["Tables"]["ticket_pricing"]["Row"];
type TrainingProgram = Database["public"]["Tables"]["training_programs"]["Row"];

interface FinanceDashboardProps {
  teamId: string;
  leagueId: string;
  salaryCap: number;
  currentPayroll: number;
}

export function FinanceDashboard({ teamId, leagueId, salaryCap, currentPayroll }: FinanceDashboardProps) {
  const [finances, setFinances] = useState<TeamFinances | null>(null);
  const [arena, setArena] = useState<ArenaInfrastructure | null>(null);
  const [ticketPricing, setTicketPricing] = useState<TicketPricing | null>(null);
  const [trainingPrograms, setTrainingPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinanceData();
  }, [teamId, leagueId]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);

      // Fetch or create team finances
      let { data: financeData } = await supabase
        .from("team_finances")
        .select("*")
        .eq("team_id", teamId)
        .eq("season_year", new Date().getFullYear())
        .maybeSingle();

      if (!financeData) {
        const { data: newFinance } = await supabase
          .from("team_finances")
          .insert({
            team_id: teamId,
            league_id: leagueId,
            season_year: new Date().getFullYear()
          })
          .select()
          .single();
        financeData = newFinance;
      }

      // Fetch or create arena infrastructure
      let { data: arenaData } = await supabase
        .from("arena_infrastructure")
        .select("*")
        .eq("team_id", teamId)
        .maybeSingle();

      if (!arenaData) {
        const { data: newArena } = await supabase
          .from("arena_infrastructure")
          .insert({
            team_id: teamId,
            league_id: leagueId
          })
          .select()
          .single();
        arenaData = newArena;
      }

      // Fetch or create ticket pricing
      let { data: pricingData } = await supabase
        .from("ticket_pricing")
        .select("*")
        .eq("team_id", teamId)
        .eq("season_year", new Date().getFullYear())
        .maybeSingle();

      if (!pricingData) {
        const { data: newPricing } = await supabase
          .from("ticket_pricing")
          .insert({
            team_id: teamId,
            league_id: leagueId,
            season_year: new Date().getFullYear()
          })
          .select()
          .single();
        pricingData = newPricing;
      }

      // Fetch training programs
      const { data: trainingData } = await supabase
        .from("training_programs")
        .select("*")
        .eq("team_id", teamId);

      setFinances(financeData);
      setArena(arenaData);
      setTicketPricing(pricingData);
      setTrainingPrograms(trainingData || []);
    } catch (error) {
      console.error("Error fetching finance data:", error);
      toast({
        title: "Error",
        description: "Failed to load finance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicketPricing = async (pricing: Partial<TicketPricing>) => {
    if (!ticketPricing) return;

    try {
      const { data } = await supabase
        .from("ticket_pricing")
        .update(pricing)
        .eq("id", ticketPricing.id)
        .select()
        .single();

      setTicketPricing(data);
      toast({
        title: "Success",
        description: "Ticket pricing updated successfully"
      });
    } catch (error) {
      console.error("Error updating ticket pricing:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket pricing",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const capUsagePercentage = (currentPayroll / salaryCap) * 100;

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(finances?.budget || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Available funds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(finances?.revenue_total || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Season to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Salary Cap Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentPayroll)}</div>
            <Progress value={capUsagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {capUsagePercentage.toFixed(1)}% of {formatCurrency(salaryCap)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">Ticket Pricing</TabsTrigger>
          <TabsTrigger value="arena">Arena</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Ticket Sales</span>
                  <span className="font-medium">{formatCurrency(finances?.ticket_revenue || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sponsorships</span>
                  <span className="font-medium">{formatCurrency(finances?.sponsorship_revenue || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Concessions</span>
                  <span className="font-medium">{formatCurrency(finances?.concession_revenue || 0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Player Salaries</span>
                  <span className="font-medium">{formatCurrency(currentPayroll)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training Programs</span>
                  <span className="font-medium">{formatCurrency(finances?.training_expenses || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Arena Operations</span>
                  <span className="font-medium">{formatCurrency(finances?.arena_expenses || 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Pricing Management</CardTitle>
              <CardDescription>
                Adjust ticket prices to balance revenue and attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lower-bowl">Lower Bowl</Label>
                  <Input
                    id="lower-bowl"
                    type="number"
                    value={ticketPricing?.lower_bowl_price || 0}
                    onChange={(e) => updateTicketPricing({ lower_bowl_price: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upper-bowl">Upper Bowl</Label>
                  <Input
                    id="upper-bowl"
                    type="number"
                    value={ticketPricing?.upper_bowl_price || 0}
                    onChange={(e) => updateTicketPricing({ upper_bowl_price: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="premium">Premium Seats</Label>
                  <Input
                    id="premium"
                    type="number"
                    value={ticketPricing?.premium_price || 0}
                    onChange={(e) => updateTicketPricing({ premium_price: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="luxury">Luxury Boxes</Label>
                  <Input
                    id="luxury"
                    type="number"
                    value={ticketPricing?.luxury_box_price || 0}
                    onChange={(e) => updateTicketPricing({ luxury_box_price: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arena" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Arena Infrastructure</CardTitle>
              <CardDescription>
                Upgrade your arena to increase capacity and revenue potential
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Seating Capacity</Label>
                  <div className="text-2xl font-bold">{arena?.seating_capacity?.toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <Label>Luxury Boxes</Label>
                  <div className="text-2xl font-bold">{arena?.luxury_boxes}</div>
                </div>
                <div className="space-y-2">
                  <Label>Arena Quality</Label>
                  <div className="flex items-center space-x-2">
                    <Progress value={arena?.arena_quality_rating || 0} className="flex-1" />
                    <span className="text-sm font-medium">{arena?.arena_quality_rating}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Training Facilities</Label>
                  <Badge variant="outline">Level {arena?.training_facilities_level}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Training Programs</CardTitle>
              <CardDescription>
                Invest in training programs to improve player development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Training programs coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}