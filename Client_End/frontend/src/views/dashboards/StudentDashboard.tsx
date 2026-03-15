"use client";

import { auth } from "@/config/firebase";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  ArrowUpRight,
  Loader2,
  Camera,
  MapPin,
  User,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useRouter, useParams } from "next/navigation";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type {
  StudentProfile,
  Course,
  Assignment,
  AttendanceRecord,
  Grade
} from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface StudentStats {
  attendancePercentage: number;
  cgpa: number;
  enrolledCourses: number;
  pendingAssignments: number;
  credits: number;
}

export function StudentDashboard() {
  const router = useRouter();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('Student');
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);

  const [semesterGrades, setSemesterGrades] = useState<{ semester: string, sgpa: number }[]>([]);
  const [stats, setStats] = useState<StudentStats>({
    attendancePercentage: 0,
    cgpa: 0,
    enrolledCourses: 0,
    pendingAssignments: 0,
    credits: 0,
  });

  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [scheduleDay, setScheduleDay] = useState<string>('Today');
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [enrolledCoursesList, setEnrolledCoursesList] = useState<Course[]>([]);

  const { user: mockUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!mockUser) {
      router.push('/auth');
      return;
    }

    setFirstName(mockUser.fullName?.split(' ')[0] || 'Student');

    const mockProfile: StudentProfile = {
      uid: mockUser.uid,
      fullName: mockUser.fullName || '',
      email: mockUser.email || '',
      enrollmentNumber: 'PEC/CS/2021/042',
      department: 'Computer Science',
      semester: '6',
      phone: '',
      dob: '',
      address: '',
      city: '',
      state: '',
      profileComplete: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any; // Cast as any to avoid strict interface issues if other fields expected

    setProfileData(mockProfile);
    fetchStudentStats(mockUser.uid, mockProfile);
    setLoading(false);
  }, [authLoading, mockUser, router.push]);

  const fetchStudentStats = async (userId: string, profile: StudentProfile) => {
    // Static mock data for student dashboard
    setStats({
      attendancePercentage: 94,
      cgpa: 8.92,
      enrolledCourses: 6,
      pendingAssignments: 3,
      credits: 72,
    });

    setSemesterGrades([
      { semester: 'S1', sgpa: 8.5, cgpa: 8.5, displayValue: 8.5 },
      { semester: 'S2', sgpa: 8.7, cgpa: 8.6, displayValue: 8.6 },
      { semester: 'S3', sgpa: 9.0, cgpa: 8.75, displayValue: 8.75 },
      { semester: 'S4', sgpa: 8.8, cgpa: 8.76, displayValue: 8.76 },
      { semester: 'S5', sgpa: 9.2, cgpa: 8.92, displayValue: 8.92 },
    ] as any);

    setEnrolledCoursesList([
      { id: 'c1', name: 'Advanced Algorithms', code: 'CS301', credits: 4, semester: 6 },
      { id: 'c2', name: 'Machine Learning', code: 'CS302', credits: 4, semester: 6 },
      { id: 'c3', name: 'Cloud Computing', code: 'CS303', credits: 3, semester: 6 },
      { id: 'c4', name: 'Software Engineering', code: 'CS304', credits: 3, semester: 6 },
    ] as any);

    setTodayClasses([
      { courseCode: 'CS301', courseName: 'Advanced Algorithms', instructor: 'Dr. Sarah Smith', startTime: '09:00', endTime: '10:00', room: 'LH-1' },
      { courseCode: 'CS302', courseName: 'Machine Learning', instructor: 'Dr. John Doe', startTime: '11:00', endTime: '12:00', room: 'LH-2' },
    ]);

    setUpcomingAssignments([
      { id: 'a1', title: 'ML Project Draft', courseCode: 'CS302', courseName: 'Machine Learning', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { id: 'a2', title: 'Algorithm Analysis', courseCode: 'CS301', courseName: 'Advanced Algorithms', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    ] as any);

    setApplications([
      { id: 'app1', jobTitle: 'Software Engineer', companyName: 'Google', status: 'offered' },
      { id: 'app2', jobTitle: 'Frontend Intern', companyName: 'Vercel', status: 'pending' },
    ]);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profileData?.enrollmentNumber || 'Student'} • {profileData?.department || 'Department'} • Semester {profileData?.semester || '-'}
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <motion.div
          variants={item}
          className="card-elevated p-5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(orgSlug ? `/${orgSlug}/examinations` : '/examinations')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-foreground/10">
              <TrendingUp className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CGPA</p>
              <p className="text-2xl font-bold text-foreground">{stats.cgpa || '-'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="card-elevated p-5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(orgSlug ? `/${orgSlug}/attendance` : '/attendance')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <ClipboardCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attendance</p>
              <p className="text-2xl font-bold text-foreground">{stats.attendancePercentage}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="card-elevated p-5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(orgSlug ? `/${orgSlug}/courses` : '/courses')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-foreground/10">
              <BookOpen className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              <p className="text-2xl font-bold text-foreground">{stats.enrolledCourses}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="card-elevated p-5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(orgSlug ? `/${orgSlug}/assignments` : '/assignments')}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stats.pendingAssignments > 0 ? 'bg-warning/10' : 'bg-muted'}`}>
              <FileText className={`w-5 h-5 ${stats.pendingAssignments > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
              <p className="text-2xl font-bold text-foreground">{stats.pendingAssignments}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={item}
          className="card-elevated p-5 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(orgSlug ? `/${orgSlug}/courses` : '/courses')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-2xl font-bold text-foreground">{stats.credits}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enrolled Courses - Primary */}
        <motion.div variants={item} className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              My Enrolled Courses
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(orgSlug ? `/${orgSlug}/courses` : '/courses')}>
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {enrolledCoursesList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-2">No active enrollments</p>
            ) : (
              enrolledCoursesList.slice(0, 4).map((course, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-border bg-card/50 hover:bg-accent/50 hover:border-accent transition-all group cursor-pointer relative overflow-hidden"
                  onClick={() => router.push(orgSlug ? `/${orgSlug}/courses/${course.id}` : `/courses/${course.id}`)}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-background/50 backdrop-blur-sm">{course.code}</Badge>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{course.name}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider relative z-10">
                    <span>{course.credits} Credits</span>
                    <span className="group-hover:text-primary transition-colors">Sem {course.semester}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))
            )}
            {enrolledCoursesList.length > 4 && (
              <div className="col-span-2 flex justify-center mt-2">
                <Button variant="link" size="sm" onClick={() => router.push(orgSlug ? `/${orgSlug}/courses` : '/courses')} className="text-xs text-muted-foreground">
                  +{enrolledCoursesList.length - 4} more courses
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {scheduleDay}'s Schedule
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(orgSlug ? `/${orgSlug}/timetable` : '/timetable')}>
              Full
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {todayClasses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No classes scheduled</p>
              </div>
            ) : (
              todayClasses.map((cls, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-secondary/10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{cls.courseCode}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1 border-l border-border pl-2">{cls.courseName}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" /> {cls.instructor}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-background whitespace-nowrap">{cls.startTime} - {cls.endTime}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    {cls.room}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* My Applications */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-foreground" />
              Applications
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(orgSlug ? `/${orgSlug}/placements` : '/placement')}>
              Browse
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active applications</p>
            ) : (
              applications.slice(0, 3).map((app) => (
                <div key={app.id} className="p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground line-clamp-1">{app.jobTitle}</span>
                    <Badge variant="outline" className={
                      app.status === 'offered' ? 'text-success border-success/30 bg-success/10' :
                        app.status === 'rejected' ? 'text-destructive border-destructive/30 bg-destructive/10' :
                          'text-primary border-primary/30 bg-primary/10'
                    }>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {app.companyName}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming Assignments */}
        <motion.div variants={item} className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Deadlines
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push(orgSlug ? `/${orgSlug}/assignments` : '/assignments')}>
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pending assignments</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {upcomingAssignments.map((assignment: any) => {
                  const dueDate = assignment.dueDate?.toDate?.() || new Date(assignment.dueDate);
                  const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 2;

                  return (
                    <div
                      key={assignment.id}
                      className="p-3 rounded-xl border border-border group hover:border-warning/30 transition-colors cursor-pointer"
                      onClick={() => router.push(orgSlug ? `/${orgSlug}/assignments` : '/assignments')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-warning uppercase">{assignment.courseCode}</span>
                        <Badge variant={isUrgent ? 'destructive' : 'secondary'} className="text-[9px]">
                          {daysLeft} days left
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{assignment.title}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}


      {/* Analytics Section (New) */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
        {/* Grades History */}
        <div
          className="card-elevated p-6 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(orgSlug ? `/${orgSlug}/examinations` : '/examinations')}
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            Performance History
          </h2>
          {semesterGrades.length > 0 ? (
            <div style={{ width: '100%', height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={semesterGrades}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                  <XAxis
                    dataKey="semester"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => [value, 'CGPA']}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cgpa"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCgpa)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No grade history data
            </div>
          )}
        </div>

        {/* Attendance Overview (Quick Graph) */}
        <div
          className="card-elevated p-6 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => router.push(orgSlug ? `/${orgSlug}/attendance` : '/attendance')}
        >
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
            <ClipboardCheck className="w-5 h-5 text-success" />
            Attendance Overview
          </h2>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={351.86}
                  strokeDashoffset={351.86 - (351.86 * stats.attendancePercentage) / 100}
                  className={`transition-all duration-1000 ease-out ${stats.attendancePercentage >= 75 ? 'text-success' : stats.attendancePercentage >= 60 ? 'text-warning' : 'text-destructive'}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{stats.attendancePercentage}%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Present</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>


    </div>
  );
}
