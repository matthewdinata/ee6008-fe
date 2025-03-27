'use client';

import { Plus, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Semester } from '@/utils/actions/admin/types';
import { useGetSemesters } from '@/utils/hooks/admin/use-get-semesters';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { CreateSemesterDialog } from './create-semester-dialog';
import { TimelineManager } from './timeline-manager';

export function SemesterManager() {
	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
	const [showHistory, setShowHistory] = useState(false);

	// Use the custom hook for fetching semesters
	const {
		data: semestersData = [],
		isLoading: isSemestersLoading,
		error: semestersError,
		refetch: refetchSemesters,
	} = useGetSemesters();

	// Update loading and error states based on the hook
	useEffect(() => {
		setIsLoading(isSemestersLoading);
		if (semestersError) {
			setError(
				semestersError instanceof Error ? semestersError.message : 'An error occurred'
			);
		} else {
			setError(null);
		}

		// Process semesters data when it's available
		if (semestersData && semestersData.length > 0) {
			console.log('Processing semesters data:', semestersData.length, 'items');

			// Map the data to ensure consistent property names
			const transformedSemesters = semestersData.map(
				(sem: {
					id: number;
					name: string;
					academicYear?: number;
					isActive?: boolean;
					min_cap?: number | null;
					max_cap?: number | null;
					created_at?: string;
					updated_at?: string;
					createdAt?: string;
					updatedAt?: string;
					startDate?: string;
					endDate?: string;
					status?: string;
					minCap?: number | null;
					maxCap?: number | null;
				}) => ({
					id: sem.id,
					name: sem.name,
					academicYear: sem.academicYear || 0,
					isActive: Boolean(sem.isActive),
					active: Boolean(sem.isActive),
					academic_year: sem.academicYear || 0,
					min_cap: sem.min_cap || sem.minCap || null,
					max_cap: sem.max_cap || sem.maxCap || null,
					created_at: sem.created_at || sem.createdAt || undefined,
					updated_at: sem.updated_at || sem.updatedAt || undefined,
					createdAt: sem.created_at || sem.createdAt || undefined,
					updatedAt: sem.updated_at || sem.updatedAt || undefined,
					startDate: sem.startDate || undefined,
					endDate: sem.endDate || undefined,
					status: sem.status || '',
				})
			);

			setSemesters(transformedSemesters);

			// Find active semester
			const activeSemester = transformedSemesters.find(
				(sem) => Boolean(sem.isActive) === true
			);

			if (activeSemester) {
				console.log('Found active semester:', activeSemester.id, activeSemester.name);
				setSelectedSemester(activeSemester);
			} else if (transformedSemesters.length > 0) {
				console.log('No active semester, selecting first:', transformedSemesters[0].id);
				setSelectedSemester(transformedSemesters[0]);
			}
		}
	}, [semestersData, isSemestersLoading, semestersError]);

	const handleCreateSuccess = (newSemester: Semester) => {
		setSemesters((prev) => [...prev, newSemester]);
		setIsCreateDialogOpen(false);
		// Refetch to ensure we have the latest data
		refetchSemesters();
	};

	const handleSemesterSelect = (semester: Semester) => {
		// Log the selected semester data for debugging
		console.log('Selected semester data:', JSON.stringify(semester, null, 2));

		setSelectedSemester(semester);
	};

	// Separate active and inactive semesters
	const activeSemesters = semesters.filter(
		(semester) => semester.isActive || semester.active === true
	);
	const inactiveSemesters = semesters.filter(
		(semester) => !semester.isActive && !semester.active
	);

	return (
		<div className="space-y-8">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-xl font-bold">Semester Management</CardTitle>
					<div className="flex space-x-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => refetchSemesters()}
							disabled={isLoading}
						>
							<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
						</Button>
						<Button
							variant="default"
							size="sm"
							onClick={() => setIsCreateDialogOpen(true)}
						>
							<Plus className="mr-2 h-4 w-4" /> Create Semester
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{error && (
						<div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
							{error}
						</div>
					)}

					{/* Active Semesters Section */}
					<div className="mb-6">
						<h3 className="text-lg font-medium mb-2">Current Semester</h3>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Academic Year</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{activeSemesters.length === 0 ? (
									<TableRow>
										<TableCell colSpan={4} className="h-24 text-center">
											{isLoading
												? 'Loading semesters...'
												: 'No active semester found.'}
										</TableCell>
									</TableRow>
								) : (
									activeSemesters.map((semester) => (
										<TableRow
											key={semester.id}
											className={
												selectedSemester?.id === semester.id
													? 'bg-muted/50'
													: ''
											}
										>
											<TableCell>{semester.academicYear}</TableCell>
											<TableCell>{semester.name}</TableCell>
											<TableCell>
												{semester.isActive ? 'Active' : 'Inactive'}
											</TableCell>
											<TableCell className="text-right">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleSemesterSelect(semester)}
												>
													Select
												</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Inactive/Historical Semesters Section */}
					{inactiveSemesters.length > 0 && (
						<div className="mt-8 border-t pt-4">
							<div
								className="flex items-center justify-between cursor-pointer mb-2"
								onClick={() => setShowHistory(!showHistory)}
							>
								<h3 className="text-lg font-medium">Semester History</h3>
								<Button variant="ghost" size="sm">
									{showHistory ? 'Hide' : 'Show'} History
								</Button>
							</div>

							{showHistory && (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Academic Year</TableHead>
											<TableHead>Name</TableHead>
											<TableHead>Status</TableHead>
											<TableHead className="text-right">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{inactiveSemesters.map((semester) => (
											<TableRow
												key={semester.id}
												className={
													selectedSemester?.id === semester.id
														? 'bg-muted/50'
														: ''
												}
											>
												<TableCell>{semester.academicYear}</TableCell>
												<TableCell>{semester.name}</TableCell>
												<TableCell>
													{semester.isActive ? 'Active' : 'Inactive'}
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															handleSemesterSelect(semester)
														}
													>
														Select
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{selectedSemester && (
				<TimelineManager
					semesterId={selectedSemester.id}
					academicYear={selectedSemester.academicYear?.toString() || 'N/A'}
					semesterName={selectedSemester.name}
				/>
			)}

			<CreateSemesterDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				onSuccess={handleCreateSuccess}
			/>
		</div>
	);
}
