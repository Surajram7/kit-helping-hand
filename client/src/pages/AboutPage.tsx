import React from 'react';
import { GraduationCap, ShieldCheck, BookOpen, Layers, CheckCircle2, Mail, Server } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { BackButton } from '../components/BackButton';

export const AboutPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="space-y-4 pb-12 max-w-4xl mx-auto">
      {/* CMS Standard Back Button */}
      <div>
        <BackButton />
      </div>

      {/* Title */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-white p-1 flex items-center justify-center shadow-md border-2 border-slate-200 shrink-0 overflow-hidden">
          <img
            src="/kit-logo.png"
            alt="Khanpur Institute of Technology"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cd7f32]/10 border border-[#cd7f32]/25 text-[#cd7f32] text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-[#cd7f32]" />
            <span>Khanpur Institute of Technology (KIT), Pakistan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2a4a] tracking-tight">
            About {settings.platformName || 'KIT Helping Hand'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {settings.tagline} Centralized institutional repository designed to organize coursework, lecture slides, and university examination archives across all admission batches and degree affiliations.
          </p>
        </div>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[#0b2a4a] text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#0b2a4a] text-sm">Official Institutional Identity</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Materials published exclusively by authorized department coordinators, eliminating unverified and broken files.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[#123a63] text-white flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#0b2a4a] text-sm">Normalized Academic Hierarchy</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Program → Admission Batch → Semester → Subject → Resource Type ensures precise, predictable document discovery.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-[#cd7f32] text-white flex items-center justify-center">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#0b2a4a] text-sm">Enterprise Data Security</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Role-based access controls (RBAC), private document storage, sanitized uploads, and comprehensive administrative audit trails.
          </p>
        </div>
      </div>

      {/* Academic Affiliations */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-base sm:text-lg font-bold text-[#0b2a4a]">
          University Affiliations & Examination Systems
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Recognizing that Khanpur Institute of Technology conducts examinations affiliated with established degree-granting bodies such as University of the Punjab (PU) and other regional boards, the platform provides dedicated classification for:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
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

      {/* Privacy Policy */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs text-slate-600 leading-relaxed">
        <h2 className="text-base sm:text-lg font-bold text-[#0b2a4a]">
          Institutional Privacy & Terms
        </h2>
        <p>
          <strong>Data Privacy:</strong> Student account records are used solely to deliver personalized academic resource filtering and request tracking. No personal student records or browsing behaviors are exposed publicly or commercialized.
        </p>
        <p>
          <strong>Official Contact:</strong> For inquiries regarding academic curriculum, please contact the department at{' '}
          <a href={`mailto:${settings.contactEmail}`} className="text-[#cd7f32] font-semibold">
            {settings.contactEmail || 'academics@kit.edu.pk'}
          </a>.
        </p>
      </div>
    </div>
  );
};
