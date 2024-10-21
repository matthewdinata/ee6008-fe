import React from 'react';

export default function Background({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className="fixed left-0 top-0 -z-50">
				<div className="sticky left-0 top-0 h-screen w-screen overflow-hidden gradient-background" />
			</div>

			{children}
		</>
	);
}
