import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import {
	ModeratorGradeUpdate,
	SupervisorGradeUpdate,
	updateModeratorGradeComponentsClient,
	updateSupervisorGradeComponentsClient,
} from '@/utils/actions/faculty/grading';
import { useToast } from '@/utils/hooks/use-toast';

interface UseGradeComponentUpdateProps {
	projectId: number;
	type: 'supervisor' | 'moderator';
}

export function useGradeComponentUpdate({ projectId, type }: UseGradeComponentUpdateProps) {
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [editingComponentId, setEditingComponentId] = useState<string | null>(null);

	// Mutation for supervisor grade updates
	const supervisorUpdateMutation = useMutation({
		mutationFn: (updates: SupervisorGradeUpdate[]) =>
			updateSupervisorGradeComponentsClient(projectId, updates),
		onSuccess: () => {
			// Invalidate and refetch the project grades query
			queryClient.invalidateQueries({ queryKey: ['projectGradesSupervisor', projectId] });
			queryClient.invalidateQueries({ queryKey: ['finalProjectGrades', projectId] });

			toast({
				title: 'Grade updated',
				description: 'Component grade has been successfully updated.',
			});

			// Clear editing state
			setEditingComponentId(null);
		},
		onError: (error) => {
			console.error('Error updating supervisor grade:', error);
			toast({
				variant: 'destructive',
				title: 'Update failed',
				description: 'Failed to update the grade component. Please try again.',
			});
		},
	});

	// Mutation for moderator grade updates
	const moderatorUpdateMutation = useMutation({
		mutationFn: ({
			updates,
			feedback,
		}: {
			updates: Omit<ModeratorGradeUpdate, 'student_id'>[];
			feedback?: string;
		}) => updateModeratorGradeComponentsClient(projectId, updates, feedback),
		onSuccess: () => {
			// Invalidate and refetch the project grades query
			queryClient.invalidateQueries({ queryKey: ['projectGradesModerator', projectId] });
			queryClient.invalidateQueries({ queryKey: ['finalProjectGrades', projectId] });

			toast({
				title: 'Grade updated',
				description: 'Component grade has been successfully updated.',
			});

			// Clear editing state
			setEditingComponentId(null);
		},
		onError: (error) => {
			console.error('Error updating moderator grade:', error);
			toast({
				variant: 'destructive',
				title: 'Update failed',
				description: 'Failed to update the grade component. Please try again.',
			});
		},
	});

	// Function to update a supervisor component grade
	const updateSupervisorComponent = (update: SupervisorGradeUpdate) => {
		// Create a composite key for tracking which component is being edited
		const compositeKey = update.student_id
			? `${update.component_id}-${update.student_id}`
			: `${update.component_id}`;
		setEditingComponentId(compositeKey);
		supervisorUpdateMutation.mutate([update]);
	};

	// Function to update a moderator component grade
	const updateModeratorComponent = (
		update: Omit<ModeratorGradeUpdate, 'student_id'>,
		feedback?: string
	) => {
		// Moderator grades don't have student_id, so just use component_id
		setEditingComponentId(`${update.component_id}`);
		moderatorUpdateMutation.mutate({ updates: [update], feedback });
	};

	// Function to update multiple supervisor component grades
	const updateMultipleSupervisorComponents = (updates: SupervisorGradeUpdate[]) => {
		supervisorUpdateMutation.mutate(updates);
	};

	// Function to update multiple moderator component grades
	const updateMultipleModeratorComponents = (
		updates: Omit<ModeratorGradeUpdate, 'student_id'>[],
		feedback?: string
	) => {
		moderatorUpdateMutation.mutate({ updates, feedback });
	};

	return {
		editingComponentId,
		setEditingComponentId,
		isUpdating:
			type === 'supervisor'
				? supervisorUpdateMutation.isPending
				: moderatorUpdateMutation.isPending,
		updateSupervisorComponent,
		updateModeratorComponent,
		updateMultipleSupervisorComponents,
		updateMultipleModeratorComponents,
	};
}
