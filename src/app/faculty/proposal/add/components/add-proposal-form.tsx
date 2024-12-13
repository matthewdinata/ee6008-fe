'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
	title: z
		.string()
		.min(2, 'Title must be at least 2 characters')
		.max(255, 'Title must be less than 255 characters'),
	programme: z.string().min(1, 'Programme is required'),
	description: z
		.string()
		.min(15, 'Description must be at least 15 characters')
		.max(1000, 'Description must be less than 1000 characters'),
});

export function AddProposalForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			programme: '',
			description: '',
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	return (
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
					name="programme"
					render={({ field, fieldState }) => (
						<FormItem>
							<FormLabel>Programme</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Select a programme" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="electronics">Electronics</SelectItem>
									<SelectItem value="communications_engineering">
										Communications Engineering
									</SelectItem>
									<SelectItem value="computer_control_automation">
										Computer Control &amp; Automation
									</SelectItem>
									<SelectItem value="power_engineering">
										Power Engineering
									</SelectItem>
									<SelectItem value="signal_processing">
										Signal Processing
									</SelectItem>
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
				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
}

export default AddProposalForm;
