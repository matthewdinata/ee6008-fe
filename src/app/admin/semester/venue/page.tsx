import ClientVenueAdd from './components/client-venue-add';
import { VenueTable } from './components/venue-table';
import VenueBulkUpload from './venue-bulk-upload';

// We need to dynamically render this page because it contains dynamic data
export const dynamic = 'force-dynamic';

export default function VenuePage() {
	return (
		<div className="container mx-auto text-foreground">
			<div className="space-y-8">
				{/* Top Section - Upload Methods */}
				<div className="grid md:grid-cols-2 gap-8">
					{/* Left Side - Bulk Upload */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<VenueBulkUpload />
					</div>

					{/* Right Side - Single Venue Add */}
					<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
						<ClientVenueAdd />
					</div>
				</div>

				{/* Bottom Section - Venue Table */}
				<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
					<VenueTable />
				</div>
			</div>
		</div>
	);
}
