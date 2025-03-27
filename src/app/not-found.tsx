import { BookMarked, BookOpenCheck, GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center h-full space-y-6 pb-4 px-12">
			<div className="relative">
				<BookMarked size={100} className="text-primary animate-bounce " strokeWidth={1.2} />
				<GraduationCap
					size={40}
					className="absolute -top-2 -right-2 rotate-12 text-chart-2"
					strokeWidth={1.5}
				/>
				<BookOpenCheck
					size={40}
					className="absolute -bottom-2 -left-2 -rotate-12 text-chart-3"
					strokeWidth={1.5}
				/>
			</div>
			<h1
				className="text-4xl font-bold bg-clip-text text-transparent"
				style={{
					backgroundImage: 'var(--gradient)',
				}}
			>
				Uh, oh!
			</h1>
			<div className="text-lg text-center flex flex-col items-center space-y-2">
				<div>
					We&apos;ve searched all our lecture halls, but this page seems to be missing.
				</div>
				<div>Check out other pages to continue your journey.</div>
			</div>
		</div>
	);
}
