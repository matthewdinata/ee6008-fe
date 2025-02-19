'use client';

import BulkStudentUpload from '@/app/admin/user/student/studen';
import UserTable from '@/app/admin/user/student/table';

import { SingleUserAdd } from '../student/user';

export default function DashboardLoading() {
	return (
		<div className="container mx-auto p-6">
			<div className="space-y-8">
				{/* Top Section - Upload Methods */}
				<div className="grid md:grid-cols-2 gap-8">
					{/* Left Side - Bulk Upload */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<BulkStudentUpload />
					</div>

					{/* Right Side - Single User Add */}
					<div className="bg-white rounded-lg shadow-sm p-6">
						<SingleUserAdd />
					</div>
				</div>

				{/* Bottom Section - User Table */}
				<div className="bg-white rounded-lg shadow-sm p-6">
					<UserTable />
				</div>
			</div>
		</div>
	);
}
