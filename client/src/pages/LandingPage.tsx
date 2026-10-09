import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileCheck,
  Search,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Layers,
  HelpCircle,
  FileText,
  Clock,
  Sparkles,
  Building,
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const LandingPage: React.FC = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/resources?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white overflow-hidden py-20 lg:py-28 border-b border-navy-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-navy-700 text-blue-300 text-xs font-medium">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>{settings.institutionName} • Official Academic Repository</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Everything You Need for Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                Academic Journey.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal max-w-2xl mx-auto leading-relaxed">
              Access lecture notes, course materials, past papers, and examination preparation resources in one organized academic platform.
            </p>

            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by subject name, code, topic, or examination..."
                  className="w-full pl-12 pr-32 py-3.5 bg-navy-900/90 border border-navy-700/80 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/resources"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg"
              >
                <span>Explore Resources</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-semibold text-sm transition-all"
              >
                <span>Student Login</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Section */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-wider font-bold text-blue-600 mb-2">
              Institutional Features
            </h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Designed Specifically for KIT Academic Structure
            </h3>
            <p className="text-slate-600 text-sm mt-2">
              All materials organized according to official academic programs, admission batches, and university affiliations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">
                Organized Lecture Notes & PDFs
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Topic-by-topic lecture notes, slides, and class handouts indexed by subject code, semester, and batch.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">
                Solved & Unsolved Past Papers
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear distinction between solved papers with verified answer keys and unsolved papers for mock examination practice.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <Building className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">
                Multi-Affiliation Support
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full compatibility with diverse university affiliations including University of the Punjab (PU) and other boards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">
                Integrated PDF Viewer
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Read, zoom, inspect, and safely download academic materials directly inside the platform on any device.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">
                Student Request Desk
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submit inquiries for missing lecture notes or specific examination papers with live status tracking and feedback.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-1.5">
                Centralized Admin Control
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete administration panel for faculty to configure programs, batches, subjects, uploads, and audit records without code changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Value Section */}
      <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-semibold mb-4">
                <span>Institutional Value Proposition</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                Why Khanpur Institute of Technology Needs a Centralized Resource Platform
              </h3>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                In many institutions, study materials and past papers are scattered across unofficial messaging groups, broken drives, and physical copies. KIT Helping Hand establishes institutional order:
              </p>

              <div className="mt-6 space-y-3">
                {[
                  'Single authoritative source for course materials verified by department administrators.',
                  'Eliminates repeated manual sharing and lost links across admission batches.',
                  'Organizes university past papers by year, semester, and solved/unsolved status.',
                  'Provides students a formal desk to report missing materials and file concerns.',
                  'Enables management to monitor resource availability across all enrolled classes.',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-medium text-sm transition-colors shadow-sm"
                >
                  <span>Register as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <h4 className="font-semibold text-slate-900 text-sm">
                  Academic Hierarchy at KIT
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every document is strictly organized within the official academic hierarchy:
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">1. Institution:</span>
                  <span className="font-semibold text-slate-800">Khanpur Institute of Technology</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">2. Program:</span>
                  <span className="font-semibold text-slate-800">BSCS / BSIT / Associate Degree</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">3. Admission Batch:</span>
                  <span className="font-semibold text-slate-800">F24, Fall 2024, Spring...</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">4. Semester & Subject:</span>
                  <span className="font-semibold text-slate-800">Semester 1 - 8 / Course Code</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-between text-blue-900">
                  <span>5. Resource & Examination:</span>
                  <span className="font-semibold">Lecture PDF / Solved Past Paper</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
