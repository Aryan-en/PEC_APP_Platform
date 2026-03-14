const fs = require('fs');
const path = require('path');

function walk(d) {
    let files = [];
    fs.readdirSync(d).forEach(f => {
        let p = path.join(d, f);
        if(fs.statSync(p).isDirectory()) files = files.concat(walk(p));
        else if(p.endsWith('.tsx') || p.endsWith('.ts')) files.push(p);
    });
    return files;
}

let files = [...walk('./src'), ...walk('./app')];
let cg = 0;

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let o = c;

    // Chat dialogs queries
    c = c.replace(/useQuery<\s*\{\s*uid:\s*string\s*\}\s*>/g, 'useQuery<any>');

    // Access denied & navigations leftover
    c = c.replace(/navigate\(-1\)/g, 'router.back()');
    c = c.replace(/router\.push\(-1\)/g, 'router.back()');

    if (c.includes('navigate=')) {
        c = c.replace(/const navigate = useNavigate\(\)/g, 'const router = useRouter()');
    }
    
    // Remaining navigates
    c = c.replace(/\bnavigate\(/g, 'router.push(');

    // useRouter fallback injection
    if (c.includes('router.push(') && !c.includes('useRouter')) {
        c = 'import { useRouter } from "next/navigation";\n' + c;
        c = c.replace(/export default function\s+\w+\s*\([^)]*\)\s*{/, match => match + '\n  const router = useRouter();\n');
        let compMatch = c.match(/const\s+[A-Z]\w+\s*=\s*(async\s*)?\([^)]*\)\s*=>\s*{/);
        if (compMatch) c = c.replace(compMatch[0], compMatch[0] + '\n  const router = useRouter();\n');
    }

    // Cloudinary service
    if(f.includes('cloudinary.service.ts')) {
        c = c.replace(/import { ref, storage, uploadBytes, getDownloadURL } from "firebase\/storage";/, 
                      'import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";');
        c = c.replace(/const storageRef = ref\(storage, path\);/, 'const storageRef = ref(getStorage(), path);');
    }

    // ResumeBuilderIvyLeague
    if(f.includes('ResumeBuilderIvyLeague.tsx')) {
        // Find and deduplicate standard firestore imports
        const fbLines = c.split('\n');
        c = fbLines.filter(l => !(l.includes('import { doc') && l.includes('firebase'))).join('\n');
        c = 'import { doc, getDoc, updateDoc } from "firebase/firestore";\n' + c;
        c = c.replace(/import pdfWorker from ['"]pdfjs-dist\/build\/pdf\.worker\.mjs\?url['"];/g, 
            '// @ts-ignore\nimport pdfWorker from "pdfjs-dist/build/pdf.worker.mjs";');
    }

    if(f.includes('usePermissions.ts') || f.includes('permissions.ts')) {
        c = c.replace(/hasPermission\(user,/g, 'hasPermission(user as any,');
        c = c.replace(/hasRole\(user,/g, 'hasRole(user as any,');
        c = c.replace(/permissions: user\.permissions/g, 'permissions: (user as any).permissions');
    }
    
    if (c.includes('navigate') && o === c) {
        c = c.replace(/\bnavigate\b/g, 'router.push');
    }

    if(o !== c) {
        fs.writeFileSync(f, c);
        cg++;
    }
});

console.log('Fixed', cg, 'files with TS Fix 8');
