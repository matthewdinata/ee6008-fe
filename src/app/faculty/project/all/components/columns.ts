import { Project } from '@/utils/actions/admin/types';

export type ProjectStatus = 'open' | 'pending' | 'assigned' | 'completed' | 'archived';

export interface EnhancedProject extends Project {
	professor: {
		id: number;
		name: string;
	};
	programme: {
		id: number;
		name: string;
	};
	moderator: {
		id: number;
		name: string;
	};
	status: ProjectStatus;
}
