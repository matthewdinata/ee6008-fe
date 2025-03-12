/* eslint-disable prettier/prettier */

/* eslint-disable import/extensions */
// eslint-disable-line
'use server';

import { fetcherFn } from '@/utils/functions';

/* eslint-disable prettier/prettier */
/* eslint-disable import/extensions */ // eslint-disable-line

/**
 * Server action to handle bulk upload of faculty users
 * @param formData Form data containing the file and semester_id
 * @param accessToken User's access token for authorization
 */
export async function bulkUploadFaculty(formData: FormData, accessToken: string) {
	return fetcherFn('admin/users/bulk-upload-faculty', formData, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

/**
 * Server action to handle bulk upload of student users
 * @param formData Form data containing the file and semester_id
 * @param accessToken User's access token for authorization
 */
export async function bulkUploadStudent(formData: FormData, accessToken: string) {
	return fetcherFn('admin/users/bulk-upload-student', formData, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

/**
 * Server action to handle general bulk upload
 * @param formData Form data containing the file and other required parameters
 * @param accessToken User's access token for authorization
 */
export async function bulkUpload(formData: FormData, accessToken: string) {
	return fetcherFn('admin/users/bulk-upload', formData, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}

/**
 * Server action to handle file upload
 * @param formData Form data containing the file to upload
 * @param accessToken User's access token for authorization
 */
export async function fileUpload(formData: FormData, accessToken: string) {
	return fetcherFn('admin/upload', formData, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
}
