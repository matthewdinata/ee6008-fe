'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { EmailLogs } from '@/app/faculty/email/components/email-logs';
import { EmailScheduler } from '@/app/faculty/email/components/email-scheduler';
import { EmailSender } from '@/app/faculty/email/components/email-sender';

export default function EmailManager() {
	return (
		<div className="mx-auto py-6 space-y-6">
			<Tabs defaultValue="send" className="w-full">
				<TabsList className="grid w-full md:w-auto grid-cols-3 h-auto">
					<TabsTrigger value="send">Send Email</TabsTrigger>
					<TabsTrigger value="schedule">Schedule</TabsTrigger>
					<TabsTrigger value="logs">Email Logs</TabsTrigger>
				</TabsList>

				<TabsContent value="send" className="mt-6">
					<EmailSender />
				</TabsContent>

				<TabsContent value="schedule" className="mt-6">
					<EmailScheduler />
				</TabsContent>

				<TabsContent value="logs" className="mt-6">
					<EmailLogs />
				</TabsContent>
			</Tabs>
		</div>
	);
}
