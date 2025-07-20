import { supabase } from '@/integrations/supabase/client';

export interface NotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  action_url?: string;
  action_label?: string;
}

/**
 * Create a new notification for the current user
 */
export const createNotification = async (notification: NotificationData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        ...notification
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Get unread notification count for current user
 */
export const getUnreadNotificationCount = async () => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;

    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

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
  })
};

/**
 * Create sample notifications for testing
 */
export const createSampleNotifications = async () => {
  const samples = [
    SAMPLE_NOTIFICATIONS.playerGenerated('Connor McDavid', 'Edmonton Oilers'),
    SAMPLE_NOTIFICATIONS.seasonComplete('2024-25'),
    SAMPLE_NOTIFICATIONS.contractExpiring('Sidney Crosby', 30),
    SAMPLE_NOTIFICATIONS.tradeProposal('Toronto Maple Leafs', 'Montreal Canadiens'),
    SAMPLE_NOTIFICATIONS.injuryReport('Alex Ovechkin', 'lower body injury'),
    SAMPLE_NOTIFICATIONS.draftComplete(2025),
    SAMPLE_NOTIFICATIONS.leagueCreated('National Hockey League'),
    SAMPLE_NOTIFICATIONS.systemMaintenance(),
    SAMPLE_NOTIFICATIONS.backupComplete()
  ];

  try {
    for (const notification of samples) {
      await createNotification(notification);
    }
    console.log('Sample notifications created successfully');
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  }
};
