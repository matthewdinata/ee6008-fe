import Image from 'next/image';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

export default function Home() {
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<Image
					className="dark:invert"
					src="https://nextjs.org/icons/next.svg"
					alt="Next.js logo"
					width={180}
					height={38}
					priority
				/>
				<ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
					<li className="mb-2">
						Get started by editing{' '}
						<code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
							src/app/page.tsx
						</code>
						.
					</li>
					<li>Save and see your changes instantly.</li>
				</ol>

				<Card className="w-[350px] self-center">
					<CardHeader>
						<CardTitle>Create project</CardTitle>
						<CardDescription>Deploy your new project in one-click.</CardDescription>
					</CardHeader>
					<CardContent>
						<form>
							<div className="grid w-full items-center gap-4">
								<div className="flex flex-col space-y-1.5">
									<Label htmlFor="name">Name</Label>
									<Input id="name" placeholder="Name of your project" />
								</div>
								<div className="flex flex-col space-y-1.5">
									<Label htmlFor="framework">Framework</Label>
									<Select>
										<SelectTrigger id="framework">
											<SelectValue placeholder="Select" />
										</SelectTrigger>
										<SelectContent position="popper">
											<SelectItem value="next">Next.js</SelectItem>
											<SelectItem value="sveltekit">SvelteKit</SelectItem>
											<SelectItem value="astro">Astro</SelectItem>
											<SelectItem value="nuxt">Nuxt.js</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
						</form>
					</CardContent>
					<CardFooter className="flex justify-between">
						<Button variant="outline">Cancel</Button>
						<Button>Deploy</Button>
					</CardFooter>
				</Card>
				<div className="flex gap-4 items-center justify-center flex-col sm:flex-row w-full">
					<Button className="w-40%">Deploy now</Button>
					<Button variant="outline" className="w-40%">
						Read our docs
					</Button>
				</div>
			</main>
			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="https://nextjs.org/icons/file.svg"
						alt="File icon"
						width={16}
						height={16}
					/>
					Learn
				</a>
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="https://nextjs.org/icons/window.svg"
						alt="Window icon"
						width={16}
						height={16}
					/>
					Examples
				</a>
				<a
					className="flex items-center gap-2 hover:underline hover:underline-offset-4"
					href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image
						aria-hidden
						src="https://nextjs.org/icons/globe.svg"
						alt="Globe icon"
						width={16}
						height={16}
					/>
					Go to nextjs.org →
				</a>
				<ModeToggle />
			</footer>
		</div>
	);
}
