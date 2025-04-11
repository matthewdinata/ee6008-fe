'use server';

import { getServerActionSession } from './actions/admin/upload';

type FetcherOptions = {
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	headers?: Record<string, string>;
	cache?: RequestCache;
	next?: NextFetchRequestConfig;
};

type NextFetchRequestConfig = {
	revalidate?: number | false;
	tags?: string[];
};

/**
 * Fetcher function to make authenticated requests to the backend API
 * @param path The API path to request
 * @param options The fetch options
 * @param data The request data
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function fetcherFn<T = any>(
	path: string,
	options: FetcherOptions,
	data?: any
): Promise<T> {
	const apiUrl = process.env.BACKEND_API_URL;
	if (!apiUrl) {
		throw new Error('Backend API URL is not defined');
	}

	const { method, headers = {}, cache, next } = options;

	const session = await getServerActionSession();
	if (process.env.NODE_ENV === 'development') {
		console.debug('Session token:', session.accessToken);
	}

	const fetchOptions: RequestInit & { next?: NextFetchRequestConfig } = {
		method: method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.accessToken}`,
			...headers,
		},
		cache: cache,
		next: next,
	};

	if (data && options.method !== 'GET') {
		const snakeCaseData = transformToSnakeCase(data);
		fetchOptions.body = JSON.stringify(snakeCaseData);
	}

	try {
		const response = await fetch(`${apiUrl}/api/${path}`, fetchOptions);

		if (!response.ok) {
			// Try to get more detailed error information from the response
			try {
				const errorData = await response.json();
				console.error('API error details:', errorData);
				throw new Error(
					`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`
				);
			} catch (parseError) {
				// If we can't parse the error response as JSON, just throw the basic error
				throw new Error(`HTTP error! status: ${response.status}`);
			}
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
