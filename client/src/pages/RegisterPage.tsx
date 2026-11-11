import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, AlertCircle, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { api } from '../services/api';
import { AcademicProgram, Semester, UniversityAffiliation, Batch } from '../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [affiliations, setAffiliations] = useState<UniversityAffiliation[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    academicProgramId: '',
    batchId: '',
    semesterId: '',
    universityAffiliationId: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await api.getHierarchy();
        setPrograms(res.programs || []);
        setSemesters(res.semesters || []);
        setAffiliations(res.affiliations || []);
      } catch (err) {
        console.error('Failed to load academic options', err);
      }
    };
    fetchHierarchy();
  }, []);

  useEffect(() => {
    if (formData.academicProgramId) {
      const selectedProg = programs.find((p) => p.id === formData.academicProgramId);
      setBatches(selectedProg?.batches || []);
    } else {
      setBatches([]);
    }
  }, [formData.academicProgramId, programs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        studentId: formData.studentId.trim() || undefined,
        academicProgramId: formData.academicProgramId || undefined,
        batchId: formData.batchId || undefined,
        semesterId: formData.semesterId || undefined,
        universityAffiliationId: formData.universityAffiliationId || undefined,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-white p-1 flex items-center justify-center shadow-md border-2 border-slate-200 mb-3 overflow-hidden">
            <img
              src="/kit-logo.png"
              alt="Khanpur Institute of Technology"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b2a4a] tracking-tight">
            Student Account Registration
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register once to access lecture notes, course materials, and university past papers
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Student Name"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Student Email *
              </label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@kit.edu.pk"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              />
            </div>
          </div>

          {/* Student ID / Roll Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Roll Number / Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g. KIT-BSCS-F24-001"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
            />
          </div>

          {/* Academic Hierarchy Associations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Academic Program
              </label>
              <select
                name="academicProgramId"
                value={formData.academicProgramId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              >
                <option value="">Select Academic Program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admission Batch
              </label>
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                disabled={!formData.academicProgramId || batches.length === 0}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white disabled:opacity-50"
              >
                <option value="">
                  {batches.length === 0 ? 'Select Program First' : 'Select Batch'}
                </option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Semester
              </label>
              <select
                name="semesterId"
                value={formData.semesterId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                University Affiliation
              </label>
              <select
                name="universityAffiliationId"
                value={formData.universityAffiliationId}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              >
                <option value="">Select Affiliation</option>
                {affiliations.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.shortCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold text-white bg-[#cd7f32] hover:bg-[#ba6a25] transition-colors shadow-sm disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <Link to="/login" className="font-bold text-[#cd7f32] hover:text-[#ba6a25]">
            Sign in to your account
          </Link>
        </div>
      </div>
    </div>
  );
};
