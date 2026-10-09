import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, Maximize2, Minimize2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Resource, ResourceFile } from '../types';
import { api } from '../services/api';
import { Badge } from './Badge';

interface PDFViewerModalProps {
  resource: Resource | null;
  file: ResourceFile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  resource,
  file,
  isOpen,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!isOpen || !resource || !file) return null;

  const viewUrl = api.getFileViewUrl(file.id);
  const downloadUrl = api.getFileDownloadUrl(file.id);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleZoomReset = () => setZoom(100);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className={`bg-white rounded-xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[90vh]'
        }`}
      >
        {/* Header Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-slate-800 rounded-lg text-blue-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm sm:text-base truncate text-slate-100">
                  {resource.title}
                </h3>
                {resource.isSolved && (
                  <Badge variant="success" size="sm" className="shrink-0 bg-emerald-900/60 text-emerald-300 border-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Solved
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate flex items-center gap-2 mt-0.5">
                <span>{file.fileName}</span>
                <span>•</span>
                <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                {resource.subject && (
                  <>
                    <span>•</span>
                    <span>{resource.subject.name} ({resource.subject.code})</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-slate-200">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="p-1.5 hover:text-white disabled:opacity-40 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-2 text-xs font-mono font-medium hover:text-white transition-colors"
                title="Reset Zoom"
              >
                {zoom}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="p-1.5 hover:text-white disabled:opacity-40 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Download Button */}
            <a
              href={downloadUrl}
              download={file.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div className="relative flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-2 sm:p-4">
          <div
            className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden flex flex-col transition-all duration-150"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          >
            <iframe
              src={viewUrl}
              title={file.fileName}
              className="w-full h-full border-0"
            />
          </div>
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span>Khanpur Institute of Technology Academic Document Vault</span>
            {resource.lectureNumber && <span>• {resource.lectureNumber}</span>}
            {resource.topic && <span>• Topic: {resource.topic}</span>}
          </div>
          <div>
            <span>Viewing in secure institutional mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};
