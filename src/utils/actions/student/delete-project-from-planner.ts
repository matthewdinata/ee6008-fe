'use server';

import { revalidateTag } from 'next/cache';

import { fetcherFn } from '../../functions';

export async function deleteProjectFromPlanner(plannerId: number): Promise<boolean> {
	try {
		await fetcherFn(`student/planner/${plannerId}`, {
			method: 'DELETE',
			next: { tags: ['planner', 'plans'] },
		});

		revalidateTag('plans');
		return true;
	} catch (error) {
		console.error('Error in deleteProjectFromPlanner:', error);
		throw error;
	}
}
