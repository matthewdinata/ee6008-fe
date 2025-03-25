import BulkUserUpload from '@/app/admin/user/faculty/components/bulk-user-upload';
import FacultyTable from '@/app/admin/user/faculty/components/faculty-table';

import { SingleUserAdd } from '../components/user';

export default function FacultyUserPage() {
	return (
		<div className="container mx-auto text-foreground">
			<div className="space-y-8">
				{/* Top Section - Upload Methods */}
				<div className="grid md:grid-cols-2 gap-8">
					{/* Left Side - Bulk Upload */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<BulkUserUpload />
					</div>

					{/* Right Side - Single User Add */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<SingleUserAdd defaultRole="faculty" />
					</div>
				</div>

				{/* Bottom Section - User Table */}
				<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
					<FacultyTable />
				</div>
			</div>
		</div>
	);
}
