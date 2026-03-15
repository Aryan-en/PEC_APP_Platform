import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Droplets,
  Globe,
  Hash,
  Users,
  Building2,
  Edit2,
  Download,
  Share2,
  BadgeCheck,
  ClipboardList,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// ─── Static demo data ────────────────────────────────────────────────────────

const STUDENT = {
  fullName: 'Arjun Singh',
  initials: 'AS',
  rollNumber: '25106012',
  branch: 'B Tech : CSE (DS)',
  degree: 'B Tech',
  semester: '2',
  email: 'aryansingh.bt25cseds@pec.edu.in',
  PECEmail: 'aryansingh.bt25cseds@pec.edu.in',
};

const PERSONAL_DETAILS: { label: string; value: string; icon: any; editable?: boolean }[] = [
  { label: "Father's Name",      value: 'UDAY SINGH',               icon: Users },
  { label: 'Gender',             value: 'Male',                       icon: User },
  { label: 'Date of Birth',      value: '21-11-2005',                 icon: Calendar },
  { label: 'Blood Group',        value: 'B+',                         icon: Droplets },
  { label: 'Mother Tongue',      value: 'HINDI',                      icon: Globe },
  { label: 'PEC EDU Email',     value: 'aryansingh.bt25cseds@pec.edu.in', icon: Mail },
  { label: 'Nationality',        value: 'India',                      icon: Globe },
  { label: 'Aadhaar Number',     value: 'Update this detail',         icon: Hash,       editable: true },
  { label: 'Phone',              value: '8284024950',                  icon: Phone },
  { label: "Parents' Phone",     value: '8284055499',                  icon: Phone },
  { label: 'Permanent Address',  value: '1635A, SHAMBHU NAGAR, NEAR ARYAN BHART GAS AGENCY, SHIKOHABAD (UP)', icon: MapPin },
  { label: 'Pincode',            value: '140301',                      icon: Hash },
  { label: 'Country',            value: 'Update this detail',          icon: Globe,      editable: true },
];

const ACADEMIC_DETAILS: { label: string; value: string; icon: any }[] = [
  { label: 'SID',         value: '25106012',                   icon: Hash },
  { label: 'Branch',              value: 'B Tech : CSE (DS)', icon: Building2 },
  { label: 'Degree',              value: 'B Tech',                     icon: GraduationCap },
  { label: 'Category',            value: 'General',        icon: Info },
  { label: 'Date of Admission',   value: '13-08-2024',                  icon: Calendar },
];

// ─── Animation variants ───────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 22 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({
  icon: Icon,
  label,
  value,
  editable,
}: {
  icon: any;
  label: string;
  value: string;
  editable?: boolean;
}) {
  const isPending = value === 'Update this detail';
  return (
    <tr className="border-b border-border/60 last:border-0 group hover:bg-muted/30 transition-colors">
      <td className="py-3 pr-4 pl-2 w-[40%]">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Icon className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
          {label}
        </div>
      </td>
      <td className="py-3 pr-2">
        {isPending ? (
          <button
            className="inline-flex items-center gap-1.5 text-sm text-amber-500 hover:text-amber-400 transition-colors font-medium"
            onClick={() => toast.info(`Please update your ${label.toLowerCase()} in Settings.`)}
          >
            <Edit2 className="w-3 h-3" />
            Update this detail
          </button>
        ) : (
          <span className="text-sm text-foreground font-medium break-words leading-relaxed">
            {value}
          </span>
        )}
      </td>
    </tr>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={item}
      className="card-elevated overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60 bg-muted/20">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-4 pb-2">
        <table className="w-full border-collapse">{children}</table>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function StudentProfile() {
  const [activeTab, setActiveTab] = useState('details');

  const primaryEmail = STUDENT.email ?? STUDENT.PECEmail ?? '';
  const [emailLocal = '', emailDomain = ''] = primaryEmail.split('@');
  const displayEmail = emailDomain ? `${emailLocal}\n@${emailDomain}` : (primaryEmail || 'Not available');

  const pecEmail = STUDENT.PECEmail ?? '';
  const [pecEmailLocal = ''] = pecEmail.split('@');
  const displayPecEmail = pecEmailLocal ? `${pecEmailLocal.slice(0, 18)}…` : 'Not available';

  const copyEmail = () => {
    if (!pecEmail) {
      toast.error('PEC email is not available.');
      return;
    }
    navigator.clipboard.writeText(pecEmail);
    toast.success('PEC email copied!');
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* ── Profile Hero Card ── */}
      <motion.div
        variants={item}
        className="card-elevated p-0 overflow-hidden"
      >
        {/* Banner gradient */}
        <div className="h-28 bg-gradient-to-r from-primary via-primary/80 to-accent/70 relative">
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="px-6 pb-6 relative z-10">
          {/* Avatar — overlaps banner */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
            <div className="flex items-end gap-4">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-black shadow-lg ring-4 ring-background">
                  {STUDENT.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center ring-2 ring-background">
                  <BadgeCheck className="w-3.5 h-3.5 text-success-foreground" />
                </div>
              </div>

              <div className="mb-1">
                <h1 className="text-3xl font-extrabold text-foreground leading-tight drop-shadow-sm">
                  {STUDENT.fullName}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                  {STUDENT.branch}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {STUDENT.rollNumber}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Semester {STUDENT.semester}
                  </Badge>
                  <Badge className="text-xs bg-primary/15 text-primary hover:bg-primary/20 border-0">
                    {STUDENT.degree}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap sm:justify-end">
              <Button variant="outline" size="sm" onClick={copyEmail}>
                <Share2 className="w-3.5 h-3.5" />
                Share Profile
              </Button>
              <Button size="sm" onClick={() => toast.info('Resume download coming soon!')}>
                <Download className="w-3.5 h-3.5" />
                Download Resume
              </Button>
            </div>
          </div>

          {/* Quick Info Strip */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'SID',  value: STUDENT.rollNumber,         icon: Hash },
              { label: 'Email',        value: displayEmail, icon: Mail },
              { label: 'PEC Email',   value: displayPecEmail, icon: BookOpen },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="p-3 rounded-xl bg-muted/40 border border-border/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
                </div>
                <p className="text-xs font-semibold text-foreground leading-snug break-all">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border rounded-lg p-1 h-auto">
            <TabsTrigger value="details" className="rounded-md gap-1.5">
              <User className="w-3.5 h-3.5" />
              Personal Details
            </TabsTrigger>
            <TabsTrigger value="academics" className="rounded-md gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Academic Details
            </TabsTrigger>
          </TabsList>

          {/* ── Personal Details Tab ── */}
          <TabsContent value="details" className="mt-5">
            <motion.div variants={container} initial="hidden" animate="show">
              <SectionCard title="Personal Details" icon={User}>
                <tbody>
                  {PERSONAL_DETAILS.map((row) => (
                    <DetailRow
                      key={row.label}
                      icon={row.icon}
                      label={row.label}
                      value={row.value}
                      editable={row.editable}
                    />
                  ))}
                </tbody>
              </SectionCard>
            </motion.div>
          </TabsContent>

          {/* ── Academic Details Tab ── */}
          <TabsContent value="academics" className="mt-5">
            <motion.div variants={container} initial="hidden" animate="show">
              <SectionCard title="Academic Details" icon={GraduationCap}>
                <tbody>
                  {ACADEMIC_DETAILS.map((row) => (
                    <DetailRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
                  ))}
                </tbody>
              </SectionCard>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

export default StudentProfile;
