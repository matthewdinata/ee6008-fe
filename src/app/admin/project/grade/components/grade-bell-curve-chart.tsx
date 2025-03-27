'use client';

import { useMemo } from 'react';
import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Legend,
	Line,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { Card } from '@/components/ui/card';

interface DataPoint {
	range: string;
	count: number;
	normalDistribution: number;
}

interface GradeBellCurveChartProps {
	data: DataPoint[];
	mean: number;
	stdDev: number;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		value: number;
		dataKey: string;
	}>;
	label?: string;
}

export default function GradeBellCurveChart({
	data,
	mean,
	stdDev: _stdDev,
}: GradeBellCurveChartProps) {
	// Format data for the chart
	const chartData = useMemo(() => {
		return data.map((point) => ({
			range: point.range,
			count: point.count,
			normalDistribution: point.normalDistribution,
		}));
	}, [data]);

	// Find the max count for y-axis scaling
	const maxCount = useMemo(() => {
		const counts = data.map((d) => d.count);
		return counts.length > 0 ? Math.max(...counts) : 10;
	}, [data]);

	// Find the range that contains the mean
	const meanRange = useMemo(() => {
		const meanFloor = Math.floor(mean / 5) * 5;
		const meanCeil = meanFloor + 5;
		return `${meanFloor}-${meanCeil - 1}`;
	}, [mean]);

	// Custom tooltip to show more information
	const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
		if (active && payload && payload.length) {
			const gradeRange = label;
			const count = payload[0]?.value;
			const normalDist = payload[1]?.value?.toFixed(2) || '0';

			return (
				<Card className="p-3 bg-background border shadow-md">
					<p className="font-medium">{`Grade Range: ${gradeRange}`}</p>
					<p className="text-sm text-muted-foreground">{`Student Count: ${count}`}</p>
					<p className="text-sm text-muted-foreground">{`Normal Distribution: ${normalDist}`}</p>
					{gradeRange === meanRange && (
						<p className="text-sm font-medium text-red-500">{`Mean: ${mean.toFixed(2)}`}</p>
					)}
				</Card>
			);
		}
		return null;
	};

	return (
		<ResponsiveContainer width="100%" height="100%">
			<ComposedChart
				data={chartData}
				margin={{
					top: 20,
					right: 30,
					left: 20,
					bottom: 60,
				}}
			>
				<CartesianGrid strokeDasharray="3 3" opacity={0.2} />
				<XAxis
					dataKey="range"
					angle={-45}
					textAnchor="end"
					height={60}
					tick={{ fontSize: 12 }}
					label={{
						value: 'Grade Range',
						position: 'insideBottom',
						offset: -15,
						fontSize: 14,
					}}
				/>
				<YAxis
					yAxisId="left"
					domain={[0, maxCount * 1.2]} // Increase y-axis scale to make small values more visible
					label={{
						value: 'Student Count',
						angle: -90,
						position: 'insideLeft',
						style: { textAnchor: 'middle' },
						fontSize: 14,
					}}
				/>
				<YAxis
					yAxisId="right"
					orientation="right"
					label={{
						value: 'Normal Distribution',
						angle: 90,
						position: 'insideRight',
						style: { textAnchor: 'middle' },
						fontSize: 14,
					}}
				/>
				<Tooltip content={<CustomTooltip />} />
				<Legend wrapperStyle={{ paddingTop: 20 }} />

				{/* Histogram bars */}
				<Bar
					yAxisId="left"
					dataKey="count"
					fill="#8884d8"
					name="Student Count"
					barSize={30}
					radius={[4, 4, 0, 0]}
				/>

				{/* Normal distribution curve */}
				<Line
					yAxisId="right"
					type="monotone"
					dataKey="normalDistribution"
					stroke="#ff7300"
					strokeWidth={3}
					dot={false}
					name="Normal Distribution"
				/>

				{/* Mean reference line */}
				<ReferenceLine
					x={meanRange}
					stroke="#ff0000"
					strokeWidth={2}
					yAxisId="left"
					label={{
						value: `Mean: ${mean.toFixed(2)}`,
						position: 'top',
						fill: '#ff0000',
						fontSize: 12,
					}}
				/>
			</ComposedChart>
		</ResponsiveContainer>
	);
}
