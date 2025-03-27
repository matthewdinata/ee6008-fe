'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export default function ButtonTest() {
	const [isLoading, setIsLoading] = useState(false);

	const handleClick = () => {
		console.log('Button clicked!');
		setIsLoading(true);

		// Simulate API call
		setTimeout(() => {
			console.log('API call completed');
			setIsLoading(false);
		}, 2000);
	};

	return (
		<Card className="w-full max-w-md mx-auto mt-10">
			<CardContent className="pt-6">
				<p>Test if the button is clickable</p>
			</CardContent>
			<CardFooter className="flex justify-end gap-2">
				<Button variant="outline">Cancel</Button>
				<Button onClick={handleClick} disabled={isLoading}>
					{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Click Me
				</Button>
			</CardFooter>
		</Card>
	);
}
