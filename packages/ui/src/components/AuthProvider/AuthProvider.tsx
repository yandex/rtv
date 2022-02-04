import { useState } from 'react';

import { AuthContext, AuthContextType } from 'hooks/useAuth';
import { getUsername, signIn, signOut } from 'utils/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState(getUsername());

  const value: AuthContextType = {
    username: username,
    signIn: (newUser: string) => {
      signIn(newUser);
      setUsername(newUser);
    },
    signOut: () => {
      signOut();
      setUsername(undefined);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
