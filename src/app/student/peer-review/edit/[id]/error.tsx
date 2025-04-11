'use client';

import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function PeerReviewErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const router = useRouter();

	useEffect(() => {
		// Log the error to an error reporting service
		console.error('Peer Review Error:', error);
	}, [error]);

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
						<AlertCircle className="h-5 w-5 text-destructive" />
						<CardTitle>Something went wrong</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						We encountered an issue while loading the peer review. This could be
						because:
					</p>
					<ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
						<li>The review ID is invalid</li>
						<li>You don&apos;t have permission to view this review</li>
						<li>The review has been deleted</li>
						<li>There was a temporary server issue</li>
					</ul>
				</CardContent>
				<CardFooter className="flex justify-between">
					<Button variant="outline" onClick={() => router.push('/student/peer-review')}>
						Return to Dashboard
					</Button>
					<Button onClick={() => reset()}>Try Again</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
