import { Suspense } from 'react';

import AllocatedProject, { AllocatedProjectSkeleton } from './allocated-project-section';

export default function AllocatedProjectPage() {
	return (
		<div>
			<Suspense fallback={<AllocatedProjectSkeleton />}>
				<AllocatedProject />
			</Suspense>
		</div>
	);
}
