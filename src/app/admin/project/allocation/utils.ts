import { GeneratedAllocationData } from './types';

/**
 * Prepares allocation data for CSV export including comprehensive data
 * @param data The allocation data to be exported
 * @returns Object containing headers, data and filename for CSV export
 */
export const prepareCSVData = (data: GeneratedAllocationData) => {
	if (!data || !data.result) {
		return { headers: [], data: [], filename: '' };
	}

	// Main allocation data for student allocations
	const headers = [
		{ label: 'Student ID', key: 'studentId' },
		{ label: 'Name', key: 'name' },
		{ label: 'Matriculation Number', key: 'matriculationNumber' },
		{ label: 'Project ID', key: 'projectId' },
		{ label: 'Priority', key: 'priority' },
		{ label: 'Status', key: 'status' },
	];

	// Map and clean allocation data
	const studentData = data.result.allocations
		.filter((allocation) => allocation && allocation.studentId)
		.map((allocation) => ({
			studentId: allocation.studentId,
			name: allocation.name || '',
			matriculationNumber: allocation.matriculationNumber || '',
			projectId: allocation.projectId,
			priority: allocation.priority,
			status: allocation.status || 'allocated',
		}));

	// Create summary data
	const summaryData = [
		{ metric: '', value: '' }, // Empty row for separation
		{ metric: 'SUMMARY DATA', value: '' }, // Section header
		{ metric: 'Allocation ID', value: data.allocationId },
		{ metric: 'Allocation Rate', value: `${data.result.allocationRate.toFixed(2)}%` },
		{ metric: 'Average Preference', value: data.result.averagePreference.toFixed(2) },
		{ metric: '', value: '' }, // Empty row for separation
		{ metric: 'PREFERENCE DISTRIBUTION', value: '' },
	];

	// Add preference distribution
	Object.entries(data.result.preferenceDistribution).forEach(([key, value]) => {
		summaryData.push({ metric: `Priority ${key}`, value: value.toString() });
	});

	// Add unallocated students
	if (data.result.unallocatedStudents.length > 0) {
		summaryData.push({ metric: '', value: '' }); // Empty row for separation
		summaryData.push({ metric: 'UNALLOCATED STUDENTS', value: '' });
		summaryData.push({
			metric: 'Total unallocated',
			value: data.result.unallocatedStudents.length.toString(),
		});

		data.result.unallocatedStudents.forEach((studentId, index) => {
			summaryData.push({ metric: `Student ID ${index + 1}`, value: studentId.toString() });
		});
	}

	// Add dropped projects
	if (data.result.droppedProjects.length > 0) {
		summaryData.push({ metric: '', value: '' }); // Empty row for separation
		summaryData.push({ metric: 'DROPPED PROJECTS', value: '' });
		summaryData.push({
			metric: 'Total dropped',
			value: data.result.droppedProjects.length.toString(),
		});

		data.result.droppedProjects.forEach((projectId, index) => {
			summaryData.push({ metric: `Project ID ${index + 1}`, value: projectId.toString() });
		});
	}

	// Combine all data (main allocations + summary data)
	const allData = [
		...studentData,
		...summaryData.map((item) => ({
			studentId: '',
			name: item.metric,
			matriculationNumber: '',
			projectId: '',
			priority: '',
			status: item.value,
		})),
	];

	// Generate filename
	const filename = `allocation_${data.allocationId}_${new Date().toISOString().split('T')[0]}.csv`;

	return { headers, data: allData, filename };
};

/**
 * Prepares summary data for CSV export
 * @param data The allocation data to prepare summary for
 * @returns Object containing headers, data and filename for summary CSV export
 */
export const prepareSummaryData = (data: GeneratedAllocationData) => {
	if (!data || !data.result) {
		return { headers: [], data: [], filename: '' };
	}

	// Summary data with headers
	const headers = [
		{ label: 'Metric', key: 'metric' },
		{ label: 'Value', key: 'value' },
	];

	const csvData = [
		{ metric: 'Allocation ID', value: data.allocationId },
		{ metric: 'Allocation Rate', value: `${data.result.allocationRate.toFixed(2)}%` },
		{ metric: 'Average Preference', value: data.result.averagePreference.toFixed(2) },
	];

	// Add preference distribution
	Object.entries(data.result.preferenceDistribution).forEach(([key, value]) => {
		csvData.push({ metric: `Priority ${key}`, value });
	});

	// Add unallocated students count
	csvData.push({
		metric: 'Unallocated Students',
		value: data.result.unallocatedStudents.length,
	});

	// Add dropped projects count
	csvData.push({
		metric: 'Dropped Projects',
		value: data.result.droppedProjects.length,
	});

	const filename = `allocation_${data.allocationId}_summary_${new Date().toISOString().split('T')[0]}.csv`;

	return { headers, data: csvData, filename };
};
