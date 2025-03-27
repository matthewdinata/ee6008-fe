'use client';

import { AuthError, Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

// import { TokenExpiryAlert } from '@/components/ui/token-expiry-alert';

interface AuthContextType {
	session: Session | null;
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	error: AuthError | null;
	signOut: () => Promise<void>;
	refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<AuthError | null>(null);

	// Calculate authentication status
	const isAuthenticated = !!session && !!user;

	// Fetch the current session
	const fetchSession = useCallback(async () => {
		try {
			setIsLoading(true);
			const { data, error } = await supabase.auth.getSession();

			if (error) {
				throw error;
			}

			setSession(data.session);
			setUser(data.session?.user || null);
			setError(null);
		} catch (err) {
			console.error('Error fetching auth session:', err);
			setError(err as AuthError);
			setSession(null);
			setUser(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Function to handle sign out
	const signOut = useCallback(async () => {
		try {
			setIsLoading(true);
			const { error } = await supabase.auth.signOut();
			if (error) throw error;

			// Clear session state
			setSession(null);
			setUser(null);
			setError(null);

			// Clear storage on client side if window is available
			if (typeof window !== 'undefined') {
				// Clear session storage items
				sessionStorage.removeItem('ee6008_user_session_data');
				sessionStorage.removeItem('ee6008_prev_user_name');
				sessionStorage.removeItem('ee6008_prev_user_email');
				sessionStorage.removeItem('hasRenderedSidebar');
				sessionStorage.removeItem('supabase.auth.token');

				// Clear local storage items
				localStorage.removeItem('ee6008_user_data');
				localStorage.removeItem('supabase.auth.token');
			}
		} catch (err) {
			console.error('Error signing out:', err);
			setError(err as AuthError);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Function to manually refresh the session
	const refreshSession = useCallback(async () => {
		try {
			setIsLoading(true);
			const { data, error } = await supabase.auth.refreshSession();

			if (error) throw error;

			setSession(data.session);
			setUser(data.session?.user || null);
			setError(null);
		} catch (err) {
			console.error('Error refreshing session:', err);
			setError(err as AuthError);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		// Load the initial session
		fetchSession();

		// Set up auth state change listener
		const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
			setSession(session);
			setUser(session?.user || null);
			setIsLoading(false);
		});

		// Clean up subscription
		return () => {
			authListener.subscription.unsubscribe();
		};
	}, [fetchSession]);

	// Context value with all auth-related state and functions
	const value = {
		session,
		user,
		isLoading,
		isAuthenticated,
		error,
		signOut,
		refreshSession,
	};

	return (
		<AuthContext.Provider value={value}>
			{/* <TokenExpiryAlert /> */}
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
}
