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
    <div className="space-y-12 pb-12">
      {/* Hero Section matching KIT CMS Deep Navy & Bronze Palette */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#061a30] via-[#0b2a4a] to-[#123a63] text-white overflow-hidden p-8 sm:p-14 lg:p-16 border border-white/10 shadow-xl">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white p-1.5 shadow-2xl border-2 border-white/40 overflow-hidden">
              <img
                src="/kit-logo.png"
                alt="Khanpur Institute of Technology"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#cd7f32] text-xs font-bold tracking-wide">
              <span>{settings.institutionName || 'Khanpur Institute of Technology'}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Everything You Need for Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cd7f32] to-[#dba175]">
              Academic Journey.
            </span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Access lecture notes, course materials, and university examination preparation archives in one unified institutional portal.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search course title, subject code, or past paper..."
                className="w-full pl-10 pr-28 py-3 bg-white text-slate-900 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#cd7f32] shadow-lg"
              />
              <button
                type="submit"
                className="absolute right-1.5 px-4 py-1.5 bg-[#cd7f32] hover:bg-[#ba6a25] text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Search
              </button>
            </div>
          </form>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#cd7f32] hover:bg-[#ba6a25] text-white font-bold text-xs sm:text-sm transition-all shadow-md"
            >
              <span>Explore Document Vault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm transition-all"
            >
              <span>Student Portal Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Institutional Highlights Grid */}
      <section className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#cd7f32]">
            INSTITUTIONAL CAPABILITIES
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0b2a4a]">
            Structured Specifically for KIT Academic Programs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#0b2a4a] text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0b2a4a] text-sm">Course Handouts & Lecture PDFs</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Topic-indexed lecture notes, slides, and class handouts organized by semester and subject code.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0b2a4a] text-sm">Solved & Unsolved Past Papers</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clear distinction between papers with verified solutions and unsolved papers for mock examination practice.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#123a63] text-white flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0b2a4a] text-sm">University Board Affiliations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Comprehensive categorization for University of the Punjab (PU) and other examination authorities.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#cd7f32] text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0b2a4a] text-sm">Integrated PDF Document Viewer</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Read, zoom, inspect, and safely download academic materials directly inside the platform on any device.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0b2a4a] text-sm">Student Request Desk</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Submit inquiries for missing lecture notes or specific examination papers with live status tracking.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#0b2a4a] text-sm">Centralized Faculty Administration</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Management interface for staff to configure programs, batches, subjects, uploads, and audit records.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
