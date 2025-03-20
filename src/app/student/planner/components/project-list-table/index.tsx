'use client';

import { BookOpen, BookmarkCheck, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

import { useGetPlannedProjects } from '@/utils/hooks/student/use-get-planned-projects';
import { useGetRegistrations } from '@/utils/hooks/student/use-get-registrations';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { plannedColumns } from './planned-columns';
import { ProjectListDataTable } from './project-list-data-table';
import { registeredColumns } from './registered-columns';

export default function ProjectListTable() {
	const [activeTab, setActiveTab] = useState('all');
	const { data: plannedProjects, isPending: isPlannedPending } = useGetPlannedProjects();
	const { data: registrations, isLoading: isRegistrationsPending } = useGetRegistrations();

	const hasPlannedProjects = plannedProjects && plannedProjects.length > 0;
	const hasRegisteredProjects = registrations && registrations.projects.length > 0;
	const registeredProjects = Array.isArray(registrations?.projects) ? registrations : [];

	return (
		<div className="space-y-6">
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<div className="flex items-center justify-between">
					<TabsList>
						<TabsTrigger value="all" className="flex items-center gap-1">
							<BookOpen className="h-4 w-4" />
							All Projects
						</TabsTrigger>
						<TabsTrigger value="planned" className="flex items-center gap-1">
							<BookmarkCheck className="h-4 w-4" />
							Planned
						</TabsTrigger>
						<TabsTrigger value="registered" className="flex items-center gap-1">
							<ClipboardCheck className="h-4 w-4" />
							Registered
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value="all" className="mt-4">
					<Card>
						<CardContent className="p-6">
							<ProjectListDataTable />
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="planned" className="mt-4">
					<Card>
						<CardContent className="p-6">
							{isPlannedPending ? (
								<Skeleton className="w-full h-64" />
							) : !hasPlannedProjects ? (
								<div className="flex flex-col items-center justify-center text-center p-6">
									<BookmarkCheck className="h-12 w-12 text-muted-foreground" />
									<h3 className="mt-4 text-lg font-medium">
										No projects on your plan yet
									</h3>
									<p className="mt-2 text-sm text-muted-foreground max-w-sm">
										You haven&apos;t planned for any projects yet. Start
										exploring projects and add projects that spark your
										interest.
									</p>
									<Button
										className="mt-4"
										variant="outline"
										onClick={() => setActiveTab('all')}
									>
										Explore projects
									</Button>
								</div>
							) : (
								<DataTable
									columns={plannedColumns}
									data={plannedProjects || []}
									filterBy="title"
									pageSize={6}
								/>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="registered" className="mt-4">
					<Card>
						<CardContent className="p-6">
							{isRegistrationsPending ? (
								<Skeleton className="w-full h-64" />
							) : !hasRegisteredProjects ? (
								<div className="flex flex-col items-center justify-center text-center p-6">
									<ClipboardCheck className="h-12 w-12 text-muted-foreground" />
									<h3 className="mt-4 text-lg font-medium">
										No registered projects yet
									</h3>
									<p className="mt-2 text-sm text-muted-foreground max-w-sm">
										You haven&apos;t registered for any projects yet. Once you
										register for projects, they will appear here.
									</p>
									<Button
										className="mt-4"
										variant="outline"
										onClick={() => setActiveTab('all')}
									>
										Explore projects
									</Button>
								</div>
							) : (
								<DataTable
									columns={registeredColumns}
									data={
										Array.isArray(registeredProjects)
											? []
											: registeredProjects.projects || []
									}
									filterBy="title"
									pageSize={6}
								/>
							)}
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<div className="text-xs text-muted-foreground">
				<p>Tip: Projects are updated regularly. Check back often for new opportunities.</p>
			</div>
		</div>
	);
}
