import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';
import { api } from '../services/api';
import { Resource, ResourceFile, AcademicProgram, Semester, Subject, Batch } from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { PDFViewerModal } from '../components/PDFViewerModal';

export const ResourcesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter hierarchy options
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

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

  // Update subjects whenever program or semester changes
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

  // Fetch resources based on current filters
  useEffect(() => {
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

    fetchResources();
  }, [search, resourceType, programId, semesterId, subjectId, page]);

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Academic Resource Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Search and filter lecture notes, PDFs, handouts, and semester coursework
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors w-fit"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by resource title, topic, or subject name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Hierarchical filter dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Academic Program */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">Academic Program</label>
              <select
                value={programId}
                onChange={(e) => {
                  setProgramId(e.target.value);
                  setSubjectId('');
                  setPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">Semester</label>
              <select
                value={semesterId}
                onChange={(e) => {
                  setSemesterId(e.target.value);
                  setSubjectId('');
                  setPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Type */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">Resource Category</label>
              <select
                value={resourceType}
                onChange={(e) => {
                  setResourceType(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Resource Types</option>
                <option value="LECTURE_NOTE">Lecture Notes</option>
                <option value="LECTURE_PDF">Lecture PDFs</option>
                <option value="HANDOUT">Handouts</option>
                <option value="ASSIGNMENT">Assignments</option>
                <option value="MIDTERM_PAPER">Midterm Papers</option>
                <option value="FINAL_TERM_PAPER">Final-Term Papers</option>
                <option value="MOCK_EXAM">Mock Examinations</option>
                <option value="OTHER">Other Resources</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
            Searching academic resources...
          </div>
        ) : resources.length === 0 ? (
          <EmptyState
            title="No Academic Resources Found"
            description={
              hasActiveFilters
                ? 'No resources match your active search filters. Try adjusting your selections or resetting filters.'
                : 'No resources available yet. Academic materials will appear here when published by an authorized administrator.'
            }
            icon="folder"
            action={hasActiveFilters ? { label: 'Reset Filters', onClick: clearFilters } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="secondary" size="sm">
                      {res.resourceType.replace(/_/g, ' ')}
                    </Badge>
                    {res.isSolved && (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3" /> Solved
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                    {res.title}
                  </h3>

                  {res.description && (
                    <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                      {res.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {res.subject && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subject:</span>
                        <span className="font-medium text-slate-800">
                          {res.subject.name} ({res.subject.code})
                        </span>
                      </div>
                    )}
                    {res.semester && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Semester:</span>
                        <span className="font-medium text-slate-800">{res.semester.name}</span>
                      </div>
                    )}
                    {res.lectureNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lecture:</span>
                        <span className="font-medium text-slate-800">{res.lectureNumber}</span>
                      </div>
                    )}
                    {res.topic && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Topic:</span>
                        <span className="font-medium text-slate-800">{res.topic}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    {res.files && res.files[0] && (
                      <span>{(res.files[0].fileSize / 1024 / 1024).toFixed(1)} MB</span>
                    )}
                  </div>

                  {res.files && res.files.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPdf(res)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <a
                        href={api.getFileDownloadUrl(res.files[0].id)}
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-600 px-3 py-1 bg-white border border-slate-200 rounded-lg">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={page >= pagination.totalPages}
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

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
