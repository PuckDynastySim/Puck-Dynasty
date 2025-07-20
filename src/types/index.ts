/**
 * Shared type definitions for the application
 */

export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  player_position: 'C' | 'LW' | 'RW' | 'D' | 'G';
  overall_rating: number;
  status: 'active' | 'injured' | 'suspended' | 'retired';
  team_id?: string;
  league_id: string;
  
  // Physical attributes
  height?: number; // Height in inches
  weight?: number; // Weight in pounds
  
  // Player attributes
  shooting?: number;
  passing?: number;
  defense?: number;
  puck_control?: number;
  checking?: number;
  movement?: number;
  vision?: number;
  poise?: number;
  aggressiveness?: number;
  discipline?: number;
  fighting?: number;
  flexibility?: number;
  injury?: number;
  fatigue?: number;
  rebound_control?: number;
  
  // Team/League info (when joined)
  team_name?: string;
  team_city?: string;
  league_name?: string;
  league_type?: string;
  
  // Contract info (when applicable)
  contract?: {
    salary: number;
    status: string;
  };
  
  // Injury info (when applicable)
  injury_info?: {
    injury_type: string;
    severity: string;
    expected_return_date: string;
  };
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  city: string;
  league_id: string;
  abbreviation?: string;
  created_at?: string;
  updated_at?: string;
}

export interface League {
  id: string;
  name: string;
  league_type: 'pro' | 'farm' | 'junior';
  created_at?: string;
  updated_at?: string;
}

export interface Coach {
  id: string;
  first_name: string;
  last_name: string;
  team_id?: string;
  offense_specialty: number;
  defense_specialty: number;
  line_management: number;
  motivation: number;
  powerplay_specialty: number;
  penalty_kill_specialty: number;
  created_at?: string;
  updated_at?: string;
}
