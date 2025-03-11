import { BulkUserUpload } from '@/app/admin/upload/page';
import UserTable from '@/app/admin/user/student/table';

import { SingleUserAdd } from '../student/user';

export default function DashboardLoading() {
	return (
		<div className="container mx-auto p-6 text-foreground">
			<div className="space-y-8">
				{/* Top Section - Upload Methods */}
				<div className="grid md:grid-cols-2 gap-8">
					{/* Left Side - Bulk Upload */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<BulkUserUpload />
					</div>

					{/* Right Side - Single User Add */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<SingleUserAdd />
					</div>
				</div>

				{/* Bottom Section - User Table */}
				<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
					<UserTable />
				</div>
			</div>
		</div>
	);
}
