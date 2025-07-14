import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';

interface TeamStrategyProps {
  teamId: string;
  leagueId: string;
}

interface StrategyData {
  forecheck_intensity: number;
  defensive_pressure: number;
  offensive_style: number;
  pp_style: 'aggressive' | 'balanced' | 'conservative';
  pk_style: 'pressure' | 'box' | 'aggressive';
  line_matching: boolean;
  pull_goalie_threshold: number;
}

export const TeamStrategy: React.FC<TeamStrategyProps> = ({ teamId, leagueId }) => {
  const [strategy, setStrategy] = useState<StrategyData>({
    forecheck_intensity: 50,
    defensive_pressure: 50,
    offensive_style: 50,
    pp_style: 'balanced',
    pk_style: 'pressure',
    line_matching: false,
    pull_goalie_threshold: 90
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStrategy();
  }, [teamId]);

  const fetchStrategy = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('team_strategy')
        .select('*')
        .eq('team_id', teamId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      if (data) {
        setStrategy({
          forecheck_intensity: data.forecheck_intensity,
          defensive_pressure: data.defensive_pressure,
          offensive_style: data.offensive_style,
          pp_style: data.pp_style as 'aggressive' | 'balanced' | 'conservative',
          pk_style: data.pk_style as 'pressure' | 'box' | 'aggressive',
          line_matching: data.line_matching,
          pull_goalie_threshold: data.pull_goalie_threshold
        });
      }
    } catch (error) {
      console.error('Error fetching strategy:', error);
      toast({
        title: "Error",
        description: "Failed to load team strategy",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStrategyChange = (field: keyof StrategyData, value: any) => {
    setStrategy(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const saveStrategy = async () => {
    try {
      setSaving(true);

      const strategyData = {
        team_id: teamId,
        league_id: leagueId,
        ...strategy
      };

      const { error } = await supabase
        .from('team_strategy')
        .upsert(strategyData, { onConflict: 'team_id' });

      if (error) throw error;

      setHasChanges(false);
      toast({
        title: "Success",
        description: "Team strategy saved successfully"
      });

    } catch (error) {
      console.error('Error saving strategy:', error);
      toast({
        title: "Error",
        description: "Failed to save team strategy",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getIntensityLabel = (value: number): string => {
    if (value <= 25) return 'Conservative';
    if (value <= 50) return 'Balanced';
    if (value <= 75) return 'Aggressive';
    return 'Very Aggressive';
  };

  const getIntensityColor = (value: number): string => {
    if (value <= 25) return 'text-blue-600';
    if (value <= 50) return 'text-green-600';
    if (value <= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="p-4">Loading team strategy...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Team Strategy</h3>
          <p className="text-sm text-muted-foreground">
            Configure your team's tactical approach and game strategy
          </p>
        </div>
        <Button 
          onClick={saveStrategy} 
          disabled={saving || !hasChanges}
          className="min-w-24"
        >
          <Save className="h-4 w-4 mr-1" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tactical Sliders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tactical Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Forecheck Intensity</Label>
                <span className={`text-sm font-medium ${getIntensityColor(strategy.forecheck_intensity)}`}>
                  {getIntensityLabel(strategy.forecheck_intensity)} ({strategy.forecheck_intensity}%)
                </span>
              </div>
              <Slider
                value={[strategy.forecheck_intensity]}
                onValueChange={(value) => handleStrategyChange('forecheck_intensity', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher values mean more aggressive pressure in the offensive zone
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Defensive Pressure</Label>
                <span className={`text-sm font-medium ${getIntensityColor(strategy.defensive_pressure)}`}>
                  {getIntensityLabel(strategy.defensive_pressure)} ({strategy.defensive_pressure}%)
                </span>
              </div>
              <Slider
                value={[strategy.defensive_pressure]}
                onValueChange={(value) => handleStrategyChange('defensive_pressure', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Controls how aggressively your team defends in their own zone
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Offensive Style</Label>
                <span className={`text-sm font-medium ${getIntensityColor(strategy.offensive_style)}`}>
                  {getIntensityLabel(strategy.offensive_style)} ({strategy.offensive_style}%)
                </span>
              </div>
              <Slider
                value={[strategy.offensive_style]}
                onValueChange={(value) => handleStrategyChange('offensive_style', value[0])}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Lower values favor possession play, higher values favor direct attacks
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Special Teams & Game Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Special Teams & Game Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Power Play Style</Label>
              <Select
                value={strategy.pp_style}
                onValueChange={(value: 'aggressive' | 'balanced' | 'conservative') => 
                  handleStrategyChange('pp_style', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative - Focus on possession</SelectItem>
                  <SelectItem value="balanced">Balanced - Mix of possession and shots</SelectItem>
                  <SelectItem value="aggressive">Aggressive - Shoot first mentality</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Penalty Kill Style</Label>
              <Select
                value={strategy.pk_style}
                onValueChange={(value: 'pressure' | 'box' | 'aggressive') => 
                  handleStrategyChange('pk_style', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="box">Box - Conservative defensive box</SelectItem>
                  <SelectItem value="pressure">Pressure - Active stick checking</SelectItem>
                  <SelectItem value="aggressive">Aggressive - High pressure system</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Line Matching</Label>
                <p className="text-xs text-muted-foreground">
                  Match lines against opponent's best players
                </p>
              </div>
              <Switch
                checked={strategy.line_matching}
                onCheckedChange={(value) => handleStrategyChange('line_matching', value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Pull Goalie Threshold</Label>
              <div className="flex items-center space-x-3">
                <Slider
                  value={[strategy.pull_goalie_threshold]}
                  onValueChange={(value) => handleStrategyChange('pull_goalie_threshold', value[0])}
                  max={300}
                  min={30}
                  step={15}
                  className="flex-1"
                />
                <span className="text-sm font-medium min-w-16">
                  {Math.floor(strategy.pull_goalie_threshold / 60)}:{(strategy.pull_goalie_threshold % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                When trailing, pull goalie with this much time remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Impact Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Strategy Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-blue-600">Scoring</div>
              <div className="text-2xl font-bold">
                {Math.round((strategy.forecheck_intensity + strategy.offensive_style) / 20)}%
              </div>
              <div className="text-xs text-muted-foreground">Expected increase</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">Defense</div>
              <div className="text-2xl font-bold">
                {Math.round((strategy.defensive_pressure + (100 - strategy.offensive_style)) / 20)}%
              </div>
              <div className="text-xs text-muted-foreground">Goals against reduction</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-yellow-600">Penalties</div>
              <div className="text-2xl font-bold">
                {Math.round((strategy.forecheck_intensity + strategy.defensive_pressure) / 25)}%
              </div>
              <div className="text-xs text-muted-foreground">Expected increase</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-600">Fatigue</div>
              <div className="text-2xl font-bold">
                {Math.round((strategy.forecheck_intensity + strategy.defensive_pressure + strategy.offensive_style) / 30)}%
              </div>
              <div className="text-xs text-muted-foreground">Player fatigue impact</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};