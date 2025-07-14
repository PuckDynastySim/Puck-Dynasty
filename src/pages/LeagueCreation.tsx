import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  CalendarIcon, 
  Trophy, 
  Users, 
  Settings, 
  Info,
  Plus,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function LeagueCreation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [leagueData, setLeagueData] = useState({
    name: "",
    type: "pro" as "pro" | "farm" | "junior",
    salaryCap: 80000000,
    maxAge: 45,
    minAge: 16,
    seasonStartDate: new Date(),
    gamesPerTeam: 82,
    description: "",
    allowTrades: true,
    allowFreeAgency: true,
    enableDraft: true,
    maxTeams: 30,
    divisionsEnabled: true,
    conferencesEnabled: true,
    numConferences: 2,
    numDivisions: 4
  });

  const leagueTypes = [
    { value: "pro", label: "Professional League", description: "Top-tier professional hockey" },
    { value: "farm", label: "Farm League", description: "Development league affiliated with pro teams" },
    { value: "junior", label: "Junior League", description: "Youth development league (16-21 years)" }
  ];

  const presetSalaryCaps = [
    { label: "NHL Standard", value: 80000000 },
    { label: "Lower Cap", value: 60000000 },
    { label: "Higher Cap", value: 100000000 },
    { label: "No Cap", value: 999999999 }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a league.",
        variant: "destructive",
      });
      return;
    }

    if (!leagueData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "League name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create the league
      const { data: league, error: leagueError } = await supabase
        .from("leagues")
        .insert([
          {
            name: leagueData.name.trim(),
            league_type: leagueData.type,
            commissioner_id: user.id,
            salary_cap: leagueData.salaryCap,
            min_age: leagueData.minAge,
            max_age: leagueData.maxAge,
            season_start_date: leagueData.seasonStartDate.toISOString().split('T')[0],
            games_per_team: leagueData.gamesPerTeam,
            is_active: true
          }
        ])
        .select()
        .single();

      if (leagueError) {
        throw leagueError;
      }

      toast({
        title: "League Created Successfully!",
        description: `${leagueData.name} has been created with you as commissioner.`,
      });

      // Navigate to the admin dashboard
      navigate("/admin");

    } catch (error) {
      console.error("Error creating league:", error);
      toast({
        title: "Error Creating League",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" asChild>
            <Link to="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="w-8 h-8 text-primary" />
              Create New League
            </h1>
            <p className="text-muted-foreground">Set up a new hockey simulation league with custom parameters</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Basic League Information
              </CardTitle>
              <CardDescription>
                Configure the fundamental settings for your new hockey league
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="leagueName">League Name *</Label>
                  <Input
                    id="leagueName"
                    placeholder="e.g., National Hockey League"
                    value={leagueData.name}
                    onChange={(e) => setLeagueData({...leagueData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>League Type *</Label>
                  <Select 
                    value={leagueData.type} 
                    onValueChange={(value: "pro" | "farm" | "junior") => 
                      setLeagueData({...leagueData, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {leagueTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">League Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your league's purpose and rules..."
                  value={leagueData.description}
                  onChange={(e) => setLeagueData({...leagueData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Season Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(leagueData.seasonStartDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={leagueData.seasonStartDate}
                      onSelect={(date) => date && setLeagueData({...leagueData, seasonStartDate: date})}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* League Rules & Limits */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                League Rules & Limits
              </CardTitle>
              <CardDescription>
                Configure salary caps, age limits, and other league constraints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Salary Cap</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {presetSalaryCaps.map((preset) => (
                        <Button
                          key={preset.value}
                          type="button"
                          variant={leagueData.salaryCap === preset.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setLeagueData({...leagueData, salaryCap: preset.value})}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      placeholder="Custom salary cap"
                      value={leagueData.salaryCap}
                      onChange={(e) => setLeagueData({...leagueData, salaryCap: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAge">Minimum Age</Label>
                    <Input
                      id="minAge"
                      type="number"
                      min="16"
                      max="25"
                      value={leagueData.minAge}
                      onChange={(e) => setLeagueData({...leagueData, minAge: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxAge">Maximum Age</Label>
                    <Input
                      id="maxAge"
                      type="number"
                      min="25"
                      max="50"
                      value={leagueData.maxAge}
                      onChange={(e) => setLeagueData({...leagueData, maxAge: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="gamesPerTeam">Games per Team</Label>
                  <Input
                    id="gamesPerTeam"
                    type="number"
                    min="20"
                    max="100"
                    value={leagueData.gamesPerTeam}
                    onChange={(e) => setLeagueData({...leagueData, gamesPerTeam: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxTeams">Maximum Teams</Label>
                  <Input
                    id="maxTeams"
                    type="number"
                    min="4"
                    max="50"
                    value={leagueData.maxTeams}
                    onChange={(e) => setLeagueData({...leagueData, maxTeams: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* League Features */}
          <Card className="card-rink">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                League Features
              </CardTitle>
              <CardDescription>
                Enable or disable specific features for this league
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Player Trades</Label>
                      <p className="text-sm text-muted-foreground">Allow teams to trade players</p>
                    </div>
                    <Switch
                      checked={leagueData.allowTrades}
                      onCheckedChange={(checked) => setLeagueData({...leagueData, allowTrades: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Free Agency</Label>
                      <p className="text-sm text-muted-foreground">Enable free agent signings</p>
                    </div>
                    <Switch
                      checked={leagueData.allowFreeAgency}
                      onCheckedChange={(checked) => setLeagueData({...leagueData, allowFreeAgency: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Entry Draft</Label>
                      <p className="text-sm text-muted-foreground">Annual player draft system</p>
                    </div>
                    <Switch
                      checked={leagueData.enableDraft}
                      onCheckedChange={(checked) => setLeagueData({...leagueData, enableDraft: checked})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Divisions</Label>
                      <p className="text-sm text-muted-foreground">Organize teams into divisions</p>
                    </div>
                    <Switch
                      checked={leagueData.divisionsEnabled}
                      onCheckedChange={(checked) => setLeagueData({...leagueData, divisionsEnabled: checked})}
                    />
                  </div>

                  {leagueData.divisionsEnabled && (
                    <div className="space-y-2 ml-4">
                      <Label htmlFor="numDivisions">Number of Divisions</Label>
                      <Input
                        id="numDivisions"
                        type="number"
                        min="2"
                        max="8"
                        value={leagueData.numDivisions}
                        onChange={(e) => setLeagueData({...leagueData, numDivisions: parseInt(e.target.value)})}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Conferences</Label>
                      <p className="text-sm text-muted-foreground">Group divisions into conferences</p>
                    </div>
                    <Switch
                      checked={leagueData.conferencesEnabled}
                      onCheckedChange={(checked) => setLeagueData({...leagueData, conferencesEnabled: checked})}
                    />
                  </div>

                  {leagueData.conferencesEnabled && (
                    <div className="space-y-2 ml-4">
                      <Label htmlFor="numConferences">Number of Conferences</Label>
                      <Input
                        id="numConferences"
                        type="number"
                        min="2"
                        max="4"
                        value={leagueData.numConferences}
                        onChange={(e) => setLeagueData({...leagueData, numConferences: parseInt(e.target.value)})}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" asChild>
              <Link to="/admin">Cancel</Link>
            </Button>
            <Button type="submit" className="btn-hockey" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Creating League..." : "Create League"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}