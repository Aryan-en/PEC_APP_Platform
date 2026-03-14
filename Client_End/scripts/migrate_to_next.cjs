const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

// 1. Merge package.json dependencies
console.log('--- Merging package.json dependencies ---');
const rootPackageJsonPath = path.join(rootDir, 'package.json');
const frontendPackageJsonPath = path.join(frontendDir, 'package.json');

const rootPkg = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf-8'));
const frontendPkg = JSON.parse(fs.readFileSync(frontendPackageJsonPath, 'utf-8'));

const excludeDeps = [
  'react', 'react-dom', 'vite', '@vitejs/plugin-react-swc',
  'autoprefixer', 'postcss', 'tailwindcss', 'eslint'
];

let mergedDepsCount = 0;
for (const [dep, version] of Object.entries(rootPkg.dependencies || {})) {
  if (!excludeDeps.includes(dep) && !frontendPkg.dependencies[dep]) {
    frontendPkg.dependencies[dep] = version;
    mergedDepsCount++;
  }
}
// Add @radix-ui dependencies if missed, user uses radix
for (const [dep, version] of Object.entries(rootPkg.devDependencies || {})) {
  if (!excludeDeps.includes(dep) && !frontendPkg.devDependencies[dep] &&
      (dep.includes('types') || dep === 'lucide-react')) {
    frontendPkg.devDependencies[dep] = version;
  }
}

// Add useful nextjs packages that might be missing
frontendPkg.dependencies['next-themes'] = '^0.3.0';

fs.writeFileSync(frontendPackageJsonPath, JSON.stringify(frontendPkg, null, 2));
console.log(`Merged ${mergedDepsCount} dependencies.`);

// 2. Process Files Recursively
console.log('--- Migrating Source Files ---');
const srcDir = path.join(rootDir, 'src');
const frontendSrcDir = path.join(frontendDir, 'src');
const frontendAppDir = path.join(frontendDir, 'app');

if (!fs.existsSync(frontendSrcDir)) {
  fs.mkdirSync(frontendSrcDir, { recursive: true });
}

function processDirectory(source, destination, isPageDir = false) { if (!fs.existsSync(destination)) fs.mkdirSync(destination, { recursive: true });
  if (!fs.existsSync(source)) return;
  const items = fs.readdirSync(source);

  for (const item of items) {
    if (item === 'App.tsx' || item === 'main.tsx' || item === 'vite-env.d.ts') continue;
    
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);

    const stat = fs.statSync(sourcePath);
    if (stat.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      processDirectory(sourcePath, destPath, isPageDir);
    } else if (stat.isFile()) {
      processFile(sourcePath, destPath, isPageDir, item);
    }
  }
}

function processFile(sourcePath, destPath, isPageDir, filename) {
  let content = fs.readFileSync(sourcePath, 'utf-8');

  // React Router to Next.js Router modifications
  const hasReactRouter = content.includes('react-router-dom');
  if (hasReactRouter) {
    content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]react-router-dom['"];?/g, (match, imports) => {
      let nextImports = [];
      let nextNavImports = [];
      
      const parts = imports.split(',').map(s => s.trim());
      
      if (parts.includes('Link')) nextImports.push('Link from "next/link"');
      if (parts.includes('useNavigate')) nextNavImports.push('useRouter');
      if (parts.includes('useLocation')) nextNavImports.push('usePathname', 'useSearchParams');
      if (parts.includes('useParams')) nextNavImports.push('useParams');
      
      let replacements = [];
      if (parts.includes('Link')) {
        replacements.push(`import Link from "next/link";`);
      }
      if (nextNavImports.length > 0) {
        replacements.push(`import { ${nextNavImports.join(', ')} } from "next/navigation";`);
      }
      
      return replacements.join('\n');
    });

    // Replace hooks usage
    content = content.replace(/useNavigate\(\)/g, "useRouter()");
    content = content.replace(/navigate\(/g, "router.push(");
  }

  // Next.js Image component (basic string replace, might need manual tweaks for intrinsic sizing)
  // Disable it for now to prevent breaking changes on <img>
  // content = content.replace(/<img/g, "<img"); 

  // Environment variables
  content = content.replace(/import\.meta\.env\.VITE_/g, "process.env.NEXT_PUBLIC_");

  // Add "use client" for components using hooks or browser APIs
  const isComponentOrHook = filename.endsWith('.tsx') || filename.endsWith('.ts');
  const usesHooks = content.includes('useState(') || content.includes('useEffect(') || content.includes('useRef(') || content.includes('useMemo(') || content.includes('useCallback(') || content.includes('useRouter(') || content.includes('useForm(');
  const usesBrowserAPI = content.includes('window.') || content.includes('document.') || content.includes('localStorage');
  
  // Pretty much all Vite SPA components are client components
  if (isComponentOrHook && !content.includes('"use client"') && !content.includes("'use client'") && (usesHooks || usesBrowserAPI || filename.endsWith('.tsx'))) {
    content = `"use client";\n\n` + content;
  }

  // Ensure imports resolving to src/ work (e.g. @/components) if tsconfig paths are set.
  // Next.js uses @/ by default if configured, but our src folder is frontend/src
  // Next.js app router uses @/... for both src and app usually depending on tsconfig.
  
  fs.writeFileSync(destPath, content);
}

// Copy components, lib, etc.
const foldersToCopy = ['components', 'lib', 'hooks', 'context', 'utils', 'styles', 'types', 'data'];
for (const folder of foldersToCopy) {
  processDirectory(path.join(srcDir, folder), path.join(frontendSrcDir, folder));
}

// 3. Generate Next.js App Router Structure
console.log('--- Generating App Router Pages ---');
const pagesDir = path.join(srcDir, 'pages');

// Map of route path to component path
const routeMappings = [
  { p: '/', c: 'LandingPage.tsx' },
  { p: '/pricing', c: 'Pricing.tsx' },
  { p: '/blog', c: 'Blog.tsx' },
  { p: '/careers', c: 'Careers.tsx' },
  { p: '/contact', c: 'Contact.tsx' },
  { p: '/privacy', c: 'Privacy.tsx' },
  { p: '/terms', c: 'Terms.tsx' },
  { p: '/gdpr', c: 'GDPR.tsx' },
  { p: '/cookies', c: 'Cookies.tsx' },
  { p: '/auth', c: 'AuthEnhanced.tsx' },
  { p: '/role-selection', c: 'RoleSelection.tsx' },
  { p: '/onboarding', c: 'Onboarding.tsx' },
  { p: '/apply-institution', c: 'ApplyInstitution.tsx' },
  { p: '/demo-dashboard', c: 'DemoDashboard.tsx' },
  { p: '/student/[id]', c: 'PublicStudentProfile.tsx' },
  { p: '/[orgSlug]/dashboard', c: 'Dashboard.tsx' },
  { p: '/[orgSlug]/chat', c: 'Chat.tsx' },
  { p: '/[orgSlug]/profile', c: 'StudentProfile.tsx' },
  { p: '/[orgSlug]/users', c: 'Users.tsx' },
  { p: '/[orgSlug]/users/add', c: 'college/AddUser.tsx' },
  { p: '/[orgSlug]/users/[userId]', c: 'UserDetail.tsx' },
  { p: '/[orgSlug]/courses', c: 'Courses.tsx' },
  { p: '/[orgSlug]/courses/add', c: 'college/AddCourse.tsx' },
  { p: '/[orgSlug]/courses/[id]', c: 'CourseDetail.tsx' },
  { p: '/[orgSlug]/timetable', c: 'Timetable.tsx' },
  { p: '/[orgSlug]/attendance', c: 'Attendance.tsx' },
  { p: '/[orgSlug]/examinations', c: 'Examinations.tsx' },
  { p: '/[orgSlug]/assignments', c: 'Assignments.tsx' },
  { p: '/[orgSlug]/course-materials', c: 'CourseMaterials.tsx' },
  { p: '/[orgSlug]/finance', c: 'Finance.tsx' },
  { p: '/[orgSlug]/finance/[id]', c: 'PaymentDetail.tsx' },
  { p: '/[orgSlug]/placements/jobs', c: 'placement/Jobs.tsx' },
  { p: '/[orgSlug]/placements/drives', c: 'placement/PlacementDrives.tsx' },
  { p: '/[orgSlug]/placements/applications', c: 'placement/PlacementApplications.tsx' },
  { p: '/[orgSlug]/placements/recruiters', c: 'placement/Recruiters.tsx' },
  { p: '/[orgSlug]/my-applications', c: 'MyApplications.tsx' },
  { p: '/[orgSlug]/resume-builder', c: 'ResumeBuilderIvyLeague.tsx' },
  { p: '/[orgSlug]/career', c: 'placement/CareerPortal.tsx' },
  { p: '/[orgSlug]/placements/profile', c: 'placement/PlacementProfile.tsx' },
  { p: '/[orgSlug]/placements/my-dashboard', c: 'placement/MyPlacementDashboard.tsx' },
  { p: '/[orgSlug]/placements/interviews', c: 'placement/InterviewSchedule.tsx' },
  { p: '/[orgSlug]/placements/student-readiness', c: 'placement/StudentReadiness.tsx' },
  { p: '/[orgSlug]/placements/reports', c: 'placement/PlacementReports.tsx' },
  { p: '/[orgSlug]/placements/candidates', c: 'placement/CandidateDiscovery.tsx' },
  { p: '/[orgSlug]/placements/offers', c: 'placement/OfferManagement.tsx' },
  { p: '/[orgSlug]/admin/placement-settings', c: 'admin/PlacementSettings.tsx' },
  { p: '/[orgSlug]/admin/placement-insights', c: 'admin/PlacementInsights.tsx' },
  { p: '/[orgSlug]/settings', c: 'Settings.tsx' },
  { p: '/[orgSlug]/notifications', c: 'Notifications.tsx' },
  { p: '/[orgSlug]/notifications/[id]', c: 'NotificationDetail.tsx' },
  { p: '/[orgSlug]/search', c: 'Search.tsx' },
  { p: '/[orgSlug]/help', c: 'Help.tsx' },
  { p: '/[orgSlug]/help/getting-started', c: 'help/GettingStarted.tsx' },
  { p: '/[orgSlug]/help/account-profile', c: 'help/AccountProfile.tsx' },
  { p: '/[orgSlug]/help/academics', c: 'help/Academics.tsx' },
  { p: '/[orgSlug]/help/settings-privacy', c: 'help/SettingsPrivacy.tsx' },
  { p: '/[orgSlug]/hostel-issues', c: 'HostelIssues.tsx' },
  { p: '/[orgSlug]/canteen', c: 'NightCanteen.tsx' },
  { p: '/[orgSlug]/campus-map', c: 'CampusMap.tsx' },
  { p: '/[orgSlug]/admin/canteen', c: 'admin/CanteenManager.tsx' },
  { p: '/[orgSlug]/admin/hostel', c: 'admin/HostelAdmin.tsx' },
  { p: '/[orgSlug]/departments', c: 'college/Departments.tsx' },
  { p: '/[orgSlug]/departments/[id]', c: 'college/DepartmentDetail.tsx' },
  { p: '/[orgSlug]/college/financial-report', c: 'college/FinancialReport.tsx' },
  { p: '/[orgSlug]/college/admissions', c: 'college/Admissions.tsx' },
  { p: '/[orgSlug]/faculty', c: 'college/Faculty.tsx' },
  { p: '/[orgSlug]/faculty/add', c: 'college/AddFaculty.tsx' },
  { p: '/[orgSlug]/faculty/[id]', c: 'college/FacultyDetail.tsx' },
  { p: '/[orgSlug]/college/add-user', c: 'college/AddUser.tsx' },
  { p: '/[orgSlug]/college/reports', c: 'college/Reports.tsx' },
  { p: '/[orgSlug]/college/add-course', c: 'college/AddCourse.tsx' },
  { p: '/[orgSlug]/college/schedule', c: 'college/Schedule.tsx' },
  { p: '/[orgSlug]/college/fee-setup', c: 'college/FeeSetup.tsx' },
  { p: '/[orgSlug]/admin/payment-settings', c: 'admin/PaymentSettings.tsx' },
  { p: '/[orgSlug]/admin/college-settings', c: 'admin/CollegeSettings.tsx' },
  { p: '/organizations', c: 'Organizations.tsx' }
];

// Ensure we move the page files into frontend/src/pages to import them in app/ pages
const frontendSrcPagesDir = path.join(frontendSrcDir, 'pages');
if (!fs.existsSync(frontendSrcPagesDir)) {
  fs.mkdirSync(frontendSrcPagesDir, { recursive: true });
}
processDirectory(pagesDir, frontendSrcPagesDir, true);

// Create App Router files
routeMappings.forEach(mapping => {
  let appRoutePath = mapping.p;
  // Convert /student/:id to /student/[id]
  appRoutePath = appRoutePath.replace(/:([^\/]+)/g, '[$1]');
  
  const pageFileDir = path.join(frontendAppDir, appRoutePath);
  if (!fs.existsSync(pageFileDir)) {
    fs.mkdirSync(pageFileDir, { recursive: true });
  }

  // The relative path from the page file to the component file
  // Using absolute imports (Next.js @/ default) is safer if configured natively, 
  // but let's assume we can just import from @/pages/... if we set up tsconfig properly.
  // Actually Next.js creates @/* as src/* in src/ directory, or app directory if we didn't have src.
  // Wait, frontend has an app/ dir and we are creating src/ dir.
  
  const compName = mapping.c.split('/').pop().replace('.tsx', '');
  
  const pageContent = `"use client";
import PageComponent from '@/pages/${mapping.c.replace('.tsx', '')}';

export default function Page(props: any) {
  return <PageComponent {...props} />;
}
`;

  fs.writeFileSync(path.join(pageFileDir, 'page.tsx'), pageContent);
});

console.log('--- Migration Script Complete ---');
