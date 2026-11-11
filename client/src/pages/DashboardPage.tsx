import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FileCheck,
  FileText,
  HelpCircle,
  Clock,
  ArrowRight,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Layers,
  Sparkles,
  FolderOpen,
  Upload,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Resource, StudentRequest, ResourceFile } from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { PDFViewerModal } from '../components/PDFViewerModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [recentResources, setRecentResources] = useState<Resource[]>([]);
  const [myRequests, setMyRequests] = useState<StudentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // PDF Viewer Modal State
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedFile, setSelectedFile] = useState<ResourceFile | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [resResponse, reqResponse] = await Promise.all([
          api.getResources({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
          api.getMyRequests(),
        ]);
        setRecentResources(resResponse.data || []);
        setMyRequests(reqResponse || []);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleOpenPdf = (resource: Resource) => {
    if (resource.files && resource.files.length > 0) {
      setSelectedResource(resource);
      setSelectedFile(resource.files[0]);
      setViewerOpen(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="primary">In Progress</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="warning">Under Review</Badge>;
      case 'DECLINED':
        return <Badge variant="danger">Declined</Badge>;
      default:
        return <Badge variant="secondary">Submitted</Badge>;
    }
  };

  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="space-y-7 pb-8">
      {/* 1. Official KIT Helping Hand Identity Hero Panel */}
      <div className="dashboard-identity-panel">
        {/* Animated decorative tech orbits */}
        <div className="dashboard-tech-orbit orbit-one" aria-hidden="true" />
        <div className="dashboard-tech-orbit orbit-two" aria-hidden="true" />

        {/* Identity Main (Avatar + Welcome Copy) */}
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-[68px] h-[68px] sm:w-[78px] sm:h-[78px] shrink-0 rounded-2xl bg-gradient-to-br from-[#cd7f32] to-[#9d531d] flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl shadow-lg border-2 border-white/60">
            {userInitial}
          </div>
          <div className="min-w-0">
            <span className="text-[#cd7f32] text-[11px] sm:text-xs font-extrabold tracking-[0.14em] uppercase block">
              {user?.role === 'CONTENT_MANAGER'
                ? '⭐ CLASS REPRESENTATIVE (CR / GR) • CONTENT MANAGER'
                : user?.role === 'SUPER_ADMIN'
                ? '👑 INSTITUTIONAL SUPER ADMINISTRATOR'
                : user?.role === 'ADMIN'
                ? '🛡️ DEPARTMENT ADMINISTRATOR'
                : 'STUDENT ACADEMIC PORTAL'}
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1 truncate leading-tight">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-white/75 text-xs sm:text-sm mt-1 leading-normal line-clamp-2">
              {user?.role === 'CONTENT_MANAGER'
                ? 'As Class Representative (CR/GR), you have authorized access to upload lecture notes, handouts, and exam preparation material for your batch.'
                : 'Khanpur Institute of Technology academic resources, lecture notes, and examination preparation archives.'}
            </p>
          </div>
        </div>

        {/* Profile Grid Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
            <span className="block text-[10px] uppercase font-bold text-white/60 tracking-wider">Program</span>
            <strong className="block text-white text-xs sm:text-sm font-semibold truncate mt-0.5">
              {user?.academicProgram?.name || 'BS Computer Science'}
            </strong>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
            <span className="block text-[10px] uppercase font-bold text-white/60 tracking-wider">Student ID / Roll</span>
            <strong className="block text-white text-xs sm:text-sm font-semibold truncate mt-0.5">
              {user?.studentId || 'KIT-Student'}
            </strong>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
            <span className="block text-[10px] uppercase font-bold text-white/60 tracking-wider">Current Semester</span>
            <strong className="block text-white text-xs sm:text-sm font-semibold truncate mt-0.5">
              {user?.semester?.name || 'Semester 1'}
            </strong>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/15">
            <span className="block text-[10px] uppercase font-bold text-white/60 tracking-wider">Affiliation</span>
            <strong className="block text-white text-xs sm:text-sm font-semibold truncate mt-0.5">
              {user?.universityAffiliation?.shortCode || 'PU (Punjab Univ)'}
            </strong>
          </div>
        </div>
      </div>

      {/* CR / GR & Admin Quick Upload Callout Banner */}
      {(user?.role === 'CONTENT_MANAGER' || user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0b2a4a] to-[#123a63] border border-[#cd7f32]/40 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#cd7f32] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              ⭐
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {user?.role === 'CONTENT_MANAGER'
                  ? 'CR / GR Content Manager Authorization'
                  : 'Institutional Super Admin Repository Access'}
              </h4>
              <p className="text-xs text-white/70">
                You can upload new notes, PDFs, Word docs, and exam papers, or manage your class repository directly.
              </p>
            </div>
          </div>
          <Link
            to="/admin?tab=resources"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#cd7f32] hover:bg-[#ba6a25] text-white text-xs font-bold rounded-xl transition-all shadow-sm w-fit shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Notes / Papers</span>
          </Link>
        </div>
      )}

      {/* 2. Official KIT Helping Hand Frequent Actions Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs sm:text-sm font-bold text-[#0b2a4a] uppercase tracking-wider flex items-center gap-2">
            <span>Quick Academic Access</span>
          </h2>
          <span className="text-[11px] font-semibold text-[#cd7f32] bg-[#cd7f32]/10 px-2.5 py-0.5 rounded-full border border-[#cd7f32]/25">
            FREQUENT MODULES
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Action 1: Lecture Notes */}
          <Link
            to="/resources?type=LECTURE_NOTE"
            className="group p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-[#cd7f32] hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0b2a4a] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <strong className="block text-xs sm:text-sm font-bold text-[#0b2a4a] group-hover:text-[#cd7f32] transition-colors leading-tight">
                Lecture Notes
              </strong>
              <small className="block text-[10px] text-slate-500 mt-0.5">
                Slides & topic notes
              </small>
            </div>
          </Link>

          {/* Action 2: Solved Papers */}
          <Link
            to="/past-papers?solved=true"
            className="group p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-[#cd7f32] hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <strong className="block text-xs sm:text-sm font-bold text-[#0b2a4a] group-hover:text-[#cd7f32] transition-colors leading-tight">
                Solved Papers
              </strong>
              <small className="block text-[10px] text-slate-500 mt-0.5">
                With verified solutions
              </small>
            </div>
          </Link>

          {/* Action 3: Unsolved Papers */}
          <Link
            to="/past-papers?solved=false"
            className="group p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-[#cd7f32] hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#123a63] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <strong className="block text-xs sm:text-sm font-bold text-[#0b2a4a] group-hover:text-[#cd7f32] transition-colors leading-tight">
                Unsolved Papers
              </strong>
              <small className="block text-[10px] text-slate-500 mt-0.5">
                Practice past exams
              </small>
            </div>
          </Link>

          {/* Action 4: Document Vault */}
          <Link
            to="/resources"
            className="group p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-[#cd7f32] hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#cd7f32] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <strong className="block text-xs sm:text-sm font-bold text-[#0b2a4a] group-hover:text-[#cd7f32] transition-colors leading-tight">
                Document Vault
              </strong>
              <small className="block text-[10px] text-slate-500 mt-0.5">
                Search all course PDFs
              </small>
            </div>
          </Link>

          {/* Action 5: Request Desk */}
          <Link
            to="/requests"
            className="group p-3.5 sm:p-4 bg-white rounded-xl border border-slate-200 hover:border-[#cd7f32] hover:shadow-md transition-all flex flex-col justify-between min-h-[110px] col-span-2 sm:col-span-1"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-700 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="mt-2">
              <strong className="block text-xs sm:text-sm font-bold text-[#0b2a4a] group-hover:text-[#cd7f32] transition-colors leading-tight">
                Request Desk
              </strong>
              <small className="block text-[10px] text-slate-500 mt-0.5">
                Inquire missing papers
              </small>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Main Two-Column View: Live Academic Documents & Inquiry Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Published Resources (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0b2a4a]">
                Recently Published Academic Materials
              </h2>
              <p className="text-xs text-slate-500">
                Official documents verified and uploaded by KIT department coordinators
              </p>
            </div>
            <Link
              to="/resources"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#cd7f32] hover:text-[#ba6a25] transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading academic repository...
            </div>
          ) : recentResources.length === 0 ? (
            <EmptyState
              title="No Academic Materials Published Yet"
              description="No resources available yet. Academic materials will appear here when published by an authorized administrator."
              icon="folder"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentResources.map((res) => (
                <div
                  key={res.id}
                  className="p-4 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
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

                    <h3 className="text-xs sm:text-sm font-bold text-[#0b2a4a] line-clamp-1 mb-1">
                      {res.title}
                    </h3>

                    {res.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                        {res.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {res.subject && (
                        <span className="font-semibold text-slate-800">
                          {res.subject.name} ({res.subject.code})
                        </span>
                      )}
                      {res.semester && <span>• {res.semester.name}</span>}
                      {res.examYear && <span>• Year {res.examYear}</span>}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {new Date(res.createdAt).toLocaleDateString()}
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
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Student Inquiries & Status Desk (1 Column) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0b2a4a]">
                My Resource Inquiries
              </h2>
              <p className="text-xs text-slate-500">
                Live status of your submitted requests
              </p>
            </div>
            <Link
              to="/requests"
              className="text-xs font-bold text-[#cd7f32] hover:text-[#ba6a25] transition-colors"
            >
              + Inquire
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
              Loading requests...
            </div>
          ) : myRequests.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0b2a4a]">No Open Inquiries</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Need a missing lecture note or past exam paper? Inquire directly with faculty.
                </p>
              </div>
              <Link
                to="/requests"
                className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold text-white bg-[#0b2a4a] hover:bg-[#123a63] rounded-lg transition-colors"
              >
                Submit Inquiries
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myRequests.slice(0, 4).map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#0b2a4a] leading-tight">
                      {req.title}
                    </h4>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {req.description}
                  </p>
                  {req.adminResponse && (
                    <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-900 mt-1">
                      <span className="font-bold">Faculty: </span>
                      {req.adminResponse}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 pt-1">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Integrated PDF Viewer Modal */}
      <PDFViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        resource={selectedResource}
        file={selectedFile}
      />
    </div>
  );
};
