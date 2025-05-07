// services/userService.js
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const auth = getAuth();

type JiraConfig = {
  domain: string;
  apiToken: string;
  email: string;
  isConnected: boolean;
}

export const saveUserProfile = async (userData: any) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      ...userData,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    
    // אם אין עדיין מידע, נחזיר מידע בסיסי מהאותנטיקציה
    return {
      displayName: user.displayName || '',
      email: user.email || '',
      company: '',
      role: ''
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};


export const saveJiraConfig = async (jiraConfig: JiraConfig) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      jiraConfig: {
        ...jiraConfig,
        updatedAt: new Date().toISOString()
      }
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error saving Jira config:', error);
    throw error;
  }
};

export const getJiraConfig = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data().jiraConfig || { domain: '', apiToken: '', email: '', isConnected: false };
    }
    
    return { domain: '', apiToken: '', email: '', isConnected: false };
  } catch (error) {
    console.error('Error getting Jira config:', error);
    throw error;
  }
};


export const saveDomainsToDatabase = async (domains: any) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      domains: domains,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error saving domains:', error);
    throw error;
  }
}

export const getDomainsFromDatabase = async () => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data().domains || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting domains:', error);
    throw error;
  }
};