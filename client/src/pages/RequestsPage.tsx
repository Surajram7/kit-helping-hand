import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  PlusCircle,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { StudentRequest, Semester, Subject, UniversityAffiliation } from '../types';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';

export const RequestsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
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
      // switch to history tab
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Student Inquiries & Missing Materials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Academic Resource Request Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Need a missing lecture PDF, specific past paper, or have feedback for KIT administration?
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'submit'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New Request</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-sm font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Inquiries & Responses</span>
          </button>
        </div>

        {/* Content Tab 1: Submit Request Form */}
        {activeTab === 'submit' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            {!isAuthenticated ? (
              <div className="text-center py-8 space-y-3">
                <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">
                  Authentication Required
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You must be signed in with your registered student account to submit resource requests and track responses.
                </p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    Student Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                {successMessage && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Request Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Missing Lecture 07 slides for Operating Systems"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Category & Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Inquiry Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      <option value="LECTURE_NOTE">Missing Lecture Note / Handout</option>
                      <option value="PAST_PAPER">Past Examination Paper Request</option>
                      <option value="RESOURCE_CATEGORY_SUGGESTION">Suggest New Category</option>
                      <option value="FILE_ISSUE_REPORT">Report Damaged / Incorrect File</option>
                      <option value="GENERAL_FEEDBACK">General Academic Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Relevant Semester
                    </label>
                    <select
                      value={semesterId}
                      onChange={(e) => {
                        setSemesterId(e.target.value);
                        setSubjectId('');
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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

                {/* Subject & Affiliation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Relevant Subject
                    </label>
                    <select
                      value={subjectId}
                      onChange={(e) => setSubjectId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      University Affiliation (For Past Papers)
                    </label>
                    <select
                      value={affiliationId}
                      onChange={(e) => setAffiliationId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Detailed Explanation *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide specific course code, topic name, examination year, or details so faculty can promptly locate the resource..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Content Tab 2: My Inquiries & Responses */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {!isAuthenticated ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-500 mb-3">
                  Please log in to inspect your submitted academic requests.
                </p>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Student Login
                </Link>
              </div>
            ) : isLoadingRequests ? (
              <div className="bg-white p-12 text-center text-sm text-slate-500 rounded-2xl border border-slate-200">
                Loading inquiries...
              </div>
            ) : requests.length === 0 ? (
              <EmptyState
                title="No Inquiries Submitted"
                description="You have not submitted any academic resource requests yet. Use the 'Submit New Request' tab whenever you need missing materials."
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
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                          {req.category.replace(/_/g, ' ')}
                        </span>
                        {getStatusBadge(req.status)}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{req.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400">
                      Submitted on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {req.description}
                  </p>

                  {/* Faculty Response Banner */}
                  {req.adminResponse && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Official Faculty Response</span>
                      </div>
                      <p className="text-xs text-blue-800 leading-relaxed">{req.adminResponse}</p>
                    </div>
                  )}

                  {/* Follow-up comments thread */}
                  <div className="pt-2 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Follow-up Discussion ({req.comments?.length || 0})
                    </h4>

                    {req.comments && req.comments.length > 0 && (
                      <div className="space-y-2">
                        {req.comments.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-800">
                              <span className="flex items-center gap-1.5">
                                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                {c.user.fullName} ({c.user.role})
                              </span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-slate-600">{c.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add comment input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInputs[req.id] || ''}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [req.id]: e.target.value }))
                        }
                        placeholder="Add a comment or follow-up note..."
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                      />
                      <button
                        onClick={() => handleAddComment(req.id)}
                        className="px-3 py-1.5 bg-navy-900 text-white rounded-lg text-xs font-semibold hover:bg-navy-800 transition-colors"
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
    </div>
  );
};
