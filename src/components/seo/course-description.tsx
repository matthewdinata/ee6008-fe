'use client';

import React from 'react';

import { Card, CardContent, CardDescription } from '@/components/ui/card';

interface CourseDescriptionProps {
	className?: string;
	hideOnMobile?: boolean;
}

export default function CourseDescription({
	className = '',
	hideOnMobile = false,
}: CourseDescriptionProps): React.ReactElement {
	// This component adds SEO-friendly content with proper heading structure
	// It can be visually hidden but still readable by search engines

	const visibilityClass = hideOnMobile ? 'hidden md:block' : '';

	return (
		<div className={`my-6 ${visibilityClass} ${className}`}>
			<Card className="border border-muted">
				<CardContent className="pt-6">
					<h1 className="text-2xl font-bold mb-3">
						EE6008 Collaborative Research and Development Project
					</h1>
					<CardDescription className="text-sm text-muted-foreground mb-4">
						Nanyang Technological University | School of EEE | MSc Programme
					</CardDescription>

					<div className="space-y-4">
						<div>
							<h2 className="text-lg font-semibold">Course Overview</h2>
							<p>
								This module aims to provide MSc students under the School of
								EEE&apos;s MSc programmes with practical experience in the design,
								implementation, prototyping and testing of electrical and electronic
								engineering projects or multi-disciplinary projects.
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<h3 className="text-md font-medium">Course Details</h3>
								<ul className="list-disc pl-5 space-y-1">
									<li>Academic Year: AY2023-24</li>
									<li>Semester: 2</li>
									<li>Course Code: EE6008</li>
									<li>Contact Hours: 39</li>
									<li>AUs: 3</li>
								</ul>
							</div>

							<div>
								<h3 className="text-md font-medium">Available Programmes</h3>
								<ul className="list-disc pl-5 space-y-1">
									<li>MSc Communications Engineering (CME)</li>
									<li>MSc Computer Control & Automation (CCA)</li>
									<li>MSc Electronics (ET)</li>
									<li>MSc Power Engineering (PE)</li>
									<li>MSc Signal Processing (SP)</li>
								</ul>
							</div>
						</div>

						<div>
							<h2 className="text-lg font-semibold">Course Aims</h2>
							<p>
								This allows students to exercise their design or innovative ideas
								through the process in a team project environment. Students will
								work on electrical and electronic engineering projects or
								multi-disciplinary projects that involve major electrical and
								electronic engineering-related components.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
