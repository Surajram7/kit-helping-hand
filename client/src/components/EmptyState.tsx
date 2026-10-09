import React from 'react';
import { FolderOpen, FileText, HelpCircle, Layers } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'folder' | 'file' | 'request' | 'layers';
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Academic Resources Available',
  description = 'No resources available yet. Academic materials will appear here when published by an authorized administrator.',
  icon = 'folder',
  action,
}) => {
  const renderIcon = () => {
    const iconClass = 'w-10 h-10 text-slate-400 stroke-1';
    switch (icon) {
      case 'file':
        return <FileText className={iconClass} />;
      case 'request':
        return <HelpCircle className={iconClass} />;
      case 'layers':
        return <Layers className={iconClass} />;
      default:
        return <FolderOpen className={iconClass} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-sm my-6">
      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors shadow-sm"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
