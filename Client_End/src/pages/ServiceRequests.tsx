import { ClipboardList, CalendarDays, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type ServiceIssue = {
  id: string;
  title: string;
  description: string;
  reportedDate: string;
  status: 'pending' | 'fixed';
};

const mockHostelIssues: ServiceIssue[] = [
  {
    id: 'HSR-2401',
    title: 'Water Cooler Not Working in Block B',
    description: 'The cooler near the second-floor common area has no cooling since the morning.',
    reportedDate: '12 Mar 2026',
    status: 'pending',
  },
  {
    id: 'HSR-2398',
    title: 'Washroom Leakage in Room 214 Corridor',
    description: 'Continuous leakage from the pipe under the basin is causing water to collect.',
    reportedDate: '10 Mar 2026',
    status: 'fixed',
  },
  {
    id: 'HSR-2391',
    title: 'Mess Hall Fans Not Functional',
    description: 'Two fans on the left dining side are not turning on during lunch hours.',
    reportedDate: '06 Mar 2026',
    status: 'fixed',
  },
  {
    id: 'HSR-2386',
    title: 'Hostel A Corridor Lights Flickering',
    description: 'Lights between rooms 105 and 112 are flickering after 8 PM.',
    reportedDate: '04 Mar 2026',
    status: 'pending',
  },
];

export default function ServiceRequests() {
  const pendingCount = mockHostelIssues.filter((issue) => issue.status === 'pending').length;
  const fixedCount = mockHostelIssues.filter((issue) => issue.status === 'fixed').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-primary" />
            Service Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track hostel issues you reported with date and current status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-warning/10 border-warning/30 text-warning">
            Pending: {pendingCount}
          </Badge>
          <Badge variant="outline" className="bg-success/10 border-success/30 text-success">
            Fixed: {fixedCount}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {mockHostelIssues.map((issue) => {
          const isFixed = issue.status === 'fixed';

          return (
            <article
              key={issue.id}
              className="card-elevated p-5 border border-border/60 hover:border-primary/25 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">{issue.id}</p>
                  <h2 className="text-base font-semibold text-foreground mt-1 leading-snug">{issue.title}</h2>
                </div>
                <Badge
                  variant="outline"
                  className={isFixed ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'}
                >
                  {isFixed ? 'Fixed' : 'Pending'}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{issue.description}</p>

              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Reported: {issue.reportedDate}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5" />
                  Resolution: {isFixed ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
