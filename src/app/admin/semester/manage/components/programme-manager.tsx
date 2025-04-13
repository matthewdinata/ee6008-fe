'use client';

import { Loader2, MoreHorizontal, Plus, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';

import { deleteProgramme } from '@/utils/actions/admin/semester';
import { Programme } from '@/utils/actions/admin/types';
import { useGetProgrammes } from '@/utils/hooks/admin/use-get-programmes';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { AssignLeaderDialog } from './assign-leader-dialog';
import { CreateProgrammeDialog } from './create-programme-dialog';

interface ProgrammeManagerProps {
	semesterId: number;
}

export function ProgrammeManager({ semesterId }: ProgrammeManagerProps) {
	// Use the React Query hook instead of manual fetching
	const {
		data: programmes = [],
		isLoading,
		error: queryError,
		refetch: refetchProgrammes,
	} = useGetProgrammes(semesterId);

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isAssigningLeader, setIsAssigningLeader] = useState(false);
	const [selectedProgramme, setSelectedProgramme] = useState<Programme | null>(null);
	const [deletingProgrammeId, setDeletingProgrammeId] = useState<number | null>(null);
	const [programmeToDelete, setProgrammeToDelete] = useState<Programme | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	// Format the error message
	const error = queryError
		? queryError instanceof Error
			? queryError.message
			: 'Failed to fetch programmes'
		: deleteError;

	const handleCreateProgramme = () => {
		setIsCreateDialogOpen(true);
	};

	const handleCreateSuccess = () => {
		refetchProgrammes(); // Refetch after creating a new programme
		setIsCreateDialogOpen(false);
	};

	const handleAssignLeader = (programme: Programme) => {
		setSelectedProgramme(programme);
		setIsAssigningLeader(true);
	};

	const handleDeleteProgramme = async () => {
		if (!programmeToDelete) return;

		try {
			setDeletingProgrammeId(programmeToDelete.id);
			setDeleteError(null);

			// Call the actual API function using our server action
			const response = await deleteProgramme(programmeToDelete.id);

			if (!response.success) {
				throw new Error(response.error || 'Failed to delete programme');
			}

			// Close the dialog and reset state
			setProgrammeToDelete(null);

			// Refetch programmes after successful deletion
			refetchProgrammes();
		} catch (error) {
			console.error('Error deleting programme:', error);
			setDeleteError(error instanceof Error ? error.message : 'Failed to delete programme');
		} finally {
			setDeletingProgrammeId(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-medium">Programmes</h3>
				<div className="flex space-x-2">
					<Button
						variant="outline"
						size="icon"
						onClick={() => refetchProgrammes()}
						disabled={isLoading}
					>
						<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
					</Button>
					<Button onClick={handleCreateProgramme}>
						<Plus className="mr-2 h-4 w-4" /> Add Programme
					</Button>
				</div>
			</div>

			{error && (
				<div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{isLoading ? (
				<div className="flex justify-center items-center h-24">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : programmes.length === 0 ? (
				<div className="text-center p-6 border rounded-md bg-muted/50">
					<p className="text-muted-foreground">No programmes found for this semester.</p>
					<Button
						variant="outline"
						size="sm"
						className="mt-2"
						onClick={handleCreateProgramme}
					>
						Create First Programme
					</Button>
				</div>
			) : (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>
								<div
									className="flex items-center cursor-pointer"
									onClick={() => {
										// Sort by programme name logic could be added here
									}}
								>
									Programme
								</div>
							</TableHead>
							<TableHead>Programme Code</TableHead>
							<TableHead>Programme Leader</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{programmes.map((programme) => (
							<TableRow key={programme.id} className="hover:bg-gray-50">
								<TableCell>
									<div className="font-medium">{programme.name}</div>
								</TableCell>
								<TableCell>
									<div className="line-clamp-2">
										{programme.programme_code || 'Not set'}
									</div>
								</TableCell>
								<TableCell>
									{programme.leader_name ? (
										<div>
											<p className="font-semibold">{programme.leader_name}</p>
											{programme.leader_email && (
												<p className="text-sm text-gray-500">
													{programme.leader_email}
												</p>
											)}
										</div>
									) : programme.coordinator_professor?.user ? (
										<div>
											<p className="font-semibold">
												{programme.coordinator_professor.user.name}
											</p>
											<p className="text-sm text-gray-500">
												{programme.coordinator_professor.user.email}
											</p>
										</div>
									) : (
										<span className="text-gray-500">Not assigned</span>
									)}
								</TableCell>
								<TableCell className="text-right">
									<div className="flex justify-end items-center gap-2">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 p-0"
												>
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													onClick={() => handleAssignLeader(programme)}
												>
													Assign Leader
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													disabled={deletingProgrammeId === programme.id}
													onClick={() => setProgrammeToDelete(programme)}
												>
													{deletingProgrammeId === programme.id
														? 'Deleting...'
														: 'Delete Programme'}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			{isCreateDialogOpen && (
				<CreateProgrammeDialog
					open={isCreateDialogOpen}
					onOpenChange={setIsCreateDialogOpen}
					onSuccess={handleCreateSuccess}
					semesterId={semesterId}
				/>
			)}

			{isAssigningLeader && selectedProgramme && (
				<AssignLeaderDialog
					open={isAssigningLeader}
					onOpenChange={setIsAssigningLeader}
					onSuccess={() => refetchProgrammes()}
					programme={selectedProgramme}
					semesterId={semesterId}
				/>
			)}

			{/* Delete Programme Dialog */}
			<AlertDialog
				open={!!programmeToDelete}
				onOpenChange={(open) => !open && setProgrammeToDelete(null)}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will delete the programme &quot;{programmeToDelete?.name}&quot; and
							all related data. This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteProgramme}>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
