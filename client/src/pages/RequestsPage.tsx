import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  PlusCircle,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { StudentRequest, Semester, Subject, UniversityAffiliation } from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { BackButton } from '../components/BackButton';

export const RequestsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'submit' | 'history'>(
    searchParams.get('tab') === 'history' ? 'history' : 'submit'
  );
  const [requests, setRequests] = useState<StudentRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Form options
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [affiliations, setAffiliations] = useState<UniversityAffiliation[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('LECTURE_NOTE');
  const [description, setDescription] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [affiliationId, setAffiliationId] = useState('');

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const res = await api.getHierarchy();
        setSemesters(res.semesters || []);
        setAffiliations(res.affiliations || []);
      } catch (err) {
        console.error('Failed to load hierarchy', err);
      }
    };
    loadHierarchy();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await api.getSubjects({ semesterId: semesterId || undefined });
        setSubjects(data);
      } catch (err) {
        console.error('Failed to load subjects', err);
      }
    };
    loadSubjects();
  }, [semesterId]);

  const fetchMyRequests = async () => {
    if (!isAuthenticated) return;
    setIsLoadingRequests(true);
    try {
      const data = await api.getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching my requests', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyRequests();
    }
  }, [activeTab, isAuthenticated]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.createRequest({
        title,
        category,
        description,
        semesterId: semesterId || undefined,
        subjectId: subjectId || undefined,
        universityAffiliationId: affiliationId || undefined,
      });

      setSuccessMessage('Your request has been officially recorded and submitted to faculty.');
      setTitle('');
      setDescription('');
      setSemesterId('');
      setSubjectId('');
      setAffiliationId('');
      setTimeout(() => {
        setActiveTab('history');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (requestId: string) => {
    const comment = commentInputs[requestId]?.trim();
    if (!comment) return;

    try {
      await api.addRequestComment(requestId, comment);
      setCommentInputs((prev) => ({ ...prev, [requestId]: '' }));
      fetchMyRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to post comment.');
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
    <div className="space-y-4 pb-8 max-w-4xl mx-auto">
      {/* CMS Standard Back Button */}
      <div>
        <BackButton />
      </div>

      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200/90 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2a4a] tracking-tight">
          Academic Resource Inquiries
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Request missing lecture notes, past exam papers, or report document issues directly to department coordinators
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('submit')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === 'submit'
              ? 'border-[#cd7f32] text-[#cd7f32]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Inquiry</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold transition-colors border-b-2 -mb-px flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-[#cd7f32] text-[#cd7f32]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>My Inquiries & Responses</span>
        </button>
      </div>

      {/* Tab 1: Submit Inquiry */}
      {activeTab === 'submit' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
          {!isAuthenticated ? (
            <div className="text-center py-8 space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="text-sm font-bold text-[#0b2a4a]">Authentication Required</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Sign in with your registered student account to submit requests and track faculty responses.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 bg-[#cd7f32] hover:bg-[#ba6a25] text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Student Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              {successMessage && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Inquiry Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Missing Lecture 05 CPU Scheduling notes"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
                  >
                    <option value="LECTURE_NOTE">Missing Lecture Note / Handout</option>
                    <option value="PAST_PAPER">Past Examination Paper Request</option>
                    <option value="RESOURCE_CATEGORY_SUGGESTION">Suggest New Category</option>
                    <option value="FILE_ISSUE_REPORT">Report Damaged / Incorrect File</option>
                    <option value="GENERAL_FEEDBACK">General Academic Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={semesterId}
                    onChange={(e) => {
                      setSemesterId(e.target.value);
                      setSubjectId('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
                  >
                    <option value="">Select Semester (Optional)</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
                  >
                    <option value="">Select Subject (Optional)</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Affiliation (For Past Papers)
                  </label>
                  <select
                    value={affiliationId}
                    onChange={(e) => setAffiliationId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
                  >
                    <option value="">Select Affiliation (Optional)</option>
                    {affiliations.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.shortCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Explanation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide course details, topic name, examination year, or details so faculty can promptly locate the document..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#0b2a4a] hover:bg-[#123a63] transition-colors shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 2: My Inquiries & Responses */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {!isAuthenticated ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-2">Please sign in to view your inquiries.</p>
              <Link to="/login" className="px-3.5 py-1.5 bg-[#cd7f32] text-white rounded-lg text-xs font-bold">
                Sign In
              </Link>
            </div>
          ) : isLoadingRequests ? (
            <div className="bg-white p-8 text-center text-xs text-slate-500 rounded-2xl border border-slate-200">
              Loading inquiries...
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              title="No Inquiries Submitted"
              description="You have not submitted any academic resource requests yet. Use the 'Submit Inquiry' tab whenever you need missing materials."
              icon="request"
              action={{
                label: 'Submit First Request',
                onClick: () => setActiveTab('submit'),
              }}
            />
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-[#0b2a4a] rounded">
                        {req.category.replace(/_/g, ' ')}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <h3 className="text-sm font-bold text-[#0b2a4a] mt-1">{req.title}</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {req.description}
                </p>

                {req.adminResponse && (
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-0.5">
                    <span className="text-xs font-bold text-blue-900 block">Faculty Response</span>
                    <p className="text-xs text-blue-800 leading-relaxed">{req.adminResponse}</p>
                  </div>
                )}

                {/* Follow-up comments */}
                <div className="pt-1 space-y-2 text-xs">
                  {req.comments && req.comments.length > 0 && (
                    <div className="space-y-1.5">
                      {req.comments.map((c) => (
                        <div key={c.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                            <span>{c.user.fullName} ({c.user.role})</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 text-xs">{c.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentInputs[req.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      placeholder="Add follow-up note..."
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:bg-white"
                    />
                    <button
                      onClick={() => handleAddComment(req.id)}
                      className="px-3 py-1.5 bg-[#0b2a4a] text-white rounded-lg text-xs font-bold hover:bg-[#123a63] transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
