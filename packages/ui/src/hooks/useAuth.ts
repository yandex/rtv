import { createContext, useContext } from 'react';

export interface AuthContextType {
  username?: string;
  signIn?: (user: string) => void;
  signOut?: () => void;
}

export const AuthContext = createContext<AuthContextType>({});

export default function useAuth() {
  return useContext(AuthContext);
}
