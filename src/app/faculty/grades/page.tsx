'use client';

import BellCurveBarChart from '@/app/faculty/grades/BellCurveBarChart';
import BellCurveDashboard from '@/app/faculty/grades/BellCurveDashboard';
import NTUBellCurveWithDownload from '@/app/faculty/grades/download';

const BellCurvePage = () => {
	return (
		<div>
			<BellCurveDashboard />
			<BellCurveBarChart />
			<NTUBellCurveWithDownload />
		</div>
	);
};

export default BellCurvePage;
