import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from 'recharts';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';

type PreferenceDistributionChartProps = {
	data: Array<{ preference: string; count: number }>;
};

export function PreferenceDistributionChart({ data }: PreferenceDistributionChartProps) {
	const chartConfig = {
		count: {
			label: 'Count',
			color: 'hsl(var(--chart-1))',
		},
		label: {
			color: 'hsl(var(--background))',
		},
	} satisfies ChartConfig;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Preference Distribution</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="preference"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
						<Bar dataKey="count" fill="var(--color-count)" radius={8}>
							<LabelList
								position="top"
								offset={12}
								className="fill-foreground"
								fontSize={12}
							/>
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col items-start gap-2 text-sm">
				<div className="leading-none text-muted-foreground">
					Showing number of allocations based on student preferences
				</div>
			</CardFooter>
		</Card>
	);
}
