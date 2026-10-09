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

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header & Academic Profile */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-600">
                Student Academic Workspace
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Access your enrolled subject materials, examination papers, and track submitted requests.
            </p>
          </div>

          {/* Academic Profile Details Pill */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 min-w-[280px]">
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Academic Enrollment</span>
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Program:</span>
                <span className="font-semibold">{user?.academicProgram?.name || 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Batch:</span>
                <span className="font-semibold">{user?.batch?.name || 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Semester:</span>
                <span className="font-semibold">{user?.semester?.name || 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Affiliation:</span>
                <span className="font-semibold">{user?.universityAffiliation?.shortCode || 'General'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/resources?type=LECTURE_NOTE"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600">
                Lecture Notes
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Course slides, PDF handouts & topics
              </p>
            </div>
          </Link>

          <Link
            to="/past-papers"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 group-hover:text-teal-600">
                Past Papers
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Midterm & final exam archives
              </p>
            </div>
          </Link>

          <Link
            to="/past-papers?solved=true"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-600">
                Solved Papers
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Verified answers & solution keys
              </p>
            </div>
          </Link>

          <Link
            to="/requests"
            className="p-5 bg-white rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all group flex items-start gap-4"
          >
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 group-hover:text-purple-600">
                Resource Requests
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Inquire or request missing notes
              </p>
            </div>
          </Link>
        </div>

        {/* Two-Column Section: Recent Uploads & My Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Resources (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recently Published Academic Resources
                </h2>
                <p className="text-xs text-slate-500">
                  Materials uploaded and approved by department administrators
                </p>
              </div>
              <Link
                to="/resources"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
                Loading academic resources...
              </div>
            ) : recentResources.length === 0 ? (
              <EmptyState
                title="No Academic Resources Published Yet"
                description="No resources available yet. Academic materials will appear here when published by an authorized administrator."
                icon="folder"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentResources.map((res) => (
                  <div
                    key={res.id}
                    className="p-5 bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary" size="sm">
                          {res.resourceType.replace(/_/g, ' ')}
                        </Badge>
                        {res.isSolved && (
                          <Badge variant="success" size="sm">
                            Solved
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 mb-1">
                        {res.title}
                      </h3>
                      {res.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                          {res.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 mb-4">
                        {res.subject && (
                          <span className="font-medium text-slate-700">
                            {res.subject.name} ({res.subject.code})
                          </span>
                        )}
                        {res.semester && <span>• {res.semester.name}</span>}
                        {res.examYear && <span>• Year {res.examYear}</span>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </span>
                      {res.files && res.files.length > 0 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenPdf(res)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={api.getFileDownloadUrl(res.files[0].id)}
                            download
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
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

          {/* Student Requests Tracking (1 Column) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  My Resource Inquiries
                </h2>
                <p className="text-xs text-slate-500">
                  Status of your submitted requests
                </p>
              </div>
              <Link
                to="/requests"
                className="text-xs font-semibold text-blue-600 hover:text-blue-500"
              >
                New Request
              </Link>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
                Loading inquiries...
              </div>
            ) : myRequests.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-center">
                <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-slate-800">No Inquiries Submitted</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Need a missing past paper or lecture handout? Submit a request to KIT faculty.
                </p>
                <Link
                  to="/requests"
                  className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-medium text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors"
                >
                  Submit Request
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                        {req.title}
                      </h4>
                      {getStatusBadge(req.status)}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {req.description}
                    </p>
                    {req.adminResponse && (
                      <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-800">
                        <span className="font-semibold">Faculty Response: </span>
                        {req.adminResponse}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
