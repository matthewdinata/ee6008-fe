'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Check, Loader2, MoreHorizontal, X } from 'lucide-react';
import { useState } from 'react';

import { ProposalStatus } from '@/types/faculty';
import { ProposalResponse } from '@/utils/actions/faculty/get-all-proposals';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function ProjectDetails({ proposal }: { proposal: ProposalResponse }) {
	if (!proposal) return <Skeleton className="h-48 w-full" />;

	console.log(proposal);

	const getBadgeVariant = (status: ProposalStatus) => {
		if (status === ProposalStatus.APPROVED) {
			return 'outlineSuccess';
		} else if (status === ProposalStatus.PENDING) {
			return 'outlinePending';
		} else if (status === ProposalStatus.REJECTED) {
			return 'outlineFail';
		}
		return 'outline';
	};

	return (
		<div className="max-h-[500px] overflow-y-auto space-y-4">
			<div>
				<h3 className="font-semibold">Professor</h3>
				<p className="text-sm text-muted-foreground">
					{proposal.professor?.name || 'Unknown Professor'}
				</p>
			</div>

			<div>
				<h3 className="font-semibold">Programme</h3>
				<p className="text-sm text-muted-foreground">{proposal.programme?.name}</p>
			</div>

			<div>
				<h3 className="font-semibold">Semester & Year</h3>
				<p className="text-sm text-muted-foreground">
					{proposal.semester?.name}, {proposal.semester?.academicYear}
				</p>
			</div>

			<div>
				<h3 className="font-semibold">Venue</h3>
				<p className="text-sm text-muted-foreground">{proposal.venue?.name}</p>
			</div>

			<div>
				<h3 className="font-semibold">Dates</h3>
				<div className="grid grid-cols-2 gap-4 mt-0.5">
					<div>
						{/* TODO: check timezone */}
						<p className="text-sm">
							{new Date(proposal.createdAt).toLocaleDateString()}
						</p>
						<p className="text-xs text-muted-foreground">Created</p>
					</div>
					<div>
						<p className="text-sm">
							{new Date(proposal.updatedAt).toLocaleDateString()}
						</p>
						<p className="text-xs text-muted-foreground">Updated</p>
					</div>
				</div>
			</div>

			<div>
				<h3 className="font-semibold">Status</h3>
				<Badge variant={getBadgeVariant(proposal.status)} className="capitalize">
					{proposal.status}
				</Badge>
			</div>

			<div>
				{proposal.status === ProposalStatus.REJECTED && (
					<div className="mt-2">
						<h3 className="font-semibold">Rejection Reason</h3>
						<p className="text-sm text-muted-foreground">
							{proposal.reason || 'Not specified'}
						</p>
					</div>
				)}
			</div>

			<div>
				<h3 className="font-semibold">Description</h3>
				<div className="rounded-md bg-secondary p-3">
					<p className="text-sm">{proposal.description}</p>
				</div>
			</div>
		</div>
	);
}

// Approval Dialog Component
function ApprovalDialog({
	proposal,
	onApprove,
	disabled,
}: {
	proposal: ProposalResponse;
	onApprove: (proposalId: number) => void;
	disabled: boolean;
}) {
	const [open, setOpen] = useState(false);

	const handleApprove = () => {
		onApprove(proposal.id);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className="h-8 w-8 p-0 hover:text-emerald-500"
					disabled={disabled}
				>
					<Check className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Approve Proposal</DialogTitle>
					<DialogDescription>
						Are you sure you want to approve this proposal?
						<br />
						This will create a new project titled{' '}
						<span className="font-medium">{proposal.title}</span>.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Cancel</Button>
					</DialogClose>
					<Button onClick={handleApprove} variant="default">
						Approve
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Rejection Dialog Component
function RejectionDialog({
	proposal,
	onReject,
	disabled,
}: {
	proposal: ProposalResponse;
	onReject: (proposalId: number, reason: string) => void;
	disabled: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState('');
	const [error, setError] = useState('');

	const handleReject = () => {
		if (!reason.trim()) {
			setError('Please provide a reason for rejection');
			return;
		}

		onReject(proposal.id, reason);
		setOpen(false);
		setReason('');
		setError('');
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					className="h-8 w-8 p-0 hover:text-red-500"
					disabled={disabled}
				>
					<X className="h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Reject Proposal</DialogTitle>
					<DialogDescription>
						Please provide a reason for rejecting{' '}
						<span className="font-medium">{proposal.title}</span>
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-2">
					<div className="grid gap-2">
						<Label htmlFor="reason" className="text-left">
							Reason <span className="text-red-500">*</span>
						</Label>
						<Textarea
							id="reason"
							placeholder="Enter reason for rejection"
							value={reason}
							onChange={(e) => {
								setReason(e.target.value);
								if (e.target.value.trim()) setError('');
							}}
							className={error ? 'border-red-500' : ''}
						/>
						{error && <p className="text-red-500 text-sm">{error}</p>}
					</div>
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="secondary">Cancel</Button>
					</DialogClose>
					<Button onClick={handleReject} variant="destructive">
						Reject
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export const createColumns = (
	onApprove: (proposalId: number) => void,
	onReject: (proposalId: number, reason: string) => void,
	isProcessing: boolean,
	processingId: number | null
): ColumnDef<ProposalResponse>[] => {
	return [
		{
			accessorKey: 'title',
			id: 'title',
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
						className="px-0 hover:bg-transparent"
					>
						Title
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			meta: {
				header: 'Title',
			},
		},
		{
			accessorKey: 'semester.name',
			id: 'semester',
			header: 'Sem.',
			cell: ({ row }) => {
				const semesterName = row.original.semester.name;
				const semesterNumber = semesterName.split(' ')[1];
				return <span>{semesterNumber}</span>;
			},
			meta: {
				header: 'Semester',
			},
		},
		{
			accessorKey: 'semester.academicYear',
			id: 'academicYear',
			header: 'Year',
			meta: {
				header: 'Year',
			},
		},
		{
			accessorKey: 'programme.name',
			id: 'programme',
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
						className="px-0 hover:bg-transparent"
					>
						Programme
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			meta: {
				header: 'Programme',
			},
		},
		{
			accessorKey: 'professor.name',
			id: 'professor',
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
						className="px-0 hover:bg-transparent"
					>
						Proposer
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			meta: {
				header: 'Proposer',
			},
		},
		{
			accessorKey: 'status',
			id: 'status',
			header: ({ column }) => {
				return (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
						className="px-0 hover:bg-transparent"
					>
						Status
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				);
			},
			cell: ({ row }) => {
				const status = row.original.status;
				let variant: 'outline' | 'outlineSuccess' | 'outlinePending' | 'outlineFail' =
					'outline';

				if (status === ProposalStatus.APPROVED) {
					variant = 'outlineSuccess';
				} else if (status === ProposalStatus.PENDING) {
					variant = 'outlinePending';
				} else if (status === ProposalStatus.REJECTED) {
					variant = 'outlineFail';
				}

				return (
					<Badge variant={variant} className="capitalize">
						{status}
					</Badge>
				);
			},
			meta: {
				header: 'Status',
			},
		},
		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) => {
				const proposal = row.original;
				const isPending = proposal.status === ProposalStatus.PENDING;
				const isCurrentProcessing = processingId === proposal.id;

				return (
					<div className="flex">
						{isPending && (
							<>
								{isCurrentProcessing ? (
									// Show loader for the currently processing proposal
									<div className="flex items-center space-x-2">
										<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
										<span className="text-xs text-muted-foreground">
											Processing...
										</span>
									</div>
								) : (
									// Show dialog-triggered buttons for other proposals (disabled during any processing)
									<>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<div>
														<ApprovalDialog
															proposal={proposal}
															onApprove={onApprove}
															disabled={isProcessing}
														/>
													</div>
												</TooltipTrigger>
												<TooltipContent>
													{isProcessing
														? 'Another proposal is being processed'
														: 'Approve'}
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<div>
														<RejectionDialog
															proposal={proposal}
															onReject={onReject}
															disabled={isProcessing}
														/>
													</div>
												</TooltipTrigger>
												<TooltipContent>
													{isProcessing
														? 'Another proposal is being processed'
														: 'Reject'}
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</>
								)}
							</>
						)}
						<Dialog>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="h-8 w-8 p-0"
										disabled={isProcessing && !isCurrentProcessing}
									>
										<span className="sr-only">Open menu</span>
										<MoreHorizontal className="h-4 w-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DialogTrigger asChild>
										<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
											View details
										</DropdownMenuItem>
									</DialogTrigger>
								</DropdownMenuContent>
							</DropdownMenu>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>{proposal.title}</DialogTitle>
									<DialogDescription>
										Project details and information
									</DialogDescription>
								</DialogHeader>
								<ProjectDetails proposal={proposal} />
								<DialogClose asChild className="mt-4">
									<Button>Close</Button>
								</DialogClose>
							</DialogContent>
						</Dialog>
					</div>
				);
			},
		},
	];
};
