import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug, AlertTriangle, Lightbulb, HelpCircle, X, Send, Upload, CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ── Types ─────────────────────────────────────────────────────────────────────

type BugType = 'bug' | 'suggestion' | 'question' | 'critical';

interface BugTypeOption {
  id: BugType;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const BUG_TYPES: BugTypeOption[] = [
  {
    id: 'bug',
    label: 'Bug Report',
    description: 'Something is broken or not working correctly',
    icon: Bug,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10 border-orange-500/30',
  },
  {
    id: 'critical',
    label: 'Critical Issue',
    description: 'Data loss, security concern, or app crash',
    icon: AlertTriangle,
    color: 'text-destructive',
    bg: 'bg-destructive/10 border-destructive/30',
  },
  {
    id: 'suggestion',
    label: 'Suggestion',
    description: 'Idea or improvement for PEC APP',
    icon: Lightbulb,
    color: 'text-primary',
    bg: 'bg-primary/10 border-primary/30',
  },
  {
    id: 'question',
    label: 'Question',
    description: 'Need help or have a general query',
    icon: HelpCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10 border-blue-500/30',
  },
];

const PAGES = [
  'Dashboard', 'Profile', 'Attendance', 'Timetable', 'Courses', 'Assignments',
  'Examinations', 'Course Materials', 'Chat', 'Hostel Issues', 'Night Canteen',
  'Campus Map', 'Career Portal', 'Resume Builder', 'Finance', 'Settings', 'Other',
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-green-500', dot: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500', dot: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'text-orange-500', dot: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-destructive', dot: 'bg-destructive' },
];

// ── Main Component ────────────────────────────────────────────────────────────

interface BugReportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function BugReportDialog({ open, onClose }: BugReportDialogProps) {
  const [step, setStep] = useState<'type' | 'details' | 'success'>('type');
  const [bugType, setBugType] = useState<BugType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep('type');
    setBugType(null);
    setTitle('');
    setDescription('');
    setPage('');
    setPriority('medium');
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    // Simulate an async submit (replace with real API call later)
    await new Promise(r => setTimeout(r, 1400));
    setSubmitting(false);
    setStep('success');
  };

  const selectedType = BUG_TYPES.find(t => t.id === bugType);

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0 border-border/70">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bug className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Tell PEC APP</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Help us improve — report bugs, suggest features, or ask a question.
              </p>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* ─── Step 1: Choose Type ─── */}
          {step === 'type' && (
            <motion.div
              key="type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-3"
            >
              <p className="text-sm font-medium text-foreground mb-4">What would you like to report?</p>
              <div className="grid grid-cols-1 gap-2.5">
                {BUG_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => { setBugType(type.id); setStep('details'); }}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                      bugType === type.id ? type.bg + ' border-current' : 'border-border/60 hover:border-border bg-muted/20 hover:bg-muted/40'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${type.bg}`}>
                      <type.icon className={`w-4.5 h-4.5 ${type.color}`} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${type.color}`}>{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: Details ─── */}
          {step === 'details' && selectedType && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 space-y-4"
            >
              {/* Category badge */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep('type')}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Change type
                </button>
                <Badge className={`text-[10px] px-2 py-0.5 border ${selectedType.bg} ${selectedType.color} font-semibold`}>
                  <selectedType.icon className="w-3 h-3 mr-1" />
                  {selectedType.label}
                </Badge>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  placeholder="Short, descriptive title…"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={120}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                  placeholder={
                    bugType === 'bug' || bugType === 'critical'
                      ? 'Describe what happened, what you expected, and steps to reproduce…'
                      : 'Provide as much detail as possible…'
                  }
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              {/* Page & Priority row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Page / Area</label>
                  <select
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    value={page}
                    onChange={e => setPage(e.target.value)}
                  >
                    <option value="">Select page…</option>
                    {PAGES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Priority</label>
                  <select
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                  >
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Screenshot note */}
              <button
                type="button"
                className="w-full flex items-center gap-2 p-3 rounded-xl border border-dashed border-border/70 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                onClick={() => toast.info('Screenshot upload coming soon!')}
              >
                <Upload className="w-3.5 h-3.5" />
                Attach a screenshot (optional) — coming soon
              </button>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setStep('type')}>
                  Back
                </Button>
                <Button size="sm" className="flex-1" onClick={handleSubmit} disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Submitting…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" />
                      Submit Report
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── Step 3: Success ─── */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="p-8 flex flex-col items-center text-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Report Submitted!</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Thanks for helping us improve PEC APP. Our team will look into this shortly.
                </p>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={reset}>
                  Submit Another
                </Button>
                <Button size="sm" className="flex-1" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
