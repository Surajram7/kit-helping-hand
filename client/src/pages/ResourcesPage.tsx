import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  BookOpen,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  X,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Upload,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Resource, ResourceFile, AcademicProgram, Semester, Subject } from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { PDFViewerModal } from '../components/PDFViewerModal';
import { BackButton } from '../components/BackButton';

export const ResourcesPage: React.FC = () => {
  const { user, isStaff, isSuperAdmin, isContentManager } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter hierarchy options
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filter values
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [resourceType, setResourceType] = useState(searchParams.get('type') || '');
  const [programId, setProgramId] = useState(searchParams.get('programId') || '');
  const [semesterId, setSemesterId] = useState(searchParams.get('semesterId') || '');
  const [subjectId, setSubjectId] = useState(searchParams.get('subjectId') || '');
  const [page, setPage] = useState(1);

  // PDF Viewer Modal
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<ResourceFile | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const res = await api.getHierarchy();
        setPrograms(res.programs || []);
        setSemesters(res.semesters || []);
      } catch (err) {
        console.error('Error fetching hierarchy', err);
      }
    };
    loadHierarchy();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await api.getSubjects({
          programId: programId || undefined,
          semesterId: semesterId || undefined,
        });
        setSubjects(data);
      } catch (err) {
        console.error('Error fetching subjects', err);
      }
    };
    loadSubjects();
  }, [programId, semesterId]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await api.getResources({
        search: search || undefined,
        resourceType: resourceType || undefined,
        academicProgramId: programId || undefined,
        semesterId: semesterId || undefined,
        subjectId: subjectId || undefined,
        page,
        limit: 12,
      });
      setResources(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Error loading resources', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [search, resourceType, programId, semesterId, subjectId, page]);

  const handleDeleteResource = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" and its document file from the vault?`)) return;
    try {
      await api.deleteResource(id);
      fetchResources();
    } catch (err: any) {
      alert(err.message || 'Failed to delete resource');
    }
  };

  const handleOpenPdf = (resource: Resource) => {
    if (resource.files && resource.files.length > 0) {
      setSelectedResource(resource);
      setSelectedFile(resource.files[0]);
      setViewerOpen(true);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setResourceType('');
    setProgramId('');
    setSemesterId('');
    setSubjectId('');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(search || resourceType || programId || semesterId || subjectId);

  return (
    <div className="space-y-4 pb-8">
      {/* CMS Standard Back Button */}
      <div>
        <BackButton />
      </div>

      {/* Page Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2a4a] tracking-tight">
            Academic Document Vault
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Khanpur Institute of Technology verified coursework, handouts, slides, and syllabus files
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isStaff && (
            <Link
              to="/admin?tab=resources"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#cd7f32] hover:bg-[#ba6a25] rounded-xl transition-all shadow-xs shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isContentManager ? 'Upload Class Note' : 'Upload Document'}</span>
            </Link>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors w-fit"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search documents by course code, lecture topic, or title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
          />
        </div>

        {/* Hierarchy Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Academic Program</label>
            <select
              value={programId}
              onChange={(e) => {
                setProgramId(e.target.value);
                setSubjectId('');
                setPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
            >
              <option value="">All Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Semester</label>
            <select
              value={semesterId}
              onChange={(e) => {
                setSemesterId(e.target.value);
                setSubjectId('');
                setPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
            >
              <option value="">All Semesters</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
            >
              <option value="">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Document Category</label>
            <select
              value={resourceType}
              onChange={(e) => {
                setResourceType(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
            >
              <option value="">All Categories</option>
              <option value="LECTURE_NOTE">Lecture Notes</option>
              <option value="LECTURE_PDF">Lecture PDFs</option>
              <option value="HANDOUT">Handouts</option>
              <option value="ASSIGNMENT">Assignments</option>
              <option value="MIDTERM_PAPER">Midterm Papers</option>
              <option value="FINAL_TERM_PAPER">Final-Term Papers</option>
              <option value="MOCK_EXAM">Mock Exams</option>
              <option value="OTHER">Other Documents</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table / Grid View */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading document vault...
        </div>
      ) : resources.length === 0 ? (
        <EmptyState
          title="No Academic Documents Found"
          description={
            hasActiveFilters
              ? 'No documents match your active filter criteria. Try resetting filters.'
              : 'No resources available yet. Academic materials will appear here when published by an authorized administrator.'
          }
          icon="folder"
          action={hasActiveFilters ? { label: 'Reset Filters', onClick: clearFilters } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0b2a4a] uppercase">
                    {res.resourceType.replace(/_/g, ' ')}
                  </span>
                  {res.isSolved && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Solved
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#0b2a4a] leading-tight line-clamp-2 mb-1.5">
                  {res.title}
                </h3>

                {res.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {res.description}
                  </p>
                )}

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                  {res.subject && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subject:</span>
                      <span className="font-semibold text-slate-800">
                        {res.subject.name} ({res.subject.code})
                      </span>
                    </div>
                  )}
                  {res.semester && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Semester:</span>
                      <span className="font-medium">{res.semester.name}</span>
                    </div>
                  )}
                  {res.lectureNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lecture:</span>
                      <span className="font-medium">{res.lectureNumber}</span>
                    </div>
                  )}
                  {res.uploadedBy && (
                    <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400">Uploaded by:</span>
                      <span className="font-semibold text-[#0b2a4a]">
                        {res.uploadedBy.fullName}{' '}
                        {res.uploadedBy.role === 'CONTENT_MANAGER' && (
                          <span className="text-[#cd7f32] font-bold">⭐ CR/GR</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {res.files && res.files[0] && (
                    <span>{(res.files[0].fileSize / 1024 / 1024).toFixed(1)} MB</span>
                  )}
                </span>

                {res.files && res.files.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenPdf(res)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <a
                      href={api.getFileDownloadUrl(res.files[0].id)}
                      download
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0b2a4a] hover:bg-[#123a63] rounded-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                    {isStaff && (!isContentManager || res.uploadedById === user?.id) && (
                      <button
                        onClick={() => handleDeleteResource(res.id, res.title)}
                        className="inline-flex items-center gap-1 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-3 py-1 bg-white border border-slate-200 rounded-lg">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
            disabled={page >= pagination.totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        resource={selectedResource}
        file={selectedFile}
      />
    </div>
  );
};
