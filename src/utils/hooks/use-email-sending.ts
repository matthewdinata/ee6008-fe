import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetcherFn } from '@/utils/functions';

import {
	EmailLog,
	PaginationResponse,
	ScheduleEmailInput,
	ScheduledEmail,
	ScheduledEmailSendResponse,
	SendEmailInput,
	SendEmailResponse,
} from '../types/email';

// Query keys for caching
export const emailKeys = {
	logs: ['email-logs'] as const,
	scheduled: ['scheduled-emails'] as const,
	scheduledDetail: (id: number) => [...emailKeys.scheduled, id] as const,
};

/**
 * Hook to send an email immediately
 */
export const useSendEmail = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: SendEmailInput) => {
			return await fetcherFn<SendEmailResponse>(
				'faculty/emails/send',
				{
					method: 'POST',
				},
				data
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: emailKeys.logs });
		},
	});
};

/**
 * Hook to schedule an email for future sending
 */
export const useScheduleEmail = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: ScheduleEmailInput) => {
			return await fetcherFn<ScheduledEmail>(
				'faculty/emails/schedule',
				{
					method: 'POST',
				},
				data
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: emailKeys.scheduled });
		},
	});
};

/**
 * Hook to fetch email sending logs
 * @param status Optional status filter
 * @param limit Optional limit for pagination
 */
export const useEmailLogs = (status?: string, limit?: number) => {
	let queryParams = '';

	if (status) {
		queryParams += `status=${status}`;
	}

	if (limit) {
		queryParams += queryParams ? `&limit=${limit}` : `limit=${limit}`;
	}

	const endpoint = queryParams ? `faculty/emails/logs?${queryParams}` : 'faculty/emails/logs';

	return useQuery({
		queryKey: [...emailKeys.logs, { status, limit }],
		queryFn: async () => {
			return await fetcherFn<EmailLog[]>(endpoint, {
				method: 'GET',
			});
		},
	});
};

/**
 * Hook to fetch scheduled emails
 * @param status Optional status filter
 * @param limit Optional limit for pagination
 * @param offset Optional offset for pagination
 */
export const useScheduledEmails = (status?: string, limit?: number, offset?: number) => {
	let queryParams = '';

	if (status) {
		queryParams += `status=${status}`;
	}

	if (limit) {
		queryParams += queryParams ? `&limit=${limit}` : `limit=${limit}`;
	}

	if (offset) {
		queryParams += queryParams ? `&offset=${offset}` : `offset=${offset}`;
	}

	const endpoint = queryParams
		? `faculty/emails/scheduled?${queryParams}`
		: 'faculty/emails/scheduled';

	return useQuery({
		queryKey: [...emailKeys.scheduled, { status, limit, offset }],
		queryFn: async () => {
			return await fetcherFn<PaginationResponse<ScheduledEmail>>(endpoint, {
				method: 'GET',
			});
		},
	});
};

/**
 * Hook to cancel a scheduled email
 */
export const useCancelScheduledEmail = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			return await fetcherFn<{ message: string }>(`faculty/emails/scheduled/${id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: emailKeys.scheduled });
		},
	});
};

/**
 * Hook to send a scheduled email immediately
 */
export const useSendScheduledEmailNow = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			return await fetcherFn<ScheduledEmailSendResponse>(
				`faculty/emails/scheduled/${id}/send-now`,
				{
					method: 'POST',
				}
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: emailKeys.scheduled });
			queryClient.invalidateQueries({ queryKey: emailKeys.logs });
		},
	});
};
