import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
	deleteScheduledEmail,
	fetchEmailLogs,
	fetchEmailTemplates,
	fetchScheduledEmails,
	scheduleEmail,
	sendEmail,
} from '@/utils/actions/email';
import { ScheduleEmailPayload, SendEmailPayload } from '@/utils/types/email';

/**
 * Hook to fetch email templates
 */
export function useEmailTemplates() {
	return useQuery({
		queryKey: ['emailTemplates'],
		queryFn: async () => {
			try {
				return await fetchEmailTemplates();
			} catch (error) {
				console.error('Error in useEmailTemplates:', error);
				throw error;
			}
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		refetchOnWindowFocus: false,
	});
}

/**
 * Hook to fetch email logs
 */
export function useEmailLogs() {
	return useQuery({
		queryKey: ['emailLogs'],
		queryFn: async () => {
			try {
				return await fetchEmailLogs();
			} catch (error) {
				console.error('Error in useEmailLogs:', error);
				throw error;
			}
		},
		staleTime: 1 * 60 * 1000, // 1 minute
		refetchOnWindowFocus: true,
	});
}

/**
 * Hook to fetch scheduled emails
 */
export function useScheduledEmails() {
	return useQuery({
		queryKey: ['scheduledEmails'],
		queryFn: async () => {
			try {
				return await fetchScheduledEmails();
			} catch (error) {
				console.error('Error in useScheduledEmails:', error);
				throw error;
			}
		},
		staleTime: 1 * 60 * 1000, // 1 minute
		refetchOnWindowFocus: true,
	});
}

/**
 * Hook to send emails
 */
export function useSendEmail() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: SendEmailPayload) => {
			return sendEmail(data);
		},
		onSuccess: () => {
			// Invalidate and refetch email logs after a successful send
			queryClient.invalidateQueries({ queryKey: ['emailLogs'] });
		},
	});
}

/**
 * Hook to schedule emails
 */
export function useScheduleEmail() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ScheduleEmailPayload) => {
			return scheduleEmail(data);
		},
		onSuccess: () => {
			// Invalidate and refetch scheduled emails after a successful schedule
			queryClient.invalidateQueries({ queryKey: ['scheduledEmails'] });
		},
	});
}

/**
 * Hook to delete scheduled emails
 */
export function useDeleteScheduledEmail() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			return deleteScheduledEmail(id);
		},
		onSuccess: () => {
			// Invalidate and refetch scheduled emails after a successful deletion
			queryClient.invalidateQueries({ queryKey: ['scheduledEmails'] });
		},
	});
}
