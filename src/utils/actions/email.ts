'use server';

import { fetcherFn } from '@/utils/functions';
import {
	EmailLog,
	EmailResponse,
	EmailTemplate,
	ScheduleEmailPayload,
	ScheduledEmail,
	SendEmailPayload,
} from '@/utils/types/email';

/**
 * Fetch email templates
 */
export async function fetchEmailTemplates(): Promise<EmailTemplate[]> {
	try {
		console.log('API Call:', 'GET', `${process.env.BACKEND_API_URL}/faculty/emails/templates`);
		return await fetcherFn<EmailTemplate[]>('faculty/emails/templates', {
			method: 'GET',
		});
	} catch (error) {
		console.error('Error fetching email templates:', error);
		return [];
	}
}

/**
 * Fetch email logs
 */
export async function fetchEmailLogs(): Promise<EmailLog[]> {
	try {
		console.log('API Call:', 'GET', `${process.env.BACKEND_API_URL}/faculty/emails/logs`);
		return await fetcherFn<EmailLog[]>('faculty/emails/logs', {
			method: 'GET',
		});
	} catch (error) {
		console.error('Error fetching email logs:', error);
		return [];
	}
}

/**
 * Fetch scheduled emails
 */
export async function fetchScheduledEmails(): Promise<ScheduledEmail[]> {
	try {
		console.log('API Call:', 'GET', `${process.env.BACKEND_API_URL}/faculty/emails/scheduled`);
		return await fetcherFn<ScheduledEmail[]>('faculty/emails/scheduled', {
			method: 'GET',
		});
	} catch (error) {
		console.error('Error fetching scheduled emails:', error);
		return [];
	}
}

/**
 * Send email to recipients
 * @param data Email data containing template_id, semester_id, recipients, email_list
 */
export async function sendEmail(data: SendEmailPayload): Promise<EmailResponse> {
	try {
		console.log(
			'API Call:',
			'POST',
			`${process.env.BACKEND_API_URL}/faculty/emails/send`,
			data
		);
		return await fetcherFn<EmailResponse>(
			'faculty/emails/send',
			{
				method: 'POST',
			},
			data
		);
	} catch (error) {
		console.error('Error sending email:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

/**
 * Schedule email to be sent at a specific time
 * @param data Schedule data containing template_id, semester_id, recipients, scheduled_date, etc.
 */
export async function scheduleEmail(data: ScheduleEmailPayload): Promise<EmailResponse> {
	try {
		console.log(
			'API Call:',
			'POST',
			`${process.env.BACKEND_API_URL}/faculty/emails/schedule`,
			data
		);
		return await fetcherFn<EmailResponse>(
			'faculty/emails/schedule',
			{
				method: 'POST',
			},
			data
		);
	} catch (error) {
		console.error('Error scheduling email:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}

/**
 * Delete a scheduled email
 * @param id ID of the scheduled email to delete
 */
export async function deleteScheduledEmail(id: number): Promise<EmailResponse> {
	try {
		console.log(
			'API Call:',
			'DELETE',
			`${process.env.BACKEND_API_URL}/faculty/emails/scheduled/${id}`
		);
		return await fetcherFn<EmailResponse>(`faculty/emails/scheduled/${id}`, {
			method: 'DELETE',
		});
	} catch (error) {
		console.error('Error deleting scheduled email:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
}
