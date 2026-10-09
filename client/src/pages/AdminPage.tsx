import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Upload,
  Layers,
  HelpCircle,
  Users,
  Settings as SettingsIcon,
  FileText,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  BookOpen,
  Building,
  GraduationCap,
  Clock,
  History,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { api } from '../services/api';
import {
  DashboardStats,
  AcademicProgram,
  Semester,
  UniversityAffiliation,
  Subject,
  Batch,
  Resource,
  StudentRequest,
  User,
  AuditLog,
} from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { PDFViewerModal } from '../components/PDFViewerModal';

export const AdminPage: React.FC = () => {
  const { user, isSuperAdmin, isStaff } = useAuth();
  const { settings, updateSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<
    'stats' | 'resources' | 'academic' | 'requests' | 'users' | 'settings' | 'audit'
  >('stats');

  // Stats state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Academic hierarchy state
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [affiliations, setAffiliations] = useState<UniversityAffiliation[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Sub-tabs for Academic Management
  const [academicSubTab, setAcademicSubTab] = useState<'programs' | 'batches' | 'semesters' | 'affiliations' | 'subjects'>('programs');

  // Form states for creating academic entities
  const [newProgram, setNewProgram] = useState({ name: '', code: '', description: '' });
  const [newBatch, setNewBatch] = useState({ name: '', code: '', academicProgramId: '' });
  const [newSemester, setNewSemester] = useState({ name: '', semesterNumber: 1 });
  const [newAffiliation, setNewAffiliation] = useState({ name: '', shortCode: '', description: '' });
  const [newSubject, setNewSubject] = useState({ name: '', code: '', academicProgramId: '', semesterId: '', description: '' });

  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);

  // Resource Upload Form State
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    resourceType: 'LECTURE_NOTE',
    academicProgramId: '',
    batchId: '',
    semesterId: '',
    subjectId: '',
    universityAffiliationId: '',
    lectureNumber: '',
    topic: '',
    examType: '',
    examYear: '',
    examSession: '',
    isSolved: false,
    isPublished: true,
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Requests state
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const [requestStatusInput, setRequestStatusInput] = useState('UNDER_REVIEW');
  const [adminResponseInput, setAdminResponseInput] = useState('');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    platformName: settings.platformName,
    tagline: settings.tagline,
    institutionName: settings.institutionName,
    contactEmail: settings.contactEmail || '',
    maxFileSizeMb: settings.maxFileSizeMb,
  });
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // PDF Preview Modal
  const [viewerOpen, setViewerOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  // Load stats
  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Load academic data
  const fetchAcademicData = async () => {
    try {
      const [progRes, batchRes, semRes, affRes, subRes] = await Promise.all([
        api.getPrograms(true),
        api.getBatches(undefined, true),
        api.getSemesters(true),
        api.getAffiliations(true),
        api.getSubjects({ all: true }),
      ]);
      setPrograms(progRes);
      setBatches(batchRes);
      setSemesters(semRes);
      setAffiliations(affRes);
      setSubjects(subRes);
    } catch (err) {
      console.error('Error loading academic structures', err);
    }
  };

  // Load resources
  const fetchResources = async () => {
    setIsLoadingResources(true);
    try {
      const res = await api.getResources({ limit: 50, includeDrafts: true });
      setResources(res.data || []);
    } catch (err) {
      console.error('Error loading resources', err);
    } finally {
      setIsLoadingResources(false);
    }
  };

  // Load requests
  const fetchRequests = async () => {
    try {
      const res = await api.getAllRequests({ limit: 50 });
      setRequests(res.data || []);
    } catch (err) {
      console.error('Error loading requests', err);
    }
  };

  // Load users
  const fetchUsers = async () => {
    try {
      const res = await api.getUsers({ search: userSearch || undefined });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error loading users', err);
    }
  };

  // Load audit logs
  const fetchAuditLogs = async () => {
    try {
      const res = await api.getAuditLogs({ limit: 40 });
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error('Error loading audit logs', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAcademicData();
  }, []);

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'academic') fetchAcademicData();
    if (activeTab === 'resources') {
      fetchAcademicData();
      fetchResources();
    }
    if (activeTab === 'requests') fetchRequests();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  // Academic Structure Form Handlers
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProgram(newProgram);
      setNewProgram({ name: '', code: '', description: '' });
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message || 'Failed to create program');
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.deleteProgram(id);
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete program');
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBatch(newBatch);
      setNewBatch({ name: '', code: '', academicProgramId: '' });
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message || 'Failed to create batch');
    }
  };

  const handleDeleteBatch = async (id: string) => {
    if (!window.confirm('Delete batch?')) return;
    try {
      await api.deleteBatch(id);
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSemester(newSemester);
      setNewSemester({ name: '', semesterNumber: 1 });
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message || 'Failed to create semester');
    }
  };

  const handleDeleteSemester = async (id: string) => {
    if (!window.confirm('Delete semester?')) return;
    try {
      await api.deleteSemester(id);
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateAffiliation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAffiliation(newAffiliation);
      setNewAffiliation({ name: '', shortCode: '', description: '' });
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message || 'Failed to create affiliation');
    }
  };

  const handleDeleteAffiliation = async (id: string) => {
    if (!window.confirm('Delete affiliation?')) return;
    try {
      await api.deleteAffiliation(id);
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSubject(newSubject);
      setNewSubject({ name: '', code: '', academicProgramId: '', semesterId: '', description: '' });
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message || 'Failed to create subject');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm('Delete subject?')) return;
    try {
      await api.deleteSubject(id);
      fetchAcademicData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Upload Resource Handler
  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadMessage({ type: 'error', text: 'Please select a document file to upload.' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('resourceType', uploadData.resourceType);
    if (uploadData.academicProgramId) formData.append('academicProgramId', uploadData.academicProgramId);
    if (uploadData.batchId) formData.append('batchId', uploadData.batchId);
    if (uploadData.semesterId) formData.append('semesterId', uploadData.semesterId);
    if (uploadData.subjectId) formData.append('subjectId', uploadData.subjectId);
    if (uploadData.universityAffiliationId) formData.append('universityAffiliationId', uploadData.universityAffiliationId);
    if (uploadData.lectureNumber) formData.append('lectureNumber', uploadData.lectureNumber);
    if (uploadData.topic) formData.append('topic', uploadData.topic);
    if (uploadData.examType) formData.append('examType', uploadData.examType);
    if (uploadData.examYear) formData.append('examYear', uploadData.examYear);
    if (uploadData.examSession) formData.append('examSession', uploadData.examSession);
    formData.append('isSolved', String(uploadData.isSolved));
    formData.append('isPublished', String(uploadData.isPublished));
    formData.append('file', uploadFile);
    if (solutionFile) formData.append('solutionFile', solutionFile);

    try {
      await api.uploadResource(formData);
      setUploadMessage({ type: 'success', text: 'Resource published and safely stored in repository.' });
      setUploadData({
        title: '',
        description: '',
        resourceType: 'LECTURE_NOTE',
        academicProgramId: '',
        batchId: '',
        semesterId: '',
        subjectId: '',
        universityAffiliationId: '',
        lectureNumber: '',
        topic: '',
        examType: '',
        examYear: '',
        examSession: '',
        isSolved: false,
        isPublished: true,
      });
      setUploadFile(null);
      setSolutionFile(null);
      fetchResources();
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Delete this academic resource and stored file?')) return;
    try {
      await api.deleteResource(id);
      fetchResources();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resource');
    }
  };

  const handleToggleResourcePublish = async (res: Resource) => {
    try {
      await api.updateResource(res.id, { isPublished: !res.isPublished });
      fetchResources();
    } catch (err: any) {
      alert(err.message || 'Failed to update publication status');
    }
  };

  // Update Request Status Handler
  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      await api.updateRequestStatus(selectedRequest.id, {
        status: requestStatusInput,
        adminResponse: adminResponseInput,
      });
      setSelectedRequest(null);
      setAdminResponseInput('');
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to update request');
    }
  };

  // User Role & Status Handlers
  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.updateUserStatus(userId, !currentStatus);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update account status');
    }
  };

  // Settings update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settingsForm);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Header */}
      <div className="bg-navy-950 text-white border-b border-navy-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Administrative Control Center
                </h1>
                <Badge variant="warning" size="sm" className="bg-amber-900/60 text-amber-300 border-amber-700">
                  {user?.role}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Khanpur Institute of Technology • Academic Resource Governance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 sm:space-x-4 overflow-x-auto">
          {[
            { id: 'stats', label: 'Metrics Overview', icon: LayoutDashboard },
            { id: 'resources', label: 'Upload & Resources', icon: Upload },
            { id: 'academic', label: 'Academic Hierarchy', icon: Layers },
            { id: 'requests', label: 'Student Inquiries', icon: HelpCircle },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'settings', label: 'Platform Settings', icon: SettingsIcon },
            { id: 'audit', label: 'Audit Trail', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 flex items-center gap-2 transition-colors ${
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* ===================== TAB 1: METRICS OVERVIEW ===================== */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                Real-Time Institutional Academic Metrics
              </h2>
              <p className="text-xs text-slate-500">
                Calculated directly from live database tables. No fabricated counts or placeholder records.
              </p>
            </div>

            {isLoadingStats || !stats ? (
              <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
                Calculating metrics...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Registered Students</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalStudents}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Published Resources</span>
                    <div className="text-2xl font-bold text-blue-600 mt-1">{stats.totalPublishedResources}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Vault Files</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalFiles}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Active Semesters</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalSemesters}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Active Subjects</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalSubjects}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Total Past Papers</span>
                    <div className="text-2xl font-bold text-purple-600 mt-1">{stats.totalPastPapers}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Solved Papers</span>
                    <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalSolvedPapers}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Unsolved Papers</span>
                    <div className="text-2xl font-bold text-slate-700 mt-1">{stats.totalUnsolvedPapers}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Admission Batches</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalBatches}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium">Pending Requests</span>
                    <div className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingRequests}</div>
                  </div>
                </div>

                {/* Recently uploaded resources */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Recent Resource Activity
                  </h3>
                  {stats.recentResources.length === 0 ? (
                    <EmptyState
                      title="No Resources in System"
                      description="No materials have been published yet. Switch to the 'Upload & Resources' tab to upload your first lecture note or past paper."
                      icon="folder"
                    />
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {stats.recentResources.map((res) => (
                        <div key={res.id} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <span className="font-semibold text-slate-800">{res.title}</span>
                            <div className="text-slate-500 mt-0.5">
                              {res.subject?.name} • Uploaded by {res.uploadedBy?.fullName}
                            </div>
                          </div>
                          <span className="text-slate-400">
                            {new Date(res.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ===================== TAB 2: UPLOAD & RESOURCE MANAGEMENT ===================== */}
        {activeTab === 'resources' && (
          <div className="space-y-8">
            {/* Upload Box */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Upload & Index Academic Resource
                </h2>
                <p className="text-xs text-slate-500">
                  Upload lecture notes, PDFs, or university past papers and associate them with official academic structures
                </p>
              </div>

              {uploadMessage && (
                <div
                  className={`p-3.5 rounded-lg text-xs flex items-center gap-2 ${
                    uploadMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {uploadMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{uploadMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUploadResource} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={uploadData.title}
                      onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                      placeholder="e.g. Lecture 04: Process Synchronization"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Resource Category *
                    </label>
                    <select
                      value={uploadData.resourceType}
                      onChange={(e) => setUploadData({ ...uploadData, resourceType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="LECTURE_NOTE">Lecture Note</option>
                      <option value="LECTURE_PDF">Lecture PDF</option>
                      <option value="HANDOUT">Handout</option>
                      <option value="ASSIGNMENT">Assignment</option>
                      <option value="MIDTERM_PAPER">Midterm Past Paper</option>
                      <option value="FINAL_TERM_PAPER">Final-Term Past Paper</option>
                      <option value="MOCK_EXAM">Mock Examination Paper</option>
                      <option value="PREVIOUS_EXAM">Previous Examination Paper</option>
                      <option value="ELADE_MATERIAL">ELADE Examination Material</option>
                      <option value="OTHER">Other Academic Resource</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Academic Program
                    </label>
                    <select
                      value={uploadData.academicProgramId}
                      onChange={(e) => setUploadData({ ...uploadData, academicProgramId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                    >
                      <option value="">Select Program</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Semester
                    </label>
                    <select
                      value={uploadData.semesterId}
                      onChange={(e) => setUploadData({ ...uploadData, semesterId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                    >
                      <option value="">Select Semester</option>
                      {semesters.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <select
                      value={uploadData.subjectId}
                      onChange={(e) => setUploadData({ ...uploadData, subjectId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Examination Metadata (for past papers) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Examination Metadata & Affiliation (Optional for Course Notes)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Affiliation</label>
                      <select
                        value={uploadData.universityAffiliationId}
                        onChange={(e) => setUploadData({ ...uploadData, universityAffiliationId: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="">None / Internal KIT</option>
                        {affiliations.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.shortCode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Exam Type</label>
                      <select
                        value={uploadData.examType}
                        onChange={(e) => setUploadData({ ...uploadData, examType: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="">Select Exam Type</option>
                        <option value="MIDTERM">Midterm</option>
                        <option value="FINAL_TERM">Final-Term</option>
                        <option value="MOCK">Mock</option>
                        <option value="PREVIOUS_EXAM">Previous Exam</option>
                        <option value="ELADE">ELADE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Exam Year</label>
                      <input
                        type="number"
                        placeholder="2024"
                        value={uploadData.examYear}
                        onChange={(e) => setUploadData({ ...uploadData, examYear: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Session</label>
                      <input
                        type="text"
                        placeholder="Spring / Fall / Annual"
                        value={uploadData.examSession}
                        onChange={(e) => setUploadData({ ...uploadData, examSession: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                      <input
                        type="checkbox"
                        checked={uploadData.isSolved}
                        onChange={(e) => setUploadData({ ...uploadData, isSolved: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span>Mark as Solved Paper (Answer Key Provided)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                      <input
                        type="checkbox"
                        checked={uploadData.isPublished}
                        onChange={(e) => setUploadData({ ...uploadData, isPublished: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300"
                      />
                      <span>Publish Immediately (Students can access)</span>
                    </label>
                  </div>
                </div>

                {/* File picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Main Academic File (PDF / Word) *
                    </label>
                    <input
                      type="file"
                      required
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.png,.jpg"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Optional Solution File (If separate answer key)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip"
                      onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-slate-300 rounded-lg p-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Resource Description / Instructor Note
                  </label>
                  <textarea
                    rows={2}
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    placeholder="Optional details or instructions for students..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading to Vault...' : 'Upload & Publish Resource'}</span>
                </button>
              </form>
            </div>

            {/* Existing Resources Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    All Registered Academic Materials ({resources.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage drafts, toggle student publication, or remove outdated documents
                  </p>
                </div>
              </div>

              {isLoadingResources ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading library...</div>
              ) : resources.length === 0 ? (
                <EmptyState
                  title="No Resources Available"
                  description="Use the upload form above to add lecture materials or examination papers."
                  icon="folder"
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Title & Subject</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Semester</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Solved?</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {resources.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50/60">
                          <td className="p-3">
                            <span className="font-semibold text-slate-900">{res.title}</span>
                            <div className="text-[11px] text-slate-500">
                              {res.subject?.name} ({res.subject?.code})
                            </div>
                          </td>
                          <td className="p-3">{res.resourceType.replace(/_/g, ' ')}</td>
                          <td className="p-3">{res.semester?.name || '—'}</td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleResourcePublish(res)}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                res.isPublished
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {res.isPublished ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td className="p-3">
                            {res.isSolved ? (
                              <span className="text-emerald-600 font-semibold">Yes</span>
                            ) : (
                              <span className="text-slate-400">No</span>
                            )}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {res.files && res.files.length > 0 && (
                              <button
                                onClick={() => {
                                  setPreviewResource(res);
                                  setViewerOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-blue-600 transition-colors"
                                title="Preview document"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteResource(res.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete resource"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: ACADEMIC HIERARCHY ===================== */}
        {activeTab === 'academic' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  KIT Academic Structure Governance
                </h2>
                <p className="text-xs text-slate-500">
                  Configure academic programs, admission batches, semesters, university affiliations, and subjects
                </p>
              </div>

              {/* Sub-tab pills */}
              <div className="flex flex-wrap gap-2 pt-2 border-b border-slate-100 pb-3">
                {[
                  { id: 'programs', label: `Programs (${programs.length})` },
                  { id: 'batches', label: `Batches (${batches.length})` },
                  { id: 'semesters', label: `Semesters (${semesters.length})` },
                  { id: 'affiliations', label: `Affiliations (${affiliations.length})` },
                  { id: 'subjects', label: `Subjects (${subjects.length})` },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setAcademicSubTab(sub.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      academicSubTab === sub.id
                        ? 'bg-navy-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Programs Sub-tab */}
            {academicSubTab === 'programs' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Add Academic Program</h3>
                  <form onSubmit={handleCreateProgram} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Program Name *</label>
                      <input
                        type="text"
                        required
                        value={newProgram.name}
                        onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                        placeholder="e.g. BS Computer Science"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Program Code *</label>
                      <input
                        type="text"
                        required
                        value={newProgram.code}
                        onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value })}
                        placeholder="e.g. BSCS"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={newProgram.description}
                        onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                        placeholder="4-Year Undergraduate Degree"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Academic Program
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Configured Programs</h3>
                  {programs.length === 0 ? (
                    <EmptyState
                      title="No Programs Defined"
                      description="Create programs like BSCS, BSIT, or Associate Degree using the form."
                      icon="layers"
                    />
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {programs.map((p) => (
                        <div key={p.id} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{p.name}</span>
                            <span className="ml-2 font-mono text-slate-500">({p.code})</span>
                            {p.description && <p className="text-slate-500 mt-0.5">{p.description}</p>}
                          </div>
                          <button
                            onClick={() => handleDeleteProgram(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Batches Sub-tab */}
            {academicSubTab === 'batches' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Add Admission Batch</h3>
                  <form onSubmit={handleCreateBatch} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Name *</label>
                      <input
                        type="text"
                        required
                        value={newBatch.name}
                        onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                        placeholder="e.g. Fall 2024 (F24)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Code *</label>
                      <input
                        type="text"
                        required
                        value={newBatch.code}
                        onChange={(e) => setNewBatch({ ...newBatch, code: e.target.value })}
                        placeholder="e.g. F24"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Program</label>
                      <select
                        value={newBatch.academicProgramId}
                        onChange={(e) => setNewBatch({ ...newBatch, academicProgramId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="">Institution-wide</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Batch
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Configured Admission Batches</h3>
                  {batches.length === 0 ? (
                    <EmptyState
                      title="No Batches Configured"
                      description="Add admission batches like F24 or Fall 2024."
                      icon="layers"
                    />
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {batches.map((b) => (
                        <div key={b.id} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{b.name}</span>
                            <span className="ml-2 font-mono text-slate-500">[{b.code}]</span>
                            {b.academicProgram && (
                              <p className="text-slate-500 mt-0.5">{b.academicProgram.name}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteBatch(b.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Semesters Sub-tab */}
            {academicSubTab === 'semesters' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Add Academic Semester</h3>
                  <form onSubmit={handleCreateSemester} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Semester Name *</label>
                      <input
                        type="text"
                        required
                        value={newSemester.name}
                        onChange={(e) => setNewSemester({ ...newSemester, name: e.target.value })}
                        placeholder="e.g. Semester 1"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Semester Number *</label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        required
                        value={newSemester.semesterNumber}
                        onChange={(e) => setNewSemester({ ...newSemester, semesterNumber: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Semester
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Configured Semesters</h3>
                  {semesters.length === 0 ? (
                    <EmptyState
                      title="No Semesters Configured"
                      description="Create semesters (1 to 8) to organize coursework."
                      icon="layers"
                    />
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {semesters.map((s) => (
                        <div key={s.id} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{s.name}</span>
                            <span className="ml-2 font-mono text-slate-500">(Order: {s.semesterNumber})</span>
                          </div>
                          <button
                            onClick={() => handleDeleteSemester(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* University Affiliations Sub-tab */}
            {academicSubTab === 'affiliations' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Add University Affiliation</h3>
                  <form onSubmit={handleCreateAffiliation} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Affiliation Name *</label>
                      <input
                        type="text"
                        required
                        value={newAffiliation.name}
                        onChange={(e) => setNewAffiliation({ ...newAffiliation, name: e.target.value })}
                        placeholder="e.g. University of the Punjab (PU)"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Short Code *</label>
                      <input
                        type="text"
                        required
                        value={newAffiliation.shortCode}
                        onChange={(e) => setNewAffiliation({ ...newAffiliation, shortCode: e.target.value })}
                        placeholder="e.g. PU"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={newAffiliation.description}
                        onChange={(e) => setNewAffiliation({ ...newAffiliation, description: e.target.value })}
                        placeholder="Primary degree awarding university"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Affiliation
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Configured University Affiliations</h3>
                  {affiliations.length === 0 ? (
                    <EmptyState
                      title="No University Affiliations"
                      description="Configure PU, UET, or other examination authorities."
                      icon="layers"
                    />
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {affiliations.map((a) => (
                        <div key={a.id} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{a.name}</span>
                            <span className="ml-2 font-mono text-blue-700">({a.shortCode})</span>
                            {a.description && <p className="text-slate-500 mt-0.5">{a.description}</p>}
                          </div>
                          <button
                            onClick={() => handleDeleteAffiliation(a.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Subjects Sub-tab */}
            {academicSubTab === 'subjects' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Add Academic Subject</h3>
                  <form onSubmit={handleCreateSubject} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
                      <input
                        type="text"
                        required
                        value={newSubject.name}
                        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                        placeholder="e.g. Data Structures & Algorithms"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
                      <input
                        type="text"
                        required
                        value={newSubject.code}
                        onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                        placeholder="e.g. CS-201"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Program *</label>
                      <select
                        required
                        value={newSubject.academicProgramId}
                        onChange={(e) => setNewSubject({ ...newSubject, academicProgramId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="">Select Program</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Semester *</label>
                      <select
                        required
                        value={newSubject.semesterId}
                        onChange={(e) => setNewSubject({ ...newSubject, semesterId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      >
                        <option value="">Select Semester</option>
                        {semesters.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                    >
                      Save Subject
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm">Configured Subjects</h3>
                  {subjects.length === 0 ? (
                    <EmptyState
                      title="No Subjects Configured"
                      description="Create subjects linked to specific programs and semesters."
                      icon="layers"
                    />
                  ) : (
                    <div className="divide-y divide-slate-100 text-xs">
                      {subjects.map((s) => (
                        <div key={s.id} className="py-3 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{s.name}</span>
                            <span className="ml-2 font-mono text-slate-500">[{s.code}]</span>
                            <p className="text-slate-500 mt-0.5">
                              {s.academicProgram?.name} • {s.semester?.name}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteSubject(s.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 4: STUDENT REQUESTS & MODERATION ===================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Student Inquiries & Missing Resource Requests ({requests.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted requests from students, post official answers, or update operational statuses
              </p>
            </div>

            {requests.length === 0 ? (
              <EmptyState
                title="No Student Requests"
                description="No students have submitted requests yet. Inquiries will appear here when posted."
                icon="request"
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List of requests */}
                <div className="lg:col-span-2 space-y-3">
                  {requests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => {
                        setSelectedRequest(req);
                        setRequestStatusInput(req.status);
                        setAdminResponseInput(req.adminResponse || '');
                      }}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        selectedRequest?.id === req.id
                          ? 'bg-blue-50/50 border-blue-400 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <Badge variant="secondary" size="sm">
                            {req.category.replace(/_/g, ' ')}
                          </Badge>
                          <h4 className="font-bold text-slate-900 text-sm mt-1">{req.title}</h4>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-2">{req.description}</p>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Submitted by: {req.student?.fullName} ({req.student?.email})</span>
                        <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Update Sidebar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedRequest ? 'Update Request Status' : 'Select a Request to Review'}
                  </h3>

                  {selectedRequest ? (
                    <form onSubmit={handleUpdateRequest} className="space-y-4 text-xs">
                      <div>
                        <span className="text-slate-400">Request:</span>
                        <p className="font-semibold text-slate-900 mt-0.5">{selectedRequest.title}</p>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Status</label>
                        <select
                          value={requestStatusInput}
                          onChange={(e) => setRequestStatusInput(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                        >
                          <option value="SUBMITTED">Submitted</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed (Resource Published)</option>
                          <option value="DECLINED">Declined</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Official Administrative Response
                        </label>
                        <textarea
                          rows={4}
                          value={adminResponseInput}
                          onChange={(e) => setAdminResponseInput(e.target.value)}
                          placeholder="Note sent to the student explaining actions taken..."
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800 transition-colors"
                      >
                        Save & Notify Student
                      </button>
                    </form>
                  ) : (
                    <p className="text-xs text-slate-500">
                      Click any student inquiry from the list on the left to inspect full details, update resolution status, and submit faculty replies.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 5: USER DIRECTORY ===================== */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Registered Accounts Directory
                </h2>
                <p className="text-xs text-slate-500">
                  Inspect student profiles, update permissions, or toggle account access
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                  placeholder="Search user name or email..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">User & Email</th>
                      <th className="p-3">Student Roll #</th>
                      <th className="p-3">Program & Semester</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Access</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60">
                        <td className="p-3">
                          <span className="font-semibold text-slate-900">{u.fullName}</span>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="p-3">{u.studentId || '—'}</td>
                        <td className="p-3">
                          {u.academicProgram?.name || '—'} {u.semester ? `• ${u.semester.name}` : ''}
                        </td>
                        <td className="p-3">
                          <select
                            value={u.role}
                            disabled={!isSuperAdmin && u.role === 'SUPER_ADMIN'}
                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                            className="p-1 bg-slate-50 border border-slate-300 rounded text-xs"
                          >
                            <option value="STUDENT">STUDENT</option>
                            <option value="CONTENT_MANAGER">CONTENT_MANAGER</option>
                            <option value="ADMIN">ADMIN</option>
                            {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                          </select>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              u.isActive
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================== TAB 6: PLATFORM SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform Identity & Policies</h2>
              <p className="text-xs text-slate-500">
                Configure institutional name, branding, tagline, and document vault constraints
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Platform settings updated successfully.</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Platform Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.platformName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, platformName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Tagline</label>
                <input
                  type="text"
                  required
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.institutionName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, institutionName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Academic Email</label>
                <input
                  type="email"
                  value={settingsForm.contactEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Upload File Size (MB)</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={settingsForm.maxFileSizeMb}
                  onChange={(e) => setSettingsForm({ ...settingsForm, maxFileSizeMb: parseInt(e.target.value, 10) })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-navy-900 text-white rounded-lg font-semibold hover:bg-navy-800 transition-colors shadow-sm"
              >
                Save Institutional Settings
              </button>
            </form>
          </div>
        )}

        {/* ===================== TAB 7: AUDIT TRAIL ===================== */}
        {activeTab === 'audit' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Administrative Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Immutable security logs of administrative actions, user changes, and content uploads
              </p>
            </div>

            {auditLogs.length === 0 ? (
              <EmptyState
                title="No Audit Logs Recorded"
                description="Administrative actions will appear here with timestamp and operator details."
                icon="layers"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3">Record Type</th>
                      <th className="p-3">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60">
                        <td className="p-3 text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3 font-semibold text-blue-700">{log.action}</td>
                        <td className="p-3 text-slate-800">{log.userEmail}</td>
                        <td className="p-3 text-slate-600">{log.recordType}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate font-sans">
                          {log.details || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* PDF Preview Modal in Admin Mode */}
      <PDFViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        resource={previewResource}
        file={previewResource?.files?.[0] || null}
      />
    </div>
  );
};
