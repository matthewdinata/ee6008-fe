import { Suspense } from 'react';

import AllocatedProject, { AllocatedProjectSkeleton } from './allocated-project-section';

export const dynamic = 'force-dynamic';

export default function AllocatedProjectPage() {
	return (
		<div>
			<Suspense fallback={<AllocatedProjectSkeleton />}>
				<AllocatedProject />
			</Suspense>
		</div>
	);
}
