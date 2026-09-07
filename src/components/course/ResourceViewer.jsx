import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

export default function ResourceViewer({ isOpen, onClose, resource }) {
  const [loading, setLoading] = useState(true);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Load PDF.js dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (viewerRef.current && resource?.url) {
          renderPDF(resource.url);
        }
      };

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen, resource?.url]);

  const renderPDF = async (url) => {
    try {
      const pdfjsLib = window.pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      
      const container = viewerRef.current;
      container.innerHTML = '';

      // Render all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.marginBottom = '10px';
        canvas.style.border = '1px solid #e2e8f0';
        canvas.style.borderRadius = '4px';

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        container.appendChild(canvas);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error rendering PDF:', error);
      setLoading(false);
    }
  };

  if (!isOpen || !resource) return null;

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
              PDF
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
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div ref={viewerRef} className="max-w-4xl mx-auto" />
        </div>
      </div>
    </div>
  );
}