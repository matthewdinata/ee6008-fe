'use client';

import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Bold,
	Code,
	Heading1,
	Heading2,
	Italic,
	Link as LinkIcon,
	List,
	ListOrdered,
	Palette,
	Underline,
	X,
} from 'lucide-react';
import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export function RichTextEditor({
	value,
	onChange,
	placeholder = 'Write your content here...',
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-primary underline',
				},
			}),
			Placeholder.configure({
				placeholder,
				emptyEditorClass: 'is-editor-empty',
			}),
			TextStyle,
			Color,
		],
		content: value,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
	});

	// Update editor content when value prop changes
	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [value, editor]);

	if (!editor) {
		return null;
	}

	// Helper functions for the link popover
	const _setLink = () => {
		const url = prompt('Enter URL');
		if (url) {
			editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
		}
	};

	const removeLinkAtSelection = () => {
		editor.chain().focus().extendMarkRange('link').unsetLink().run();
	};

	return (
		<div className="border rounded-md">
			<div className="flex flex-wrap items-center gap-1 p-1 border-b">
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive('bold')}
								onPressedChange={() => editor.chain().focus().toggleBold().run()}
								aria-label="Bold"
							>
								<Bold className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Bold</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive('italic')}
								onPressedChange={() => editor.chain().focus().toggleItalic().run()}
								aria-label="Italic"
							>
								<Italic className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Italic</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive('underline')}
								onPressedChange={() => {
									editor.chain().focus().toggleMark('underline').run();
								}}
								aria-label="Underline"
							>
								<Underline className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Underline</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive('code')}
								onPressedChange={() => editor.chain().focus().toggleCode().run()}
								aria-label="Code"
							>
								<Code className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Code</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<div className="bg-border w-px h-6 mx-1" />

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive('heading', { level: 1 })}
								onPressedChange={() =>
									editor.chain().focus().toggleHeading({ level: 1 }).run()
								}
								aria-label="Heading 1"
							>
								<Heading1 className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Heading 1</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive('heading', { level: 2 })}
								onPressedChange={() =>
									editor.chain().focus().toggleHeading({ level: 2 }).run()
								}
								aria-label="Heading 2"
							>
								<Heading2 className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Heading 2</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<div className="bg-border w-px h-6 mx-1" />

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive('bulletList')}
								onPressedChange={() =>
									editor.chain().focus().toggleBulletList().run()
								}
								aria-label="Bullet List"
							>
								<List className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Bullet List</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive('orderedList')}
								onPressedChange={() =>
									editor.chain().focus().toggleOrderedList().run()
								}
								aria-label="Ordered List"
							>
								<ListOrdered className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Ordered List</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<div className="bg-border w-px h-6 mx-1" />

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive({ textAlign: 'left' })}
								onPressedChange={() =>
									editor
										.chain()
										.focus()
										.setMark('textAlign', { textAlign: 'left' })
										.run()
								}
								aria-label="Align left"
							>
								<AlignLeft className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Align Left</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive({ textAlign: 'center' })}
								onPressedChange={() =>
									editor
										.chain()
										.focus()
										.setMark('textAlign', { textAlign: 'center' })
										.run()
								}
								aria-label="Align center"
							>
								<AlignCenter className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Align Center</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Toggle
								size="sm"
								pressed={editor.isActive({ textAlign: 'right' })}
								onPressedChange={() =>
									editor
										.chain()
										.focus()
										.setMark('textAlign', { textAlign: 'right' })
										.run()
								}
								aria-label="Align right"
							>
								<AlignRight className="h-4 w-4" />
							</Toggle>
						</TooltipTrigger>
						<TooltipContent>Align Right</TooltipContent>
					</Tooltip>
				</TooltipProvider>

				<div className="bg-border w-px h-6 mx-1" />

				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="sm" className="px-2">
							<LinkIcon className="h-4 w-4" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-60 p-2">
						<div className="grid gap-2">
							<div className="flex gap-1">
								<Input
									id="link"
									placeholder="https://example.com"
									className="h-8"
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											e.preventDefault();
											editor
												.chain()
												.focus()
												.extendMarkRange('link')
												.setLink({ href: e.currentTarget.value })
												.run();
										}
									}}
								/>
								<Button
									size="sm"
									variant="ghost"
									onClick={removeLinkAtSelection}
									className="w-8 h-8"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							<Button
								size="sm"
								onClick={() => {
									const input = document.getElementById(
										'link'
									) as HTMLInputElement;
									if (input.value) {
										editor
											.chain()
											.focus()
											.extendMarkRange('link')
											.setLink({ href: input.value })
											.run();
									}
								}}
							>
								Save
							</Button>
						</div>
					</PopoverContent>
				</Popover>

				<div className="bg-border w-px h-6 mx-1" />

				<Select
					onValueChange={(value) => {
						editor.chain().focus().setColor(value).run();
					}}
				>
					<SelectTrigger className="w-auto h-8 gap-1 border-none">
						<Palette className="h-4 w-4" />
						<SelectValue placeholder="Color" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="default">Default</SelectItem>
						<SelectItem value="#f44336">Red</SelectItem>
						<SelectItem value="#2196f3">Blue</SelectItem>
						<SelectItem value="#4caf50">Green</SelectItem>
						<SelectItem value="#ff9800">Orange</SelectItem>
						<SelectItem value="#9c27b0">Purple</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<EditorContent
				editor={editor}
				className="p-4 min-h-[200px] prose dark:prose-invert max-w-none [&_.is-editor-empty]:text-muted-foreground"
			/>
		</div>
	);
}
