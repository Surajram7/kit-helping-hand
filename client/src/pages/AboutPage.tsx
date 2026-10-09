import React from 'react';
import { GraduationCap, ShieldCheck, BookOpen, Layers, CheckCircle2, Mail, Server } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            <span>Khanpur Institute of Technology (KIT), Pakistan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About {settings.platformName}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {settings.tagline} A secure, production-grade centralized academic repository engineered to organize course handouts, lecture slides, and affiliated examination archives.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Official Institutional Identity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Materials published exclusively by authorized department coordinators, eliminating unverified and broken files.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Normalized Academic Hierarchy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Program → Admission Batch → Semester → Subject → Resource Type ensures precise, predictable document discovery.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Enterprise Data Security</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Role-based access controls (RBAC), private document storage, sanitized uploads, and comprehensive administrative audit trails.
            </p>
          </div>
        </div>

        {/* Academic Affiliations */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            University Affiliations & Examination Systems
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Recognizing that Khanpur Institute of Technology conducts examinations affiliated with established degree-granting bodies such as University of the Punjab (PU) and other regional boards, the platform provides dedicated classification for:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {[
              'University of the Punjab (PU) affiliated examinations',
              'University of Engineering & Technology (UET) syllabus papers',
              'Solved past papers with verified solutions',
              'Unsolved papers for timed exam rehearsals',
              'Midterm assessments and mock examination tests',
              'ELADE preparation and foundational evaluations',
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Governance Policy */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Institutional Privacy & Terms Policy
          </h2>
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <p>
              <strong>Data Privacy:</strong> Student account records are used solely to deliver personalized academic resource filtering and request tracking. No personal student records or browsing behaviors are exposed publicly or commercialized.
            </p>
            <p>
              <strong>Academic Integrity:</strong> Materials uploaded are intended for authorized academic assistance and revision. All uploaded documents are moderated by faculty administrators.
            </p>
            <p>
              <strong>Administration Inquiries:</strong> For inquiries regarding academic curriculum, please contact the department at{' '}
              <a href={`mailto:${settings.contactEmail}`} className="text-blue-600 font-mono">
                {settings.contactEmail || 'academics@kit.edu.pk'}
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
