// types.ts

export type MessageType = {
	text: string;
	type: 'success' | 'error' | 'info';
};

export type AuthMode = 'signin' | 'signup';
