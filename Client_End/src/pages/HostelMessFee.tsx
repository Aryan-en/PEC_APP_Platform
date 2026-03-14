import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, Download, Building2, UtensilsCrossed, Clock, CheckCircle2,
  FileText, History, AlertCircle, TrendingUp, CreditCard, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// ── Types ────────────────────────────────────────────────────────────────────

interface FeeBreakdown {
  label: string;
  amount: number;
}

interface SemesterFee {
  id: string;
  semester: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  hostelBreakdown: FeeBreakdown[];
  messBreakdown: FeeBreakdown[];
}

interface Transaction {
  id: string;
  date: string;
  amount: number;
  method: string;
  type: string;
  status: 'success' | 'failed' | 'processing';
  receiptUrl?: string;
}

// ── Demo Data ────────────────────────────────────────────────────────────────

const CURRENT_FEE: SemesterFee = {
  id: 'sem_even_2026',
  semester: 'Even Semester (Jan - May 2026)',
  dueDate: '2026-04-15',
  totalAmount: 42500,
  paidAmount: 0,
  status: 'pending',
  hostelBreakdown: [
    { label: 'Room Rent (Double Occupancy)', amount: 15000 },
    { label: 'Electricity & Water Charges', amount: 3500 },
    { label: 'Hostel Maintenance', amount: 2000 },
  ],
  messBreakdown: [
    { label: 'Mess Advance (Basic)', amount: 18000 },
    { label: 'Establishment Charges', amount: 4000 },
  ],
};

const PAST_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-98234710',
    date: '2025-08-10',
    amount: 42500,
    method: 'UPI',
    type: 'Odd Semester Fee (Jul-Dec 2025)',
    status: 'success',
  },
  {
    id: 'TXN-87491204',
    date: '2025-01-15',
    amount: 41000,
    method: 'Net Banking',
    type: 'Even Semester Fee (Jan-May 2025)',
    status: 'success',
  },
  {
    id: 'TXN-76129844',
    date: '2024-07-20',
    amount: 41000,
    method: 'Credit Card',
    type: 'Odd Semester Fee (Jul-Dec 2024)',
    status: 'success',
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function HostelMessFee() {
  const [isPaying, setIsPaying] = useState(false);
  
  const totalHostel = CURRENT_FEE.hostelBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const totalMess = CURRENT_FEE.messBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const totalDue = CURRENT_FEE.totalAmount - CURRENT_FEE.paidAmount;

  const handlePayment = () => {
    setIsPaying(true);
    // Simulate payment gateway delay
    setTimeout(() => {
      setIsPaying(false);
      toast.success('Redirecting to payment gateway...', {
        description: `Amount: ₹${totalDue.toLocaleString()}`
      });
    }, 1500);
  };

  const handleDownloadReceipt = (id: string) => {
    toast.success('Downloading Receipt', {
      description: `Receipt for ${id} has been downloaded.`
    });
  };

  const statusConfig = {
    pending: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: AlertCircle },
    partial: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Clock },
    paid: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle2 },
    overdue: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle },
  };

  const StatusIcon = statusConfig[CURRENT_FEE.status].icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hostel & Mess Fee</h1>
        <p className="text-muted-foreground">Manage and pay your accommodation and dining charges</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left Column: Outstanding Dues & Action ── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-elevated relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  Outstanding Dues
                </h2>
                <Badge className={`${statusConfig[CURRENT_FEE.status].bg} ${statusConfig[CURRENT_FEE.status].color} border-0`}>
                  {CURRENT_FEE.status.toUpperCase()}
                </Badge>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">{CURRENT_FEE.semester}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground tracking-tight">
                    ₹{totalDue.toLocaleString()}
                  </span>
                </div>
                {CURRENT_FEE.status !== 'paid' && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Due by {new Date(CURRENT_FEE.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={isPaying || totalDue === 0}
                className="w-full h-12 text-base font-medium shadow-md transition-all active:scale-[0.98]"
              >
                {isPaying ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : totalDue === 0 ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Nothing to Pay
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Pay Now
                  </span>
                )}
              </Button>
            </div>
            
            <div className="bg-muted/30 px-6 py-4 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Total Fee: ₹{CURRENT_FEE.totalAmount.toLocaleString()}</span>
              {CURRENT_FEE.paidAmount > 0 && (
                <span className="text-success font-medium">Paid: ₹{CURRENT_FEE.paidAmount.toLocaleString()}</span>
              )}
            </div>
          </div>

          {/* Quick Stats or Info */}
          <div className="card-elevated p-5 space-y-4">
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Quick Info
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Late fee of ₹100 per day is applicable after the due date.
              </li>
              <li className="flex gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Payments might take up to 24 hours to reflect in the portal.
              </li>
              <li className="flex gap-3 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                For fee related queries, contact the accounts section at block A.
              </li>
            </ul>
          </div>
        </div>

        {/* ── Right Column: Breakdowns & History ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Fee Breakdown */}
          <div className="card-elevated">
            <div className="p-5 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Fee Breakdown
              </h2>
            </div>
            
            <div className="p-5 grid gap-6 md:grid-cols-2">
              {/* Hostel */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium">Hostel Charges</h3>
                </div>
                <div className="space-y-3">
                  {CURRENT_FEE.hostelBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-foreground">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border border-dashed">
                    <span>Subtotal</span>
                    <span className="text-primary">₹{totalHostel.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Mess */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                    <UtensilsCrossed className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium">Mess Charges</h3>
                </div>
                <div className="space-y-3">
                  {CURRENT_FEE.messBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-foreground">₹{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border border-dashed">
                    <span>Subtotal</span>
                    <span className="text-primary">₹{totalMess.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="card-elevated overflow-hidden">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Payment History
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Transaction ID</th>
                    <th className="px-6 py-4">Fee Period</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right rounded-tr-lg">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PAST_TRANSACTIONS.map((txn) => (
                    <tr key={txn.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{txn.id}</td>
                      <td className="px-6 py-4 text-muted-foreground">{txn.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(txn.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 font-semibold">₹{txn.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary hover:text-primary hover:bg-primary/10 gap-2"
                          onClick={() => handleDownloadReceipt(txn.id)}
                        >
                          <Download className="w-4 h-4" />
                          <span className="sr-only sm:not-sr-only">Download</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {PAST_TRANSACTIONS.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No past transactions found.
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
