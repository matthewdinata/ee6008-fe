'use client';

import Script from 'next/script';

interface CourseStructuredDataProps {
	courseName?: string;
	courseDescription?: string;
	courseCode?: string;
}

export default function CourseStructuredData({
	courseName = 'EE6008 Collaborative Research and Development Project',
	courseDescription = "The module aims the MSc students under the School of EEE's MSc programmes with practical experience in the design, implementation, prototyping and testing of electrical and electronic engineering projects or multi-disciplinary projects that involve major electrical and electronic engineering-related components.",
	courseCode = 'EE6008',
}: CourseStructuredDataProps): React.ReactElement {
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Course',
		name: courseName,
		description: courseDescription,
		provider: {
			'@type': 'Organization',
			name: 'Nanyang Technological University',
			sameAs: 'https://www.ntu.edu.sg',
		},
		courseCode: courseCode,
		educationalCredentialAwarded: 'MSc',
		numberOfCredits: '3 AUs',
		timeRequired: '39 Contact Hours',
		hasCourseInstance: {
			'@type': 'CourseInstance',
			courseMode: 'onsite',
			courseWorkload: '39 hours',
			academicTerm: 'AY2023-24 Semester 2',
		},
		inLanguage: 'en',
		teaches: [
			'Collaborative Research',
			'Development Projects',
			'Electrical Engineering',
			'Electronic Engineering',
			'Design',
			'Implementation',
			'Prototyping',
			'Testing',
		],
		educationalProgramMode: 'full-time',
		educationalLevel: "Master's Degree",
	};

	return (
		<Script
			id="course-structured-data"
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
		/>
	);
}
