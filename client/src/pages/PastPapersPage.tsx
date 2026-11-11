import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Calendar,
  Search,
  Eye,
  Download,
  Filter,
  X,
  GraduationCap,
  Upload,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Resource, ResourceFile, UniversityAffiliation, AcademicProgram, Semester, Subject } from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { PDFViewerModal } from '../components/PDFViewerModal';
import { BackButton } from '../components/BackButton';

export const PastPapersPage: React.FC = () => {
  const { user, isStaff, isSuperAdmin, isContentManager } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [papers, setPapers] = useState<Resource[]>([]);
  const [counts, setCounts] = useState({ total: 0, solved: 0, unsolved: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Hierarchy options
  const [affiliations, setAffiliations] = useState<UniversityAffiliation[]>([]);
  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Filter states
  const [affiliationId, setAffiliationId] = useState(searchParams.get('affiliationId') || '');
  const [programId, setProgramId] = useState(searchParams.get('programId') || '');
  const [semesterId, setSemesterId] = useState(searchParams.get('semesterId') || '');
  const [subjectId, setSubjectId] = useState(searchParams.get('subjectId') || '');
  const [examType, setExamType] = useState(searchParams.get('examType') || '');
  const [examYear, setExamYear] = useState(searchParams.get('year') || '');
  const [solvedFilter, setSolvedFilter] = useState<string>(searchParams.get('solved') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // PDF Viewer Modal
  const [selectedPaper, setSelectedPaper] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<ResourceFile | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const res = await api.getHierarchy();
        setAffiliations(res.affiliations || []);
        setPrograms(res.programs || []);
        setSemesters(res.semesters || []);
      } catch (err) {
        console.error('Failed to load hierarchy', err);
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
        console.error('Failed to load subjects', err);
      }
    };
    loadSubjects();
  }, [programId, semesterId]);

  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPastPapers({
        affiliationId: affiliationId || undefined,
        programId: programId || undefined,
        semesterId: semesterId || undefined,
        subjectId: subjectId || undefined,
        examType: examType || undefined,
        examYear: examYear || undefined,
        isSolved: solvedFilter !== '' ? solvedFilter : undefined,
        search: search || undefined,
      });
      setPapers(res.data || []);
      setCounts(res.counts || { total: 0, solved: 0, unsolved: 0 });
    } catch (err) {
      console.error('Failed to fetch past papers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [affiliationId, programId, semesterId, subjectId, examType, examYear, solvedFilter, search]);

  const handleDeletePaper = async (id: string, title: string) => {
    if (!window.confirm(`Delete past paper "${title}" from the repository?`)) return;
    try {
      await api.deleteResource(id);
      fetchPapers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete past paper');
    }
  };

  const handleOpenPdf = (paper: Resource) => {
    if (paper.files && paper.files.length > 0) {
      setSelectedPaper(paper);
      setSelectedFile(paper.files[0]);
      setViewerOpen(true);
    }
  };

  const clearFilters = () => {
    setAffiliationId('');
    setProgramId('');
    setSemesterId('');
    setSubjectId('');
    setExamType('');
    setExamYear('');
    setSolvedFilter('');
    setSearch('');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    affiliationId || programId || semesterId || subjectId || examType || examYear || solvedFilter || search
  );

  return (
    <div className="space-y-4 pb-8">
      {/* CMS Standard Back Button */}
      <div>
        <BackButton />
      </div>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2a4a] tracking-tight">
            University Past Examination Papers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified PU (University of the Punjab) & UET examination questions, solved answers, and mock papers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isStaff && (
            <Link
              to="/admin?tab=resources"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#cd7f32] hover:bg-[#ba6a25] rounded-xl transition-all shadow-xs shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isContentManager ? 'Upload Past Paper' : 'Upload Exam Paper'}</span>
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

      {/* KPI Stats Cards (KIT CMS Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          onClick={() => setSolvedFilter('')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            solvedFilter === ''
              ? 'bg-[#0b2a4a] text-white border-[#061a30] shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
            <span>Total Exam Papers</span>
            <Building className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-2xl font-extrabold">{counts.total}</div>
          <p className="text-[11px] opacity-75 mt-0.5">All board archives</p>
        </div>

        <div
          onClick={() => setSolvedFilter('true')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            solvedFilter === 'true'
              ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            <span>Solved Papers</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-2xl font-extrabold ${solvedFilter === 'true' ? 'text-white' : 'text-emerald-700'}`}>
            {counts.solved}
          </div>
          <p className={`text-[11px] mt-0.5 ${solvedFilter === 'true' ? 'opacity-80' : 'text-slate-500'}`}>
            With verified solution files
          </p>
        </div>

        <div
          onClick={() => setSolvedFilter('false')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            solvedFilter === 'false'
              ? 'bg-slate-800 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <span>Unsolved Practice</span>
            <AlertCircle className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-800">
            {counts.unsolved}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Raw papers for exam rehearsal
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search paper by subject, code, year, or university name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div>
            <label className="block text-slate-600 font-bold mb-1">Affiliation</label>
            <select
              value={affiliationId}
              onChange={(e) => setAffiliationId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
            >
              <option value="">All Affiliations (PU / UET)</option>
              {affiliations.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.shortCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-bold mb-1">Program</label>
            <select
              value={programId}
              onChange={(e) => {
                setProgramId(e.target.value);
                setSubjectId('');
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
              onChange={(e) => setSubjectId(e.target.value)}
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
            <label className="block text-slate-600 font-bold mb-1">Exam Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32]"
            >
              <option value="">All Exam Types</option>
              <option value="MIDTERM">Midterm</option>
              <option value="FINAL_TERM">Final-Term</option>
              <option value="MOCK">Mock Exam</option>
              <option value="PREVIOUS_EXAM">Previous Board</option>
              <option value="ELADE">ELADE Assessment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Papers Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading examination papers...
        </div>
      ) : papers.length === 0 ? (
        <EmptyState
          title="No Examination Papers Available"
          description={
            hasActiveFilters
              ? 'No past papers match your active criteria. Try broadening your university or semester filters.'
              : 'No examination papers have been published yet. Materials will appear once verified and uploaded by the department.'
          }
          icon="file"
          action={hasActiveFilters ? { label: 'Clear Filters', onClick: clearFilters } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0b2a4a] uppercase">
                    {paper.examType ? paper.examType.replace(/_/g, ' ') : 'EXAM PAPER'}
                  </span>
                  {paper.isSolved ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Solved Solution
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Unsolved Paper
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-[#0b2a4a] leading-tight line-clamp-2 mb-1.5">
                  {paper.title}
                </h3>

                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4">
                  {paper.universityAffiliation && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Affiliation:</span>
                      <span className="font-bold text-[#0b2a4a]">
                        {paper.universityAffiliation.name}
                      </span>
                    </div>
                  )}
                  {paper.subject && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Subject:</span>
                      <span className="font-semibold text-slate-800">
                        {paper.subject.name} ({paper.subject.code})
                      </span>
                    </div>
                  )}
                  {paper.semester && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Semester:</span>
                      <span className="font-medium">{paper.semester.name}</span>
                    </div>
                  )}
                  {paper.examYear && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Year / Session:</span>
                      <span className="font-medium">
                        {paper.examYear} {paper.examSession ? `(${paper.examSession})` : ''}
                      </span>
                    </div>
                  )}
                  {paper.uploadedBy && (
                    <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400">Uploaded by:</span>
                      <span className="font-semibold text-[#0b2a4a]">
                        {paper.uploadedBy.fullName}{' '}
                        {paper.uploadedBy.role === 'CONTENT_MANAGER' && (
                          <span className="text-[#cd7f32] font-bold">⭐ CR/GR</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {paper.files && paper.files[0] && (
                    <span>{(paper.files[0].fileSize / 1024 / 1024).toFixed(1)} MB</span>
                  )}
                </span>

                {paper.files && paper.files.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenPdf(paper)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <a
                      href={api.getFileDownloadUrl(paper.files[0].id)}
                      download
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0b2a4a] hover:bg-[#123a63] rounded-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                    {isStaff && (!isContentManager || paper.uploadedById === user?.id) && (
                      <button
                        onClick={() => handleDeletePaper(paper.id, paper.title)}
                        className="inline-flex items-center gap-1 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete past paper"
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

      {/* PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        resource={selectedPaper}
        file={selectedFile}
      />
    </div>
  );
};
