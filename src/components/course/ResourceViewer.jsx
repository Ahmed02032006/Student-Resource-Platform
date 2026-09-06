import React, { useEffect } from 'react';
import { 
  X, 
  FileText, 
  Video, 
  Image as ImageIcon, 
  File, 
  ShieldCheck
} from 'lucide-react';

export default function ResourceViewer({ isOpen, onClose, resource }) {
  if (!isOpen || !resource) return null;

  const isPdf = resource.type === 'pdf';
  const isVideo = resource.type === 'video';
  const isImage = resource.type === 'image';
  const isNote = resource.type === 'note';

  // Prevent right-click context menu
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Prevent dragging
  const handleDragStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // Prevent keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent Ctrl+S, Ctrl+P, Ctrl+Shift+I, F12, Ctrl+U
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleContextMenuGlobal = (e) => {
      // Check if right-click is within the modal
      const modal = document.querySelector('[data-resource-viewer="true"]');
      if (modal && modal.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenuGlobal);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenuGlobal);
    };
  }, [isOpen]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-fadeIn p-2 sm:p-3 md:p-4 lg:p-5"
      data-resource-viewer="true"
      onContextMenu={handleContextMenu}
    >
      <div className="w-full h-full max-w-[95vw] max-h-[95vh] md:max-w-[90vw] md:max-h-[90vh] lg:max-w-[85vw] lg:max-h-[88vh] bg-white border border-slate-200 rounded-xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        
        {/* Modal Top Header */}
        <div className="px-4 md:px-6 py-3 md:py-4 border-b-2 border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center space-x-2 md:space-x-3 truncate min-w-0">
            <span className="px-2 md:px-2.5 py-1 text-[10px] md:text-[11px] font-mono-code font-bold uppercase rounded-lg bg-blue-50 border border-blue-200 text-blue-600 shrink-0">
              {resource.type || 'DOCUMENT'}
            </span>
            <h3 className="font-heading text-sm md:text-base font-bold text-slate-900 truncate">
              {resource.title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0 ml-2"
            title="Close Preview"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Modal Main Content Viewer Area */}
        <div 
          className="flex-1 overflow-y-auto bg-slate-100/60 flex flex-col items-center justify-center min-h-0 select-none"
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', MsUserSelect: 'none' }}
        >
          
          {/* PDF Viewer - Full Width and Height */}
          {isPdf && (
            <div className="w-full h-full bg-slate-900 relative">
              {resource.url ? (
                <>
                  <iframe 
                    src={`${resource.url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&download=0`}
                    title={resource.title}
                    className="w-full h-full border-none"
                    onContextMenu={handleContextMenu}
                    style={{
                      pointerEvents: 'auto',
                      WebkitUserSelect: 'none',
                      userSelect: 'none'
                    }}
                  />
                  {/* Top gradient overlay to hide PDF viewer toolbar */}
                  <div className="absolute top-0 inset-x-0 h-10 md:h-12 bg-slate-900 pointer-events-none"></div>
                  
                  {/* Bottom gradient overlay to hide PDF viewer bottom toolbar */}
                  <div className="absolute bottom-0 inset-x-0 h-10 md:h-12 bg-slate-900 pointer-events-none"></div>
                  
                  {/* Watermark overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="transform rotate-[-30deg] text-slate-400/20 text-5xl md:text-7xl font-bold select-none">
                      ACADEX
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                  Document URL unavailable
                </div>
              )}
            </div>
          )}

          {/* Video Stream Viewer */}
          {isVideo && (
            <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-6">
              <div className="w-full max-w-6xl">
                {resource.url ? (
                  <div className="relative w-full">
                    <video
                      controls
                      controlsList="nodownload noplaybackrate noremoteplayback"
                      disablePictureInPicture
                      src={resource.url}
                      className="w-full h-auto max-h-[70vh] md:max-h-[75vh] rounded-lg md:rounded-2xl border border-slate-200 shadow-md bg-black"
                      onContextMenu={handleContextMenu}
                      onDragStart={handleDragStart}
                    />
                    {/* Watermark overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="transform rotate-[-30deg] text-white/20 text-5xl md:text-7xl font-bold select-none">
                        ACADEX
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-xs text-slate-400">Video source URL missing</div>
                )}
              </div>
            </div>
          )}

          {/* Image Viewer */}
          {isImage && (
            <div className="w-full h-full flex items-center justify-center p-3 sm:p-4 md:p-6">
              <div className="w-full max-w-5xl">
                {resource.url ? (
                  <div className="relative w-full flex items-center justify-center">
                    <img
                      src={resource.url}
                      alt={resource.title}
                      className="w-full h-auto max-h-[70vh] md:max-h-[75vh] object-contain rounded-lg md:rounded-2xl border border-slate-200 shadow-md bg-white p-2 select-none"
                      draggable="false"
                      onContextMenu={handleContextMenu}
                      onDragStart={handleDragStart}
                      style={{ userSelect: 'none', WebkitUserSelect: 'none', MsUserSelect: 'none' }}
                    />
                    {/* Watermark overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="transform rotate-[-30deg] text-slate-400/20 text-4xl md:text-6xl font-bold select-none">
                        ACADEX
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-xs text-slate-400">Image URL missing</div>
                )}
              </div>
            </div>
          )}

          {/* Text Note / Annotation */}
          {isNote && (
            <div className="w-full max-w-4xl p-4 md:p-6 bg-white border border-slate-200 rounded-lg md:rounded-2xl shadow-sm font-sans text-xs md:text-sm text-slate-800 leading-relaxed select-none">
              <div className="text-xs font-heading text-blue-600 font-bold mb-3 uppercase tracking-wider flex items-center space-x-1.5">
                <File className="w-4 h-4" />
                <span>Academic Notes & Annotations</span>
              </div>
              <div className="whitespace-pre-wrap p-3 md:p-4 bg-slate-50 rounded-lg md:rounded-xl border border-slate-100 text-slate-700">
                {resource.content || resource.description || resource.title || 'No extra note content provided.'}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="px-4 md:px-6 py-2.5 md:py-3 border-t-2 border-slate-200 bg-white flex items-center justify-center text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-1.5 text-emerald-600 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm">Protected Academic Resource - Viewing Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}