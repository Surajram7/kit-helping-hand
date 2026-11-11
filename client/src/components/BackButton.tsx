import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  fallbackPath,
  className = '',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath || (isAuthenticated ? '/dashboard' : '/'));
    }
  };

  return (
    <button
      onClick={handleBack}
      type="button"
      className={`px-3 py-1 text-xs sm:text-sm font-normal text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 rounded shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-slate-400 ${className}`}
      title="Go back to previous screen"
    >
      <span>{label}</span>
    </button>
  );
};
