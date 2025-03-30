import { useEffect, useState } from 'react';

// Define the types for different schema structures
interface CourseProps {
	name?: string;
	description?: string;
	courseCode?: string;
	credential?: string;
}

interface BreadcrumbItem {
	name: string;
	url: string;
}

interface BreadcrumbProps {
	items: BreadcrumbItem[];
}

interface WebPageProps {
	title?: string;
	description?: string;
	url?: string;
}

type SchemaProps = CourseProps | BreadcrumbProps | WebPageProps;

/**
 * Custom hook to dynamically generate schema.org JSON-LD data
 * for different page types to improve SEO
 */
export function useSEOSchema(
	type: 'Course' | 'BreadcrumbList' | 'WebPage',
	props: SchemaProps
): string {
	const [schemaData, setSchemaData] = useState<string>('');

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let schema: Record<string, any> = {
			'@context': 'https://schema.org',
		};

		switch (type) {
			case 'Course':
				schema = {
					...schema,
					'@type': 'Course',
					name: `${(props as CourseProps).name || 'EE6008 Collaborative Research and Development Project'}`,
					description: `${(props as CourseProps).description || 'Collaborative Research and Development Project at Nanyang Technological University'}`,
					provider: {
						'@type': 'Organization',
						name: 'Nanyang Technological University',
						sameAs: 'https://www.ntu.edu.sg',
					},
					courseCode: `${(props as CourseProps).courseCode || 'EE6008'}`,
					educationalCredentialAwarded: `${(props as CourseProps).credential || 'MSc'}`,
				};
				break;

			case 'BreadcrumbList':
				schema = {
					...schema,
					'@type': 'BreadcrumbList',
					itemListElement: (props as BreadcrumbProps).items.map(
						(item: BreadcrumbItem, index: number) => ({
							'@type': 'ListItem',
							position: index + 1,
							name: item.name,
							item: item.url,
						})
					),
				};
				break;

			case 'WebPage':
				schema = {
					...schema,
					'@type': 'WebPage',
					name: (props as WebPageProps).title || 'EE6008',
					description:
						(props as WebPageProps).description ||
						'EE6008 at Nanyang Technological University',
					url: (props as WebPageProps).url || 'https://ee6008-fe.vercel.app',
					isPartOf: {
						'@type': 'WebSite',
						name: 'EE6008 Course Portal',
						url: 'https://ee6008-fe.vercel.app',
					},
				};
				break;

			default:
				break;
		}

		setSchemaData(JSON.stringify(schema));
	}, [type, props]);

	return schemaData;
}
