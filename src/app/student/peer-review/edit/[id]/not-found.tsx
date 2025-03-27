'use client';

import { ArrowLeft, FileQuestion } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PeerReviewNotFound() {
	const router = useRouter();

	return (
		<div className="container mx-auto py-6">
			<div className="flex items-center mb-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => router.push('/student/peer-review')}
					className="mr-2"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					Back to Peer Reviews
				</Button>
			</div>

			<Card className="mx-auto max-w-md">
				<CardHeader>
					<div className="flex items-center space-x-2">
						<FileQuestion className="h-5 w-5 text-primary" />
						<CardTitle>Review Not Found</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						We couldn&apos;t find the peer review you&apos;re looking for. This could be
						because:
					</p>
					<ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
						<li>The review ID is invalid</li>
						<li>The review has been deleted</li>
						<li>You don&apos;t have permission to view this review</li>
					</ul>
				</CardContent>
				<CardFooter>
					<Button className="w-full" onClick={() => router.push('/student/peer-review')}>
						Return to Peer Review Dashboard
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
