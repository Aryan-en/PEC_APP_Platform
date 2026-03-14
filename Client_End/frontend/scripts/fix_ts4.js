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
    if(c.includes('<Link ') && !c.includes('next/link')) {
        c = 'import Link from "next/link";\n' + c;
    }
    // Also fix navigate issues
    if (c.includes('navigate(') && !c.includes('const router = useRouter()')) {
        c = c.replace(/\bnavigate\(/g, 'router.push(');
    }
    if (c.includes('router.push(') && !c.includes('next/navigation')) {
        c = 'import { useRouter } from "next/navigation";\n' + c;
        c = c.replace(/export default function\s+\w+\s*\([^)]*\)\s*{/, match => match + '\n  const router = useRouter();\n');
        c = c.replace(/export function\s+\w+\s*\([^)]*\)\s*{/, match => match + '\n  const router = useRouter();\n');
    }

    if(o !== c) {
        fs.writeFileSync(f, c);
        cg++;
    }
});
console.log('Fixed', cg, 'files with Link and router imports');
