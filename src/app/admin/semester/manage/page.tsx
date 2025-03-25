import { SemesterManager } from './components/semester-manager';

// We need to dynamically render this page because it contains dynamic data that cannot be statically generated
export const dynamic = 'force-dynamic';

export default function SemesterManagePage() {
	return (
		<div className="container mx-auto p-6 text-foreground">
			<div className="space-y-8">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-2xl font-bold">Semester Management</h1>
					<div className="flex items-center space-x-2">
						<p className="text-sm text-muted-foreground">
							Manage semesters, timelines, and programmes
						</p>
					</div>
				</div>

				{/* Semester Management Section */}
				<SemesterManager />
			</div>
		</div>
	);
}
