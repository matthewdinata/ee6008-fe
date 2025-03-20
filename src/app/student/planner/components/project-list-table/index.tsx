'use client';

import { BookOpen, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ProjectListDataTable } from './project-list-data-table';

export default function ProjectListTable() {
	const [activeTab, setActiveTab] = useState('all');
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
						<CardContent className="p-0 py-10">
							<div className="flex flex-col items-center justify-center text-center p-6">
								<BookmarkCheck className="h-12 w-12 text-muted-foreground" />
								<h3 className="mt-4 text-lg font-medium">
									No projects on your plan yet
								</h3>
								<p className="mt-2 text-sm text-muted-foreground max-w-sm">
									You haven&apos;t planned for any projects yet. Start exploring
									projects and add projects that spark your interest.
								</p>
								<Button
									className="mt-4"
									variant="outline"
									onClick={() => setActiveTab('all')}
								>
									Explore projects
								</Button>
							</div>
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
