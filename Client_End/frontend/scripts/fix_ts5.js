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

    // Fix navigate
    if (c.match(/\bnavigate\(/)) {
        c = c.replace(/\bnavigate\(/g, 'router.push(');
    }
    
    // Auto-inject useRouter if router is used but not imported
    if (c.includes('router.push') || c.includes('router.replace')) {
        if (!c.includes('next/navigation')) {
            c = 'import { useRouter } from "next/navigation";\n' + c;
        }
        if (!c.includes('const router = useRouter()')) {
             c = c.replace(/export default function\s+\w+\s*\([^)]*\)\s*{/, match => match + '\n  const router = useRouter();\n');
             c = c.replace(/export function\s+\w+\s*\([^)]*\)\s*{/, match => match + '\n  const router = useRouter();\n');
             let compMatch = c.match(/const\s+[A-Z]\w+\s*=\s*(async\s*)?\([^)]*\)\s*=>\s*{/);
             if (compMatch) {
                 c = c.replace(compMatch[0], compMatch[0] + '\n  const router = useRouter();\n');
             }
        }
    }

    // useParams type casting (id as string) for Firebase doc
    c = c.replace(/doc\(\s*db\s*,\s*['"][a-zA-Z_-]+['"]\s*,\s*([a-zA-Z0-9_]+)\s*\)/g, (match, p1) => {
        if (p1 !== 'id' && p1 !== 'orgId' && p1 !== 'userId' && p1 !== 'departmentId' && p1 !== 'courseId' && p1 !== 'studentId') {
            return match; // Only cast common dynamic route params
        }
        return `doc(db, '${match.match(/['"](.*?)['"]/)[1]}', ${p1} as string)`;
    });

    if(f.includes('ChatInfoDialog.tsx')) {
        c = c.replace(/useQuery\s*<\s*{\s*uid:\s*string\s*}\s*>/g, 'useQuery<any>');
        c = c.replace(/\{ uid: string \}/g, 'any');
    }

    if(f.includes('ResumeBuilderIvyLeague.tsx')) {
        // remove duplicated docs
        if(c.split('import { doc').length > 2) {
            let lines = c.split('\n');
            c = lines.filter(l => !(l.includes('import { doc') && l.includes('firebase'))).join('\n');
            c = c + '\nimport { doc, getDoc, updateDoc } from "firebase/firestore";\n';
        }
    }
    
    // user possibly null overrides safely
    c = c.replace(/user\.organizationId/g, 'user?.organizationId');
    c = c.replace(/userData\.organizationId/g, 'userData?.organizationId');
    c = c.replace(/user\.role/g, 'user?.role');
    c = c.replace(/submission\.marksObtained/g, 'submission?.marksObtained');

    if(o !== c) {
        fs.writeFileSync(f, c);
        cg++;
    }
});
console.log('Fixed', cg, 'files with TS fixes pass 5');
