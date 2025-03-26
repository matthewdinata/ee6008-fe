'use client';

import GradeAnalyticsDashboard from './components/grade-analytics-dashboard';

export default function AdminGradeAnalyticsPage() {
	return (
		<div className="container mx-auto py-6 space-y-8">
			<div>
				<h1 className="text-3xl font-bold">Grade Analytics Dashboard</h1>
				<p className="text-muted-foreground mt-2">
					Comprehensive analysis of student performance across all projects
				</p>
			</div>

			<GradeAnalyticsDashboard />
		</div>
	);
}
