'use client';

import { AuthError, Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

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

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);

	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}

	return context;
}
