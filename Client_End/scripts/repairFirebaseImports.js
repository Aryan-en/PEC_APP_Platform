import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../src');

const firestoreFunctions = [
  'collection', 'doc', 'getDoc', 'getDocs', 'addDoc', 'setDoc', 
  'updateDoc', 'deleteDoc', 'query', 'where', 'limit', 'orderBy', 
  'startAfter', 'serverTimestamp', 'increment', 'getFirestore'
];

const authFunctions = [
  'getAuth', 'onAuthStateChanged', 'signInWithEmailAndPassword', 
  'createUserWithEmailAndPassword', 'sendPasswordResetEmail', 
  'signInWithPopup', 'GoogleAuthProvider'
];

function repairFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Find used functions from firestore
  const usedFirestore = firestoreFunctions.filter(fn => 
    new RegExp(`\\b${fn}\\s*\\(`).test(content) || new RegExp(`\\b${fn}\\b`).test(content)
  );

  // Find used functions from auth
  const usedAuth = authFunctions.filter(fn => 
    new RegExp(`\\b${fn}\\s*\\(`).test(content) || new RegExp(`\\b${fn}\\b`).test(content)
  );

  // Find if db or auth is used (usually from @/config/firebase)
  const usesDb = /\bdb\b/.test(content);
  const usesAuthObj = /\bauth\b/.test(content);

  // Add firestore imports if missing
  if (usedFirestore.length > 0 && !content.includes('from "firebase/firestore"') && !content.includes("from 'firebase/firestore'")) {
    const importStats = `import { ${usedFirestore.join(', ')} } from "firebase/firestore";\n`;
    content = importStats + content;
    changed = true;
  }

  // Add auth imports if missing
  if (usedAuth.length > 0 && !content.includes('from "firebase/auth"') && !content.includes("from 'firebase/auth'")) {
    const importStats = `import { ${usedAuth.join(', ')} } from "firebase/auth";\n`;
    content = importStats + content;
    changed = true;
  }

  // Add @/config/firebase imports if missing
  if ((usesDb || usesAuthObj) && !content.includes('@/config/firebase')) {
    const imports = [];
    if (usesDb) imports.push('db');
    if (usesAuthObj) imports.push('auth');
    const importStats = `import { ${imports.join(', ')} } from "@/config/firebase";\n`;
    content = importStats + content;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Repaired: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      repairFile(fullPath);
    }
  }
}

console.log('Starting repair of Firebase imports...');
walkDir(srcDir);
console.log('Finished repair.');
