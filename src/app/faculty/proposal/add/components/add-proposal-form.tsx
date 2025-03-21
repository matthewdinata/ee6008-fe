'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useCreateProposal } from '@/utils/hooks/faculty/use-create-proposal';
import { useGetActiveProgrammes } from '@/utils/hooks/faculty/use-get-active-programmes';
import { useGetActiveVenues } from '@/utils/hooks/faculty/use-get-active-venues';

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

	const [showSuccessModal, setShowSuccessModal] = useState(false);

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

	const isLoading = isLoadingVenues || isLoadingProgrammes || isCreatingProposal;

	return (
		<>
			<Form {...form}>
				<form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="title"
						render={({ field, fieldState }) => (
							<FormItem>
								<FormLabel>Title</FormLabel>
								<FormControl>
									<Input placeholder="Project title" {...field} />
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
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a programme" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{isLoadingProgrammes ? (
											<div className="flex items-center justify-center p-2">
												<Skeleton className="h-8 w-full" />
											</div>
										) : (
											programmes?.map((programme) => (
												<SelectItem
													key={programme.id}
													value={programme.id.toString()}
												>
													{programme.name}
												</SelectItem>
											))
										)}
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
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a venue" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{isLoadingVenues ? (
											<div className="flex items-center justify-center p-2">
												<Skeleton className="h-8 w-full" />
											</div>
										) : (
											venues?.map((venue) => (
												<SelectItem
													key={venue.id}
													value={venue.id.toString()}
												>
													{venue.name}

													<span className="text-muted-foreground ml-2">
														({venue.location})
													</span>
												</SelectItem>
											))
										)}
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
					<Button type="submit" disabled={isLoading}>
						Submit
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
