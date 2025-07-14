import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowUp, ArrowDown, AlertTriangle, DollarSign } from 'lucide-react';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  player_position: string;
  age: number;
  overall_rating: number;
  contract?: {
    salary: number;
    status: string;
  };
  injury?: {
    injury_type: string;
    severity: string;
    expected_return_date: string;
  };
}

interface Team {
  id: string;
  name: string;
  city: string;
  league_id: string;
}

interface RosterManagementProps {
  teamId: string;
  leagueId: string;
}

export const RosterManagement: React.FC<RosterManagementProps> = ({ teamId, leagueId }) => {
  const [proRoster, setProRoster] = useState<Player[]>([]);
  const [farmRoster, setFarmRoster] = useState<Player[]>([]);
  const [farmTeam, setFarmTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [salaryCapUsed, setSalaryCapUsed] = useState(0);
  const [salaryCapLimit, setSalaryCapLimit] = useState(80000000);
  const { toast } = useToast();

  useEffect(() => {
    fetchRosterData();
  }, [teamId, leagueId]);

  const fetchRosterData = async () => {
    try {
      setLoading(true);

      // Fetch pro team players
      const { data: proPlayers, error: proError } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId);

      if (proError) throw proError;

      // Fetch contracts for pro players
      const { data: proContracts, error: contractError } = await supabase
        .from('player_contracts')
        .select('*')
        .in('player_id', (proPlayers || []).map(p => p.id))
        .eq('status', 'active');

      if (contractError) throw contractError;

      // Fetch active injuries for pro players
      const { data: proInjuries, error: injuryError } = await supabase
        .from('player_injuries')
        .select('*')
        .in('player_id', (proPlayers || []).map(p => p.id))
        .eq('is_active', true);

      if (injuryError) throw injuryError;

      // Find farm team (assuming naming convention or explicit link)
      const { data: farmTeamData, error: farmTeamError } = await supabase
        .from('teams')
        .select('*')
        .eq('league_id', leagueId)
        .ilike('name', '%farm%')
        .limit(1);

      if (farmTeamError) throw farmTeamError;

      let farmPlayers: any[] = [];
      let farmContracts: any[] = [];
      let farmInjuries: any[] = [];

      if (farmTeamData?.[0]) {
        setFarmTeam(farmTeamData[0]);
        
        const { data: farmPlayersData, error: farmError } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', farmTeamData[0].id);

        if (farmError) throw farmError;
        farmPlayers = farmPlayersData || [];

        // Fetch farm team contracts and injuries
        if (farmPlayers.length > 0) {
          const { data: farmContractsData } = await supabase
            .from('player_contracts')
            .select('*')
            .in('player_id', farmPlayers.map(p => p.id))
            .eq('status', 'active');

          const { data: farmInjuriesData } = await supabase
            .from('player_injuries')
            .select('*')
            .in('player_id', farmPlayers.map(p => p.id))
            .eq('is_active', true);

          farmContracts = farmContractsData || [];
          farmInjuries = farmInjuriesData || [];
        }
      }

      // Get salary cap from league
      const { data: leagueData, error: leagueError } = await supabase
        .from('leagues')
        .select('salary_cap')
        .eq('id', leagueId)
        .single();

      if (leagueError) throw leagueError;

      // Process pro roster
      const processedProRoster = (proPlayers || []).map(player => ({
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        player_position: player.player_position,
        age: player.age,
        overall_rating: player.overall_rating,
        contract: proContracts.find(c => c.player_id === player.id),
        injury: proInjuries.find(i => i.player_id === player.id)
      }));

      // Process farm roster
      const processedFarmRoster = farmPlayers.map(player => ({
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        player_position: player.player_position,
        age: player.age,
        overall_rating: player.overall_rating,
        contract: farmContracts.find(c => c.player_id === player.id),
        injury: farmInjuries.find(i => i.player_id === player.id)
      }));

      setProRoster(processedProRoster);
      setFarmRoster(processedFarmRoster);
      setSalaryCapLimit(leagueData?.salary_cap || 80000000);
      
      const totalSalary = processedProRoster.reduce((sum, player) => 
        sum + (player.contract?.salary || 0), 0);
      setSalaryCapUsed(totalSalary);

    } catch (error) {
      console.error('Error fetching roster data:', error);
      toast({
        title: "Error",
        description: "Failed to load roster data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCallUp = async (playerId: string) => {
    try {
      // Move player from farm to pro team
      const { error: updateError } = await supabase
        .from('players')
        .update({ team_id: teamId })
        .eq('id', playerId);

      if (updateError) throw updateError;

      // Log transaction
      await supabase
        .from('transaction_log')
        .insert({
          league_id: leagueId,
          player_id: playerId,
          from_team_id: farmTeam?.id,
          to_team_id: teamId,
          transaction_type: 'call_up'
        });

      toast({
        title: "Success",
        description: "Player called up to pro team"
      });

      fetchRosterData();
    } catch (error) {
      console.error('Error calling up player:', error);
      toast({
        title: "Error",
        description: "Failed to call up player",
        variant: "destructive"
      });
    }
  };

  const handleSendDown = async (playerId: string) => {
    if (!farmTeam) {
      toast({
        title: "Error",
        description: "No farm team available",
        variant: "destructive"
      });
      return;
    }

    try {
      // Move player from pro to farm team
      const { error: updateError } = await supabase
        .from('players')
        .update({ team_id: farmTeam.id })
        .eq('id', playerId);

      if (updateError) throw updateError;

      // Log transaction
      await supabase
        .from('transaction_log')
        .insert({
          league_id: leagueId,
          player_id: playerId,
          from_team_id: teamId,
          to_team_id: farmTeam.id,
          transaction_type: 'send_down'
        });

      toast({
        title: "Success",
        description: "Player sent down to farm team"
      });

      fetchRosterData();
    } catch (error) {
      console.error('Error sending down player:', error);
      toast({
        title: "Error",
        description: "Failed to send down player",
        variant: "destructive"
      });
    }
  };

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'F': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'D': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'G': return 'bg-purple-500/10 text-purple-600 border-purple-200';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-200';
    }
  };

  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(salary);
  };

  const PlayerRow = ({ player, isProRoster }: { player: Player; isProRoster: boolean }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {player.first_name[0]}{player.last_name[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center space-x-2">
            <p className="font-medium">{player.first_name} {player.last_name}</p>
            <Badge variant="outline" className={getPositionColor(player.player_position)}>
              {player.player_position}
            </Badge>
            {player.injury && (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{player.injury.severity}</span>
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Age: {player.age}</span>
            <span>Overall: {player.overall_rating}</span>
            {player.contract && (
              <span className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>{formatSalary(player.contract.salary)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        {isProRoster ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSendDown(player.id)}
            disabled={!!player.injury}
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            Send Down
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCallUp(player.id)}
            disabled={!!player.injury}
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            Call Up
          </Button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return <div className="p-4">Loading roster data...</div>;
  }

  const capPercentage = (salaryCapUsed / salaryCapLimit) * 100;
  const isOverCap = salaryCapUsed > salaryCapLimit;

  return (
    <div className="space-y-4">
      {/* Salary Cap Widget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Salary Cap</span>
            <span className={isOverCap ? 'text-destructive' : 'text-foreground'}>
              {formatSalary(salaryCapUsed)} / {formatSalary(salaryCapLimit)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                isOverCap ? 'bg-destructive' : capPercentage > 90 ? 'bg-yellow-500' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(capPercentage, 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isOverCap && '⚠️ Over salary cap! '}
            Cap space: {formatSalary(salaryCapLimit - salaryCapUsed)}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="pro" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pro">Pro Roster ({proRoster.length})</TabsTrigger>
          <TabsTrigger value="farm">Farm Roster ({farmRoster.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pro" className="space-y-3">
          {proRoster.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No players on pro roster</p>
          ) : (
            proRoster.map(player => (
              <PlayerRow key={player.id} player={player} isProRoster={true} />
            ))
          )}
        </TabsContent>

        <TabsContent value="farm" className="space-y-3">
          {farmRoster.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No players on farm roster</p>
          ) : (
            farmRoster.map(player => (
              <PlayerRow key={player.id} player={player} isProRoster={false} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};