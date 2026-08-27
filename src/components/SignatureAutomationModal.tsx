import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileSignature,
  Check,
  Sparkles,
  ShieldCheck,
  Upload,
  Eraser,
  PenTool,
  CheckCircle2,
  Calendar,
  Building2,
  Briefcase
} from 'lucide-react';
import { SignatureAutomationConfig } from '../types';
import { DEFAULT_SIGNATURE_CONFIG } from '../utils/signatureAutomationScripts';
import { DrumPickerTriggerButton } from './DrumPickerTriggerButton';
import { DrumWheelPickerModal } from './DrumWheelPickerModal';

interface SignatureAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SignatureAutomationConfig;
  onSaveConfig: (updatedConfig: SignatureAutomationConfig) => void;
  onToast: (toast: { type: 'success' | 'error' | 'info'; message: string }) => void;
}

export const SignatureAutomationModal: React.FC<SignatureAutomationModalProps> = ({
  isOpen,
  onClose,
  config: initialConfig,
  onSaveConfig,
  onToast
}) => {
  // Signature configuration state
  const [config, setConfig] = useState<SignatureAutomationConfig>(initialConfig || DEFAULT_SIGNATURE_CONFIG);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeInputMethod, setActiveInputMethod] = useState<'existing' | 'draw' | 'upload'>('existing');

  // Drum picker for signature date
  const [isDrumPickerOpen, setIsDrumPickerOpen] = useState(false);

  // Canvas ref for interactive signature drawing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig || DEFAULT_SIGNATURE_CONFIG);
    }
  }, [isOpen, initialConfig]);

  // Drawing Canvas setup
  useEffect(() => {
    if (activeInputMethod === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1E3A8A'; // Deep Navy Blue
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [activeInputMethod]);

  if (!isOpen) return null;

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setConfig(prev => ({ ...prev, signatureImageBase64: dataUrl }));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // Upload image handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        onToast({ type: 'error', message: 'Please select a valid PNG or JPEG image file.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setConfig(prev => ({ ...prev, signatureImageBase64: base64 }));
        onToast({ type: 'success', message: 'Signature image loaded successfully!' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Get active script text
  const handleSave = () => {
    onSaveConfig(config);
    onToast({ type: 'success', message: 'Signature and auto-append settings saved!' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FileSignature className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 tracking-tight">
                Signature & Authorization Settings
              </h2>
              <p className="text-xs text-zinc-400">
                Configure electronic signatures, signer identity, and verification stamps for generated TAFs.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Signature & Block Settings Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Visual Signature Asset */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                      <FileSignature className="w-4 h-4 text-indigo-400" />
                      Visual Signature Image (PNG / JPEG)
                    </label>
                    <span className="text-[10px] text-zinc-400 font-mono">Appends to bottom</span>
                  </div>

                  {/* Input Mode Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveInputMethod('existing')}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                        activeInputMethod === 'existing'
                          ? 'bg-indigo-950/70 border-indigo-500/80 text-indigo-200'
                          : 'bg-zinc-900 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Default Official
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInputMethod('draw')}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        activeInputMethod === 'draw'
                          ? 'bg-indigo-950/70 border-indigo-500/80 text-indigo-200'
                          : 'bg-zinc-900 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <PenTool className="w-3 h-3" />
                      Draw Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveInputMethod('upload')}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        activeInputMethod === 'upload'
                          ? 'bg-indigo-950/70 border-indigo-500/80 text-indigo-200'
                          : 'bg-zinc-900 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      Upload File
                    </button>
                  </div>

                  {/* Draw Signature Canvas */}
                  {activeInputMethod === 'draw' && (
                    <div className="space-y-2">
                      <div className="relative border-2 border-dashed border-indigo-500/40 rounded-xl bg-white overflow-hidden shadow-inner">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={120}
                          className="w-full h-[120px] cursor-crosshair touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                        <span className="absolute bottom-1 right-2 text-[9px] text-zinc-400 font-mono pointer-events-none">
                          Draw inside box
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <button
                          type="button"
                          onClick={clearCanvas}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-700/60 transition-colors cursor-pointer"
                        >
                          <Eraser className="w-3 h-3" />
                          Clear Canvas
                        </button>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Signature saved on release
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Upload Image Area */}
                  {activeInputMethod === 'upload' && (
                    <div className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center bg-zinc-900/60 space-y-2">
                      <Upload className="w-6 h-6 text-zinc-400 mx-auto" />
                      <p className="text-xs text-zinc-300">Choose transparent PNG or JPEG signature</p>
                      <input
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleImageUpload}
                        className="block w-full text-xs text-zinc-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Signature Preview Thumbnail */}
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">Current Active Signature Asset:</span>
                    <div className="h-16 bg-white rounded-lg flex items-center justify-center p-2 border border-zinc-700 shadow-sm overflow-hidden">
                      {config.signatureImageBase64 ? (
                        <img
                          src={config.signatureImageBase64}
                          alt="Signature Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-zinc-500 italic">No signature loaded</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Auto-Stamp Switch */}
                <div className="p-4 bg-indigo-950/40 border border-indigo-800/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Auto-Append to Every Generated File
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Automatically stamp this signature image and verification block onto all generated TAF PDFs & ZIP archives.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.autoStampGeneratedFiles}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoStampGeneratedFiles: e.target.checked }))}
                      className="w-4 h-4 text-indigo-600 rounded bg-zinc-800 border-zinc-700 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Signer Metadata & Text Verification Block */}
              <div className="lg:col-span-6 space-y-4">
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    Signer Details & Metadata
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                        Signer Name
                      </label>
                      <input
                        type="text"
                        value={config.signatureName}
                        onChange={(e) => setConfig(prev => ({ ...prev, signatureName: e.target.value }))}
                        placeholder="e.g. Eric Matola"
                        className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 font-medium focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                        Title / Role
                      </label>
                      <input
                        type="text"
                        value={config.signerTitle}
                        onChange={(e) => setConfig(prev => ({ ...prev, signerTitle: e.target.value }))}
                        placeholder="e.g. Site Logistics Lead"
                        className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 font-medium focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-zinc-400 mb-1 block">
                        Organization / JV
                      </label>
                      <input
                        type="text"
                        value={config.organization}
                        onChange={(e) => setConfig(prev => ({ ...prev, organization: e.target.value }))}
                        placeholder="e.g. Daewoo E&C / CCS JV"
                        className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 font-medium focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-medium text-zinc-400">
                          Signature Date
                        </label>
                        <DrumPickerTriggerButton
                          onClick={() => setIsDrumPickerOpen(true)}
                          title="Open Drum Wheel Date Picker"
                        />
                      </div>
                      <input
                        type="text"
                        value={config.signatureDate}
                        onChange={(e) => setConfig(prev => ({ ...prev, signatureDate: e.target.value }))}
                        placeholder="06 AUGUST 2026"
                        className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-100 font-mono focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 mb-1.5 block">
                      Appending Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['both', 'image', 'text_block'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setConfig(prev => ({ ...prev, mode: m }))}
                          className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                            config.mode === m
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-zinc-900 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {m === 'both' ? 'Image + Text Block' : m === 'image' ? 'Image Only' : 'Text Block Only'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Legal Disclaimer & Compliance Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-zinc-400">
                        Legal Confirmation Statement
                      </label>
                      <input
                        type="checkbox"
                        checked={config.includeLegalDisclaimer}
                        onChange={(e) => setConfig(prev => ({ ...prev, includeLegalDisclaimer: e.target.checked }))}
                        className="w-3.5 h-3.5 text-indigo-600 rounded bg-zinc-800 border-zinc-700"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={config.legalDisclaimerText}
                      onChange={(e) => setConfig(prev => ({ ...prev, legalDisclaimerText: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-700/80 rounded-lg text-zinc-200 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-950/70">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Drum Picker for Signature Date */}
      <DrumWheelPickerModal
        isOpen={isDrumPickerOpen}
        onClose={() => setIsDrumPickerOpen(false)}
        mode="date"
        title="Select Signature & Authorization Date"
        initialValue={config.signatureDate || '06 AUGUST 2026'}
        dateFormat="full"
        context="signatureDate"
        onConfirm={(val) => {
          setConfig(prev => ({ ...prev, signatureDate: val }));
          setIsDrumPickerOpen(false);
        }}
      />
    </div>
  );
};
