/* eslint-disable @typescript-eslint/no-explicit-any */

'use server';

type FetcherOptions = {
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	headers?: Record<string, string>;
	cache?: RequestCache;
	next?: NextFetchRequestConfig;
};

type NextFetchRequestConfig = {
	revalidate?: number | false;
	tags?: string[];
};

export async function fetcherFn<T = any>(
	path: string,
	data?: any,
	options: FetcherOptions = {}
): Promise<T> {
	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const { method = 'POST', headers = {} } = options;

	const fetchOptions: RequestInit & { next?: NextFetchRequestConfig } = {
		method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
			...headers,
		},
	};

	if (data) {
		const snakeCaseData = transformToSnakeCase(data);
		fetchOptions.body = JSON.stringify(snakeCaseData);
	}

	try {
		const response = await fetch(`${apiUrl}/api/${path}`, fetchOptions);

		console.log(`${apiUrl}/api/${path}`);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const rawResult = await response.json();
		const camelCaseResult = transformToCamelCase(rawResult);

		return camelCaseResult as T;
	} catch (error) {
		console.error(`Error fetching ${path}:`, error);
		throw error;
	}
}

/**
 * Converts a camelCase string to snake_case
 */
const toSnakeCase = (str: string): string => {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Converts a snake_case string to camelCase
 */
const toCamelCase = (str: string): string => {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Recursively transforms all object keys from camelCase to snake_case
 */
const transformToSnakeCase = (obj: any): any => {
	if (Array.isArray(obj)) {
		return obj.map((item) => transformToSnakeCase(item));
	} else if (obj && typeof obj === 'object' && obj !== null) {
		return Object.keys(obj).reduce((acc, key) => {
			const snakeKey = toSnakeCase(key);
			acc[snakeKey] = transformToSnakeCase(obj[key]);
			return acc;
		}, {} as any);
	}
	return obj;
};

/**
 * Recursively transforms all object keys from snake_case to camelCase
 */
const transformToCamelCase = (obj: any): any => {
	if (Array.isArray(obj)) {
		return obj.map((item) => transformToCamelCase(item));
	} else if (obj && typeof obj === 'object' && obj !== null) {
		return Object.keys(obj).reduce((acc, key) => {
			const camelKey = toCamelCase(key);
			acc[camelKey] = transformToCamelCase(obj[key]);
			return acc;
		}, {} as any);
	}
	return obj;
};
