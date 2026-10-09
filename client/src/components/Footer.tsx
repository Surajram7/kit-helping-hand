import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Mail, BookOpen, ExternalLink } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-800/80 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Institutional Identity */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                KIT
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-tight">
                  {settings.platformName}
                </span>
                <p className="text-[11px] text-slate-300">
                  {settings.institutionName}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {settings.tagline} Centralized university academic resource management system for students and faculty.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Institutional Resource Portal</span>
            </div>
          </div>

          {/* Col 2: Academic Modules */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Academic Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/resources" className="hover:text-white transition-colors">
                  Subject Materials & Notes
                </Link>
              </li>
              <li>
                <Link to="/resources?type=LECTURE_NOTE" className="hover:text-white transition-colors">
                  Lecture PDFs & Handouts
                </Link>
              </li>
              <li>
                <Link to="/past-papers" className="hover:text-white transition-colors">
                  All Examination Papers
                </Link>
              </li>
              <li>
                <Link to="/past-papers?solved=true" className="hover:text-white transition-colors">
                  Verified Solved Papers
                </Link>
              </li>
              <li>
                <Link to="/past-papers?solved=false" className="hover:text-white transition-colors">
                  Unsolved Practice Papers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Services */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Student Desk
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/requests" className="hover:text-white transition-colors">
                  Resource Request Desk
                </Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-white transition-colors">
                  Missing Notes & Paper Inquiries
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Platform Documentation
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Personalized Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional & Help */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Administration & Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <span className="block text-slate-400">Official Contact:</span>
                <span className="text-white font-mono text-xs">{settings.contactEmail || 'academics@kit.edu.pk'}</span>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Authorized Faculty Login
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Privacy Policy & Data Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-navy-800 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()} {settings.institutionName} (KIT). All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-slate-300 transition-colors">
              Terms of Use
            </Link>
            <Link to="/about" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="hover:text-slate-300 transition-colors">
              Help & Verification
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
