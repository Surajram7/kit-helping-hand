import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  FolderOpen,
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
import { BackButton } from '../components/BackButton';

export const AdminPage: React.FC = () => {
  const { user, isSuperAdmin, isStaff, isContentManager, isAdmin } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<
    'stats' | 'resources' | 'academic' | 'requests' | 'users' | 'settings' | 'audit'
  >(() => {
    const tabParam = searchParams.get('tab') as any;
    if (tabParam) return tabParam;
    return user?.role === 'CONTENT_MANAGER' ? 'resources' : 'stats';
  });

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
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'STUDENT' | 'CONTENT_MANAGER' | 'ADMIN'>('ALL');

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

  const fetchRequests = async () => {
    try {
      const res = await api.getAllRequests({ limit: 50 });
      setRequests(res.data || []);
    } catch (err) {
      console.error('Error loading requests', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.getUsers({
        search: userSearch || undefined,
        role: userRoleFilter !== 'ALL' ? userRoleFilter : undefined,
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error loading users', err);
    }
  };

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
  }, [activeTab, userRoleFilter]);

  // Handlers for Academic Structure
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
    if (!window.confirm('Delete this academic program?')) return;
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
      setUploadMessage({ type: 'success', text: 'Document published and securely stored in repository.' });
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
    <div className="space-y-4 pb-12">
      {/* CMS Standard Back Button */}
      <div>
        <BackButton />
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2a4a] tracking-tight">
            Administrative Management Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Document Center, Academic Hierarchy, Student Inquiries, and Platform Governance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            Staff: {user?.fullName} ({user?.role})
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          ...(!isContentManager ? [{ id: 'stats', label: 'Metrics Overview', icon: LayoutDashboard }] : []),
          { id: 'resources', label: isContentManager ? 'Upload & Manage Materials' : 'Document Center & Upload', icon: Upload },
          ...(!isContentManager ? [{ id: 'academic', label: 'Academic Hierarchy', icon: Layers }] : []),
          { id: 'requests', label: 'Student Inquiries', icon: HelpCircle },
          ...(!isContentManager ? [{ id: 'users', label: 'CR / GR & User Directory', icon: Users }] : []),
          ...(!isContentManager ? [{ id: 'settings', label: 'Platform Settings', icon: SettingsIcon }] : []),
          ...(!isContentManager ? [{ id: 'audit', label: 'Audit Trail', icon: History }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 text-xs font-bold whitespace-nowrap rounded-lg flex items-center gap-1.5 transition-colors ${
                active
                  ? 'bg-[#0b2a4a] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===================== TAB 1: METRICS OVERVIEW ===================== */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {isLoadingStats || !stats ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Calculating metrics...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Registered Students</span>
                  <div className="text-xl font-extrabold text-[#0b2a4a] mt-1">{stats.totalStudents}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-[#cd7f32]/30 bg-[#cd7f32]/5 shadow-xs">
                  <span className="text-[#cd7f32] font-bold block text-[11px]">Active CR / GR Managers</span>
                  <div className="text-xl font-extrabold text-[#cd7f32] mt-1">{stats.totalContentManagers ?? 0}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Published Documents</span>
                  <div className="text-xl font-extrabold text-[#0b2a4a] mt-1">{stats.totalPublishedResources}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Vault Files</span>
                  <div className="text-xl font-extrabold text-[#0b2a4a] mt-1">{stats.totalFiles}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Active Semesters</span>
                  <div className="text-xl font-extrabold text-[#0b2a4a] mt-1">{stats.totalSemesters}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Active Subjects</span>
                  <div className="text-xl font-extrabold text-[#0b2a4a] mt-1">{stats.totalSubjects}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Past Papers</span>
                  <div className="text-xl font-extrabold text-purple-700 mt-1">{stats.totalPastPapers}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Solved Papers</span>
                  <div className="text-xl font-extrabold text-emerald-700 mt-1">{stats.totalSolvedPapers}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Unsolved Papers</span>
                  <div className="text-xl font-extrabold text-slate-700 mt-1">{stats.totalUnsolvedPapers}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Admission Batches</span>
                  <div className="text-xl font-extrabold text-[#0b2a4a] mt-1">{stats.totalBatches}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-slate-500 font-bold block text-[11px]">Pending Inquiries</span>
                  <div className="text-xl font-extrabold text-amber-600 mt-1">{stats.pendingRequests}</div>
                </div>
              </div>

              {/* Recently uploaded resources */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-[#0b2a4a] uppercase tracking-wider">
                  Recent Document Upload Activity
                </h3>
                {stats.recentResources.length === 0 ? (
                  <EmptyState
                    title="No Resources in System"
                    description="No materials have been published yet. Switch to the 'Document Center & Upload' tab to add your first lecture note or past paper."
                    icon="folder"
                  />
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {stats.recentResources.map((res) => (
                      <div key={res.id} className="py-2.5 flex items-center justify-between gap-4">
                        <div>
                          <span className="font-bold text-slate-900">{res.title}</span>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {res.subject?.name} • Uploaded by {res.uploadedBy?.fullName}
                          </div>
                        </div>
                        <span className="text-slate-400 text-[11px]">
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

      {/* ===================== TAB 2: DOCUMENT CENTER & UPLOAD ===================== */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Upload Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-[#0b2a4a]">
                Upload New Document to Vault
              </h2>
              <p className="text-xs text-slate-500">
                Index course notes, syllabus PDFs, or university examination papers into KIT repository
              </p>
            </div>

            {uploadMessage && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
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

            <form onSubmit={handleUploadResource} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    placeholder="e.g. Lecture 04: Process Scheduling"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={uploadData.resourceType}
                    onChange={(e) => setUploadData({ ...uploadData, resourceType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
                  >
                    <option value="LECTURE_NOTE">Lecture Note</option>
                    <option value="LECTURE_PDF">Lecture PDF</option>
                    <option value="HANDOUT">Handout</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="MIDTERM_PAPER">Midterm Past Paper</option>
                    <option value="FINAL_TERM_PAPER">Final-Term Past Paper</option>
                    <option value="MOCK_EXAM">Mock Exam</option>
                    <option value="PREVIOUS_EXAM">Previous Examination Paper</option>
                    <option value="ELADE_MATERIAL">ELADE Assessment Material</option>
                    <option value="OTHER">Other Document</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Program
                  </label>
                  <select
                    value={uploadData.academicProgramId}
                    onChange={(e) => setUploadData({ ...uploadData, academicProgramId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
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
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={uploadData.semesterId}
                    onChange={(e) => setUploadData({ ...uploadData, semesterId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
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
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <select
                    value={uploadData.subjectId}
                    onChange={(e) => setUploadData({ ...uploadData, subjectId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
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

              {/* Exam metadata */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-[#0b2a4a] uppercase tracking-wider text-[11px] block">
                  Examination & Affiliation Details (For Past Papers)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Affiliation</label>
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
                    <label className="block text-slate-600 font-bold mb-1">Exam Type</label>
                    <select
                      value={uploadData.examType}
                      onChange={(e) => setUploadData({ ...uploadData, examType: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="">Select Type</option>
                      <option value="MIDTERM">Midterm</option>
                      <option value="FINAL_TERM">Final-Term</option>
                      <option value="MOCK">Mock</option>
                      <option value="PREVIOUS_EXAM">Previous Exam</option>
                      <option value="ELADE">ELADE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Exam Year</label>
                    <input
                      type="number"
                      placeholder="2024"
                      value={uploadData.examYear}
                      onChange={(e) => setUploadData({ ...uploadData, examYear: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Session</label>
                    <input
                      type="text"
                      placeholder="Spring / Fall"
                      value={uploadData.examSession}
                      onChange={(e) => setUploadData({ ...uploadData, examSession: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={uploadData.isSolved}
                      onChange={(e) => setUploadData({ ...uploadData, isSolved: e.target.checked })}
                      className="w-4 h-4 rounded text-[#cd7f32] border-slate-300"
                    />
                    <span>Mark as Solved Paper (Includes Answer Key)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={uploadData.isPublished}
                      onChange={(e) => setUploadData({ ...uploadData, isPublished: e.target.checked })}
                      className="w-4 h-4 rounded text-[#cd7f32] border-slate-300"
                    />
                    <span>Publish Immediately (Visible to Students)</span>
                  </label>
                </div>
              </div>

              {/* File picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Main PDF / Document *
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.rtf,.zip,.rar,.7z"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#0b2a4a] file:text-white hover:file:bg-[#123a63] border border-slate-300 rounded-lg p-1.5"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports any format: Images (JPG/PNG), PDFs, Word (.doc/.docx), PowerPoint (.ppt/.pptx), Excel (.xls/.xlsx), Text notes, and ZIP archives.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Optional Solution File (Separate key)
                  </label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,.rtf,.zip,.rar,.7z"
                    onChange={(e) => setSolutionFile(e.target.files?.[0] || null)}
                    className="w-full text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 border border-slate-300 rounded-lg p-1.5"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Upload solved answer key, solution document, or image (optional).
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#cd7f32] hover:bg-[#ba6a25] text-white rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading to Vault...' : 'Upload & Index Resource'}</span>
              </button>
            </form>
          </div>

          {/* Table of all uploaded documents */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-[#0b2a4a] text-sm">
              All Repository Documents ({resources.length})
            </h3>

            {isLoadingResources ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading documents...</div>
            ) : resources.length === 0 ? (
              <EmptyState
                title="No Documents in Repository"
                description="Upload lecture materials or examination papers using the form above."
                icon="folder"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-[#0b2a4a] text-white uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-2.5">Document Title</th>
                      <th className="p-2.5">Subject</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Uploaded By</th>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">Solved</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resources.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50">
                        <td className="p-2.5">
                          <span className="font-bold text-slate-900 block">{res.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(res.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="p-2.5">{res.subject?.name || '—'}</td>
                        <td className="p-2.5">{res.resourceType.replace(/_/g, ' ')}</td>
                        <td className="p-2.5">
                          <span className="font-semibold text-slate-800 block">
                            {res.uploadedBy?.fullName || 'KIT Administration'}
                          </span>
                          <span className="text-[10px] text-[#cd7f32] font-semibold">
                            {res.uploadedBy?.role === 'CONTENT_MANAGER' ? '⭐ CR / GR' : res.uploadedBy?.role || 'ADMIN'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <button
                            onClick={() => handleToggleResourcePublish(res)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              res.isPublished
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {res.isPublished ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td className="p-2.5">
                          {res.isSolved ? (
                            <span className="text-emerald-700 font-bold">✓ Yes</span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                        <td className="p-2.5 text-right space-x-1.5">
                          {res.files && res.files.length > 0 && (
                            <button
                              onClick={() => {
                                setPreviewResource(res);
                                setViewerOpen(true);
                              }}
                              className="p-1 text-slate-600 hover:text-[#0b2a4a]"
                              title="Preview in PDF viewer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {(!isContentManager || res.uploadedById === user?.id) && (
                            <button
                              onClick={() => handleDeleteResource(res.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#0b2a4a]">
              Academic Structure Governance
            </h2>

            {/* Sub-tab pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    academicSubTab === sub.id
                      ? 'bg-[#cd7f32] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Programs */}
          {academicSubTab === 'programs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Add Program</h3>
                <form onSubmit={handleCreateProgram} className="space-y-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={newProgram.name}
                      onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                      placeholder="BS Computer Science"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Code *</label>
                    <input
                      type="text"
                      required
                      value={newProgram.code}
                      onChange={(e) => setNewProgram({ ...newProgram, code: e.target.value })}
                      placeholder="BSCS"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0b2a4a] hover:bg-[#123a63] text-white rounded-lg font-bold"
                  >
                    Save Program
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Configured Programs</h3>
                <div className="divide-y divide-slate-100">
                  {programs.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="ml-2 font-mono text-slate-500">[{p.code}]</span>
                      </div>
                      <button
                        onClick={() => handleDeleteProgram(p.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Batches */}
          {academicSubTab === 'batches' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Add Batch</h3>
                <form onSubmit={handleCreateBatch} className="space-y-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Batch Name *</label>
                    <input
                      type="text"
                      required
                      value={newBatch.name}
                      onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                      placeholder="Fall 2024 (F24)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Batch Code *</label>
                    <input
                      type="text"
                      required
                      value={newBatch.code}
                      onChange={(e) => setNewBatch({ ...newBatch, code: e.target.value })}
                      placeholder="F24"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0b2a4a] hover:bg-[#123a63] text-white rounded-lg font-bold"
                  >
                    Save Batch
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Configured Batches</h3>
                <div className="divide-y divide-slate-100">
                  {batches.map((b) => (
                    <div key={b.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{b.name}</span>
                        <span className="ml-2 font-mono text-slate-500">[{b.code}]</span>
                      </div>
                      <button
                        onClick={() => handleDeleteBatch(b.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Semesters */}
          {academicSubTab === 'semesters' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Add Semester</h3>
                <form onSubmit={handleCreateSemester} className="space-y-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Semester Name *</label>
                    <input
                      type="text"
                      required
                      value={newSemester.name}
                      onChange={(e) => setNewSemester({ ...newSemester, name: e.target.value })}
                      placeholder="Semester 1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Number (1-8) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={12}
                      value={newSemester.semesterNumber}
                      onChange={(e) => setNewSemester({ ...newSemester, semesterNumber: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0b2a4a] hover:bg-[#123a63] text-white rounded-lg font-bold"
                  >
                    Save Semester
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Configured Semesters</h3>
                <div className="divide-y divide-slate-100">
                  {semesters.map((s) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="ml-2 text-slate-500">(Order: {s.semesterNumber})</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSemester(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Affiliations */}
          {academicSubTab === 'affiliations' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Add University Affiliation</h3>
                <form onSubmit={handleCreateAffiliation} className="space-y-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Affiliation Name *</label>
                    <input
                      type="text"
                      required
                      value={newAffiliation.name}
                      onChange={(e) => setNewAffiliation({ ...newAffiliation, name: e.target.value })}
                      placeholder="University of the Punjab (PU)"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Short Code *</label>
                    <input
                      type="text"
                      required
                      value={newAffiliation.shortCode}
                      onChange={(e) => setNewAffiliation({ ...newAffiliation, shortCode: e.target.value })}
                      placeholder="PU"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0b2a4a] hover:bg-[#123a63] text-white rounded-lg font-bold"
                  >
                    Save Affiliation
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Configured Affiliations</h3>
                <div className="divide-y divide-slate-100">
                  {affiliations.map((a) => (
                    <div key={a.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{a.name}</span>
                        <span className="ml-2 font-mono text-[#0b2a4a]">({a.shortCode})</span>
                      </div>
                      <button
                        onClick={() => handleDeleteAffiliation(a.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subjects */}
          {academicSubTab === 'subjects' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Add Subject</h3>
                <form onSubmit={handleCreateSubject} className="space-y-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      placeholder="Programming Fundamentals"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Course Code *</label>
                    <input
                      type="text"
                      required
                      value={newSubject.code}
                      onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                      placeholder="CS-101"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-1 focus:ring-[#cd7f32]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Program *</label>
                    <select
                      required
                      value={newSubject.academicProgramId}
                      onChange={(e) => setNewSubject({ ...newSubject, academicProgramId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
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
                    <label className="block font-bold text-slate-700 mb-1">Semester *</label>
                    <select
                      required
                      value={newSubject.semesterId}
                      onChange={(e) => setNewSubject({ ...newSubject, semesterId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
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
                    className="w-full py-2 bg-[#0b2a4a] hover:bg-[#123a63] text-white rounded-lg font-bold"
                  >
                    Save Subject
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <h3 className="font-bold text-[#0b2a4a] text-sm">Configured Subjects</h3>
                <div className="divide-y divide-slate-100">
                  {subjects.map((s) => (
                    <div key={s.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="ml-2 font-mono text-slate-500">[{s.code}]</span>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {s.academicProgram?.name} • {s.semester?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSubject(s.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB 4: STUDENT INQUIRIES ===================== */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-[#0b2a4a]">
              Student Inquiries & Missing Paper Requests ({requests.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
            <div className="lg:col-span-2 space-y-2.5">
              {requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequest(req);
                    setRequestStatusInput(req.status);
                    setAdminResponseInput(req.adminResponse || '');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedRequest?.id === req.id
                      ? 'bg-blue-50/60 border-blue-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0b2a4a]">
                        {req.category.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{req.title}</h4>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100">
                      {req.status}
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-2">{req.description}</p>
                </div>
              ))}
            </div>

            {/* Sidebar response form */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-bold text-[#0b2a4a] text-sm">Review & Respond</h3>
              {selectedRequest ? (
                <form onSubmit={handleUpdateRequest} className="space-y-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Inquiry:</span>
                    <strong className="text-slate-900 block mt-0.5">{selectedRequest.title}</strong>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={requestStatusInput}
                      onChange={(e) => setRequestStatusInput(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed (Document Uploaded)</option>
                      <option value="DECLINED">Declined</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Response Note</label>
                    <textarea
                      rows={3}
                      value={adminResponseInput}
                      onChange={(e) => setAdminResponseInput(e.target.value)}
                      placeholder="Note to student..."
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#0b2a4a] hover:bg-[#123a63] text-white rounded-lg font-bold"
                  >
                    Save & Update
                  </button>
                </form>
              ) : (
                <p className="text-slate-500">Select any inquiry from the left to review and post faculty response.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 5: USER DIRECTORY ===================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#0b2a4a]">Institutional User Directory & Permissions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign CR / GR students as Content Managers so they can upload notes, handouts, and exam papers for their class.
                </p>
              </div>

              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                placeholder="Search name, roll #, or email..."
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-full sm:w-64 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider mr-1">Filter Role:</span>
              {[
                { id: 'ALL', label: 'All Accounts' },
                { id: 'CONTENT_MANAGER', label: '⭐ CR / GR Content Managers' },
                { id: 'STUDENT', label: '🎓 Students' },
                { id: 'ADMIN', label: '🛡️ Administrators' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setUserRoleFilter(pill.id as any)}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    userRoleFilter === pill.id
                      ? 'bg-[#0b2a4a] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#0b2a4a] text-white uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Roll #</th>
                  <th className="p-2.5">Program</th>
                  <th className="p-2.5">Assigned Role</th>
                  <th className="p-2.5">Role Action</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-2.5">
                      <span className="font-bold text-slate-900 block">{u.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                    </td>
                    <td className="p-2.5 font-medium">{u.studentId || '—'}</td>
                    <td className="p-2.5">{u.academicProgram?.code || '—'}</td>
                    <td className="p-2.5">
                      {u.role === 'CONTENT_MANAGER' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#cd7f32]/15 text-[#cd7f32] border border-[#cd7f32]/30">
                          ⭐ CR / GR (Manager)
                        </span>
                      ) : u.role === 'SUPER_ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          👑 Super Admin
                        </span>
                      ) : u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          🛡️ Department Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          🎓 Student
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <select
                        value={u.role}
                        disabled={!isSuperAdmin && u.role === 'SUPER_ADMIN'}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
                      >
                        <option value="STUDENT">🎓 Regular Student</option>
                        <option value="CONTENT_MANAGER">⭐ CR / GR (Content Manager)</option>
                        <option value="ADMIN">🛡️ Department Admin</option>
                        {isSuperAdmin && <option value="SUPER_ADMIN">👑 Super Admin</option>}
                      </select>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                        className={`px-2 py-1 rounded text-xs font-bold ${
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
      )}

      {/* ===================== TAB 6: SETTINGS ===================== */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-xl space-y-4 text-xs">
          <h2 className="text-base font-bold text-[#0b2a4a]">Institutional Portal Settings</h2>

          {settingsSuccess && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Platform Name</label>
              <input
                type="text"
                required
                value={settingsForm.platformName}
                onChange={(e) => setSettingsForm({ ...settingsForm, platformName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                required
                value={settingsForm.tagline}
                onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Institution Name</label>
              <input
                type="text"
                required
                value={settingsForm.institutionName}
                onChange={(e) => setSettingsForm({ ...settingsForm, institutionName: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Academic Email</label>
              <input
                type="email"
                value={settingsForm.contactEmail}
                onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Vault Upload Size (MB)</label>
              <input
                type="number"
                value={settingsForm.maxFileSizeMb}
                onChange={(e) => setSettingsForm({ ...settingsForm, maxFileSizeMb: parseInt(e.target.value, 10) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#cd7f32] hover:bg-[#ba6a25] text-white rounded-lg font-bold transition-colors"
            >
              Save Settings
            </button>
          </form>
        </div>
      )}

      {/* ===================== TAB 7: AUDIT TRAIL ===================== */}
      {activeTab === 'audit' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-[#0b2a4a]">Administrative Audit Trail</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#0b2a4a] text-white uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Operator</th>
                  <th className="p-2.5">Record Type</th>
                  <th className="p-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-2.5 font-bold text-[#0b2a4a]">{log.action}</td>
                    <td className="p-2.5 text-slate-800">{log.userEmail}</td>
                    <td className="p-2.5 text-slate-600">{log.recordType}</td>
                    <td className="p-2.5 text-slate-500 max-w-xs truncate font-sans">{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
