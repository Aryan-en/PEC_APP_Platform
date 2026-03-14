const fs = require('fs');

const files = [
    './src/components/chat/ChatSidebar.tsx',
    './src/components/chat/NewChatDialog.tsx',
    './src/components/chat/ChatInfoDialog.tsx',
    './src/components/layout/Header.tsx',
    './src/lib/cloudinary.service.ts',
    './src/hooks/usePermissions.ts',
    './src/lib/permissions.ts'
];

try {
    let cs = fs.readFileSync('./src/components/chat/ChatSidebar.tsx', 'utf8');
    cs = cs.replace(/const activeId = useQuery<\s*{\s*uid:\s*string\s*}\s*>\(\)/, 'const activeId = useQuery<any>()');
    fs.writeFileSync('./src/components/chat/ChatSidebar.tsx', cs);

    let ncd = fs.readFileSync('./src/components/chat/NewChatDialog.tsx', 'utf8');
    ncd = ncd.replace(/const activeId = useQuery<\s*{\s*uid:\s*string\s*}\s*>\(\)/, 'const activeId = useQuery<any>()');
    fs.writeFileSync('./src/components/chat/NewChatDialog.tsx', ncd);
    
    let clo = fs.readFileSync('./src/lib/cloudinary.service.ts', 'utf8');
    if (!clo.includes('firebase/storage')) {
        clo = 'import { ref, storage, uploadBytes, getDownloadURL } from "firebase/storage";\n' + clo;
        fs.writeFileSync('./src/lib/cloudinary.service.ts', clo);
    }

    let up = fs.readFileSync('./src/hooks/usePermissions.ts', 'utf8');
    up = up.replace(/import { CurrentUser } from '..\/types';/, "import { CurrentUser, User } from '../types';");
    up = up.replace(/hasPermission\(user,/g, 'hasPermission(user as unknown as User,');
    up = up.replace(/hasRole\(user,/g, 'hasRole(user as unknown as User,');
    fs.writeFileSync('./src/hooks/usePermissions.ts', up);

} catch(e) {
    console.error(e);
}

// all files with navigate missing
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = require('path').join(dir, file);
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

walk('./src').forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let o = c;
    if (c.includes('navigate("')) {
        c = c.replace(/navigate\("/g, 'router.push("');
    }
    if (c.includes("navigate('")) {
        c = c.replace(/navigate\('/g, "router.push('");
    }
    if (c.includes("navigate(`")) {
        c = c.replace(/navigate\(`/g, "router.push(`");
    }
    if (c.includes("navigate(")) {
        c = c.replace(/navigate\(/g, "router.push(");
    }
    
    if (c.includes('navigate(-1)') || c.includes('navigate(-1')) {
        c = c.replace(/navigate\(-1\)/g, 'router.back()');
    }
    
    // add router.push to missing
    if (c.includes('router.') && !c.includes('useRouter')) {
        c = 'import { useRouter } from "next/navigation";\n' + c;
        c = c.replace(/export default function\s+\w+\s*\([^)]*\)\s*{/, match => match + '\n  const router = useRouter();\n');
        c = c.replace(/export function\s+\w+\s*\([^)]*\)\s*{/, match => match + '\n  const router = useRouter();\n');
        let compMatch = c.match(/const\s+[A-Z]\w+\s*=\s*(async\s*)?\([^)]*\)\s*=>\s*{/);
        if (compMatch) {
            c = c.replace(compMatch[0], compMatch[0] + '\n  const router = useRouter();\n');
        }
    }

    if(f.includes('NavLink.tsx')) {
        c = c.replace(/NavLinkProps/g, 'any');
        c = c.replace(/RouterNavLink/g, 'any');
    }
    
    // cast params to string
    c = c.replace(/doc\(db,\s*'[^']+',\s*([^)]+)\)/g, (match, p1) => {
        if (!p1.includes('string') && p1 !== 'id') {
             return match.replace(p1, `${p1} as string`);
        }
        return match;
    });

    if (c !== o) {
        fs.writeFileSync(f, c);
        console.log("Fixed", f);
    }
});
