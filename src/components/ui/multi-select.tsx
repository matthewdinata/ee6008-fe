'use client';

import { Check, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/utils/cn';

import { Badge } from '@/components/ui/badge';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';

export type Option = {
	value: string;
	label: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any;
};

type MultiSelectProps = {
	options: Option[];
	value: Option[];
	onChange: (value: Option[]) => void;
	placeholder?: string;
	className?: string;
	badgeClassName?: string;
	emptyMessage?: string;
};

export function MultiSelect({
	options,
	value,
	onChange,
	placeholder = 'Select items...',
	className,
	badgeClassName,
	emptyMessage = 'No items found.',
}: MultiSelectProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState('');

	const handleUnselect = React.useCallback(
		(option: Option) => {
			onChange(value.filter((item) => item.value !== option.value));
		},
		[onChange, value]
	);

	const handleSelect = React.useCallback(
		(option: Option) => {
			setInputValue('');
			if (value.some((item) => item.value === option.value)) {
				onChange(value.filter((item) => item.value !== option.value));
			} else {
				onChange([...value, option]);
			}
		},
		[onChange, value, setInputValue]
	);

	const handleKeyDown = React.useCallback(
		(e: React.KeyboardEvent<HTMLDivElement>) => {
			const input = inputRef.current;
			if (input) {
				if (e.key === 'Delete' || e.key === 'Backspace') {
					if (input.value === '' && value.length > 0) {
						onChange(value.slice(0, -1));
					}
				}
				// This is not a default behavior of the <input /> field
				if (e.key === 'Escape') {
					input.blur();
				}
			}
		},
		[value, onChange]
	);

	const selectables = options.filter(
		(option) => !value.some((item) => item.value === option.value)
	);

	return (
		<Command
			onKeyDown={handleKeyDown}
			className={cn('overflow-visible bg-transparent', className)}
		>
			<div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
				<div className="flex flex-wrap gap-1">
					{value.map((option) => {
						return (
							<Badge
								key={option.value}
								variant="secondary"
								className={cn('rounded-sm px-1 py-0 text-xs', badgeClassName)}
							>
								{option.label}
								<button
									className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											handleUnselect(option);
										}
									}}
									onMouseDown={(e) => {
										e.preventDefault();
										e.stopPropagation();
									}}
									onClick={() => handleUnselect(option)}
								>
									<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
								</button>
							</Badge>
						);
					})}
					<CommandInput
						ref={inputRef}
						value={inputValue}
						onValueChange={setInputValue}
						onBlur={() => setOpen(false)}
						onFocus={() => setOpen(true)}
						placeholder={value.length === 0 ? placeholder : undefined}
						className="ml-0 h-auto flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
					/>
				</div>
			</div>
			<div className="relative">
				{open && selectables.length > 0 ? (
					<div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
						<CommandList>
							{selectables.length > 0 ? (
								<CommandGroup className="max-h-[200px] overflow-auto">
									{selectables.map((option) => {
										const isSelected = value.some(
											(item) => item.value === option.value
										);
										return (
											<CommandItem
												key={option.value}
												onMouseDown={(e) => {
													e.preventDefault();
													e.stopPropagation();
												}}
												onSelect={() => handleSelect(option)}
												className={
													'flex cursor-pointer items-center justify-between py-1.5 px-2'
												}
											>
												<span>{option.label}</span>
												{isSelected && <Check className="h-4 w-4" />}
											</CommandItem>
										);
									})}
								</CommandGroup>
							) : (
								<CommandEmpty>{emptyMessage}</CommandEmpty>
							)}
						</CommandList>
					</div>
				) : null}
			</div>
		</Command>
	);
}
