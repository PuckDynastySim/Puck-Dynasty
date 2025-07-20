import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Save, RotateCcw } from 'lucide-react';

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  player_position: string;
  overall_rating: number;
  height?: number; // Height in inches
  weight?: number; // Weight in pounds
}

interface LineBuilderProps {
  teamId: string;
  leagueId: string;
}

interface LineSlot {
  position: string;
  player?: Player;
}

interface LineConfiguration {
  [key: string]: LineSlot[];
}

export const LineBuilder: React.FC<LineBuilderProps> = ({ teamId, leagueId }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [lines, setLines] = useState<LineConfiguration>({
    line1: [
      { position: 'lw' }, { position: 'c' }, { position: 'rw' }, 
      { position: 'ld' }, { position: 'rd' }
    ],
    line2: [
      { position: 'lw' }, { position: 'c' }, { position: 'rw' }, 
      { position: 'ld' }, { position: 'rd' }
    ],
    line3: [
      { position: 'lw' }, { position: 'c' }, { position: 'rw' }, 
      { position: 'ld' }, { position: 'rd' }
    ],
    line4: [
      { position: 'lw' }, { position: 'c' }, { position: 'rw' }, 
      { position: 'ld' }, { position: 'rd' }
    ],
    pp1: [
      { position: 'lw' }, { position: 'c' }, { position: 'rw' }, 
      { position: 'ld' }, { position: 'rd' }
    ],
    pp2: [
      { position: 'lw' }, { position: 'c' }, { position: 'rw' }, 
      { position: 'ld' }, { position: 'rd' }
    ],
    pk1: [
      { position: 'c' }, { position: 'rw' }, { position: 'ld' }, { position: 'rd' }
    ],
    pk2: [
      { position: 'c' }, { position: 'rw' }, { position: 'ld' }, { position: 'rd' }
    ],
    goalies: [
      { position: 'g' }, { position: 'g' }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [teamId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch team players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, first_name, last_name, player_position, overall_rating')
        .eq('team_id', teamId);

      if (playersError) throw playersError;

      // Fetch existing lines
      const { data: linesData, error: linesError } = await supabase
        .from('team_lines')
        .select('*')
        .eq('team_id', teamId);

      if (linesError) throw linesError;

      setPlayers(playersData || []);

      // Populate existing lines
      if (linesData && linesData.length > 0) {
        const newLines = { ...lines };
        linesData.forEach(line => {
          const lineType = line.line_type;
          const positionIndex = getPositionIndex(lineType, line.position);
          if (newLines[lineType] && positionIndex !== -1) {
            const player = playersData?.find(p => p.id === line.player_id);
            if (player) {
              newLines[lineType][positionIndex].player = player;
            }
          }
        });
        setLines(newLines);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load line data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPositionIndex = (lineType: string, position: string): number => {
    const lineConfig = lines[lineType];
    if (!lineConfig) return -1;
    return lineConfig.findIndex(slot => slot.position === position);
  };

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    setDraggedPlayer(player);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, lineType: string, slotIndex: number) => {
    e.preventDefault();
    if (!draggedPlayer) return;

    // Validate position compatibility
    const slot = lines[lineType][slotIndex];
    const isCompatible = isPlayerPositionCompatible(draggedPlayer.player_position, slot.position);
    
    if (!isCompatible) {
      toast({
        title: "Invalid Position",
        description: `${draggedPlayer.first_name} ${draggedPlayer.last_name} cannot play ${slot.position.toUpperCase()}`,
        variant: "destructive"
      });
      return;
    }

    // Remove player from any existing slot
    const newLines = { ...lines };
    Object.keys(newLines).forEach(lt => {
      newLines[lt] = newLines[lt].map(s => 
        s.player?.id === draggedPlayer.id ? { ...s, player: undefined } : s
      );
    });

    // Add player to new slot
    newLines[lineType][slotIndex].player = draggedPlayer;
    setLines(newLines);
    setDraggedPlayer(null);
  };

  const isPlayerPositionCompatible = (playerPosition: string, slotPosition: string): boolean => {
    const compatibility: { [key: string]: string[] } = {
      'F': ['lw', 'c', 'rw'],
      'D': ['ld', 'rd'],
      'G': ['g']
    };
    return compatibility[playerPosition]?.includes(slotPosition) || false;
  };

  const removePlayerFromSlot = (lineType: string, slotIndex: number) => {
    const newLines = { ...lines };
    newLines[lineType][slotIndex].player = undefined;
    setLines(newLines);
  };

  const saveLines = async () => {
    try {
      setSaving(true);

      // Delete existing lines
      await supabase
        .from('team_lines')
        .delete()
        .eq('team_id', teamId);

      // Insert new lines
      const lineInserts: any[] = [];
      Object.entries(lines).forEach(([lineType, slots]) => {
        slots.forEach((slot, index) => {
          if (slot.player) {
            lineInserts.push({
              team_id: teamId,
              league_id: leagueId,
              line_type: lineType,
              position: slot.position,
              player_id: slot.player.id,
              line_order: index + 1
            });
          }
        });
      });

      if (lineInserts.length > 0) {
        const { error } = await supabase
          .from('team_lines')
          .insert(lineInserts);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Line combinations saved successfully"
      });

    } catch (error) {
      console.error('Error saving lines:', error);
      toast({
        title: "Error",
        description: "Failed to save line combinations",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const clearLines = () => {
    const clearedLines = { ...lines };
    Object.keys(clearedLines).forEach(lineType => {
      clearedLines[lineType] = clearedLines[lineType].map(slot => ({
        ...slot,
        player: undefined
      }));
    });
    setLines(clearedLines);
  };

  const getPositionLabel = (position: string): string => {
    const labels: { [key: string]: string } = {
      'lw': 'LW', 'c': 'C', 'rw': 'RW',
      'ld': 'LD', 'rd': 'RD', 'g': 'G'
    };
    return labels[position] || position.toUpperCase();
  };

  const getPositionColor = (position: string): string => {
    const colors: { [key: string]: string } = {
      'F': 'bg-blue-500/10 text-blue-600 border-blue-200',
      'D': 'bg-green-500/10 text-green-600 border-green-200',
      'G': 'bg-purple-500/10 text-purple-600 border-purple-200'
    };
    return colors[position] || 'bg-gray-500/10 text-gray-600 border-gray-200';
  };

  const LineSlotComponent = ({ 
    slot, 
    lineType, 
    slotIndex 
  }: { 
    slot: LineSlot; 
    lineType: string; 
    slotIndex: number;
  }) => (
    <div
      className="w-24 h-16 border-2 border-dashed border-muted rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, lineType, slotIndex)}
      onClick={() => slot.player && removePlayerFromSlot(lineType, slotIndex)}
    >
      {slot.player ? (
        <div className="text-center">
          <div className="text-xs font-medium truncate w-full">
            {slot.player.first_name[0]}. {slot.player.last_name}
          </div>
          <div className="text-xs text-muted-foreground">
            {slot.player.overall_rating}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-xs font-medium text-muted-foreground">
            {getPositionLabel(slot.position)}
          </div>
          <div className="text-xs text-muted-foreground">Empty</div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return <div className="p-4">Loading line builder...</div>;
  }

  const availablePlayers = players.filter(player => 
    !Object.values(lines).some(line => 
      line.some(slot => slot.player?.id === player.id)
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Line Builder</h3>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={clearLines}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear All
          </Button>
          <Button onClick={saveLines} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save Lines'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Available Players */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Available Players ({availablePlayers.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {availablePlayers.map(player => (
              <div
                key={player.id}
                draggable
                onDragStart={(e) => handleDragStart(e, player)}
                className="flex items-center space-x-2 p-2 border rounded cursor-move hover:bg-muted/50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {player.first_name[0]}{player.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {player.first_name} {player.last_name}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className={`text-xs ${getPositionColor(player.player_position)}`}>
                      {player.player_position}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {player.overall_rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Lines */}
        <Card className="lg:col-span-3">
          <CardContent className="p-4">
            <Tabs defaultValue="even-strength" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="even-strength">Even Strength</TabsTrigger>
                <TabsTrigger value="special-teams">Special Teams</TabsTrigger>
                <TabsTrigger value="goalies">Goalies</TabsTrigger>
              </TabsList>

              <TabsContent value="even-strength" className="space-y-4">
                {['line1', 'line2', 'line3', 'line4'].map((lineType, index) => (
                  <div key={lineType} className="space-y-2">
                    <h4 className="text-sm font-medium">Line {index + 1}</h4>
                    <div className="flex space-x-2">
                      {lines[lineType].map((slot, slotIndex) => (
                        <LineSlotComponent
                          key={slotIndex}
                          slot={slot}
                          lineType={lineType}
                          slotIndex={slotIndex}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="special-teams" className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Power Play 1</h4>
                  <div className="flex space-x-2">
                    {lines.pp1.map((slot, slotIndex) => (
                      <LineSlotComponent
                        key={slotIndex}
                        slot={slot}
                        lineType="pp1"
                        slotIndex={slotIndex}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Power Play 2</h4>
                  <div className="flex space-x-2">
                    {lines.pp2.map((slot, slotIndex) => (
                      <LineSlotComponent
                        key={slotIndex}
                        slot={slot}
                        lineType="pp2"
                        slotIndex={slotIndex}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Penalty Kill 1</h4>
                  <div className="flex space-x-2">
                    {lines.pk1.map((slot, slotIndex) => (
                      <LineSlotComponent
                        key={slotIndex}
                        slot={slot}
                        lineType="pk1"
                        slotIndex={slotIndex}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Penalty Kill 2</h4>
                  <div className="flex space-x-2">
                    {lines.pk2.map((slot, slotIndex) => (
                      <LineSlotComponent
                        key={slotIndex}
                        slot={slot}
                        lineType="pk2"
                        slotIndex={slotIndex}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="goalies" className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Goaltenders</h4>
                  <div className="flex space-x-2">
                    {lines.goalies.map((slot, slotIndex) => (
                      <div key={slotIndex} className="space-y-1">
                        <div className="text-xs text-center text-muted-foreground">
                          {slotIndex === 0 ? 'Starter' : 'Backup'}
                        </div>
                        <LineSlotComponent
                          slot={slot}
                          lineType="goalies"
                          slotIndex={slotIndex}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};