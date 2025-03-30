import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetcherFn } from '@/utils/functions';

import { EmailTemplate, EmailTemplateInput } from '../types/email';

// Query keys for caching
export const emailTemplateKeys = {
	all: ['email-templates'] as const,
	myTemplates: () => [...emailTemplateKeys.all, 'my'] as const,
	detail: (id: number) => [...emailTemplateKeys.all, id] as const,
};

/**
 * Hook to fetch all email templates
 */
export const useEmailTemplates = () => {
	return useQuery({
		queryKey: emailTemplateKeys.all,
		queryFn: async () => {
			return await fetcherFn<EmailTemplate[]>('faculty/emails/templates', {
				method: 'GET',
			});
		},
	});
};

/**
 * Hook to fetch email templates created by the current user
 */
export const useMyEmailTemplates = () => {
	return useQuery({
		queryKey: emailTemplateKeys.myTemplates(),
		queryFn: async () => {
			return await fetcherFn<EmailTemplate[]>('faculty/emails/templates/my', {
				method: 'GET',
			});
		},
	});
};

/**
 * Hook to fetch a specific email template by ID
 */
export const useEmailTemplate = (id: number) => {
	return useQuery({
		queryKey: emailTemplateKeys.detail(id),
		queryFn: async () => {
			return await fetcherFn<EmailTemplate>(`faculty/emails/templates/${id}`, {
				method: 'GET',
			});
		},
		enabled: !!id,
	});
};

/**
 * Hook to create a new email template
 */
export const useCreateEmailTemplate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: EmailTemplateInput) => {
			return await fetcherFn<EmailTemplate>(
				'faculty/emails/templates',
				{
					method: 'POST',
				},
				data
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
			queryClient.invalidateQueries({ queryKey: emailTemplateKeys.myTemplates() });
		},
	});
};

/**
 * Hook to update an existing email template
 */
export const useUpdateEmailTemplate = (id: number) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: EmailTemplateInput) => {
			return await fetcherFn<EmailTemplate>(
				`faculty/emails/templates/${id}`,
				{
					method: 'PATCH',
				},
				data
			);
		},
		onSuccess: (_data) => {
			queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
			queryClient.invalidateQueries({ queryKey: emailTemplateKeys.myTemplates() });
			queryClient.invalidateQueries({ queryKey: emailTemplateKeys.detail(id) });
		},
	});
};

/**
 * Hook to delete an email template
 */
export const useDeleteEmailTemplate = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: number) => {
			return await fetcherFn<{ message: string }>(`faculty/emails/templates/${id}`, {
				method: 'DELETE',
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: emailTemplateKeys.all });
			queryClient.invalidateQueries({ queryKey: emailTemplateKeys.myTemplates() });
		},
	});
};
