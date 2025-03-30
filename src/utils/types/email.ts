import { z } from 'zod';

// Response type for all email-related actions
export interface EmailResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
}

// Types for email templates
export interface EmailTemplate {
	id: number;
	name: string;
	subject: string;
	body: string;
	description?: string;
	createdBy: number;
	createdAt: string;
	updatedAt: string;
}

// Types for email logs
export interface EmailLog {
	id: number;
	htmlBody: string;
	templateId: number;
	recipient: string | string[];
	subject: string;
	status: 'success' | 'failed' | 'pending';
	sentBy: number;
	sentAt: string;
	createdAt: string;
}

// Types for scheduled emails
export interface ScheduledEmail {
	id: number;
	template_id: number;
	scheduled_date: string;
	scheduledDate: string;
	status: 'pending' | 'sent' | 'failed';
	subject?: string;
	recipients: string;
	email_list: string;
	emailList?: string;
	created_by: number;
	sent_at: string | null;
	sentAt: string | null;
	createdAt: string;
	created_at: string;
	updated_at: string;
	htmlBody?: string;
	recipient?: string[];
}

// Types for pagination response
export interface PaginationResponse<T> {
	data: T[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
	};
}

// Types for sending email response
export interface SendEmailResponse {
	successCount: number;
	failedCount: number;
	failedEmails: string[];
}

// Types for scheduled email send response
export interface ScheduledEmailSendResponse {
	id: number;
	status: string;
	sentCount: number;
	failedCount: number;
	totalCount: number;
	recipientCount: number;
	templateId: number;
	message: string;
}

// Types for user data (for recipient selection)
export interface User {
	id: number;
	email: string;
	name: string;
}

// Type for recipient
export type RecipientType = 'students' | 'faculty' | 'specific';

// Schema for creating/updating email templates
export const emailTemplateSchema = z.object({
	name: z.string().min(1, 'Template name is required'),
	subject: z.string().min(1, 'Subject is required'),
	body: z.string().min(1, 'Email body is required'),
	description: z.string().optional(),
});

export type EmailTemplateInput = z.infer<typeof emailTemplateSchema>;

// Schema for sending emails immediately
export const sendEmailSchema = z.object({
	templateId: z.number().positive({ message: 'Template is required' }),
	semesterId: z.number().positive({ message: 'Semester is required' }),
	recipients: z.enum(['students', 'faculty', 'specific']),
	email_list: z.array(z.string().email()).optional(),
});

export interface SendEmailInput {
	templateId: number;
	semesterId: number;
	recipients: 'students' | 'faculty' | 'specific';
	email_list?: string[];
}

export interface SendEmailPayload {
	template_id: number;
	semester_id: number;
	recipients: 'students' | 'faculty' | 'specific';
	email_list: string[];
}

// Input interface for scheduling emails
export interface ScheduleEmailInput {
	templateId: number;
	semesterId: number;
	recipients: RecipientType;
	scheduled_date: string;
	scheduled_time: string;
	description?: string;
	email_list?: string[];
}

// Payload interface for scheduling emails (matches backend API)
export interface ScheduleEmailPayload {
	template_id: number;
	semester_id: number;
	recipients: RecipientType;
	email_list: string[];
	scheduled_date: string;
	description?: string;
}

// Schema for scheduling emails
export const scheduleEmailSchema = z.object({
	templateId: z.number().positive({ message: 'Template is required' }),
	semesterId: z.number().positive({ message: 'Semester is required' }),
	recipients: z.enum(['students', 'faculty', 'specific']),
	scheduled_date: z.string().min(1, { message: 'Date is required' }),
	scheduled_time: z.string().min(1, { message: 'Time is required' }),
	description: z.string().optional(),
	email_list: z.array(z.string().email()).optional(),
});

// We use the explicit interface definition above instead of this inferred type
// export type ScheduleEmailInput = z.infer<typeof scheduleEmailSchema>;
