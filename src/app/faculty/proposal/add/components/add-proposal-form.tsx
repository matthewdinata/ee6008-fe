'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useCreateProposal } from '@/utils/hooks/faculty/use-create-proposal';
import { useGetActiveProgrammes } from '@/utils/hooks/faculty/use-get-active-programmes';
import { useGetActiveSemesterTimeline } from '@/utils/hooks/faculty/use-get-active-semester-timeline';
import { useGetActiveVenues } from '@/utils/hooks/faculty/use-get-active-venues';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
	title: z
		.string()
		.min(2, 'Title must be at least 2 characters')
		.max(255, 'Title must be less than 255 characters'),
	programmeId: z.number().int().positive('Programme is required'),
	description: z
		.string()
		.min(15, 'Description must be at least 15 characters')
		.max(1000, 'Description must be less than 1000 characters'),
	venueId: z.number().int().positive('Venue is required'),
});

export function AddProposalForm() {
	const router = useRouter();

	const { data: venues, isPending: isLoadingVenues } = useGetActiveVenues();
	const { data: programmes, isPending: isLoadingProgrammes } = useGetActiveProgrammes();
	const { mutate: createProposal, isPending: isCreatingProposal } = useCreateProposal();

	const { data: semesterTimeline, isPending: isLoadingSemesterTimeline } =
		useGetActiveSemesterTimeline();

	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [isWithinSubmissionPeriod, setIsWithinSubmissionPeriod] = useState(false);
	const [timeMessage, setTimeMessage] = useState('');

	useEffect(() => {
		// Check if current time is within the submission period
		if (semesterTimeline) {
			const now = new Date();
			const startDate = new Date(semesterTimeline.facultyProposalSubmissionStart);
			const endDate = new Date(semesterTimeline.facultyProposalSubmissionEnd);

			if (now < startDate) {
				setIsWithinSubmissionPeriod(false);
				const formattedStartDate = new Intl.DateTimeFormat('en-US', {
					dateStyle: 'full',
					timeStyle: 'long',
				}).format(startDate);
				setTimeMessage(`Submissions will open on ${formattedStartDate}`);
			} else if (now > endDate) {
				setIsWithinSubmissionPeriod(false);
				setTimeMessage('The submission period has ended.');
			} else {
				setIsWithinSubmissionPeriod(true);
				const formattedEndDate = new Intl.DateTimeFormat('en-US', {
					dateStyle: 'full',
					timeStyle: 'long',
				}).format(endDate);
				setTimeMessage(`Submissions close on ${formattedEndDate}`);
			}
		}
	}, [semesterTimeline]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			programmeId: undefined,
			description: '',
			venueId: undefined,
		},
	});

	const handleGotItClick = () => {
		setShowSuccessModal(false);
		router.push('/faculty/proposal/view');
	};

	function onSubmit(values: z.infer<typeof formSchema>) {
		// Verify again that we're within the submission period
		if (!isWithinSubmissionPeriod) return;

		try {
			createProposal(
				{
					title: values.title,
					description: values.description,
					venueId: values.venueId,
					programmeId: values.programmeId,
				},
				{
					onSuccess: () => {
						setShowSuccessModal(true);
						form.reset();
					},
				}
			);
		} catch (error) {
			console.error('Failed to create proposal:', error);
		}
	}

	const isLoading =
		isLoadingVenues || isLoadingProgrammes || isCreatingProposal || isLoadingSemesterTimeline;

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}

	return (
		<>
			{/* Display time-based alert */}
			<Alert
				className={`mb-6 ${isWithinSubmissionPeriod ? 'bg-blue-200/20' : 'bg-amber-200/20'}`}
			>
				<Clock
					className={`h-4 w-4 ${isWithinSubmissionPeriod ? 'text-blue-600' : 'text-amber-600'}`}
				/>
				<AlertTitle className="flex items-center gap-2">
					{/* <Clock className="h-4 w-4" /> */}
					{isWithinSubmissionPeriod
						? 'Submission Period Active'
						: 'Submission Period Inactive'}
				</AlertTitle>
				<AlertDescription>{timeMessage}</AlertDescription>
			</Alert>

			<Form {...form}>
				<form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="title"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input
										placeholder="Project title"
										{...field}
										disabled={!isWithinSubmissionPeriod}
									/>
								</FormControl>
								{fieldState.error ? (
									<FormMessage />
								) : (
									<FormDescription>Your proposed project title</FormDescription>
								)}
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="programmeId"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel>Programme</FormLabel>
								<Select
									onValueChange={(value) => field.onChange(parseInt(value))}
									value={field.value?.toString()}
									disabled={!isWithinSubmissionPeriod}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a programme" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{programmes?.map((programme) => (
											<SelectItem
												key={programme.id}
												value={programme.id.toString()}
											>
												{programme.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.error ? (
									<FormMessage />
								) : (
									<FormDescription>
										The programme covering your project&#x27;s primary area
									</FormDescription>
								)}
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="venueId"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel>Venue</FormLabel>
								<Select
									onValueChange={(value) => field.onChange(parseInt(value))}
									value={field.value?.toString()}
									disabled={!isWithinSubmissionPeriod}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a venue" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{venues?.map((venue) => (
											<SelectItem key={venue.id} value={venue.id.toString()}>
												{venue.name}

												<span className="text-muted-foreground ml-2">
													({venue.location})
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{fieldState.error ? (
									<FormMessage />
								) : (
									<FormDescription>
										The venue where your project will progress or be worked on
									</FormDescription>
								)}
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="description"
						render={({ field, fieldState }) => (
							<FormItem>
								<div className="flex justify-between items-center">
									<FormLabel>Description</FormLabel>
									<span className="text-sm text-muted-foreground">
										{field.value?.length || 0}/1000
									</span>
								</div>
								<FormControl>
									<Textarea
										placeholder="Project description"
										className="min-h-[240px] resize-none"
										maxLength={1000}
										{...field}
										disabled={!isWithinSubmissionPeriod}
									/>
								</FormControl>
								{fieldState.error ? (
									<FormMessage />
								) : (
									<FormDescription>
										Describe your project in detail (15-1000 characters)
									</FormDescription>
								)}
							</FormItem>
						)}
					/>
					<Button type="submit" disabled={isLoading || !isWithinSubmissionPeriod}>
						{isWithinSubmissionPeriod ? 'Submit' : 'Submission Currently Closed'}
					</Button>
				</form>
			</Form>

			<AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Proposal Submitted!</AlertDialogTitle>
						<AlertDialogDescription>
							Your proposal has been successfully submitted and will be reviewed soon.
							Thank you for your submission!
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={handleGotItClick}>Got it!</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

export default AddProposalForm;
