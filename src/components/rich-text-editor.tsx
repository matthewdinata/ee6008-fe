'use client';

import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
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
	List,
	ListOrdered,
	Palette,
	Underline as UnderlineIcon,
} from 'lucide-react';
import React, { useEffect } from 'react';

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
			Underline,
			TextAlign.configure({
				types: ['heading', 'paragraph'],
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
								onPressedChange={() =>
									editor.chain().focus().toggleUnderline().run()
								}
								aria-label="Underline"
							>
								<UnderlineIcon className="h-4 w-4" />
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
									editor.chain().focus().setTextAlign('left').run()
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
									editor.chain().focus().setTextAlign('center').run()
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
									editor.chain().focus().setTextAlign('right').run()
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
