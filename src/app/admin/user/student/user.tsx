'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { createFacultyUser, createUser, getSemesters } from '@/utils/actions/admin/fetch';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface FormData {
	email: string;
	name: string;
	studentID: string;
	semesterID: string;
	isCoordinator: boolean;
}

interface FormErrors {
	[key: string]: string;
}

interface Semester {
	id: number;
	name: string;
	academic_year: string | number;
	is_active: boolean;
	status: string;
}

interface SingleUserAddProps {
	defaultRole?: string;
}

export function SingleUserAdd({ defaultRole }: SingleUserAddProps) {
	const router = useRouter();
	const _supabase = createClientComponentClient();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [role, setRole] = useState<string>(defaultRole || 'student');
	const [errors, setErrors] = useState<FormErrors>({});
	const [debugLog, setDebugLog] = useState<string[]>([]);
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [formData, setFormData] = useState<FormData>({
		email: '',
		name: '',
		studentID: '',
		semesterID: '',
		isCoordinator: false,
	});

	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [loadingSemesters, setLoadingSemesters] = useState(false);

	// Fetch semesters on component mount
	useEffect(() => {
		const fetchSemesters = async () => {
			setLoadingSemesters(true);
			try {
				const response = await getSemesters();
				if (response.success) {
					setSemesters(response.data || []);
				}
			} catch (error) {
				console.error('Error fetching semesters:', error);
			} finally {
				setLoadingSemesters(false);
			}
		};

		fetchSemesters();
	}, []);

	// Function to validate form fields
	const validateForm = () => {
		const validationErrors: FormErrors = {};
		setErrors({});

		// Validate email
		if (!formData.email.trim()) {
			validationErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			validationErrors.email = 'Email is invalid';
		}

		// Validate name
		if (!formData.name.trim()) {
			validationErrors.name = 'Name is required';
		}

		// Validate role
		if (!role) {
			validationErrors.role = 'Role is required';
		}

		// Role-specific validations
		if (role === 'student') {
			// Validate student ID for student role
			if (!formData.studentID?.trim()) {
				validationErrors.studentID = 'Student ID is required';
			} else if (!/^[A-Za-z][A-Za-z0-9]{8}$/.test(formData.studentID)) {
				validationErrors.studentID =
					'Invalid student ID format. Must be 9 characters with a letter at the beginning.';
			}
		}

		// Set validation errors and return validation result
		setErrors(validationErrors);
		return Object.keys(validationErrors).length === 0;
	};

	const _handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value, type } = e.target;
		if (type === 'checkbox') {
			setFormData({
				...formData,
				[name]: (e.target as HTMLInputElement).checked,
			});
		} else {
			setFormData({
				...formData,
				[name]: value,
			});
		}
		// Clear the error for this field when user starts typing
		if (errors[name]) {
			setErrors({ ...errors, [name]: '' });
		}
	};

	const addDebugMessage = (msg: string) => {
		const timestamp = new Date().toISOString().substr(11, 8);
		setDebugLog((prev) => [...prev, `${timestamp}: ${msg}`]);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log('Starting form submission...');

		setIsSubmitting(true);
		setErrorMessage('');
		setSuccessMessage('');

		// Validate form fields first
		console.log('Starting form validation...');
		if (!validateForm()) {
			console.log('Form validation failed. Stopping submission.');
			setIsSubmitting(false);
			return;
		}
		console.log('Form validation passed. Proceeding with submission...');

		// Check if we have a valid session
		console.log('Checking authentication session...');

		try {
			// Access data from the form
			console.log('Session found. Preparing user data...');

			if (role === 'student') {
				// Use the general create user function for students
				const userData = {
					email: formData.email,
					name: formData.name,
					role: 'student',
					studentID: formData.studentID,
					semesterID: formData.semesterID ? Number(formData.semesterID) : undefined,
				};

				console.log('Prepared student data:', JSON.stringify(userData));
				console.log('Calling general createUser for student...');

				const result = await createUser(userData);

				if (result.success) {
					// Clear form on success
					setFormData({
						name: '',
						email: '',
						studentID: '',
						semesterID: '',
						isCoordinator: false,
					});
					setRole(defaultRole || 'student');
					setSuccessMessage('Student user created successfully');
					setErrorMessage('');
					router.refresh();
				} else {
					// Keep form data on error
					setErrorMessage(result.error);
					setSuccessMessage('');
				}
			} else if (role === 'faculty') {
				// For faculty users, use the dedicated faculty user creation function
				const facultyData = {
					email: formData.email,
					name: formData.name,
					isCoordinator: formData.isCoordinator,
				};

				console.log('Prepared faculty data:', JSON.stringify(facultyData));
				console.log('Calling server action to create faculty user...');

				const result = await createFacultyUser(facultyData);

				if (result.success) {
					// Clear form on success
					setFormData({
						name: '',
						email: '',
						studentID: '',
						semesterID: '',
						isCoordinator: false,
					});
					setRole(defaultRole || 'faculty');
					setSuccessMessage('Faculty user created successfully');
					setErrorMessage('');
					router.refresh();
				} else {
					// Keep form data on error
					setErrorMessage(result.error);
					setSuccessMessage('');
				}
			} else {
				// For other roles, use the general createUser function
				const userData = {
					email: formData.email,
					name: formData.name,
					role: role,
				};

				console.log('Prepared regular user data:', JSON.stringify(userData));
				console.log('Calling server action to create user...');

				const result = await createUser(userData);

				if (result.success) {
					// Clear form on success
					setFormData({
						name: '',
						email: '',
						studentID: '',
						semesterID: '',
						isCoordinator: false,
					});
					setRole(defaultRole || 'student');
					setSuccessMessage('User created successfully');
					setErrorMessage('');
					router.refresh();
				} else {
					// Keep form data on error
					setErrorMessage(result.error);
					setSuccessMessage('');
				}
			}
		} catch (error) {
			console.error('Error creating user:', error);
			setErrorMessage(
				error instanceof Error ? error.message : 'An error occurred creating the user'
			);
			setSuccessMessage('');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Add Single User</h1>
			<div className="space-y-4 max-w-lg">
				{/* Success/Error Messages */}
				{successMessage && (
					<div className="mb-4 rounded-md bg-green-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-green-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-green-800">
									{successMessage}
								</p>
							</div>
						</div>
					</div>
				)}

				{errorMessage && (
					<div className="mb-4 rounded-md bg-red-50 p-4">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-400"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414l2-2a1 1 0 000-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-red-800">{errorMessage}</p>
							</div>
						</div>
					</div>
				)}

				{/* Email Field */}
				<div className="space-y-2">
					<Label htmlFor="email">Email (@e.ntu.edu.sg)</Label>
					<Input
						id="email"
						name="email"
						type="email"
						placeholder="user@e.ntu.edu.sg"
						value={formData.email}
						onChange={_handleChange}
						className={errors.email ? 'border-red-500' : ''}
					/>
					{errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
				</div>

				{/* Name Field */}
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						name="name"
						placeholder="Full Name"
						value={formData.name}
						onChange={_handleChange}
						className={errors.name ? 'border-red-500' : ''}
					/>
					{errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
				</div>

				{/* Role Field */}
				<div className="space-y-2">
					<Label htmlFor="role">Role</Label>
					<Select value={role} onValueChange={setRole}>
						<SelectTrigger className={errors.role ? 'border-red-500' : ''}>
							<SelectValue placeholder="Select role" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="student">Student</SelectItem>
							<SelectItem value="faculty">Faculty</SelectItem>
							<SelectItem value="admin">Admin</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
						</SelectContent>
					</Select>
					{errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
				</div>

				{/* Conditional Fields */}
				{role === 'student' && (
					<>
						<div className="space-y-2">
							<Label htmlFor="studentID">Student ID</Label>
							<Input
								id="studentID"
								name="studentID"
								placeholder="e.g., U2024123A"
								value={formData.studentID}
								onChange={_handleChange}
								className={errors.studentID ? 'border-red-500' : ''}
							/>
							{errors.studentID && (
								<p className="text-sm text-red-500">{errors.studentID}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="semesterID">Semester</Label>
							<Select
								value={formData.semesterID || ''}
								onValueChange={(value) => {
									addDebugMessage(`Selected semester ID: ${value}`);
									setFormData({
										...formData,
										semesterID: value,
									});
								}}
							>
								<SelectTrigger
									className={errors.semesterID ? 'border-red-500' : ''}
								>
									<SelectValue placeholder="Select semester" />
								</SelectTrigger>
								<SelectContent>
									{semesters.map((semester) => (
										<SelectItem
											key={semester.id}
											value={semester.id.toString()}
										>
											{semester.academic_year} {semester.name}
											{semester.is_active && ' (Current)'}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{loadingSemesters && (
								<div className="text-sm text-gray-500">Loading semesters...</div>
							)}
							{errors.semesterID && (
								<p className="text-sm text-red-500">{errors.semesterID}</p>
							)}
						</div>
					</>
				)}

				{role === 'faculty' && (
					<div className="flex items-center space-x-2">
						<Switch
							id="coordinator"
							checked={formData.isCoordinator}
							onCheckedChange={(checked) =>
								setFormData({ ...formData, isCoordinator: checked })
							}
						/>
						<Label htmlFor="coordinator">Course Coordinator</Label>
					</div>
				)}

				{/* Debugging Semester Info */}
				<div className="mt-4 text-xs text-gray-600">
					<p>Available Semesters:</p>
					<ul className="list-disc pl-5">
						{semesters.map((semester) => (
							<li key={semester.id}>
								ID: {semester.id} - {semester.academic_year} {semester.name} -
								Active: {semester.is_active ? 'Yes' : 'No'} - Status:{' '}
								{semester.status}
							</li>
						))}
					</ul>
				</div>

				{/* Submit Button */}
				<Button
					type="submit"
					onClick={(e) => {
						e.preventDefault();
						handleSubmit(
							new Event('submit') as unknown as React.FormEvent<HTMLFormElement>
						);
					}}
					disabled={isSubmitting}
					className="w-full"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Creating User...
						</>
					) : (
						'Create User'
					)}
				</Button>

				{/* Debug Log */}
				{process.env.NODE_ENV === 'development' && debugLog.length > 0 && (
					<div className="mt-8 p-4 bg-gray-50 rounded-md">
						<h3 className="text-sm font-medium text-gray-700 mb-2">Debug Log:</h3>
						<pre className="text-xs text-gray-600 whitespace-pre-wrap">
							{debugLog.join('\n')}
						</pre>
					</div>
				)}
			</div>
		</div>
	);
}

export default SingleUserAdd;
