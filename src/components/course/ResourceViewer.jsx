import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, FileText, Presentation } from 'lucide-react';

export default function ResourceViewer({ isOpen, onClose, resource }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
    }
  }, [isOpen, resource?.url]);

  if (!isOpen || !resource) return null;

  const getFileExtension = (url) => {
    if (!url) return '';
    const cleanUrl = url.split('?')[0];
    const parts = cleanUrl.split('.');
    return parts[parts.length - 1].toLowerCase();
  };

  const getResourceType = () => {
    const type = resource.type?.toLowerCase();
    const url = resource.url || '';
    const ext = getFileExtension(url);

    if (type === 'pdf' || ext === 'pdf') return 'pdf';
    if (type === 'video' || ['mp4', 'webm', 'ogg'].includes(ext)) return 'video';
    if (type === 'image' || ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
    if (type === 'ppt' || type === 'pptx' || ['ppt', 'pptx', 'pps', 'ppsx'].includes(ext)) return 'ppt';
    return 'other';
  };

  const resourceType = getResourceType();

  const renderContent = () => {
    switch (resourceType) {
      case 'pdf':
        return (
          <iframe
            src={resource.url}
            className="w-full h-full"
            title={resource.title || 'PDF Viewer'}
            onLoad={() => setLoading(false)}
          />
        );

      case 'video':
        return (
          <video
            controls
            className="w-full h-full"
            src={resource.url}
            onLoadedData={() => setLoading(false)}
          >
            Your browser does not support the video tag.
          </video>
        );

      case 'image':
        return (
          <div className="flex items-center justify-center h-full bg-slate-50">
            <img
              src={resource.url}
              alt={resource.title || 'Resource Image'}
              className="max-w-full max-h-full object-contain"
              onLoad={() => setLoading(false)}
            />
          </div>
        );

      case 'ppt':
        return (
          <div className="w-full h-full bg-slate-50 p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto h-full overflow-auto">
              <div className="flex items-center justify-center h-full flex-col">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Presentation className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  PowerPoint Presentation
                </h3>
                <p className="text-sm text-slate-500 mb-4 text-center">
                  {resource.title || 'This is a PowerPoint presentation file.'}
                </p>

                {/* Google Docs Viewer for PPT */}
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resource.url)}`}
                  className="w-full flex-1 min-h-[500px] border border-slate-200 rounded-lg"
                  title="PowerPoint Viewer"
                  onLoad={() => setLoading(false)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full bg-slate-50">
            <FileText className="w-16 h-16 text-slate-400 mb-4" />
            <p className="text-sm text-slate-600 mb-4">
              This file type cannot be previewed directly.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[95%] max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {resource.title || 'Resource Viewer'}
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-600 uppercase">
              {resourceType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {renderContent()}
        </div>
      </div>
    </div>
  );
}