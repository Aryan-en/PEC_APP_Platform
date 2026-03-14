const fs = require('fs');
const path = require('path');

const frontendSrcDir = path.resolve(__dirname, '..', 'frontend', 'src');

let fixedCount = 0;

function walkDir(dir, callback) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      callback(fullPath);
    }
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  // 1. Fix useLocation() -> usePathname()
  // Replace the call itself
  content = content.replace(/\bconst\s+location\s*=\s*useLocation\(\)\s*;?/g, 'const pathname = usePathname();');
  
  // Replace location.pathname with pathname
  content = content.replace(/\blocation\.pathname\b/g, 'pathname');
  
  // Replace location.search with searchParams (less common)
  content = content.replace(/\blocation\.search\b/g, '(typeof window !== "undefined" ? window.location.search : "")');
  
  // Replace location.state (not available in Next.js, use empty)
  content = content.replace(/\blocation\.state\b/g, 'null');
  
  // Replace location.hash
  content = content.replace(/\blocation\.hash\b/g, '(typeof window !== "undefined" ? window.location.hash : "")');

  // 2. Fix navigate -> router naming inconsistency
  // The migration script renamed useNavigate() to useRouter() but kept navigate( as router.push(
  // Some files may have: const navigate = useRouter() -> should be const router = useRouter()
  content = content.replace(/\bconst\s+navigate\s*=\s*useRouter\(\)\s*;?/g, 'const router = useRouter();');
  
  // Fix navigate( that wasn't converted (raw calls without router.)
  content = content.replace(/\bnavigate\(([^)]+)\)/g, (match, args) => {
    // Don't replace if it's already router.push
    if (match.includes('router.push')) return match;
    return `router.push(${args})`;
  });

  // 3. Fix router.push with { replace: true } -> router.replace
  content = content.replace(/router\.push\(([^,]+),\s*\{\s*replace:\s*true\s*\}\)/g, 'router.replace($1)');
  
  // 4. Fix <Navigate to="..." replace /> -> redirect or router.push
  // Replace <Navigate to="..." replace /> with a redirect effect  
  content = content.replace(/<Navigate\s+to=["']([^"']+)["']\s*(replace)?\s*\/>/g, (match, to) => {
    return `<>{(() => { if (typeof window !== "undefined") window.location.href = "${to}"; return null; })()}</>`;
  });
  
  // 5. Fix <Outlet /> -> {children} — but only if the component accepts children
  // This is tricky; for layout components using Outlet, they should accept children
  if (content.includes('<Outlet')) {
    content = content.replace(/<Outlet\s*\/>/g, '{children}');
  }

  // 6. Add usePathname import if it's used but not imported
  if (content.includes('usePathname') && !content.includes("from 'next/navigation'") && !content.includes('from "next/navigation"')) {
    // Add import
    const firstImportMatch = content.match(/^import\s/m);
    if (firstImportMatch) {
      content = content.replace(/^(import\s)/m, 'import { usePathname } from "next/navigation";\n$1');
    }
  } else if (content.includes('usePathname') && (content.includes("from 'next/navigation'") || content.includes('from "next/navigation"'))) {
    // Check if usePathname is in the import
    if (!content.match(/import\s*{[^}]*usePathname[^}]*}\s*from\s*['"]next\/navigation['"]/)) {
      content = content.replace(
        /import\s*{\s*([^}]*)\s*}\s*from\s*['"]next\/navigation['"]/,
        (match, imports) => `import { ${imports.trim()}, usePathname } from "next/navigation"`
      );
    }
  }

  // 7. Add useRouter import if router is used but useRouter isn't imported
  if (content.includes('useRouter()') && !content.includes("from 'next/navigation'") && !content.includes('from "next/navigation"')) {
    const firstImportMatch = content.match(/^import\s/m);
    if (firstImportMatch) {
      content = content.replace(/^(import\s)/m, 'import { useRouter } from "next/navigation";\n$1');
    }
  }

  // 8. Ensure "use client" is at the top if it uses hooks
  if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) {
    const needsClient = content.includes('useState') || content.includes('useEffect') ||
      content.includes('useRouter') || content.includes('usePathname') ||
      content.includes('useParams') || content.includes('useRef') ||
      content.includes('onClick') || content.includes('onChange') ||
      content.includes('window.') || content.includes('document.') ||
      content.includes('localStorage');
    if (needsClient && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
      content = '"use client";\n\n' + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    fixedCount++;
    console.log(`Fixed: ${path.relative(frontendSrcDir, filePath)}`);
  }
}

console.log('--- Running bulk fix script ---');
walkDir(frontendSrcDir, fixFile);
console.log(`\n--- Done! Fixed ${fixedCount} files ---`);
