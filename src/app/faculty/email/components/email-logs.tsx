'use client';

import {
	AlertCircle,
	ArrowUpDown,
	CheckCircle2,
	Clock,
	Eye,
	Info,
	Loader2,
	MoreHorizontal,
	Search,
	Trash2,
	XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
	useCancelScheduledEmail,
	useEmailLogs,
	useScheduledEmails,
} from '@/utils/hooks/use-email-sending';
import { useToast } from '@/utils/hooks/use-toast';
import { EmailLog, ScheduledEmail } from '@/utils/types/email';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function EmailLogs() {
	const [tab, setTab] = useState<string>('sent');
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
	const [selectedScheduled, setSelectedScheduled] = useState<ScheduledEmail | null>(null);
	const [isViewLogDialogOpen, setIsViewLogDialogOpen] = useState<boolean>(false);
	const [isViewScheduledDialogOpen, setIsViewScheduledDialogOpen] = useState<boolean>(false);
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);

	const { toast } = useToast();

	// Fetch data
	const logsQuery = useEmailLogs();
	const scheduledQuery = useScheduledEmails();
	const cancelMutation = useCancelScheduledEmail();

	useEffect(() => {
		console.log('==== EMAIL LOGS DEBUG ====');
		console.log('Regular logs query status:', logsQuery.status);
		console.log('Regular logs data:', logsQuery.data);
		console.log('Scheduled emails query status:', scheduledQuery.status);
		console.log('Scheduled emails data:', scheduledQuery.data);

		// Log the first scheduled email's structure if available
		if (Array.isArray(scheduledQuery.data) && scheduledQuery.data.length > 0) {
			console.log('First scheduled email structure:', scheduledQuery.data[0]);

			// Check if email_list exists and try to parse it
			const firstScheduled = scheduledQuery.data[0];
			if (firstScheduled.email_list) {
				try {
					console.log('Parsed email_list:', JSON.parse(firstScheduled.email_list));
				} catch (e) {
					console.log('Failed to parse email_list:', firstScheduled.email_list, e);
				}
			}
		}
	}, [logsQuery.data, logsQuery.status, scheduledQuery.data, scheduledQuery.status]);

	// Format date to readable string
	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleString();
	};

	// Helper function to get recipient emails from scheduled email
	const getRecipientEmails = (scheduled: ScheduledEmail): string[] => {
		// console.log('Parsing recipient for scheduled email:', scheduled.id);
		// console.log('emailList value:', scheduled.emailList);
		// console.log('recipients value:', scheduled.recipients);

		// If emailList is present and not empty, parse it as JSON
		if (scheduled.emailList && scheduled.emailList) {
			try {
				const parsed = JSON.parse(scheduled.emailList);
				console.log('Successfully parsed emailList:', parsed);
				return parsed;
			} catch (error) {
				console.error('Error parsing emailList:', error);
				return [];
			}
		}

		// If recipient array is already populated, use it
		if (
			scheduled.recipient &&
			Array.isArray(scheduled.recipient) &&
			scheduled.recipient.length > 0
		) {
			return scheduled.recipient;
		}

		// Fallback: Check recipients field (e.g. "students", "faculty")
		if (scheduled.recipients === 'students') {
			return ['All Students'];
		} else if (scheduled.recipients === 'faculty') {
			return ['All Faculty'];
		} else if (scheduled.recipients === 'specific' && !scheduled.emailList) {
			return ['Specific Users (details not available)'];
		}

		return [];
	};

	// Helper function to normalize recipient data to array
	const getRecipientsArray = (recipient: string | string[] | undefined): string[] => {
		if (!recipient) return [];
		return Array.isArray(recipient) ? recipient : [recipient];
	};

	// Filter logs based on search query
	const filteredLogs =
		searchQuery.trim() === ''
			? logsQuery.data || []
			: (logsQuery.data || []).filter((log: EmailLog) => {
					// Check if subject contains search query
					const subjectMatch = log.subject
						.toLowerCase()
						.includes(searchQuery.toLowerCase());

					// Check if recipient contains search query
					let recipientMatch = false;
					if (Array.isArray(log.recipient)) {
						// If recipient is an array, check each element
						recipientMatch = log.recipient.some((r: string) =>
							r.toLowerCase().includes(searchQuery.toLowerCase())
						);
					} else if (typeof log.recipient === 'string') {
						// If recipient is a string, check directly
						recipientMatch = log.recipient
							.toLowerCase()
							.includes(searchQuery.toLowerCase());
					}

					return subjectMatch || recipientMatch;
				});

	// Filter scheduled emails based on search query
	const filteredScheduled =
		scheduledQuery.data && Array.isArray(scheduledQuery.data.data)
			? searchQuery.trim() === ''
				? scheduledQuery.data.data
				: scheduledQuery.data.data.filter((scheduled: ScheduledEmail) => {
						// Get email list from the scheduled email
						const emailList = getRecipientEmails(scheduled);

						// Check if subject contains the search query
						const subjectMatch = scheduled.subject
							? scheduled.subject.toLowerCase().includes(searchQuery.toLowerCase())
							: false;

						// Check if any email in the emailList contains the search query
						const emailMatch = emailList.some((email: string) =>
							email.toLowerCase().includes(searchQuery.toLowerCase())
						);

						return subjectMatch || emailMatch;
					})
			: [];

	// Handle cancel scheduled email
	const handleCancelScheduled = async () => {
		if (!selectedScheduled) return;

		try {
			await cancelMutation.mutateAsync(selectedScheduled.id);

			toast({
				title: 'Success',
				description: 'Scheduled email has been cancelled',
			});

			setIsCancelDialogOpen(false);
		} catch (error) {
			console.error('Error cancelling scheduled email:', error);
			toast({
				title: 'Error',
				description: 'Failed to cancel scheduled email',
				variant: 'destructive',
			});
		}
	};

	// Get status badge for email logs
	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case 'sent':
				return (
					<Badge
						variant="outline"
						className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
					>
						<CheckCircle2 className="h-3 w-3" />
						Sent
					</Badge>
				);
			case 'success':
				return (
					<Badge
						variant="outline"
						className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
					>
						<CheckCircle2 className="h-3 w-3" />
						Sent
					</Badge>
				);
			case 'failed':
				return (
					<Badge variant="destructive" className="flex items-center gap-1">
						<XCircle className="h-3 w-3" />
						Failed
					</Badge>
				);
			case 'sending':
				return (
					<Badge variant="outline" className="flex items-center gap-1">
						<Loader2 className="h-3 w-3 animate-spin" />
						Sending
					</Badge>
				);
			default:
				return (
					<Badge variant="secondary" className="flex items-center gap-1">
						<Info className="h-3 w-3" />
						{status}
					</Badge>
				);
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Email Logs</CardTitle>
				<CardDescription>View your sent and scheduled emails</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value={tab} onValueChange={setTab} className="w-full">
					<div className="flex items-center justify-between mb-4">
						<TabsList>
							<TabsTrigger value="sent">Sent Emails</TabsTrigger>
							<TabsTrigger value="scheduled">Scheduled Emails</TabsTrigger>
						</TabsList>

						<div className="relative">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Search emails..."
								className="w-[250px] pl-8"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
					</div>

					<TabsContent value="sent" className="pt-0 mt-0">
						{renderLogsTable()}
					</TabsContent>

					<TabsContent value="scheduled" className="pt-0 mt-0">
						{renderScheduledTable()}
					</TabsContent>
				</Tabs>
			</CardContent>

			{/* View Email Log Dialog */}
			<Dialog open={isViewLogDialogOpen} onOpenChange={setIsViewLogDialogOpen}>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle>Email Details</DialogTitle>
						<DialogDescription>
							Sent on {selectedLog?.sentAt && formatDate(selectedLog.sentAt)}
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-hidden">
						<ScrollArea className="h-[400px] rounded-md border p-4">
							<div className="space-y-4">
								<div>
									<h4 className="font-medium text-sm">Subject:</h4>
									<p>{selectedLog?.subject}</p>
								</div>

								<div>
									<h4 className="font-medium text-sm">Status:</h4>
									<div className="mt-1">
										{selectedLog && getStatusBadge(selectedLog.status)}
									</div>
								</div>

								<div>
									<h4 className="font-medium text-sm">Recipients:</h4>
									<div className="mt-1 flex flex-wrap gap-1">
										{selectedLog?.recipient &&
											getRecipientsArray(selectedLog.recipient).map(
												(recipient: string, index: number) => (
													<Badge key={index} variant="outline">
														{recipient}
													</Badge>
												)
											)}
									</div>
								</div>

								<div>
									<h4 className="font-medium text-sm">Content:</h4>
									<div
										className="mt-2 border rounded-md p-4 prose max-w-none"
										dangerouslySetInnerHTML={{
											__html: selectedLog?.htmlBody || '',
										}}
									/>
								</div>
							</div>
						</ScrollArea>
					</div>

					<DialogFooter className="pt-4">
						<Button variant="outline" onClick={() => setIsViewLogDialogOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* View Scheduled Email Dialog */}
			<Dialog open={isViewScheduledDialogOpen} onOpenChange={setIsViewScheduledDialogOpen}>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle>Scheduled Email Details</DialogTitle>
						<DialogDescription>
							Scheduled for{' '}
							{selectedScheduled?.scheduledDate &&
								formatDate(selectedScheduled.scheduledDate)}
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-hidden">
						<ScrollArea className="h-[400px] rounded-md border p-4">
							<div className="space-y-4">
								<div>
									<h4 className="font-medium text-sm">Subject:</h4>
									<p>{selectedScheduled?.subject}</p>
								</div>

								<div>
									<h4 className="font-medium text-sm">Recipients:</h4>
									<div className="mt-1 flex flex-wrap gap-1">
										{selectedScheduled?.recipient &&
											selectedScheduled.recipient.map(
												(recipient: string, index: number) => (
													<Badge key={index} variant="outline">
														{recipient}
													</Badge>
												)
											)}
									</div>
								</div>

								<div>
									<h4 className="font-medium text-sm">Content:</h4>
									<div
										className="mt-2 border rounded-md p-4 prose max-w-none"
										dangerouslySetInnerHTML={{
											__html: selectedScheduled?.htmlBody || '',
										}}
									/>
								</div>
							</div>
						</ScrollArea>
					</div>

					<DialogFooter className="pt-4">
						<Button
							variant="destructive"
							onClick={() => {
								setIsViewScheduledDialogOpen(false);
								setIsCancelDialogOpen(true);
							}}
						>
							Cancel Schedule
						</Button>
						<Button
							variant="outline"
							onClick={() => setIsViewScheduledDialogOpen(false)}
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Cancel Confirmation Dialog */}
			<Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-destructive">
							Cancel Scheduled Email
						</DialogTitle>
						<DialogDescription>
							Are you sure you want to cancel this scheduled email?
						</DialogDescription>
					</DialogHeader>

					{selectedScheduled && (
						<div className="py-4">
							<p>
								<span className="font-medium">Subject:</span>{' '}
								{selectedScheduled.subject}
							</p>
							<p>
								<span className="font-medium">Scheduled for:</span>{' '}
								{formatDate(selectedScheduled.scheduledDate)}
							</p>
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
							No, Keep It
						</Button>
						<Button
							variant="destructive"
							onClick={handleCancelScheduled}
							disabled={cancelMutation.isPending}
						>
							{cancelMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Cancelling...
								</>
							) : (
								'Yes, Cancel'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);

	// Helper function to render the email logs table
	function renderLogsTable() {
		if (logsQuery.isLoading) {
			return (
				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
					{[...Array(5)].map((_, i) => (
						<Skeleton key={i} className="h-16 w-full" />
					))}
				</div>
			);
		}

		if (filteredLogs.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center text-center py-12">
					<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium">No emails found</h3>
					<p className="text-muted-foreground max-w-md mt-2">
						{searchQuery.trim() !== ''
							? 'No emails match your search criteria. Try a different search term.'
							: "You haven't sent any emails yet."}
					</p>
				</div>
			);
		}

		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<div className="flex items-center">
								Subject
								<ArrowUpDown className="ml-2 h-4 w-4" />
							</div>
						</TableHead>
						<TableHead>Recipients</TableHead>
						<TableHead>Status</TableHead>
						<TableHead className="hidden md:table-cell">Sent At</TableHead>
						<TableHead className="w-[80px] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredLogs.map((log: EmailLog) => (
						<TableRow key={log.id}>
							<TableCell className="font-medium">{log.subject}</TableCell>
							<TableCell>{log.recipient || 'No recipients'}</TableCell>
							<TableCell>{getStatusBadge(log.status)}</TableCell>
							<TableCell className="hidden md:table-cell">
								{formatDate(log.sentAt)}
							</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<MoreHorizontal className="h-4 w-4" />
											<span className="sr-only">Open menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => {
												setSelectedLog(log);
												setIsViewLogDialogOpen(true);
											}}
										>
											<Eye className="mr-2 h-4 w-4" />
											View Details
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}

	// Helper function to render the scheduled emails table
	function renderScheduledTable() {
		if (scheduledQuery.isLoading) {
			return (
				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
					{[...Array(5)].map((_, i) => (
						<Skeleton key={i} className="h-16 w-full" />
					))}
				</div>
			);
		}

		if (filteredScheduled.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center text-center py-12">
					<Clock className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium">No scheduled emails</h3>
					<p className="text-muted-foreground max-w-md mt-2">
						{searchQuery.trim() !== ''
							? 'No scheduled emails match your search criteria. Try a different search term.'
							: "You don't have any emails scheduled for the future."}
					</p>
				</div>
			);
		}

		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>
							<div className="flex items-center">
								Subject
								<ArrowUpDown className="ml-2 h-4 w-4" />
							</div>
						</TableHead>
						<TableHead>Recipients</TableHead>
						<TableHead className="hidden md:table-cell">Created At</TableHead>
						<TableHead>Scheduled For</TableHead>
						<TableHead className="w-[80px] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredScheduled.map((scheduled: ScheduledEmail) => (
						<TableRow key={scheduled.id}>
							<TableCell className="font-medium">{scheduled.subject}</TableCell>
							<TableCell>
								{(() => {
									// Use our getRecipientEmails helper function to get recipients
									const recipients = getRecipientEmails(scheduled);
									if (recipients.length === 0) {
										return 'No recipients';
									} else if (recipients.length === 1) {
										return recipients[0];
									} else {
										return `${recipients[0]} +${recipients.length - 1} more`;
									}
								})()}
							</TableCell>
							<TableCell className="hidden md:table-cell">
								{formatDate(scheduled.createdAt)}
							</TableCell>
							<TableCell>{formatDate(scheduled.scheduledDate)}</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<MoreHorizontal className="h-4 w-4" />
											<span className="sr-only">Open menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => {
												setSelectedScheduled(scheduled);
												setIsViewScheduledDialogOpen(true);
											}}
										>
											<Eye className="mr-2 h-4 w-4" />
											View Details
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => {
												setSelectedScheduled(scheduled);
												setIsCancelDialogOpen(true);
											}}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Cancel Schedule
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		);
	}
}
