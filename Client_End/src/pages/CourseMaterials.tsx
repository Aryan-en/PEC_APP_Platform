import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  Loader2,
  BookOpen,
  Video,
  File,
  ClipboardList,
  Link as LinkIcon,
  Search,
  MoreVertical,
  ExternalLink,
  Eye,
  Calendar,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useDepartmentFilter } from '@/hooks/useDepartmentFilter';
import BulkUpload from '@/components/BulkUpload';
import { exportUserListPDF } from '@/lib/pdfExport';
import PDFExportButton from '@/components/common/PDFExportButton';

interface CourseMaterial {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  title: string;
  description: string;
  fileURL: string;
  type: 'lecture-notes' | 'reference' | 'assignment' | 'video' | 'other';
  uploadedBy: string;
  uploadedAt: string;
  fileSize?: string;
  downloadCount?: number;
  tags?: string[];
}

const MOCK_COURSES = [
  { id: 'cs101', code: 'CS101', name: 'Introduction to Computer Science', department: 'Computer Science' },
  { id: 'cs202', code: 'CS202', name: 'Data Structures & Algorithms', department: 'Computer Science' },
  { id: 'ee301', code: 'EE301', name: 'Digital Electronics', department: 'Electrical Engineering' },
  { id: 'ma101', code: 'MA101', name: 'Engineering Mathematics I', department: 'Mathematics' },
];

const MOCK_MATERIALS: CourseMaterial[] = [
  {
    id: 'mat1',
    courseId: 'cs101',
    courseName: 'Introduction to Computer Science',
    courseCode: 'CS101',
    title: 'Lecture 1: History of Computing',
    description: 'Overview of computer evolution from mechanical calculators to modern systems.',
    fileURL: '#',
    type: 'lecture-notes',
    uploadedBy: 'Dr. Sarah Wilson',
    uploadedAt: '2024-03-01',
    fileSize: '4.2 MB',
    downloadCount: 156,
    tags: ['History', 'Basics']
  },
  {
    id: 'mat2',
    courseId: 'cs202',
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS202',
    title: 'Week 4: Red-Black Trees Implementation',
    description: 'Detailed guide and pseudocode for balanced binary search trees.',
    fileURL: '#',
    type: 'reference',
    uploadedBy: 'Prof. James Miller',
    uploadedAt: '2024-03-05',
    fileSize: '1.8 MB',
    downloadCount: 89,
    tags: ['DSA', 'Trees']
  },
  {
    id: 'mat3',
    courseId: 'cs202',
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS202',
    title: 'Assignment 2: Graph Traversals',
    description: 'Implementation of BFS and DFS on adjacency lists.',
    fileURL: '#',
    type: 'assignment',
    uploadedBy: 'Prof. James Miller',
    uploadedAt: '2024-03-10',
    fileSize: '0.5 MB',
    downloadCount: 210,
    tags: ['Graphs', 'Algorithms']
  },
  {
    id: 'mat4',
    courseId: 'ee301',
    courseName: 'Digital Electronics',
    courseCode: 'EE301',
    title: 'Lab 3 Video: Logic Gates on Breadboard',
    description: 'Demonstration of building AND, OR, and NOT circuits.',
    fileURL: '#',
    type: 'video',
    uploadedBy: 'Dr. Robert Chen',
    uploadedAt: '2024-03-12',
    fileSize: '450 MB',
    downloadCount: 45,
    tags: ['Lab', 'Circuit']
  }
];

export default function CourseMaterials() {
  const navigate = useNavigate();
  const { isAdmin, isFaculty, user, loading: authLoading } = usePermissions();
  const { filterByDepartment } = useDepartmentFilter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin || isFaculty) {
    return <MaterialsManager userId="demo-faculty" userRole="faculty" />;
  }

  return <StudentMaterialsView userId="demo-student" />;
}

function MaterialsManager({ userId, userRole }: { userId: string; userRole: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [materialForm, setMaterialForm] = useState({
    courseId: '',
    title: '',
    description: '',
    fileURL: '',
    type: 'lecture-notes' as CourseMaterial['type'],
  });

  const isAdmin = userRole.includes('admin');

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  useEffect(() => {
    if (courses.length > 0) {
      fetchMaterials();
    }
  }, [courses, selectedCourse]);

  const fetchCourses = async () => {
    setCourses(MOCK_COURSES);
  };

  const fetchMaterials = async () => {
    const courseIds = selectedCourse ? [selectedCourse] : MOCK_COURSES.map(c => c.id);
    if (courseIds.length === 0) return;

    const materialsData = MOCK_MATERIALS.filter(m => courseIds.includes(m.courseId));
    setMaterials(materialsData);
  };

  const handleUpload = async () => {
    if (!materialForm.title || !materialForm.courseId || !materialForm.fileURL) {
      toast.error('Please fill all required fields');
      return;
    }

    setUploading(true);
    setTimeout(() => {
      const course = courses.find(c => c.id === materialForm.courseId);
      const newMaterial: CourseMaterial = {
        ...materialForm,
        id: Math.random().toString(36).substr(2, 9),
        courseName: course?.name || '',
        courseCode: course?.code || '',
        uploadedBy: 'Demo faculty',
        uploadedAt: new Date().toISOString(),
        fileSize: '1.2 MB',
        downloadCount: 0
      };
      
      setMaterials([newMaterial, ...materials]);
      toast.success('Material uploaded successfully');
      setShowUploadDialog(false);
      resetForm();
      setUploading(false);
    }, 1000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this material?')) return;
    setMaterials(materials.filter(m => m.id !== id));
    toast.success('Material deleted');
  };

  const handleBulkImport = async (data: any[]) => {
    const newItems = data.map(row => ({
      ...row,
      id: Math.random().toString(36).substr(2, 9),
      uploadedBy: userId,
      uploadedAt: new Date().toISOString(),
      fileSize: '2.5 MB',
      downloadCount: 0
    }));
    setMaterials([...newItems, ...materials]);
    return { success: data.length, failed: 0, errors: [] };
  };

  const resetForm = () => {
    setMaterialForm({
      courseId: '',
      title: '',
      description: '',
      fileURL: '',
      type: 'lecture-notes',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture-notes': return <BookOpen className="w-6 h-6" />;
      case 'reference': return <FileText className="w-6 h-6" />;
      case 'assignment': return <ClipboardList className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const filteredMaterials = selectedCourse && selectedCourse !== 'all'
    ? materials.filter(m => m.courseId === selectedCourse)
    : materials;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course Materials</h1>
          <p className="text-muted-foreground">Upload and manage course materials</p>
        </div>
        <div className="button-group">
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => { resetForm(); setShowUploadDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Upload Material
          </Button>
        </div>
      </div>

      <div className="card-elevated p-4">
        <Select value={selectedCourse || 'all'} onValueChange={(val) => setSelectedCourse(val === 'all' ? '' : val)}>
          <SelectTrigger>
            <SelectValue placeholder="All courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredMaterials.map((material, idx) => (
            <motion.div
              key={material.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="group relative bg-card hover:bg-accent/50 border border-border rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground`}>
                    {getTypeIcon(material.type)}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                      {material.courseCode}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {material.type.replace('-', ' ')}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                    {material.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {material.description}
                  </p>
                </div>

                <div className="pt-4 mt-auto border-t border-border/50">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(material.uploadedAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5" />
                      {material.uploadedBy.split(' ').pop()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <File className="h-3.5 w-3.5" />
                      {material.fileSize || '1.2 MB'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      {material.downloadCount || 0} downloads
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" asChild>
                      <a href={material.fileURL} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </a>
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9 border-border hover:bg-accent" asChild>
                      <a href={material.fileURL} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredMaterials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-2xl">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-1">No materials found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Course Material</DialogTitle>
            <DialogDescription>Add a new material for your course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Course</label>
              <Select value={materialForm.courseId} onValueChange={val => setMaterialForm({...materialForm, courseId: val})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="mt-1" placeholder="Lecture 1 - Introduction" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={materialForm.description} onChange={e => setMaterialForm({...materialForm, description: e.target.value})} className="mt-1 w-full min-h-[80px] p-2 rounded border bg-background" placeholder="Brief description..." />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={materialForm.type} onValueChange={(val: any) => setMaterialForm({...materialForm, type: val})}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture-notes">Lecture Notes</SelectItem>
                  <SelectItem value="reference">Reference Material</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">File URL</label>
              <Input value={materialForm.fileURL} onChange={e => setMaterialForm({...materialForm, fileURL: e.target.value})} className="mt-1" placeholder="https://drive.google.com/..." />
              <p className="text-xs text-muted-foreground mt-1">Upload to Google Drive/Dropbox and paste shareable link</p>
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</> : <><Upload className="w-4 h-4 mr-2" /> Upload Material</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Materials</DialogTitle>
            <DialogDescription>Columns: courseCode, title, description, type, fileURL</DialogDescription>
          </DialogHeader>
          <BulkUpload 
            entityType="materials" 
            onImport={handleBulkImport} 
            templateColumns={['courseCode', 'title', 'description', 'type', 'fileURL']}
            sampleData={[{ courseCode: 'CS101', title: 'Lecture 1', description: 'Intro', type: 'lecture-notes', fileURL: 'https://...' }]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StudentMaterialsView({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      // Simulate fetching enrolled courses
      const enrolledCourseIds = MOCK_COURSES.map(c => c.id); // Assume student is enrolled in all mock courses for demo

      // Simulate fetching course details
      const coursesData = MOCK_COURSES.filter(c => enrolledCourseIds.includes(c.id));
      setCourses(coursesData);

      // Simulate fetching materials
      const materialsData = MOCK_MATERIALS.filter(m => enrolledCourseIds.includes(m.courseId));
      
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to load materials');
    } finally {
      setTimeout(() => setLoading(false), 500); // Simulate network delay
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lecture-notes': return <BookOpen className="w-6 h-6" />;
      case 'reference': return <FileText className="w-6 h-6" />;
      case 'assignment': return <ClipboardList className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const filteredMaterials = materials.filter(m => {
    const matchesType = filterType === 'all' || m.type === filterType;
    const matchesCourse = filterCourse === 'all' || m.courseId === filterCourse;
    return matchesType && matchesCourse;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Course Materials</h1>
        <p className="text-muted-foreground">Access learning resources for your courses</p>
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="lecture-notes">Lecture Notes</SelectItem>
              <SelectItem value="reference">References</SelectItem>
              <SelectItem value="assignment">Assignments</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredMaterials.map((material, idx) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="group relative bg-card hover:bg-accent/50 border border-border rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground`}>
                      {getTypeIcon(material.type)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                        {material.courseCode}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {material.type.replace('-', ' ')}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                      {material.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                      {material.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-auto border-t border-border/50">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(material.uploadedAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="h-3.5 w-3.5" />
                        {material.uploadedBy.split(' ').pop()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <File className="h-3.5 w-3.5" />
                        {material.fileSize || '1.2 MB'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Download className="h-3.5 w-3.5" />
                        {material.downloadCount || 0} downloads
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" asChild>
                        <a href={material.fileURL} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" /> Download
                        </a>
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 border-border hover:bg-accent" asChild>
                        <a href={material.fileURL} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredMaterials.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border-2 border-dashed border-border rounded-2xl">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-1">No materials found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
