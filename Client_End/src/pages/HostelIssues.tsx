import { db, auth } from "@/config/firebase";
import { collection, doc, addDoc, updateDoc, query, where, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Plus, Clock, CheckCircle2, AlertCircle, MessageSquare,
  Send, Wrench, Zap, Droplets, Wifi, ThermometerSun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface HostelIssue {
  id: string;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'internet' | 'maintenance' | 'hvac';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  roomNumber: string;
  studentId: string;
  studentName: string;
  createdAt: any;
  updatedAt: any;
  responses: { from: string; message: string; timestamp: any }[];
}

const categoryIcons: Record<string, any> = {
  electrical: Zap,
  plumbing: Droplets,
  internet: Wifi,
  maintenance: Wrench,
  hvac: ThermometerSun,
};

const categoryLabels: Record<string, string> = {
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  internet: 'Internet / WiFi',
  maintenance: 'General Maintenance',
  hvac: 'AC / Heating',
};

// ── Demo Data ────────────────────────────────────────────────────────────────

const ts = (iso: string) => {
  const d = new Date(iso);
  return { seconds: Math.floor(d.getTime() / 1000), toDate: () => d };
};

const DEMO_ISSUES: HostelIssue[] = [
  {
    id: 'hi-1', title: 'Ceiling fan not working', description: 'The ceiling fan in my room has stopped rotating. The regulator switch also seems loose. Tried switching off and on from the MCB — no luck.',
    category: 'electrical', priority: 'high', status: 'in_progress', roomNumber: 'A-204',
    studentId: 'demo-user-001', studentName: 'Aryan Singh',
    createdAt: ts('2026-03-12T10:30:00'), updatedAt: ts('2026-03-13T14:00:00'),
    responses: [
      { from: 'Hostel Warden', message: 'We have assigned an electrician. He will visit by 5 PM today.', timestamp: ts('2026-03-12T15:00:00') },
      { from: 'Aryan Singh', message: 'Thanks! Will be in the room after 4 PM.', timestamp: ts('2026-03-12T15:10:00') },
      { from: 'Electrician (Rajesh)', message: 'Motor capacitor was faulty. Ordered a replacement, will fix tomorrow.', timestamp: ts('2026-03-13T14:00:00') },
    ],
  },
  {
    id: 'hi-2', title: 'Water leaking from bathroom tap', description: 'The hot water tap in the bathroom keeps dripping even when fully closed. Wasting a lot of water overnight.',
    category: 'plumbing', priority: 'medium', status: 'open', roomNumber: 'A-204',
    studentId: 'demo-user-001', studentName: 'Aryan Singh',
    createdAt: ts('2026-03-13T08:00:00'), updatedAt: ts('2026-03-13T08:00:00'),
    responses: [],
  },
  {
    id: 'hi-3', title: 'WiFi not reaching third floor', description: 'WiFi signal is extremely weak in the third floor east wing (rooms A-301 to A-310). Speed drops below 1 Mbps.',
    category: 'internet', priority: 'high', status: 'in_progress', roomNumber: 'A-305',
    studentId: 'stu-002', studentName: 'Rahul Kapoor',
    createdAt: ts('2026-03-10T09:00:00'), updatedAt: ts('2026-03-12T11:00:00'),
    responses: [
      { from: 'IT Admin', message: 'We are installing an additional access point on the third floor. ETA: 2 days.', timestamp: ts('2026-03-11T10:00:00') },
      { from: 'IT Admin', message: 'Access point installed. Please check and confirm if signal is better now.', timestamp: ts('2026-03-12T11:00:00') },
    ],
  },
  {
    id: 'hi-4', title: 'Broken window latch', description: "The latch on the window is broken and the window does not close properly. It's a safety concern during rain and at night.",
    category: 'maintenance', priority: 'medium', status: 'resolved', roomNumber: 'B-112',
    studentId: 'stu-003', studentName: 'Sneha Joshi',
    createdAt: ts('2026-03-08T16:00:00'), updatedAt: ts('2026-03-10T09:30:00'),
    responses: [
      { from: 'Maintenance Team', message: 'Latch has been replaced. Please verify.', timestamp: ts('2026-03-10T09:30:00') },
      { from: 'Sneha Joshi', message: 'Confirmed, working fine now. Thank you!', timestamp: ts('2026-03-10T10:00:00') },
    ],
  },
  {
    id: 'hi-5', title: 'AC making grinding noise', description: "The split AC unit in room C-401 has been making a loud grinding noise whenever the compressor kicks in. It's disturbing sleep.",
    category: 'hvac', priority: 'urgent', status: 'open', roomNumber: 'C-401',
    studentId: 'stu-004', studentName: 'Vikram Malhotra',
    createdAt: ts('2026-03-14T06:00:00'), updatedAt: ts('2026-03-14T06:00:00'),
    responses: [],
  },
  {
    id: 'hi-6', title: 'Bathroom geyser not heating', description: 'The geyser in the common bathroom on the second floor is not heating water at all. Multiple students are affected.',
    category: 'electrical', priority: 'high', status: 'open', roomNumber: 'D-200 (Common)',
    studentId: 'stu-005', studentName: 'Priya Gupta',
    createdAt: ts('2026-03-13T19:00:00'), updatedAt: ts('2026-03-13T19:00:00'),
    responses: [],
  },
  {
    id: 'hi-7', title: 'Clogged drain in corridor', description: "The floor drain near room B-105 is clogged and water accumulates in the corridor after mopping. It's slippery and dangerous.",
    category: 'plumbing', priority: 'medium', status: 'resolved', roomNumber: 'B-105 (Corridor)',
    studentId: 'stu-006', studentName: 'Ankit Mehta',
    createdAt: ts('2026-03-06T14:00:00'), updatedAt: ts('2026-03-07T12:00:00'),
    responses: [
      { from: 'Maintenance Team', message: 'Drain has been cleared and cleaned.', timestamp: ts('2026-03-07T12:00:00') },
    ],
  },
  {
    id: 'hi-8', title: 'Switchboard sparking', description: 'The main switchboard near the door is sparking when turning on the lights. Very dangerous — needs immediate attention.',
    category: 'electrical', priority: 'urgent', status: 'in_progress', roomNumber: 'A-108',
    studentId: 'stu-007', studentName: 'Deepak Kumar',
    createdAt: ts('2026-03-13T22:00:00'), updatedAt: ts('2026-03-14T08:00:00'),
    responses: [
      { from: 'Hostel Warden', message: 'DO NOT USE that switchboard. Electrician dispatched on URGENT basis.', timestamp: ts('2026-03-13T22:30:00') },
      { from: 'Electrician (Suresh)', message: 'Loose wiring found. Rewired the board. Will do a final safety check in the morning.', timestamp: ts('2026-03-14T08:00:00') },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'open': return { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Open' };
    case 'in_progress': return { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'In Progress' };
    case 'resolved': return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Resolved' };
    case 'closed': return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Closed' };
    default: return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'urgent': return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Urgent' };
    case 'high': return { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'High' };
    case 'medium': return { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Medium' };
    default: return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Low' };
  }
};

// ── Component ────────────────────────────────────────────────────────────────

export default function HostelIssues() {
  const { orgSlug } = useParams<{ orgSlug?: string }>();
  const [issues, setIssues] = useState<HostelIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [newIssue, setNewIssue] = useState({ title: '', description: '', category: '', priority: 'medium', roomNumber: '' });
  const [selectedIssue, setSelectedIssue] = useState<HostelIssue | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // ── Demo mode ──
    if (orgSlug === 'demo') {
      setIssues(DEMO_ISSUES);
      setSelectedIssue(DEMO_ISSUES[0]);
      setLoading(false);
      return;
    }

    // ── Real Firebase (non-demo) ──
    setLoading(false);
  }, [orgSlug]);

  const handleSubmitIssue = () => {
    if (!newIssue.title || !newIssue.description || !newIssue.category || !newIssue.roomNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    const user = auth.currentUser;
    const issue: HostelIssue = {
      id: `hi-new-${Date.now()}`,
      title: newIssue.title,
      description: newIssue.description,
      category: newIssue.category as HostelIssue['category'],
      priority: newIssue.priority as HostelIssue['priority'],
      status: 'open',
      roomNumber: newIssue.roomNumber,
      studentId: user?.uid || 'demo-user-001',
      studentName: user?.displayName || 'Aryan Singh',
      createdAt: ts(new Date().toISOString()),
      updatedAt: ts(new Date().toISOString()),
      responses: [],
    };

    setIssues(prev => [issue, ...prev]);
    setNewIssue({ title: '', description: '', category: '', priority: 'medium', roomNumber: '' });
    setDialogOpen(false);
    toast.success('Issue submitted successfully!');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedIssue) return;

    const updatedIssue: HostelIssue = {
      ...selectedIssue,
      responses: [
        ...selectedIssue.responses,
        { from: 'You', message: newMessage, timestamp: ts(new Date().toISOString()) },
      ],
      updatedAt: ts(new Date().toISOString()),
    };

    setIssues(prev => prev.map(i => i.id === selectedIssue.id ? updatedIssue : i));
    setSelectedIssue(updatedIssue);
    setNewMessage('');
    toast.success('Message sent');
  };

  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'all') return true;
    return issue.status === activeTab;
  });

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hostel Issue Inbox</h1>
          <p className="text-muted-foreground">Report and track maintenance issues in your hostel</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Report Issue</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Report New Issue</DialogTitle>
              <DialogDescription>Describe the issue you're facing in your hostel room</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground">Issue Title *</label>
                <Input placeholder="Brief description of the issue" value={newIssue.title}
                  onChange={e => setNewIssue(prev => ({ ...prev, title: e.target.value }))} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Room Number *</label>
                  <Input placeholder="e.g. A-204" value={newIssue.roomNumber}
                    onChange={e => setNewIssue(prev => ({ ...prev, roomNumber: e.target.value }))} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category *</label>
                  <Select value={newIssue.category} onValueChange={v => setNewIssue(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="internet">Internet/WiFi</SelectItem>
                      <SelectItem value="hvac">AC/Heating</SelectItem>
                      <SelectItem value="maintenance">General Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Priority</label>
                <Select value={newIssue.priority} onValueChange={v => setNewIssue(prev => ({ ...prev, priority: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description *</label>
                <Textarea placeholder="Provide details about the issue..." value={newIssue.description}
                  onChange={e => setNewIssue(prev => ({ ...prev, description: e.target.value }))} className="mt-1" rows={4} />
              </div>
              <Button className="w-full" onClick={handleSubmitIssue}>Submit Issue</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Home className="w-5 h-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Total Issues</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10"><AlertCircle className="w-5 h-5 text-orange-500" /></div>
            <div><p className="text-sm text-muted-foreground">Open</p><p className="text-2xl font-bold text-foreground">{stats.open}</p></div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10"><Clock className="w-5 h-5 text-blue-500" /></div>
            <div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-foreground">{stats.inProgress}</p></div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
            <div><p className="text-sm text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-foreground">{stats.resolved}</p></div>
          </div>
        </div>
      </div>

      {/* Issues list + detail panel */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left panel — list */}
        <div className="lg:col-span-2">
          <div className="card-elevated">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="p-4 border-b border-border">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="open" className="flex-1">Open</TabsTrigger>
                  <TabsTrigger value="in_progress" className="flex-1">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved" className="flex-1">Resolved</TabsTrigger>
                </TabsList>
              </div>
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No issues found</p>
                  </div>
                ) : (
                  filteredIssues.map(issue => {
                    const sc = getStatusConfig(issue.status);
                    const pc = getPriorityConfig(issue.priority);
                    const CatIcon = categoryIcons[issue.category] || Wrench;

                    return (
                      <div key={issue.id}
                        className={cn('p-4 hover:bg-muted/30 transition-colors cursor-pointer', selectedIssue?.id === issue.id && 'bg-muted/50')}
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('p-2 rounded-lg', pc.bg)}>
                            <CatIcon className={cn('w-4 h-4', pc.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground truncate">{issue.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{issue.description}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge className={cn(sc.bg, sc.color, 'border-0 text-xs')}>{sc.label}</Badge>
                              <Badge variant="outline" className="text-xs">{issue.roomNumber}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {issue.createdAt?.toDate?.().toLocaleDateString() || 'Just now'}
                              </span>
                            </div>
                          </div>
                          {issue.responses.length > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground shrink-0">
                              <MessageSquare className="w-4 h-4" /><span className="text-xs">{issue.responses.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Tabs>
          </div>
        </div>

        {/* Right panel — detail */}
        <div className="lg:col-span-3">
          {selectedIssue ? (
            <div className="card-elevated h-full flex flex-col">
              {/* Issue header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-foreground">{selectedIssue.title}</h2>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                      <span>Room: <strong className="text-foreground">{selectedIssue.roomNumber}</strong></span>
                      <span>•</span>
                      <span>By: <strong className="text-foreground">{selectedIssue.studentName}</strong></span>
                      <span>•</span>
                      <span>{categoryLabels[selectedIssue.category] || 'General'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Badge className={cn(getPriorityConfig(selectedIssue.priority).bg, getPriorityConfig(selectedIssue.priority).color, 'border-0')}>
                      {getPriorityConfig(selectedIssue.priority).label}
                    </Badge>
                    <Badge className={cn(getStatusConfig(selectedIssue.status).bg, getStatusConfig(selectedIssue.status).color, 'border-0')}>
                      {getStatusConfig(selectedIssue.status).label}
                    </Badge>
                  </div>
                </div>
                <p className="mt-4 text-muted-foreground text-sm leading-relaxed">{selectedIssue.description}</p>
                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                  <span>Created: {selectedIssue.createdAt?.toDate?.().toLocaleString() || 'Just now'}</span>
                  <span>Updated: {selectedIssue.updatedAt?.toDate?.().toLocaleString() || 'Just now'}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[400px]">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Conversation ({selectedIssue.responses.length})
                </h3>
                {selectedIssue.responses.length > 0 ? (
                  <div className="space-y-3">
                    {selectedIssue.responses.map((r, i) => {
                      const isStudent = r.from === selectedIssue.studentName || r.from === 'You';
                      return (
                        <div key={i} className={cn('p-3 rounded-lg max-w-[85%]', isStudent ? 'ml-auto bg-primary/10' : 'bg-muted')}>
                          <div className="flex items-center justify-between mb-1 gap-3">
                            <span className="text-xs font-semibold text-foreground">{r.from}</span>
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                              {r.timestamp?.toDate?.().toLocaleString() || 'Just now'}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{r.message}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8 text-sm">No messages yet. The warden will respond soon.</p>
                )}
              </div>

              {/* Message input */}
              {selectedIssue.status !== 'closed' && (
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input placeholder="Type a message..." value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()} />
                    <Button onClick={handleSendMessage}><Send className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card-elevated h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Select an issue to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
