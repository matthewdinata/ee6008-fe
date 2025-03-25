import { VenueTable } from './components/venue-table';

export default function VenuePage() {
	return (
		<div className="container mx-auto p-6 text-foreground">
			<div className="space-y-8">
				<div className="flex items-center justify-between mb-4">
					<h1 className="text-2xl font-bold">Venue Management</h1>
					<div className="flex items-center space-x-2">
						<p className="text-sm text-muted-foreground">
							Manage venues for scheduling exams and classes
						</p>
					</div>
				</div>

				{/* Venue Table Section */}
				<div className="bg-card rounded-lg shadow-sm p-6 border border-border">
					<VenueTable />
				</div>
			</div>
		</div>
	);
}
