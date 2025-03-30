import { z } from 'zod';

// Response type for all manual-related actions
export interface ManualResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
}

// Types for manuals
export interface Manual {
	id: number;
	title: string;
	content: string;
	category: string;
	createdAt: string;
	updatedAt: string;
}

// Types for categories
export interface Category {
	id: number;
	name: string;
	description?: string;
}

// Schema for creating/updating manuals
export const manualSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	content: z.string().min(1, 'Content is required'),
	category: z.string().min(1, 'Category is required'),
});

export type ManualInput = z.infer<typeof manualSchema>;
