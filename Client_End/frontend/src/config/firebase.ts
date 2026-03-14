"use client";

// ===========================================
// MEGA-MOCK Firebase Module — No Firebase SDK Used
// ===========================================
// This module provides mock stubs so that existing imports
// like `import { auth, db, storage } from '@/config/firebase'`
// and aliased imports from 'firebase/auth' or 'firebase/firestore'
// don't break. 

// --- Core Auth ---
export const auth: any = {
  currentUser: {
    uid: 'demo-user-001',
    email: 'admin@PEC App.edu',
    displayName: 'Arjun Admin',
    emailVerified: true,
  },
  onAuthStateChanged: (callback: any) => {
    // Simulate immediate login with the demo user
    setTimeout(() => callback(auth.currentUser), 0);
    return () => { };
  },
  signOut: async () => {
    console.log('[Mock] signOut called');
    window.location.href = '/auth';
  },
};

export const getAuth = () => auth;
export const onAuthStateChanged = (authInstance: any, callback: any) => authInstance.onAuthStateChanged(callback);
export const signInWithEmailAndPassword = async () => ({ user: auth.currentUser });
export const createUserWithEmailAndPassword = async () => ({ user: auth.currentUser });
export const sendPasswordResetEmail = async () => ({});
export const signInWithPopup = async () => ({ user: auth.currentUser });
export const GoogleAuthProvider = class { };

// --- Core Firestore ---
export const db: any = {};
export const getFirestore = () => db;

// Mocking snapshots and docs
const mockDoc = {
  id: 'demo-doc-id',
  exists: () => true,
  data: () => ({
    role: 'college_admin', // Default to admin for testing the admin dashboard
    organizationId: 'demo-org-001',
    fullName: 'Arjun Admin',
    email: 'admin@PEC App.edu',
    status: 'active',
    verified: true,
    profileComplete: true,
    name: 'Demo Institution',
    slug: 'demo',
    type: 'college',
  })
};

const mockSnapshot = {
  docs: [mockDoc, { ...mockDoc, id: 'demo-doc-2' }],
  empty: false,
  size: 2,
  forEach: (cb: any) => [mockDoc].forEach(cb),
  map: (cb: any) => [mockDoc].map(cb),
  find: (cb: any) => mockDoc
};

export const collection = () => ({});
export const doc = () => ({});
export const getDoc = async () => mockDoc;
export const getDocs = async () => mockSnapshot;
export const addDoc = async () => ({ id: 'new-id' });
export const setDoc = async () => ({});
export const updateDoc = async () => ({});
export const deleteDoc = async () => ({});
export const query = () => ({});
export const where = () => ({});
export const limit = () => ({});
export const orderBy = () => ({});
export const startAfter = () => ({});
export const serverTimestamp = () => new Date();
export const increment = (v: number) => v;

// --- Storage ---
export const storage: any = {};
export const getStorage = () => storage;
export const ref = () => ({});
export const uploadBytes = async () => ({});
export const getDownloadURL = async () => 'https://via.placeholder.com/150';

// --- App ---
export const app = {};
export const initializeApp = () => app;

export default app;
