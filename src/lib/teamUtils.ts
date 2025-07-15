import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

/**
 * Utility functions for handling team-related database operations
 * Centralizes the logic for handling "free_agents" vs null team_id conversions
 */

/**
 * Converts team filter value to proper database value
 * @param teamValue - The team value from UI (could be "free_agents", null, or actual team ID)
 * @returns null for free agents, or the actual team ID
 */
export function normalizeTeamId(teamValue: string | null | undefined): string | null {
  if (!teamValue || teamValue === "free_agents") {
    return null;
  }
  return teamValue;
}

/**
 * Converts database team_id value to UI display value
 * @param teamId - The team_id from database (null for free agents)
 * @returns "free_agents" for null values, or the actual team ID
 */
export function denormalizeTeamId(teamId: string | null | undefined): string {
  if (!teamId) {
    return "free_agents";
  }
  return teamId;
}

/**
 * Applies team filter to a Supabase query builder
 * @param query - The Supabase query builder
 * @param teamFilter - The team filter value ("free_agents", "all-teams", or team ID)
 * @returns The query builder with team filter applied
 */
export function applyTeamFilter(
  query: any,
  teamFilter: string | null | undefined
): any {
  if (!teamFilter || teamFilter === "all-teams") {
    return query;
  }
  
  if (teamFilter === "free_agents") {
    return query.is('team_id', null);
  }
  
  return query.eq('team_id', teamFilter);
}

/**
 * Validates that a team ID is a proper UUID or null/free_agents
 * @param teamId - The team ID to validate
 * @returns true if valid, false otherwise
 */
export function isValidTeamId(teamId: string | null | undefined): boolean {
  if (!teamId || teamId === "free_agents") {
    return true;
  }
  
  // UUID regex pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidPattern.test(teamId);
}

/**
 * Safely filters an array by team_id, handling free agents correctly
 * @param items - Array of items with team_id property
 * @param teamFilter - The team filter value
 * @returns Filtered array
 */
export function filterByTeam<T extends { team_id: string | null }>(
  items: T[],
  teamFilter: string | null | undefined
): T[] {
  if (!teamFilter || teamFilter === "all-teams") {
    return items;
  }
  
  if (teamFilter === "free_agents") {
    return items.filter(item => !item.team_id);
  }
  
  return items.filter(item => item.team_id === teamFilter);
}