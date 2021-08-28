import { destroyCookie, setCookie } from 'nookies';
import { useEffect, useState, createContext, ReactNode, useContext } from 'react';
import { auth, firebase } from '../services/firebase';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';

type User = {
  id: string;
  name: string;
  avatar: string;
}

type AuthContextType = {
  user: User | undefined;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider(props: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const router = useRouter();
  const { setTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        const { displayName, photoURL, uid } = user

        if (!displayName || !photoURL) {
          throw new Error('Missing information from Google Account.');
        }

        setUser({
          id: uid,
          name: displayName,
          avatar: photoURL,
        });

        const token = await user.getIdToken();

        setCookie(undefined, '@Musifavs:token', token, {
          maxAge: 60 * 60 * 60 * 1,
          path: '/',
        })
      }
    });

    return () => {
      unsubscribe();
    }
  }, []);

  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);

    if (result.user) {
      const { displayName, photoURL, uid } = result.user

      if (!displayName || !photoURL) {
        throw new Error('Missing information from Google Account.');
      }

      setUser({
        id: uid,
        name: displayName,
        avatar: photoURL,
      });

      router.push('/');
    }
  }

  async function signOut() {
    await auth.signOut();

    destroyCookie(null, '@Musifavs:token', {
      path: '/',
    });

    router.push('/login');

    setTheme('light');
  }


  return (
    <AuthContext.Provider value={{
      signInWithGoogle,
      signOut,
      user,
    }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext);

  return value;
}