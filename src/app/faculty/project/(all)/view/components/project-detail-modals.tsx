// components/project-details-modal.tsx
import { useGetProjectDetails } from '@/utils/hooks/faculty/use-faculty-get-project-details';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface ProjectDetailsModalProps {
	projectId: number | null;
	isOpen: boolean;
	onClose: () => void;
}

export function ProjectDetailsModal({ projectId, isOpen, onClose }: ProjectDetailsModalProps) {
	// Fetch project details using the hook
	const {
		data: projectDetails,
		isLoading,
		error,
	} = useGetProjectDetails(isOpen ? projectId : null);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl">Project Details</DialogTitle>
				</DialogHeader>

				{isLoading && (
					<div className="flex justify-center items-center py-8">
						<p>Loading project details...</p>
					</div>
				)}

				{error && (
					<div className="text-red-500 py-4">
						<p>Error loading project details: {error.message}</p>
					</div>
				)}

				{projectDetails && (
					<div className="space-y-6">
						<div>
							<h3 className="text-lg font-semibold mb-2">{projectDetails.title}</h3>
							<p className="text-gray-600">
								{projectDetails.description || 'No description provided'}
							</p>
						</div>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Project Information</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="font-medium">Semester:</div>
									<div>
										{projectDetails.semester} {projectDetails.academic_year}
									</div>

									<div className="font-medium">Allocation:</div>
									<div>{projectDetails.allocation_name}</div>

									<div className="font-medium">Allocation Date:</div>
									<div>
										{new Date(
											projectDetails.allocation_timestamp
										).toLocaleDateString()}
									</div>

									<div className="font-medium">Project ID:</div>
									<div>{projectDetails.id}</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Professor</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="font-medium">Name:</div>
									<div>{projectDetails.professor?.name}</div>

									<div className="font-medium">Email:</div>
									<div>{projectDetails.professor?.email}</div>

									<div className="font-medium">ID:</div>
									<div>{projectDetails.professor?.id}</div>
								</div>
							</CardContent>
						</Card>

						{/* Added Moderator Section */}
						{projectDetails.moderator && (
							<Card>
								<CardHeader className="pb-2">
									<CardTitle className="text-base">Moderator</CardTitle>
								</CardHeader>
								<CardContent className="pt-0">
									<div className="grid grid-cols-2 gap-2 text-sm">
										<div className="font-medium">Name:</div>
										<div>{projectDetails.moderator?.name}</div>

										<div className="font-medium">Email:</div>
										<div>{projectDetails.moderator?.email}</div>

										<div className="font-medium">ID:</div>
										<div>{projectDetails.moderator?.id}</div>
									</div>
								</CardContent>
							</Card>
						)}

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-base">Team Members</CardTitle>
							</CardHeader>
							<CardContent className="pt-0">
								{projectDetails.team_members &&
								projectDetails.team_members.length > 0 ? (
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b">
													<th className="text-left py-2 font-medium">
														Name
													</th>
													<th className="text-left py-2 font-medium">
														Matriculation
													</th>
													<th className="text-left py-2 font-medium">
														Email
													</th>
												</tr>
											</thead>
											<tbody>
												{projectDetails.team_members.map((member) => (
													<tr
														key={member.student_id}
														className="border-b"
													>
														<td className="py-2">
															{member.name || '—'}
														</td>
														<td className="py-2">
															{member.matriculation_number}
														</td>
														<td className="py-2">
															{member.email || '—'}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<p>No team members assigned</p>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				<DialogFooter className="mt-6">
					<Button variant="outline" onClick={onClose}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
