import React, { useState, useEffect } from 'react';
import { User as UserIcon, Lock, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { AcademicProgram, Semester, UniversityAffiliation, Batch } from '../types';
import { Badge } from '../components/Badge';
import { BackButton } from '../components/BackButton';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [programs, setPrograms] = useState<AcademicProgram[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [affiliations, setAffiliations] = useState<UniversityAffiliation[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [studentId, setStudentId] = useState(user?.studentId || '');
  const [academicProgramId, setAcademicProgramId] = useState(user?.academicProgramId || '');
  const [batchId, setBatchId] = useState(user?.batchId || '');
  const [semesterId, setSemesterId] = useState(user?.semesterId || '');
  const [universityAffiliationId, setUniversityAffiliationId] = useState(user?.universityAffiliationId || '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const res = await api.getHierarchy();
        setPrograms(res.programs || []);
        setSemesters(res.semesters || []);
        setAffiliations(res.affiliations || []);
      } catch (err) {
        console.error('Failed to load hierarchy', err);
      }
    };
    loadHierarchy();
  }, []);

  useEffect(() => {
    if (academicProgramId) {
      const selectedProg = programs.find((p) => p.id === academicProgramId);
      setBatches(selectedProg?.batches || []);
    } else {
      setBatches([]);
    }
  }, [academicProgramId, programs]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    try {
      await api.updateProfile({
        fullName,
        studentId: studentId || null,
        academicProgramId: academicProgramId || null,
        batchId: batchId || null,
        semesterId: semesterId || null,
        universityAffiliationId: universityAffiliationId || null,
      });
      await refreshUser();
      setProfileSuccess('Academic profile details updated successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password.');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <BackButton className="mb-3" />
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2a4a] tracking-tight">
          Academic Profile & Account Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal academic associations, enrollment records, and account security
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#cd7f32] to-[#9d531d] text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-[#0b2a4a] text-base">{user?.fullName}</h3>
              <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#cd7f32] bg-[#cd7f32]/10 px-2.5 py-1 rounded-full border border-[#cd7f32]/25">
            {user?.role}
          </span>
        </div>

        {profileSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Roll Number / Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. KIT-BSCS-F24-001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Academic Program
              </label>
              <select
                value={academicProgramId}
                onChange={(e) => setAcademicProgramId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              >
                <option value="">Select Program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Admission Batch
              </label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
              >
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Semester
              </label>
              <select
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
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
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                University Affiliation
              </label>
              <select
                value={universityAffiliationId}
                onChange={(e) => setUniversityAffiliationId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
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

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0b2a4a] hover:bg-[#123a63] text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            Save Profile Changes
          </button>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-[#0b2a4a] text-sm">Account Password Security</h3>
          <p className="text-xs text-slate-500">Update your account authentication password</p>
        </div>

        {passwordSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-[#cd7f32] focus:border-[#cd7f32] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#cd7f32] hover:bg-[#ba6a25] text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
};
