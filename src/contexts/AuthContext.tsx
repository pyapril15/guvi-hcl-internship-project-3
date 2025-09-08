import React, {createContext, useContext, useEffect, useState} from 'react';
import {onAuthStateChanged, signOut, User as FirebaseUser} from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore';
import {auth, db} from '../config/firebase';
import {User} from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile({uid: user.uid, ...userDoc.data()} as User);
          } else {
            setUserProfile({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || '',
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
          });
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};