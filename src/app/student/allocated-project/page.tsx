import { CalendarIcon, Users2 } from 'lucide-react';
import React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

function AllocatedProject() {
	return (
		<div>
			<Card>
				<CardHeader className="space-y-1">
					<div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<h2 className="text-xl font-bold">Blockchain for Supply Chain</h2>
							<p className="text-sm text-muted-foreground">
								Supervised by William Parker
							</p>
						</div>
						<div className="sm:flex-shrink-0">
							<Badge>Technology</Badge>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Project Details */}
					<div className="space-y-4">
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<CalendarIcon size={16} />
							<span>24S1</span>
						</div>

						<div className="space-y-2">
							<h3 className="font-semibold">Description</h3>
							<p className="text-sm text-muted-foreground">
								Blockchain technology offers a decentralized and secure way to track
								and verify transactions across a supply chain. This project aims to
								explore the application of blockchain in enhancing transparency,
								reducing fraud, and improving the efficiency of supply chain
								operations. Students will investigate various blockchain platforms,
								develop smart contracts, and analyze the impact of blockchain on
								supply chain management.
							</p>
						</div>

						{/* Team Members */}
						<div>
							<h3 className="font-semibold mb-3 flex items-center gap-2">
								<Users2 size={18} />
								Team Members
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{[
									'Borrusia Lee',
									'Rendy Williams',
									'Wheelock Poe',
									'Kia Picasso',
									'Donovan Page',
								].map((member, index) => (
									<div key={index} className="flex items-center gap-2">
										<Avatar className="h-8 w-8">
											<AvatarFallback>
												{member
													.split(' ')
													.map((n) => n[0])
													.join('')}
											</AvatarFallback>
										</Avatar>
										<span className="text-sm">{member}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</CardContent>

				<CardFooter className="mt-4">
					<div className="w-full text-sm text-muted-foreground">
						<p>
							For any questions about this project, please contact your supervisor at{' '}
							<a
								href="mailto:williamparker@ntu.com"
								// TODO: fix color for text
								className="text-primary hover:text-primary/80 underline"
							>
								williamparker@ntu.com
							</a>{' '}
							or team members directly.
						</p>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}

export default AllocatedProject;
