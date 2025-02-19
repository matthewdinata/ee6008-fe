'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

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
	studentId: string;
	isCoordinator: boolean;
	semesterId?: number;
}

interface FormErrors {
	email?: string;
	name?: string;
	role?: string;
	studentId?: string;
	semesterId?: number;
}

// Add Semester interface
interface Semester {
	id: number;
	academic_year: number;
	name: string;
	is_active: boolean;
	status: string;
}

export function SingleUserAdd() {
	const router = useRouter();
	const supabase = createClientComponentClient();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [role, setRole] = useState<string>('');
	const [errors, setErrors] = useState<FormErrors>({});
	const [debugLog, setDebugLog] = useState<string[]>([]);
	const [successMessage, setSuccessMessage] = useState('');

	const [semesters, setSemesters] = useState<Semester[]>([]);
	const [loadingSemesters, setLoadingSemesters] = useState(false);

	// Add function to fetch semesters
	const fetchSemesters = async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) return;

			setLoadingSemesters(true);
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/semesters`, {
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
			});
			const data = await response.json();
			setSemesters(data);
		} catch (error) {
			console.error('Error fetching semesters:', error);
		} finally {
			setLoadingSemesters(false);
		}
	};

	// Fetch semesters when role changes to student
	useEffect(() => {
		if (role === 'student') {
			fetchSemesters();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [role]);

	const [formData, setFormData] = useState<FormData>({
		email: '',
		name: '',
		studentId: '',
		isCoordinator: false,
	});

	const addDebugMessage = (msg: string) => {
		const timestamp = new Date().toLocaleTimeString();
		setDebugLog((prev) => [...prev, `${timestamp}: ${msg}`]);
	};

	const validateForm = (): boolean => {
		addDebugMessage('Starting form validation...');
		const newErrors: FormErrors = {};

		// Email validation
		if (!formData.email) {
			newErrors.email = 'Email is required';
			addDebugMessage('Validation failed: Email is required');
		} else if (!formData.email.endsWith('@e.ntu.edu.sg')) {
			newErrors.email = 'Must be an NTU email address';
			addDebugMessage('Validation failed: Invalid email domain');
		} else {
			addDebugMessage('Email validation passed');
		}

		// Name validation
		if (!formData.name) {
			newErrors.name = 'Name is required';
			addDebugMessage('Validation failed: Name is required');
		} else if (formData.name.length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
			addDebugMessage('Validation failed: Name too short');
		} else {
			addDebugMessage('Name validation passed');
		}

		// Role validation
		if (!role) {
			newErrors.role = 'Role is required';
			addDebugMessage('Validation failed: Role is required');
		} else {
			addDebugMessage(`Role validation passed: ${role} selected`);
		}

		// Student ID validation
		if (role === 'student' && formData.studentId) {
			if (!formData.studentId.startsWith('U') || formData.studentId.length !== 9) {
				newErrors.studentId = 'Invalid student ID format (e.g., U2024123A)';
				addDebugMessage('Validation failed: Invalid student ID format');
			} else {
				addDebugMessage('Student ID validation passed');
			}
		}

		setErrors(newErrors);
		const isValid = Object.keys(newErrors).length === 0;
		addDebugMessage(`Form validation ${isValid ? 'successful' : 'failed'}`);
		return isValid;
	};

	{
		role === 'student' && (
			<div className="space-y-2">
				<Label htmlFor="semester">Semester</Label>
				<Select
					value={formData.semesterId?.toString() || ''}
					onValueChange={(value) =>
						setFormData({
							...formData,
							semesterId: parseInt(value),
						})
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select semester" />
					</SelectTrigger>
					<SelectContent>
						{semesters.map((semester) => (
							<SelectItem key={semester.id} value={semester.id.toString()}>
								{semester.academic_year} {semester.name}
								{semester.is_active && ' (Current)'}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{loadingSemesters && (
					<div className="text-sm text-gray-500">Loading semesters...</div>
				)}
			</div>
		);
	}

	const handleSubmit = async () => {
		addDebugMessage('Starting form submission...');

		if (!validateForm()) {
			addDebugMessage('Form validation failed. Stopping submission.');
			return;
		}

		setIsSubmitting(true);
		addDebugMessage('Form validation passed. Proceeding with submission...');

		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			addDebugMessage('Checking authentication session...');

			if (!session) {
				addDebugMessage('No active session found. Redirecting to signin...');
				router.push('/signin');
				return;
			}

			addDebugMessage('Session found. Preparing user data...');
			const userData = {
				email: formData.email,
				name: formData.name,
				role: role,
				...(role === 'student' && {
					studentId: formData.studentId,
					semesterId: formData.semesterId,
				}),
				...(role === 'faculty' && {
					isCoordinator: formData.isCoordinator,
				}),
			};

			addDebugMessage('Sending API request to create user...');
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.details || data.message || 'Failed to create user');
			}

			addDebugMessage('User created successfully!');
			setSuccessMessage('✓ User has been successfully created!');

			// Reset form
			setFormData({
				email: '',
				name: '',
				studentId: '',
				isCoordinator: false,
			});
			setRole('');
			setErrors({});
		} catch (error) {
			console.error('Error:', error);
			addDebugMessage(
				`Error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Add Single User</h1>
			<div className="space-y-4 max-w-lg">
				{/* Success Message */}
				{successMessage && (
					<div className="bg-green-50 p-4 rounded-md mb-4">
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

				{/* Existing form fields... */}
				{/* Email Field */}
				<div className="space-y-2">
					<Label htmlFor="email">Email (@e.ntu.edu.sg)</Label>
					<Input
						id="email"
						type="email"
						placeholder="user@e.ntu.edu.sg"
						value={formData.email}
						onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						className={errors.email ? 'border-red-500' : ''}
					/>
					{errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
				</div>

				{/* Rest of the existing form fields... */}
				{/* Name Field */}
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						placeholder="Full Name"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
							<Label htmlFor="studentId">Student ID</Label>
							<Input
								id="studentId"
								placeholder="e.g., U2024123A"
								value={formData.studentId}
								onChange={(e) =>
									setFormData({ ...formData, studentId: e.target.value })
								}
								className={errors.studentId ? 'border-red-500' : ''}
							/>
							{errors.studentId && (
								<p className="text-sm text-red-500">{errors.studentId}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="semester">Semester</Label>
							<Select
								value={formData.semesterId?.toString() || ''}
								onValueChange={(value) => {
									addDebugMessage(`Selected semester ID: ${value}`);
									setFormData({
										...formData,
										semesterId: parseInt(value),
									});
								}}
							>
								<SelectTrigger
									className={errors.semesterId ? 'border-red-500' : ''}
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
							{errors.semesterId && (
								<p className="text-sm text-red-500">{errors.semesterId}</p>
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

				{/* Submit Button */}
				<Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
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
