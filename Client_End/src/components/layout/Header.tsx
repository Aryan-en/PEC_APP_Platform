import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Bell, Search, User, ChevronDown, LogOut, Settings, HelpCircle,
  Menu, Building2, GraduationCap, Briefcase, Map, Users,
  LayoutDashboard, UtensilsCrossed, Shield, ShoppingBag, IndianRupee,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import ThemeToggler from '@/components/ThemeToggler';
import { GoogleTranslate } from '@/components/GoogleTranslate';
import type { User as UserType } from '@/types';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { searchableRoutes } from '@/utils/searchableRoutes';
import { BugReportDialog } from '@/components/BugReportDialog';

interface HeaderProps {
  user: UserType;
  sidebarCollapsed: boolean;
  isMobile?: boolean;
  onMenuClick?: () => void;
}

const navGroups = [
  {
    label: 'Institute',
    icon: Building2,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['student', 'faculty', 'college_admin', 'super_admin', 'placement_officer', 'recruiter'] },
      { icon: Building2, label: 'Departments', path: '/departments', roles: ['college_admin'] },
      { icon: Users, label: 'Faculty', path: '/faculty', roles: ['college_admin'] },
      { icon: Users, label: 'Users', path: '/users', roles: ['college_admin'] },
      { icon: Briefcase, label: 'Finance', path: '/finance', roles: ['student', 'college_admin'] },
      { isLabel: true, label: 'Others', roles: ['student', 'faculty', 'college_admin', 'super_admin', 'placement_officer', 'recruiter'] },
      { label: 'Tell PEC APP', path: '#', isBugReport: true, roles: ['student', 'faculty', 'college_admin', 'super_admin', 'placement_officer', 'recruiter'] },
      { label: 'PEC News', path: '#', roles: ['student', 'faculty', 'college_admin', 'super_admin', 'placement_officer', 'recruiter'] },
      { label: 'Service Requests', path: '#', hasDivider: true, roles: ['student', 'faculty', 'college_admin', 'super_admin', 'placement_officer', 'recruiter'] },
      { label: 'My Profile', path: '#', roles: ['student', 'faculty', 'college_admin', 'super_admin', 'placement_officer', 'recruiter'] },
      { label: 'Manage pec.edu.in Accounts', path: '#', roles: ['student', 'faculty', 'college_admin', 'super_admin', 'placement_officer', 'recruiter'] },
    ],
  },
  {
    label: 'Academics',
    icon: GraduationCap,
    items: [
      { icon: GraduationCap, label: 'Courses', path: '/courses', roles: ['student', 'faculty', 'college_admin'] },
      { icon: Map, label: 'Timetable', path: '/timetable', roles: ['student', 'faculty', 'college_admin'] },
      { icon: Shield, label: 'Attendance', path: '/attendance', roles: ['student', 'faculty', 'college_admin'] },
      { icon: HelpCircle, label: 'Examinations', path: '/examinations', roles: ['student', 'faculty', 'college_admin'] },
      { icon: HelpCircle, label: 'Assignments', path: '/assignments', roles: ['student', 'faculty', 'college_admin'] },
      { icon: HelpCircle, label: 'Materials', path: '/course-materials', roles: ['student', 'faculty', 'college_admin'] },
    ],
  },
  {
    label: 'Campus',
    icon: Building2,
    items: [
      { icon: Building2, label: 'Hostel Issues', path: '/hostel-issues', roles: ['student'] },
      { icon: UtensilsCrossed, label: 'Night Canteen', path: '/canteen', roles: ['student'] },
      { icon: Map, label: 'Campus Map', path: '/campus-map', roles: ['student', 'faculty', 'college_admin'] },
      { icon: Shield, label: 'Manage Hostel', path: '/admin/hostel', roles: ['college_admin'] },
      { icon: UtensilsCrossed, label: 'Canteen Manager', path: '/admin/canteen', roles: ['college_admin'] },
      { icon: ShoppingBag, label: 'Buy & Sell', path: '/buy-sell', roles: ['student', 'faculty', 'college_admin'] },
      { icon: IndianRupee, label: 'Hostel & Mess Fee', path: '/hostel-mess-fee', roles: ['student'] },
    ],
  },
  {
    label: 'Alumni / Career',
    icon: Briefcase,
    items: [
      { icon: Briefcase, label: 'Career Portal', path: '/career', roles: ['student', 'faculty', 'placement_officer', 'recruiter', 'college_admin'] },
      { icon: Building2, label: 'Resume Builder', path: '/resume-builder', roles: ['student', 'faculty', 'placement_officer', 'recruiter', 'college_admin'] },
      { icon: Briefcase, label: 'Placement Insights', path: '/admin/placement-insights', roles: ['college_admin'] },
    ],
  },
];

export function Header({ user, sidebarCollapsed, isMobile, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [hasNotifications] = useState(true);
  const [bugReportOpen, setBugReportOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Log Out error:', error);
      toast.error('Failed to Log Out');
    }
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    college_admin: 'College Admin',
    placement_officer: 'Placement Officer',
    faculty: 'Faculty',
    student: 'Student',
    recruiter: 'Recruiter',
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex flex-col w-full shadow-md">
      {/* Top Thin Bar */}
      <div className="h-10 bg-zinc-950 text-white flex justify-between items-center px-4 md:px-8 text-xs font-medium relative z-[70]">
        <div className="flex gap-6 items-center">
          <a href="https://pec.ac.in" className="hover:text-primary transition-colors tracking-wide hidden sm:block">PEC Chandigarh</a>
          <a href="#" className="hover:text-primary transition-colors tracking-wide">About PEC APP</a>
        </div>
        <div className="flex gap-6 items-center">
          <a href="#" className="hover:text-primary transition-colors tracking-wide">Terms of Service</a>
        </div>
      </div>

      <header className="h-[64px] bg-card border-b border-border transition-all duration-300 w-full flex items-center px-4 md:px-8 justify-between relative z-[65]">

        {/* Left Section: Mobile Menu & Logo */}
        <div className="flex items-center">
          {isMobile && (
            <Button variant="ghost" size="icon" className="mr-2" onClick={onMenuClick}>
              <Menu className="w-5 h-5" />
            </Button>
          )}

          {/* PEC APP Logo */}
          <div
            className="bg-primary text-white h-10 px-5 rounded-sm flex items-center justify-center text-xl tracking-[0.15em] mr-8 select-none cursor-pointer hover:bg-primary/90 transition-colors whitespace-nowrap"
            onClick={() => navigate('/dashboard')}
          >
            <span className="font-light opacity-90 mr-2">P E C</span>
            <span className="font-semibold">A P P</span>
          </div>

          {/* Desktop Dropdown Menus */}
          <div className="hidden lg:flex items-center gap-2 relative z-[100]">
            {navGroups.map((group, idx) => {
              const accessibleItems = group.items.filter(item => item.roles.includes(user.role));
              if (accessibleItems.length === 0) return null;

              return (
                <DropdownMenu key={idx}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-md transition-colors h-10">
                      <group.icon className="w-4 h-4 opacity-70" />
                      {group.label}
                      <ChevronDown className="w-3.5 h-3.5 opacity-50 ml-1" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[200px] z-[100]" sideOffset={8}>
                    {accessibleItems.map((item: any, itemIdx: number) => {
                      if (item.isLabel) {
                        return (
                          <DropdownMenuLabel key={itemIdx} className="text-[#6466e9] font-normal px-3 py-1.5 text-[13px]">
                            {item.label}
                          </DropdownMenuLabel>
                        );
                      }

                      const handleClick = () => {
                        if (item.isBugReport) {
                          setBugReportOpen(true);
                        } else if (item.label === 'PEC News') {
                          const targetPath = orgSlug ? `/${orgSlug}/dashboard#pec-news` : '/dashboard#pec-news';
                          if (location.pathname.endsWith('/dashboard')) {
                            window.history.replaceState(null, '', `${location.pathname}#pec-news`);
                            document.getElementById('pec-news')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          } else {
                            navigate(targetPath);
                          }
                        } else if (item.label === 'Service Requests') {
                          const targetPath = orgSlug ? `/${orgSlug}/service-requests` : '/service-requests';
                          navigate(targetPath);
                        } else {
                          navigate(item.path);
                        }
                      };

                      return (
                        <div key={itemIdx}>
                          <DropdownMenuItem
                            onClick={handleClick}
                            className="cursor-pointer font-medium text-[13px] py-1.5 px-3 flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              {item.icon && <item.icon className="w-4 h-4 mr-2.5 opacity-70" />}
                              {!item.icon && <span className="ml-[26px]"></span>}
                              {item.label}
                            </div>
                            {item.badge && (
                              <Badge className="bg-[#2e7d32] hover:bg-[#2e7d32] text-white text-[9px] px-1 py-0 h-4 rounded-sm border-0">
                                {item.badge}
                              </Badge>
                            )}
                          </DropdownMenuItem>
                          {item.hasDivider && <DropdownMenuSeparator className="my-1 border-white/10" />}
                        </div>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>
        </div>

        {/* Right Section: Search & Utilities */}
        <div className="flex items-center gap-3 md:gap-4 ml-auto">
          {/* Search */}
          <div className="relative hidden md:block w-56 group pointer-events-auto">
            <CommandMenu navigate={navigate} />
          </div>

          <div className="scale-90 sm:scale-100"><GoogleTranslate containerId="google_translate_header" /></div>
          <div className="hidden md:block scale-90 sm:scale-100"><ThemeToggler /></div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground h-9 w-9 rounded-full bg-secondary/30"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-4 h-4" />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-destructive rounded-full ring-2 ring-card" />
            )}
          </Button>

          {/* Shield icon */}
          <div className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-secondary/50 mx-1">
            <Shield className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-[5px] hover:bg-secondary/80 transition-colors border border-transparent hover:border-border">
                <div className="w-8 h-8 rounded-sm bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/20 shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-70 mr-1 hidden sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <div className="px-2 py-2.5 bg-secondary/20 -mt-1 -mx-1 mb-2 border-b border-border/50">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wider font-medium">{roleLabels[user.role]}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{user.email}</p>
              </div>
              <DropdownMenuItem onClick={() => navigate('/profile')} className="py-2 cursor-pointer">
                <User className="w-4 h-4 mr-2 opacity-70" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="py-2 cursor-pointer">
                <Settings className="w-4 h-4 mr-2 opacity-70" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive py-2 cursor-pointer"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2 opacity-70" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Bug Report Dialog */}
      <BugReportDialog open={bugReportOpen} onClose={() => setBugReportOpen(false)} />
    </div>
  );
}

function CommandMenu({ navigate }: { navigate: (path: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <>
      <div
        className="relative group-hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search for... (Ctrl+K)"
          className="pl-9 h-9 bg-secondary/50 border-transparent shadow-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer text-sm text-foreground placeholder:text-muted-foreground/80 hover:bg-secondary/80 transition-colors rounded-3xl"
          readOnly
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type to search pages, students, or data..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-2 px-4 text-sm">
              No results found.
              <Button
                variant="link"
                className="px-1 h-auto font-normal text-primary"
                onClick={() => {
                  setOpen(false);
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                }}
              >
                Search for "{query}"
              </Button>
            </div>
          </CommandEmpty>

          <CommandGroup heading="Pages">
            {searchableRoutes
              .filter(
                route =>
                  route.title.toLowerCase().includes(query.toLowerCase()) ||
                  route.keywords.some(k => k.includes(query.toLowerCase())),
              )
              .slice(0, 5)
              .map(route => (
                <CommandItem
                  key={route.path}
                  onSelect={() => {
                    setOpen(false);
                    navigate(route.path);
                  }}
                  className="cursor-pointer"
                >
                  <route.icon className="mr-2 h-4 w-4 opacity-70" />
                  <span>{route.title}</span>
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
