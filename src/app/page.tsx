import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import CourseDescription from '@/components/seo/course-description';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Page() {
	return (
		<div className="container mx-auto px-4 py-8">
			{/* SEO-optimized course description with keyword-rich content */}
			<CourseDescription />

			{/* Login card - visually dominant for users but comes after SEO content */}
			<Card className="max-w-md mx-auto mt-8">
				<CardContent className="pt-6">
					<div className="space-y-4">
						<h2 className="text-xl font-semibold text-center">EE6008 Course Portal</h2>
						<p className="text-muted-foreground text-center">
							Access the course management system for EE6008 Collaborative Research
							and Development Project
						</p>
						<div className="flex justify-center pt-2">
							<Button asChild className="w-full">
								<Link href="/signin">
									Sign In <ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
