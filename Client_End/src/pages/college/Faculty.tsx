// Removed Firebase imports
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  UserPlus,
  Mail,
  Phone,
  BookOpen,
  Upload,
  Download,
  Crown,
  MoreVertical,
  Shield,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';
import { getOrgIdFromSlug, isSuperAdmin } from '@/lib/orgHelpers';

export default function Faculty() {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [faculty, setFaculty] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDialog, setShowDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [facultyForm, setFacultyForm] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    department: '',
    designation: '',
    phone: '',
    specialization: '',
  });

  useEffect(() => {
    const mockFaculty = [
      {
        id: 'f-1',
        fullName: 'Dr. Priya Mehta',
        email: 'priya@pec.edu',
        employeeId: 'FAC-022',
        department: 'Computer Science',
        designation: 'Professor',
        phone: '+91 9000000001',
        specialization: 'Machine Learning',
        status: 'active',
      },
      {
        id: 'f-2',
        fullName: 'Dr. Aman Verma',
        email: 'aman@pec.edu',
        employeeId: 'FAC-031',
        department: 'Electronics',
        designation: 'Associate Professor',
        phone: '+91 9000000002',
        specialization: 'Embedded Systems',
        status: 'active',
      },
    ];

    setFaculty(mockFaculty);
    setUserRole('college_admin');
    setLoading(false);
  }, [orgSlug]);

  const resetForm = () => {
    setFacultyForm({
      fullName: '',
      email: '',
      employeeId: '',
      department: '',
      designation: '',
      phone: '',
      specialization: '',
    });
  };

  const handleCreate = async () => {
    if (!facultyForm.fullName || !facultyForm.email) {
      toast.error('Full name and email are required');
      return;
    }

    setFaculty((prev) => [
      {
        id: `f-${Date.now()}`,
        ...facultyForm,
        status: 'active',
      },
      ...prev,
    ]);
    toast.success('Faculty added successfully');
    setShowDialog(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingFaculty) return;
    setFaculty((prev) =>
      prev.map((f) => (f.id === editingFaculty.id ? { ...f, ...facultyForm } : f)),
    );
    toast.success('Faculty updated successfully');
    setShowDialog(false);
    setEditingFaculty(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    setFaculty((prev) => prev.filter((f) => f.id !== id));
    toast.success('Faculty removed');
  };

  const promoteToHOD = (fac: any) => {
    toast.success(`${fac.fullName} promoted to HOD`);
  };

  const promoteToPlacementOfficer = (fac: any) => {
    toast.success(`${fac.fullName} assigned as placement officer`);
  };

  const handleBulkImport = async (rows: any[]) => {
    if (!rows?.length) {
      return { success: 0, failed: 0, errors: ['No rows found in file'] };
    }

    const prepared = rows.map((row, idx) => ({
      id: `bulk-fac-${Date.now()}-${idx}`,
      fullName: row.fullName || '',
      email: row.email || '',
      employeeId: row.employeeId || '',
      department: row.department || '',
      designation: row.designation || '',
      phone: row.phone || '',
      specialization: row.specialization || '',
      status: 'active',
    }));

    const valid = prepared.filter((r) => r.fullName && r.email);
    const failed = prepared.length - valid.length;
    if (valid.length > 0) {
      setFaculty((prev) => [...valid, ...prev]);
    }

    return {
      success: valid.length,
      failed,
      errors:
        failed > 0
          ? ['Some rows were skipped because fullName/email were missing']
          : [],
    };
  };

  const exportFaculty = () => {
    const exportData = filteredFaculty.map((f) => ({
      fullName: f.fullName,
      email: f.email,
      employeeId: f.employeeId || '',
      department: f.department || '',
      designation: f.designation || '',
      phone: f.phone || '',
      specialization: f.specialization || '',
      status: f.status || 'active',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Faculty');
    XLSX.writeFile(
      workbook,
      `faculty_export_${new Date().toISOString().split('T')[0]}.xlsx`,
    );
    toast.success('Faculty exported successfully');
  };

  const bulkUploadTemplate = [
    'fullName',
    'email',
    'employeeId',
    'department',
    'designation',
    'phone',
    'specialization',
  ];

  const sampleBulkData = [
    {
      fullName: 'Dr. Jane Smith',
      email: 'jane@pec.edu',
      employeeId: 'FAC101',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      phone: '+91 9000000010',
      specialization: 'Artificial Intelligence',
    },
  ];

  const openEditDialog = (fac: any) => {
    setEditingFaculty(fac);
    setFacultyForm({
      fullName: fac.fullName,
      email: fac.email,
      employeeId: fac.employeeId || '',
      department: fac.department || '',
      designation: fac.designation || '',
      phone: fac.phone || '',
      specialization: fac.specialization || '',
    });
    setShowDialog(true);
  };

  const filteredFaculty = faculty.filter(f => 
    f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading faculty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Management</h1>
          <p className="text-muted-foreground mt-1">Manage all faculty members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportFaculty}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => { resetForm(); setEditingFaculty(null); setShowDialog(true); }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Faculty</p>
              <p className="text-2xl font-bold text-foreground">{faculty.length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <BookOpen className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Faculty</p>
              <p className="text-2xl font-bold text-foreground">{faculty.filter(f => f.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold text-foreground">{new Set(faculty.map(f => f.department)).size}</p>
            </div>
          </div>
        </div>
      </div>

      <Input
        placeholder="Search by name, email, or employee ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Department</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Designation</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFaculty.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No faculty found</td></tr>
              ) : (
                filteredFaculty.map((fac) => (
                  <tr 
                    key={fac.id} 
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => navigate(`/users/${fac.id}`)}
                  >
                    <td className="p-4 font-medium text-foreground">{fac.employeeId || 'N/A'}</td>
                    <td className="p-4 text-foreground">{fac.fullName}</td>
                    <td className="p-4 text-muted-foreground">{fac.email}</td>
                    <td className="p-4 text-muted-foreground">{fac.department || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">{fac.designation || 'N/A'}</td>
                    <td className="p-4 text-center">
                      <Badge variant={fac.status === 'active' ? 'default' : 'secondary'}>{fac.status || 'active'}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(fac)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => promoteToHOD(fac)}>
                              <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                              Promote to HOD
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => promoteToPlacementOfficer(fac)}>
                              <Shield className="w-4 h-4 mr-2 text-blue-500" />
                              Make Placement Officer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(fac.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Faculty
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
            <DialogDescription>{editingFaculty ? 'Update faculty details' : 'Add a new faculty member'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <Input value={facultyForm.fullName} onChange={(e) => setFacultyForm({ ...facultyForm, fullName: e.target.value })} placeholder="Dr. John Doe" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" value={facultyForm.email} onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })} placeholder="john@example.com" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Employee ID</label>
                <Input value={facultyForm.employeeId} onChange={(e) => setFacultyForm({ ...facultyForm, employeeId: e.target.value })} placeholder="FAC2024001" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={facultyForm.phone} onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })} placeholder="+1 234 567 8900" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input value={facultyForm.department} onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })} placeholder="Computer Science" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Designation</label>
                <Input value={facultyForm.designation} onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })} placeholder="Professor" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Specialization</label>
              <Input value={facultyForm.specialization} onChange={(e) => setFacultyForm({ ...facultyForm, specialization: e.target.value })} placeholder="Machine Learning" className="mt-1" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={editingFaculty ? handleUpdate : handleCreate} className="flex-1">
                {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditingFaculty(null); resetForm(); }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Faculty</DialogTitle>
            <DialogDescription>Upload CSV or Excel file with faculty data</DialogDescription>
          </DialogHeader>
          <BulkUpload
            entityType="users"
            onImport={handleBulkImport}
            templateColumns={bulkUploadTemplate}
            sampleData={sampleBulkData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
