import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Resource, ResourceFile, UniversityAffiliation, AcademicProgram, Semester, Subject } from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { PDFViewerModal } from '../components/PDFViewerModal';

export const PastPapersPage: React.FC = () => {
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

  useEffect(() => {
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

    fetchPapers();
  }, [affiliationId, programId, semesterId, subjectId, examType, examYear, solvedFilter, search]);

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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-2">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Examination Preparation Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Past Papers & Examination Archives
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Verified examination papers across University of the Punjab (PU), UET, and KIT faculties
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

        {/* Paper Statistics & Category Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setSolvedFilter('')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              solvedFilter === ''
                ? 'bg-navy-950 text-white border-navy-900 shadow-md'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                All Examination Papers
              </span>
              <Building className="w-4 h-4 opacity-70" />
            </div>
            <div className="text-2xl font-bold">{counts.total}</div>
            <p className="text-[11px] opacity-70 mt-1">Total published examination papers</p>
          </div>

          <div
            onClick={() => setSolvedFilter('true')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              solvedFilter === 'true'
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
                : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-500">
                Solved Papers
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-900">{counts.solved}</div>
            <p className="text-[11px] text-slate-500 mt-1">With supplied solution or verified answer key</p>
          </div>

          <div
            onClick={() => setSolvedFilter('false')}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              solvedFilter === 'false'
                ? 'bg-slate-800 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                Unsolved Practice Papers
              </span>
              <AlertCircle className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{counts.unsolved}</div>
            <p className="text-[11px] text-slate-500 mt-1">Raw examination papers for revision practice</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search paper by course title, code, year, or university..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* University Affiliation */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">University Affiliation</label>
              <select
                value={affiliationId}
                onChange={(e) => setAffiliationId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Affiliations (PU / UET / KIT)</option>
                {affiliations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Program */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">Academic Program</label>
              <select
                value={programId}
                onChange={(e) => {
                  setProgramId(e.target.value);
                  setSubjectId('');
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
                onChange={(e) => setSubjectId(e.target.value)}
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

            {/* Exam Type */}
            <div>
              <label className="block text-slate-600 font-medium mb-1">Examination Type</label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="MIDTERM">Midterm Exam</option>
                <option value="FINAL_TERM">Final-Term Exam</option>
                <option value="MOCK">Mock Examination</option>
                <option value="PREVIOUS_EXAM">Previous Examination</option>
                <option value="ELADE">ELADE Assessment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Papers Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
            Filtering examination papers...
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((paper) => (
              <div
                key={paper.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                      {paper.examType ? paper.examType.replace(/_/g, ' ') : 'EXAM PAPER'}
                    </span>
                    {paper.isSolved ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solved Solution
                      </Badge>
                    ) : (
                      <Badge variant="secondary" size="sm">
                        Unsolved Paper
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-2">
                    {paper.title}
                  </h3>

                  {paper.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                      {paper.description}
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {paper.universityAffiliation && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Affiliation:</span>
                        <span className="font-semibold text-blue-700">
                          {paper.universityAffiliation.name}
                        </span>
                      </div>
                    )}
                    {paper.subject && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subject:</span>
                        <span className="font-medium text-slate-800">
                          {paper.subject.name} ({paper.subject.code})
                        </span>
                      </div>
                    )}
                    {paper.semester && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Semester:</span>
                        <span className="font-medium text-slate-800">{paper.semester.name}</span>
                      </div>
                    )}
                    {paper.examYear && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Year / Session:</span>
                        <span className="font-medium text-slate-800">
                          {paper.examYear} {paper.examSession ? `(${paper.examSession})` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-400">
                    {paper.files && paper.files[0] && (
                      <span>{(paper.files[0].fileSize / 1024 / 1024).toFixed(1)} MB</span>
                    )}
                  </div>

                  {paper.files && paper.files.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPdf(paper)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <a
                        href={api.getFileDownloadUrl(paper.files[0].id)}
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
      </div>

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
