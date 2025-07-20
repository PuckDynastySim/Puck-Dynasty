
// Simplified notification utilities that don't rely on database storage
// This provides a working notifications system without requiring additional DB setup

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  action_url?: string;
  action_label?: string;
}

/**
 * Sample notifications for different scenarios
 */
export const SAMPLE_NOTIFICATIONS = {
  playerGenerated: (playerName: string, teamName: string) => ({
    title: 'New Player Generated',
    message: `${playerName} has been added to ${teamName}'s roster.`,
    type: 'success' as const,
    action_url: '/player-management',
    action_label: 'View Players'
  }),

  seasonComplete: (season: string) => ({
    title: 'Season Complete',
    message: `The ${season} regular season has ended. Playoffs are ready to begin!`,
    type: 'success' as const,
    action_url: '/simulation-engine',
    action_label: 'Start Playoffs'
  }),

  contractExpiring: (playerName: string, days: number) => ({
    title: 'Contract Expiring',
    message: `${playerName}'s contract expires in ${days} days. Consider renewal negotiations.`,
    type: 'warning' as const,
    action_url: '/player-management',
    action_label: 'View Contract'
  }),

  tradeProposal: (fromTeam: string, toTeam: string) => ({
    title: 'Trade Proposal',
    message: `${fromTeam} has proposed a trade with ${toTeam}. Review the details.`,
    type: 'info' as const,
    action_url: '/trades',
    action_label: 'Review Trade'
  }),

  injuryReport: (playerName: string, injury: string) => ({
    title: 'Player Injury',
    message: `${playerName} has suffered a ${injury}. Expected recovery time varies.`,
    type: 'error' as const,
    action_url: '/roster-management',
    action_label: 'View Roster'
  }),

  draftComplete: (year: number) => ({
    title: 'Draft Complete',
    message: `The ${year} entry draft has concluded. Review your new prospects.`,
    type: 'success' as const,
    action_url: '/draft-results',
    action_label: 'View Results'
  }),

  leagueCreated: (leagueName: string) => ({
    title: 'League Created',
    message: `${leagueName} has been successfully created and is ready for teams.`,
    type: 'success' as const,
    action_url: '/league-alignment',
    action_label: 'Manage League'
  }),

  systemMaintenance: () => ({
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2-4 AM EST. Save your work.',
    type: 'system' as const
  }),

  backupComplete: () => ({
    title: 'Backup Complete',
    message: 'Your dynasty data has been successfully backed up to secure storage.',
    type: 'system' as const
  }),

  userCreated: (userName: string, role: string) => ({
    title: 'User Created Successfully',
    message: `${userName} has been created with ${role} role and can now access the system.`,
    type: 'success' as const,
    action_url: '/admin/users',
    action_label: 'View Users'
  })
};

/**
 * Get sample notifications for demo purposes
 */
export const getSampleNotifications = () => {
  return [
    { 
      id: '1', 
      ...SAMPLE_NOTIFICATIONS.userCreated('John Doe', 'GM'),
      is_read: false,
      created_at: new Date().toISOString()
    },
    { 
      id: '2', 
      ...SAMPLE_NOTIFICATIONS.seasonComplete('2024-25'),
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    { 
      id: '3', 
      ...SAMPLE_NOTIFICATIONS.contractExpiring('Connor McDavid', 30),
      is_read: true,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    { 
      id: '4', 
      ...SAMPLE_NOTIFICATIONS.systemMaintenance(),
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];
};
