import { SemesterManager } from './components/semester-manager';

// We need to dynamically render this page because it contains dynamic data that cannot be statically generated
export const dynamic = 'force-dynamic';

export default function SemesterManagePage() {
	return (
		<div className="container mx-auto p-6 text-foreground">
			<div className="space-y-8">
				{/* Semester Management Section */}
				<SemesterManager />
			</div>
		</div>
	);
}
