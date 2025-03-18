'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { createUser, fetchSemesters } from '@/utils/actions/admin/upload';

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
	studentId?: string;
	role?: string;
	semesterId?: string;
}

interface Semester {
	id: number;
	name: string;
	academic_year: number;
	is_active: boolean;
	status: string;
}

export default function SingleUserAdd() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [role, setRole] = useState<string>('');
	const [errors, setErrors] = useState<FormErrors>({});
	const [successMessage, setSuccessMessage] = useState('');

	const [formData, setFormData] = useState<FormData>({
		email: '',
		name: '',
		studentId: '',
		isCoordinator: false,
	});

	const [semesters, setSemesters] = useState<Semester[]>([]);

	const fetchSemestersData = async () => {
		try {
			const data = await fetchSemesters();
			setSemesters(data);
		} catch (error) {
			console.error('Error fetching semesters:', error);
		}
	};

	useEffect(() => {
		if (role === 'student') {
			fetchSemestersData();
		}
	}, [role]);

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.email) {
			newErrors.email = 'Email is required';
		} else if (!formData.email.endsWith('@e.ntu.edu.sg')) {
			newErrors.email = 'Must be an NTU email address';
		}

		if (!formData.name) {
			newErrors.name = 'Name is required';
		} else if (formData.name.length < 2) {
			newErrors.name = 'Name must be at least 2 characters';
		}

		if (!role) {
			newErrors.role = 'Role is required';
		}

		if (role === 'student' && formData.studentId) {
			if (!formData.studentId.startsWith('U') || formData.studentId.length !== 9) {
				newErrors.studentId = 'Invalid student ID format (e.g., U2024123A)';
			}
		}

		setErrors(newErrors);
		const isValid = Object.keys(newErrors).length === 0;
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
			</div>
		);
	}

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);

		try {
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

			await createUser(userData);
			setSuccessMessage('✓ User has been successfully created!');

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
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Add Single User</h1>
			<div className="space-y-4 max-w-lg">
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
			</div>
		</div>
	);
}
