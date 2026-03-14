const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./src/views');
const appFiles = walk('./app');
const libFiles = walk('./src/lib');
const allFiles = [...files, ...appFiles, ...libFiles, './src/components/layout/Header.tsx', './src/components/layout/Sidebar.tsx', './src/components/layout/BottomNav.tsx'];

let changedCount = 0;

allFiles.forEach(f => {
    if (!fs.existsSync(f)) return;
    try {
        let c = fs.readFileSync(f, 'utf8');
        let orig = c;

        // Firebase imports
        const firestoreMethods = ['onSnapshot', 'Timestamp', 'doc', 'arrayUnion', 'arrayRemove', 'deleteField', 'writeBatch', 'collection', 'getDoc', 'getDocs', 'addDoc', 'updateDoc', 'setDoc'];
        let needsFirestore = [];
        firestoreMethods.forEach(method => {
            const regex = new RegExp('\\b' + method + '\\b');
            if (regex.test(c) && !c.match(new RegExp('import.*\\b' + method + '\\b.*from.*firebase/firestore'))) {
                needsFirestore.push(method);
            }
        });

        if (needsFirestore.length > 0) {
            if (c.includes('firebase/firestore')) {
                c = c.replace(/import\s+{([^}]*)}\s+from\s+['"]firebase\/firestore['"]/, (match, p1) => {
                    return `import { ${p1}, ${needsFirestore.join(', ')} } from 'firebase/firestore'`;
                });
            } else {
                c = `import { ${needsFirestore.join(', ')} } from "firebase/firestore";\n` + c;
            }
        }

        // Router injection
        if (c.includes('navigate(') && !c.includes('const router = useRouter()')) {
            c = c.replace(/\bnavigate\(/g, 'router.push(');
        }
        
        if (c.includes('router.push(') && !c.includes('useRouter')) {
             if (!c.includes('next/navigation')) {
                c = `import { useRouter } from "next/navigation";\n` + c;
             }
             // Simple naive injection for router
             c = c.replace(/export default function\s+\w+\s*\([^)]*\)\s*{/, match => match + '\n  const router = useRouter();\n');
             c = c.replace(/export function\s+\w+\s*\([^)]*\)\s*{/, match => match + '\n  const router = useRouter();\n');
        }
        
        // common null checks for users
        c = c.replace(/user\.uid/g, 'user?.uid');
        c = c.replace(/user\.email/g, 'user?.email');
        c = c.replace(/user\.displayName/g, 'user?.displayName');
        
        if (orig !== c) {
            fs.writeFileSync(f, c);
            changedCount++;
        }
    } catch(e) {
        console.error("Error with file " + f, e);
    }
});

console.log("Fixed files:", changedCount);
