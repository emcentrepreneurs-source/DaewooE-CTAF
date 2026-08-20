import React from 'react';
import { BatchProgress } from '../types';
import { Loader2, CheckCircle2, AlertCircle, FileArchive, Download } from 'lucide-react';

interface BatchProgressModalProps {
  progress: BatchProgress;
  onClose: () => void;
}

export const BatchProgressModal: React.FC<BatchProgressModalProps> = ({ progress, onClose }) => {
  if (progress.status === 'idle') return null;

  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-800 w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-150">
        {/* Status Icon */}
        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-inner">
          {progress.status === 'generating' || progress.status === 'zipping' ? (
            <div className="bg-indigo-950/60 text-indigo-400 border border-indigo-700/50 w-full h-full rounded-full flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          ) : progress.status === 'completed' ? (
            <div className="bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 w-full h-full rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : (
            <div className="bg-red-950/60 text-red-400 border border-red-700/50 w-full h-full rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">
          {progress.status === 'generating' && `Generating TAF PDFs (${progress.current}/${progress.total})`}
          {progress.status === 'zipping' && 'Compressing into ZIP Archive...'}
          {progress.status === 'completed' && 'Batch Generation Complete!'}
          {progress.status === 'error' && 'Batch Generation Failed'}
        </h3>

        {/* Subtitle / Traveler name */}
        <p className="text-xs text-zinc-400 mb-4 min-h-[18px]">
          {progress.status === 'generating' && (
            <span>Processing: <strong className="text-zinc-200">{progress.currentTravelerName || 'Traveler'}</strong></span>
          )}
          {progress.status === 'zipping' && 'Bundling all vector PDFs with standard naming...'}
          {progress.status === 'completed' && `Successfully generated ${progress.total} TAF documents.`}
          {progress.status === 'error' && (progress.errorMessage || 'An error occurred during generation.')}
        </p>

        {/* Progress Bar */}
        {(progress.status === 'generating' || progress.status === 'zipping' || progress.status === 'completed') && (
          <div className="w-full bg-zinc-800 rounded-full h-2.5 mb-2 overflow-hidden border border-zinc-700/60">
            <div
              className={`h-full transition-all duration-150 rounded-full ${
                progress.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        )}

        <div className="flex justify-between text-[11px] font-mono text-zinc-500 mb-6">
          <span>{percentage}% finished</span>
          <span>{progress.current} of {progress.total} forms</span>
        </div>

        {/* Done / Close Button */}
        {(progress.status === 'completed' || progress.status === 'error') && (
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-colors"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};
