// 'use client';

// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// // Define the user data type
// interface UserData {
//   name: string;
//   email: string;
//   role: string;
//   avatar: string;
//   isLoading: boolean;
//   id?: number | string;
// }

// // Helper function for cookie access
// function getCookieValue(name: string): string {
//   if (typeof document === 'undefined') return '';

//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) {
//     const cookieValue = parts.pop()?.split(';').shift();
//     return cookieValue ? decodeURIComponent(cookieValue) : '';
//   }
//   return '';
// }

// // Create the context with proper type
// const UserContext = createContext<UserData>({
//   name: 'User',
//   email: '',
//   role: '',
//   avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==',
//   isLoading: true
// });

// interface UserProviderProps {
//   children: ReactNode;
// }

// export function UserProvider({ children }: UserProviderProps) {
//   const [userData, setUserData] = useState<UserData>({
//     name: 'User',
//     email: '',
//     role: '',
//     avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==',
//     isLoading: true
//   });

//   const [mounted, setMounted] = useState(false);

//   // Set mounted state to true after component mounts
//   // This prevents hydration errors
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Load user data once on mount
//   useEffect(() => {
//     // Skip during SSR
//     if (!mounted) return;

//     function loadUserData() {
//       try {
//         // Try to get stored user from session storage first
//         if (typeof window !== 'undefined') {
//           try {
//             const sessionData = sessionStorage.getItem('ee6008_user_session_data');
//             if (sessionData) {
//               const parsedData = JSON.parse(sessionData);
//               setUserData({
//                 name: parsedData.name || 'User',
//                 email: parsedData.email || '',
//                 role: parsedData.role || '',
//                 avatar: parsedData.avatar || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==',
//                 id: parsedData.id,
//                 isLoading: false
//               });
//               console.log('✅ User loaded from session storage');
//               return;
//             }
//           } catch (error) {
//             console.error('Error reading from session storage:', error);
//           }
//         }

//         // Get data from cookies if session storage failed
//         const cookieName = getCookieValue('user-name');
//         const cookieEmail = getCookieValue('user-email');
//         const cookieRole = getCookieValue('user-role');
//         const cookieId = getCookieValue('user-id');

//         if (cookieName || cookieEmail) {
//           const userData = {
//             name: cookieName || 'User',
//             email: cookieEmail || '',
//             role: cookieRole || '',
//             avatar: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS11c2VyIj48cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIvPjxjaXJjbGUgY3g9IjEyIiBjeT0iNyIgcj0iNCIvPjwvc3ZnPg==',
//             id: cookieId ? parseInt(cookieId) : undefined,
//             isLoading: false
//           };

//           setUserData(userData);

//           // Also store in session storage for future use
//           if (typeof window !== 'undefined') {
//             try {
//               sessionStorage.setItem('ee6008_user_session_data', JSON.stringify(userData));
//             } catch (error) {
//               console.error('Error storing in session storage:', error);
//             }
//           }

//           console.log('✅ User loaded from cookies');
//           return;
//         }

//         // If we get here, we couldn't load user data
//         setUserData(prev => ({ ...prev, isLoading: false }));
//       } catch (error) {
//         console.error('Error loading user data:', error);
//         setUserData(prev => ({ ...prev, isLoading: false }));
//       }
//     }

//     loadUserData();
//   }, [mounted]);

//   return (
//     <UserContext.Provider value={userData}>
//       {children}
//     </UserContext.Provider>
//   );
// }

// // Hook to access user data
// export function useUser() {
//   return useContext(UserContext);
// }
