import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  onIdTokenChanged, 
  User as FirebaseUser,
  getAuth,
  getIdTokenResult
} from 'firebase/auth';
import { 
  doc, 
  onSnapshot,
  updateDoc,
  getDocs,
  collection,
  query,
  where,
  getFirestore,
  getDoc,
  setDoc,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  const errorString = JSON.stringify(errInfo);
  console.error('Firestore Error: ', errorString);
  throw new Error(errorString);
}

interface UserProfile {
  uid: string;
  public_id?: string;
  name: string;
  username: string;
  email: string;
  role: 'user' | 'cipher';
  funding_balance: number;
  available_balance: number;
  total_earnings: number;
  total_invested: number;
  email_verified?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribeProfileRef = useRef<(() => void) | null>(null);

  const fetchProfileWithRetry = useCallback(async (firebaseUser: FirebaseUser, retryCount = 0): Promise<void> => {
    const isCipher = firebaseUser.email === 'support@tavariwave.network' || 
                     firebaseUser.email === 'contact.cga.usa@gmail.com' || 
                     firebaseUser.uid === '3yV3rfcUzob5v9ltfVcMw0PL6tQ2';

    // Reload user state to ensure we have the absolute latest verification status
    // This addresses the "verified users unable to sign in" permission issue
    if (retryCount === 0) {
      try {
        await firebaseUser.reload();
        await firebaseUser.getIdToken(true);
      } catch (e) {
        console.warn("Auth reload failed during profile fetch", e);
      }
    }

    if (!firebaseUser.emailVerified && !isCipher) {
        setProfile(null);
        setLoading(false);
        return;
    }

    const docRef = doc(db, 'users', firebaseUser.uid);
    
    try {
      // Clear existing subscription
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
        unsubscribeProfileRef.current = null;
      }

      // Initial getDoc to check existence and prime the cache
      const initialSnap = await getDoc(docRef);
      if (initialSnap.exists()) {
        setProfile(initialSnap.data() as UserProfile);
      }

      const unsubscribe = onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setProfile(profileData);

          // ROI Background Sync
          const cycleStartStr = profileData.roi_cycle_start;
          const isRoiDisabled = profileData.roi_disabled === true;

          if (cycleStartStr && !isRoiDisabled) {
            const now = new Date().getTime();
            const cycleStart = new Date(cycleStartStr).getTime();
            const totalDuration = 24 * 60 * 60 * 1000;
            const elapsed = now - cycleStart;
            const completedCycles = Math.floor(elapsed / totalDuration);

            if (completedCycles > 0) {
              try {
                await runTransaction(db, async (transaction) => {
                  const userSnap = await transaction.get(docRef);
                  if (!userSnap.exists()) return;
                  
                  const currentProfile = userSnap.data() as UserProfile;
                  const currentCycleStart = new Date(currentProfile.roi_cycle_start).getTime();
                  const currentCompletedCycles = Math.floor((new Date().getTime() - currentCycleStart) / totalDuration);

                  if (currentCompletedCycles <= 0) return;

                  const q = query(collection(db, 'investments'), where('user_id', '==', firebaseUser.uid), where('status', '==', 'active'));
                  const invSnap = await getDocs(q);
                  
                  let totalCredit = 0;
                  const investmentUpdates: { id: string, data: any }[] = [];

                  invSnap.docs.forEach(d => {
                    const invData = d.data();
                    const profitPerCycle = invData.amount * (invData.dailyRoi || 0);
                    const cycleProfit = currentCompletedCycles * profitPerCycle;
                    totalCredit += cycleProfit;

                    investmentUpdates.push({
                      id: d.id,
                      data: {
                        total_earned: (invData.total_earned || 0) + cycleProfit,
                        last_sync: new Date().toISOString()
                      }
                    });
                  });

                  if (totalCredit > 0) {
                    const newCycleStart = new Date(currentCycleStart + (currentCompletedCycles * totalDuration)).toISOString();
                    
                    // Update User Profile
                    transaction.update(docRef, {
                      available_balance: (currentProfile.available_balance || 0) + totalCredit,
                      total_earnings: (currentProfile.total_earnings || 0) + totalCredit,
                      roi_cycle_start: newCycleStart
                    });

                    // Update individual investments
                    investmentUpdates.forEach(update => {
                      transaction.update(doc(db, 'investments', update.id), update.data);
                    });

                    // Add Transaction Record
                    const txRef = doc(collection(db, 'transactions'));
                    transaction.set(txRef, {
                      user_id: firebaseUser.uid,
                      type: 'roi_harvest',
                      amount: totalCredit,
                      plan_name: 'Auto-Yield Cycle',
                      created_at: new Date().toISOString(),
                      status: 'approved',
                      description: `Automatic credit for ${currentCompletedCycles} cycle(s)`
                    });
                  }
                });
              } catch (err) {
                console.error("[ROI Engine] Sync failed:", err);
              }
            }
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }, (error) => {
        // If snapshot fails with permission error, retry silently
        if (error.message.includes('permission')) {
          if (retryCount < 5) {
            const delay = Math.pow(2, retryCount) * 500;
            setTimeout(() => fetchProfileWithRetry(firebaseUser, retryCount + 1), delay);
          } else {
            console.error("Max retries reached for profile fetch", error);
            setLoading(false);
          }
        } else {
          console.error("Profile subscription error:", error);
          setLoading(false);
        }
      });

      unsubscribeProfileRef.current = unsubscribe;
    } catch (err: any) {
      if (err.message.includes('permission') && retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 500;
        setTimeout(() => fetchProfileWithRetry(firebaseUser, retryCount + 1), delay);
      } else {
        console.error("Fetch profile error:", err);
        setLoading(false);
      }
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      if (updatedUser) {
        await fetchProfileWithRetry(updatedUser);
      }
    }
  }, [fetchProfileWithRetry]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Wait for verification before fetching profile
        const isCipher = firebaseUser.email === 'support@tavariwave.network' || 
                         firebaseUser.email === 'contact.cga.usa@gmail.com' || 
                         firebaseUser.uid === '3yV3rfcUzob5v9ltfVcMw0PL6tQ2';
        
        if (firebaseUser.emailVerified || isCipher) {
          await fetchProfileWithRetry(firebaseUser);
        } else {
          // If not verified, we set profile to null and wait
          setProfile(null);
          setLoading(false);
        }
      } else {
        if (unsubscribeProfileRef.current) {
          unsubscribeProfileRef.current();
          unsubscribeProfileRef.current = null;
        }
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfileRef.current) {
        unsubscribeProfileRef.current();
      }
    };
  }, [fetchProfileWithRetry]);

  const logout = async () => {
    if (unsubscribeProfileRef.current) {
      unsubscribeProfileRef.current();
      unsubscribeProfileRef.current = null;
    }
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshAuth }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
