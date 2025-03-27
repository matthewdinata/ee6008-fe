'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { assignProjectModerator } from '@/utils/actions/admin/project';
import { AssignModeratorRequest, Project } from '@/utils/actions/admin/types';
import { useGetFacultyUsers } from '@/utils/hooks/admin/use-get-facullty-users';
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
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface AssignModeratorDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	project: Project;
	onAssigned?: () => void;
}

export default function AssignModeratorDialog({
	open,
	onOpenChange,
	project,
	onAssigned = () => {},
}: AssignModeratorDialogProps) {
	const [facultyId, setFacultyId] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();

	// Use the custom hook for fetching faculty data with proper caching
	const { data: faculty = [], isLoading: facultyLoading } = useGetFacultyUsers({
		onSuccess: (data) => {
			console.log(`Loaded ${data.length} faculty users`);
		},
	});

	// Reset the form when dialog opens with a new project
	useEffect(() => {
		if (open && project) {
			console.log('Dialog opened for project:', project.id);
			// Reset faculty selection when opening for a new project
			setFacultyId('');
		}
	}, [open, project]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!facultyId) {
			toast({
				title: 'Error',
				description: 'Please select a faculty member',
				variant: 'destructive',
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Prepare the request data
			const request: AssignModeratorRequest = {
				project_id: project.id,
				email: faculty.find((f) => f.id === parseInt(facultyId))?.email || '',
			};

			console.log('Assigning moderator with data:', request);

			// Call the server action
			const result = await assignProjectModerator(request);

			console.log('Assignment result:', result);

			// Show success message
			toast({
				title: 'Success',
				description: 'Moderator assigned successfully',
			});

			// Close the dialog and trigger refresh
			onOpenChange(false);
			onAssigned();
		} catch (error) {
			console.error('Error assigning moderator:', error);
			toast({
				title: 'Error',
				description: 'Failed to assign moderator',
				variant: 'destructive',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Assign Moderator</DialogTitle>
					<DialogDescription>
						Assign a faculty member as a moderator for this project.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						{project && (
							<div>
								<p className="text-sm font-medium mb-2">Project: {project.title}</p>
							</div>
						)}
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="faculty" className="text-right">
								Faculty
							</Label>
							<div className="col-span-3">
								<Select value={facultyId} onValueChange={setFacultyId}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a faculty member" />
									</SelectTrigger>
									<SelectContent
										position="popper"
										className="max-h-[200px] overflow-y-auto z-50"
									>
										{!facultyLoading ? (
											faculty && faculty.length > 0 ? (
												faculty.map((user) => (
													<SelectItem
														key={`faculty-${user.id}`}
														value={user.id.toString()}
													>
														{user.name} ({user.email})
													</SelectItem>
												))
											) : (
												<div className="p-2 text-sm text-muted-foreground">
													No faculty members available
												</div>
											)
										) : (
											<div className="p-2 text-sm text-muted-foreground">
												Loading faculty members...
											</div>
										)}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Assigning...
								</>
							) : (
								'Assign'
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
