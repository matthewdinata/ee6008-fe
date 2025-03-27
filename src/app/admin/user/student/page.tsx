import BulkStudentUpload from '@/app/admin/user/student/components/student-bulk-upload';
import { StudentTable } from '@/app/admin/user/student/components/student-table';

import { SingleUserAdd } from '../components/user';

export default function StudentUserPage() {
	return (
		<div className="container mx-auto text-foreground">
			<div className="space-y-8">
				{/* Top Section - Upload Methods */}
				<div className="grid md:grid-cols-2 gap-8">
					{/* Left Side - Bulk Upload */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<BulkStudentUpload />
					</div>

					{/* Right Side - Single User Add */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<SingleUserAdd defaultRole="student" />
					</div>
				</div>

				{/* Bottom Section - User Table */}
				<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
					<StudentTable />
				</div>
			</div>
		</div>
	);
}
