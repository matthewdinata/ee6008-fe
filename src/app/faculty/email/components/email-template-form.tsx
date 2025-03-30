'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateEmailTemplate, useUpdateEmailTemplate } from '@/utils/hooks/use-email-templates';
import { useToast } from '@/utils/hooks/use-toast';
import { EmailTemplate, EmailTemplateInput, emailTemplateSchema } from '@/utils/types/email';

import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EmailTemplateFormProps {
	template?: EmailTemplate;
	onSuccess?: () => void;
}

export function EmailTemplateForm({ template, onSuccess }: EmailTemplateFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();

	const createMutation = useCreateEmailTemplate();
	const updateMutation = useUpdateEmailTemplate(template?.id || 0);

	const form = useForm<EmailTemplateInput>({
		resolver: zodResolver(emailTemplateSchema),
		defaultValues: {
			name: template?.name || '',
			subject: template?.subject || '',
			body: template?.body || '',
			description: template?.description || '',
		},
	});

	const onSubmit = async (data: EmailTemplateInput) => {
		setIsSubmitting(true);

		try {
			if (template) {
				await updateMutation.mutateAsync(data);
				toast({
					title: 'Success',
					description: 'Email template updated successfully',
				});
			} else {
				await createMutation.mutateAsync(data);
				toast({
					title: 'Success',
					description: 'Email template created successfully',
				});
				form.reset({
					name: '',
					subject: '',
					body: '',
					description: '',
				});
			}

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error('Error submitting template:', error);
			toast({
				title: 'Error',
				description: 'Failed to save email template',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Template Name</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="subject"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email Subject</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="body"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email Body</FormLabel>
							<FormControl>
								<RichTextEditor
									value={field.value}
									onChange={field.onChange}
									placeholder="Write your email content here..."
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea
									{...field}
									placeholder="Briefly describe the purpose of this email template..."
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
				</Button>
			</form>
		</Form>
	);
}
