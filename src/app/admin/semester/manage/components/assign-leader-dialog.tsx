'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { assignLeader, getFacultyUsers } from '@/utils/actions/admin/semester';
import { Programme } from '@/utils/actions/admin/types';
import { useToast } from '@/utils/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
	email: z.string().min(1, 'Please select a faculty member'),
});

type LeaderFormValues = z.infer<typeof formSchema>;

interface AssignLeaderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess: () => void;
	programme: Programme | null;
	semesterId: number;
}

// Define a type for the faculty user response
interface FacultyUserResponse {
	id: number;
	name?: string;
	email?: string;
	role?: string;
	professor?: {
		id?: number;
		user_id?: number;
		user?: {
			id?: number;
			name?: string;
			email?: string;
			role?: string;
		};
	};
}

// Define a simplified user interface for the component
interface FormattedUser {
	id: number;
	name: string;
	email: string;
	role: string;
}

export const AssignLeaderDialog: React.FC<AssignLeaderDialogProps> = ({
	open,
	onOpenChange,
	onSuccess,
	programme,
	semesterId,
}) => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingUsers, setIsLoadingUsers] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [users, setUsers] = useState<FormattedUser[]>([]);
	const { toast } = useToast();

	const form = useForm<LeaderFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: '',
		},
	});

	useEffect(() => {
		if (open && programme) {
			// Reset form when dialog opens with a new programme
			const coordinatorEmail = programme.coordinator_professor?.user?.email || '';
			form.reset({
				email: coordinatorEmail,
			});
			console.log('Form reset with email:', coordinatorEmail);

			// Fetch faculty users
			const fetchUsers = async () => {
				setIsLoadingUsers(true);
				try {
					const response = await getFacultyUsers();
					if (!response.success || !response.data) {
						throw new Error(response.error || 'Failed to fetch faculty users');
					}

					console.log('Faculty users raw response:', response.data);

					// Handle different possible data structures coming from the API
					const formattedUsers = (response.data as FacultyUserResponse[]).map((user) => {
						// Format the user data based on the structure we receive
						let name = user.name || '';
						let email = user.email || '';

						// If the user has a professor property, extract data from there
						if (user.professor && user.professor.user) {
							name = user.professor.user.name || name;
							email = user.professor.user.email || email;
						}

						// Ensure email is never empty
						if (!email) {
							console.error('User without email:', user);
							email = `user-${Date.now()}@placeholder.com`;
						}

						return {
							id: Number(user.id), // Ensure id is a number
							name,
							email,
							role: user.role || 'faculty',
						};
					});
					console.log('Formatted faculty users:', formattedUsers);
					setUsers(formattedUsers);
				} catch (error) {
					console.error('Failed to fetch users:', error);
					setError('Failed to load faculty members');
				} finally {
					setIsLoadingUsers(false);
				}
			};

			fetchUsers();
		}
	}, [open, programme, form]);

	async function onSubmit(values: LeaderFormValues) {
		if (!programme) return;

		setIsSubmitting(true);
		setError(null);

		try {
			// Validate the email value before submission
			if (!values.email || values.email === '0') {
				console.error('Invalid email detected in form values:', values.email);
				setError('Invalid email address. Please select a faculty member.');
				setIsSubmitting(false);
				return;
			}

			// Call the API to assign programme leader
			console.log('Assigning leader:', {
				programmeId: programme.id,
				email: values.email,
				semesterId: semesterId,
			});

			const response = await assignLeader({
				programmeId: programme.id,
				email: values.email,
				semesterId: semesterId,
			});

			console.log('Leader assignment response:', JSON.stringify(response, null, 2));

			if (!response.success) {
				// Handle authentication errors specifically
				if (response.error?.includes('401') || response.error?.includes('Invalid token')) {
					setError(
						'Authentication error: Your session may have expired. Please refresh the page and try again.'
					);
				} else {
					setError(response.error || 'Failed to assign programme leader');
				}
				setIsSubmitting(false);
				return;
			}

			// Success case
			onSuccess();
			onOpenChange(false);

			// Show success toast
			toast({
				title: 'Success',
				description: 'Programme leader assigned successfully',
			});
		} catch (error) {
			console.error('Error in form submission:', error);

			// Check for authentication errors in the caught error
			if (
				error instanceof Error &&
				(error.message.includes('401') || error.message.includes('Invalid token'))
			) {
				setError(
					'Authentication error: Your session may have expired. Please refresh the page and try again.'
				);
			} else {
				setError('An unexpected error occurred. Please try again.');
			}

			setIsSubmitting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Assign Programme Leader</DialogTitle>
					<DialogDescription>
						Select a faculty member to lead the programme &quot;{programme?.name}&quot;.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
						{error}
					</div>
				)}

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel>Faculty Member</FormLabel>
									<Select
										disabled={isLoadingUsers}
										onValueChange={(value) => {
											console.log('Selected faculty email:', value);
											if (value && value !== '0') {
												field.onChange(value);
											}
										}}
										value={field.value || ''}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a faculty member" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{isLoadingUsers ? (
												<div className="flex justify-center p-4">
													<Loader2 className="h-4 w-4 animate-spin" />
												</div>
											) : users.length === 0 ? (
												<div className="p-4 text-center text-sm text-muted-foreground">
													No faculty members found
												</div>
											) : (
												users.map((user) => (
													<SelectItem key={user.email} value={user.email}>
														{user.name} ({user.email})
													</SelectItem>
												))
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting || isLoadingUsers}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Assigning...
									</>
								) : (
									'Assign Leader'
								)}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
