'use client';

import {
	AlertCircle,
	ArrowUpDown,
	Edit,
	Loader2,
	MoreHorizontal,
	PlusCircle,
	Search,
	Trash2,
} from 'lucide-react';
import { useState } from 'react';

import {
	useDeleteEmailTemplate,
	useEmailTemplates,
	useMyEmailTemplates,
} from '@/utils/hooks/use-email-templates';
import { useToast } from '@/utils/hooks/use-toast';
import { EmailTemplate } from '@/utils/types/email';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
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
	DropdownMenuLabel,
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

import { EmailTemplateForm } from './email-template-form';

interface EmailTemplatesListProps {
	initialTab?: string;
}

export function EmailTemplatesList({ initialTab = 'all' }: EmailTemplatesListProps) {
	const [tab, setTab] = useState<string>(initialTab);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);

	const allTemplatesQuery = useEmailTemplates();
	const myTemplatesQuery = useMyEmailTemplates();
	const deleteMutation = useDeleteEmailTemplate();
	const { toast } = useToast();

	// Get the correct templates based on current tab
	const templates = tab === 'my' ? myTemplatesQuery.data || [] : allTemplatesQuery.data || [];
	const _isLoading = tab === 'my' ? myTemplatesQuery.isLoading : allTemplatesQuery.isLoading;

	// Filter templates based on search query
	const filteredTemplates =
		searchQuery.trim() === ''
			? templates
			: templates.filter(
					(template) =>
						template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
						template.description?.toLowerCase().includes(searchQuery.toLowerCase())
				);

	// Handle delete template
	const handleDeleteTemplate = async () => {
		if (!selectedTemplate) return;

		try {
			await deleteMutation.mutateAsync(selectedTemplate.id);
			toast({
				title: 'Success',
				description: 'Email template deleted successfully',
			});
			setIsDeleteDialogOpen(false);
		} catch (error) {
			console.error('Error deleting template:', error);
			toast({
				title: 'Error',
				description: 'Failed to delete template',
				variant: 'destructive',
			});
		}
	};

	// Format date to readable string
	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleString();
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Email Templates</CardTitle>
				<CardDescription>
					Create and manage email templates for communicating with students and faculty.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value={tab} onValueChange={setTab} className="w-full">
					<div className="flex items-center justify-between mb-4">
						<TabsList>
							<TabsTrigger value="all">All Templates</TabsTrigger>
							<TabsTrigger value="my">My Templates</TabsTrigger>
						</TabsList>

						<div className="flex items-center gap-2">
							<div className="relative">
								<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
								<Input
									type="search"
									placeholder="Search templates..."
									className="w-[250px] pl-8"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>

							<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
								<DialogTrigger asChild>
									<Button>
										<PlusCircle className="mr-2 h-4 w-4" />
										New Template
									</Button>
								</DialogTrigger>
								<DialogContent className="max-w-2xl">
									<DialogHeader>
										<DialogTitle>Create Email Template</DialogTitle>
										<DialogDescription>
											Create a new email template that can be used for sending
											emails to students or faculty.
										</DialogDescription>
									</DialogHeader>
									<EmailTemplateForm
										onSuccess={() => setIsCreateDialogOpen(false)}
									/>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					<TabsContent value="all" className="pt-0 mt-0">
						{renderTemplatesTable(
							allTemplatesQuery.data || [],
							allTemplatesQuery.isLoading
						)}
					</TabsContent>

					<TabsContent value="my" className="pt-0 mt-0">
						{renderTemplatesTable(
							myTemplatesQuery.data || [],
							myTemplatesQuery.isLoading
						)}
					</TabsContent>
				</Tabs>
			</CardContent>

			{/* View Template Dialog */}
			<Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
				<DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle>{selectedTemplate?.name}</DialogTitle>
						<DialogDescription>
							Created on{' '}
							{selectedTemplate?.createdAt && formatDate(selectedTemplate.createdAt)}
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-hidden">
						<ScrollArea className="h-[400px] rounded-md border p-4">
							<div className="space-y-4">
								<div>
									<h4 className="font-medium text-sm">Subject:</h4>
									<p>{selectedTemplate?.subject}</p>
								</div>

								<div>
									<h4 className="font-medium text-sm">Description:</h4>
									<p>{selectedTemplate?.description || 'No description'}</p>
								</div>

								<div>
									<h4 className="font-medium text-sm">Content:</h4>
									<div
										className="mt-2 border rounded-md p-4 prose max-w-none"
										dangerouslySetInnerHTML={{
											__html: selectedTemplate?.body || '',
										}}
									/>
								</div>
							</div>
						</ScrollArea>
					</div>

					<DialogFooter className="pt-4">
						<Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Template Dialog */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>Edit Email Template</DialogTitle>
						<DialogDescription>Update this email template</DialogDescription>
					</DialogHeader>
					{selectedTemplate && (
						<EmailTemplateForm
							template={selectedTemplate}
							onSuccess={() => setIsEditDialogOpen(false)}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-destructive">Delete Template</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this template?
						</DialogDescription>
					</DialogHeader>

					{selectedTemplate && (
						<div className="py-4">
							<p>
								<span className="font-medium">Template:</span>{' '}
								{selectedTemplate.name}
							</p>
							<p>
								<span className="font-medium">Subject:</span>{' '}
								{selectedTemplate.subject}
							</p>
						</div>
					)}

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteTemplate}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Deleting...
								</>
							) : (
								'Delete Template'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);

	// Helper function to render the templates table
	function renderTemplatesTable(templates: EmailTemplate[], isLoading: boolean) {
		if (isLoading) {
			return (
				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
					{[...Array(5)].map((_, i) => (
						<Skeleton key={i} className="h-16 w-full" />
					))}
				</div>
			);
		}

		if (filteredTemplates.length === 0) {
			return (
				<div className="flex flex-col items-center justify-center text-center py-12">
					<AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
					<h3 className="text-lg font-medium">No templates found</h3>
					<p className="text-muted-foreground max-w-md mt-2">
						{searchQuery.trim() !== ''
							? 'No templates match your search criteria. Try a different search term.'
							: "You haven't created any email templates yet. Click 'New Template' to get started."}
					</p>
				</div>
			);
		}

		return (
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[200px]">
							<div className="flex items-center">
								Name
								<ArrowUpDown className="ml-2 h-4 w-4" />
							</div>
						</TableHead>
						<TableHead className="w-[250px]">Subject</TableHead>
						<TableHead className="hidden md:table-cell">Description</TableHead>
						<TableHead className="w-[150px] hidden md:table-cell">Created</TableHead>
						<TableHead className="w-[100px] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredTemplates.map((template) => (
						<TableRow key={template.id}>
							<TableCell className="font-medium">{template.name}</TableCell>
							<TableCell>{template.subject}</TableCell>
							<TableCell className="hidden md:table-cell">
								{template.description || '—'}
							</TableCell>
							<TableCell className="hidden md:table-cell">
								{formatDate(template.createdAt)}
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
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuItem
											onClick={() => {
												setSelectedTemplate(template);
												setIsViewDialogOpen(true);
											}}
										>
											View
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => {
												setSelectedTemplate(template);
												setIsEditDialogOpen(true);
											}}
										>
											<Edit className="mr-2 h-4 w-4" />
											Edit
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => {
												setSelectedTemplate(template);
												setIsDeleteDialogOpen(true);
											}}
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
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
