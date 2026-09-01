import React, { useState, useEffect } from 'react';
import { TravelerRecord, BatchProgress, SignatureAutomationConfig } from './types';
import { SAMPLE_TRAVELERS } from './utils/sampleData';
import { exportTravelersToZip, downloadCombinedPdf } from './utils/zipExporter';
import { DEFAULT_SIGNATURE_CONFIG } from './utils/signatureAutomationScripts';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { FileUploadArea } from './components/FileUploadArea';
import { TravelersTable } from './components/TravelersTable';
import { TafFormPreview } from './components/TafFormPreview';
import { EditTravelerModal } from './components/EditTravelerModal';
import { BatchSettingsModal, BatchSettings } from './components/BatchSettingsModal';
import { BatchProgressModal } from './components/BatchProgressModal';
import { DatabaseModal } from './components/DatabaseModal';
import { IdPassportScannerModal } from './components/IdPassportScannerModal';
import { SignatureAutomationModal } from './components/SignatureAutomationModal';
import { Toast, ToastMessage } from './components/Toast';
import { recordActivityLog } from './utils/activityLogger';
import {
  FileSpreadsheet,
  FileCheck,
  Eye,
  FileArchive,
  Layers,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Clock,
  Briefcase,
  Camera,
  FileSignature
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('taf_auth_user') || sessionStorage.getItem('taf_auth_user') || null;
  });

  // Initialize with the 12 sample travelers so the user sees immediate results on load
  const [travelers, setTravelers] = useState<TravelerRecord[]>(SAMPLE_TRAVELERS);
  const [selectedIds, setSelectedIds] = useState<string[]>(SAMPLE_TRAVELERS.map(t => t.id));
  
  // UI Tabs & Views
  const [activeTab, setActiveTab] = useState<'manifest' | 'preview'>('manifest');
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  
  // Modals
  const [editingTraveler, setEditingTraveler] = useState<TravelerRecord | null>(null);
  const [isBatchSettingsOpen, setIsBatchSettingsOpen] = useState(false);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [signatureConfig, setSignatureConfig] = useState<SignatureAutomationConfig>(() => {
    const saved = localStorage.getItem('taf_signature_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_SIGNATURE_CONFIG;
      }
    }
    return DEFAULT_SIGNATURE_CONFIG;
  });
  const [dbSyncStatus, setDbSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    total: 0,
    current: 0,
    status: 'idle'
  });

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch travelers from Cloud SQL Database on startup
  useEffect(() => {
    if (!currentUser) return;

    const loadDbTravelers = async () => {
      try {
        const res = await fetch('/api/travelers');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Map DB records to TravelerRecord
            const mapped: TravelerRecord[] = data.map((d: any) => ({
              id: d.id,
              surname: d.surname,
              nameAndGender: d.name_gender || d.nameGender || '',
              finalDestination: d.final_destination || d.finalDestination || '',
              rotationType: d.rotation_type || d.rotationType || '',
              purposeOfTrip: d.purpose_of_trip || d.purposeOfTrip || 'Business Trip',
              companyId: d.company_id || d.companyId || '',
              company: d.company || '',
              projectPosition: d.position || d.projectPosition || '',
              projectDepartment: d.department || d.projectDepartment || '',
              mobileNumber: d.mobile_number || d.mobileNumber || '',
              emailAddress: d.email_address || d.emailAddress || '',
              substituteInAbsence: d.substitute_in_absence || d.substituteInAbsence || '',
              frequentFlyerCard: d.frequent_flyer_card || d.frequentFlyerCard || '',
              passportOrIdNumber: d.passport_number || d.passportOrIdNumber || '',
              dateOfBirth: d.date_of_birth || d.dateOfBirth || '',
              nationality: d.nationality || '',
              passportExpiryDate: d.passport_expiry_date || d.passportExpiryDate || '',
              signatureDate: d.signature_date || d.signatureDate || '06 AUGUST 2026',
              signatureName: d.signature_name || d.signatureName || 'Eric Matola',
              signatureImage: d.signature_image || d.signatureImage,
              flights: d.flights || [],
              accommodation: d.accommodations || d.accommodation || [],
              isValid: d.status !== 'error' && d.status !== 'invalid',
              source: d.source || 'manual',
            }));
            setTravelers(mapped);
            setSelectedIds(mapped.map(t => t.id));
          } else {
            // Seed initial sample data to database
            syncToDatabase(SAMPLE_TRAVELERS);
          }
        }
      } catch (err) {
        console.warn('Could not fetch from database, using initial state:', err);
      }
    };

    loadDbTravelers();
  }, [currentUser]);

  // Helper to persist travelers to Cloud SQL DB
  const syncToDatabase = async (records: TravelerRecord[]): Promise<boolean> => {
    try {
      setDbSyncStatus('saving');
      const payload = records.map(r => ({
        id: r.id,
        surname: r.surname,
        nameAndGender: r.nameAndGender,
        finalDestination: r.finalDestination,
        rotationType: r.rotationType,
        purposeOfTrip: r.purposeOfTrip,
        companyId: r.companyId,
        company: r.company,
        projectPosition: r.projectPosition,
        projectDepartment: r.projectDepartment,
        mobileNumber: r.mobileNumber,
        emailAddress: r.emailAddress,
        substituteInAbsence: r.substituteInAbsence,
        frequentFlyerCard: r.frequentFlyerCard,
        passportOrIdNumber: r.passportOrIdNumber,
        dateOfBirth: r.dateOfBirth,
        nationality: r.nationality,
        passportExpiryDate: r.passportExpiryDate,
        signatureDate: r.signatureDate,
        signatureName: r.signatureName,
        signatureImage: r.signatureImage,
        flights: r.flights || [],
        accommodation: r.accommodation || [],
        status: r.isValid === false ? 'invalid' : 'ready',
        source: r.source || 'manual',
      }));

      const res = await fetch('/api/travelers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ travelers: payload, userUid: currentUser })
      });

      if (res.ok) {
        setDbSyncStatus('synced');
        return true;
      } else {
        setDbSyncStatus('error');
        return false;
      }
    } catch (err) {
      console.error('Failed to sync to database:', err);
      setDbSyncStatus('error');
      return false;
    }
  };

  const handleLoginSuccess = (user: string) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('taf_auth_user');
    localStorage.removeItem('taf_auth_timestamp');
    sessionStorage.removeItem('taf_auth_user');
    sessionStorage.removeItem('taf_auth_timestamp');
    setCurrentUser(null);
  };

  // If user is not authenticated, show login screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Handle uploaded file
  const handleTravelersLoaded = (loaded: TravelerRecord[], fileName: string) => {
    setTravelers(loaded);
    setSelectedIds(loaded.map(t => t.id));
    setPreviewIndex(0);
    setActiveTab('manifest');
    syncToDatabase(loaded);
    recordActivityLog(
      'Manifest Imported',
      `Imported ${loaded.length} traveler records from file ${fileName}.`,
      currentUser || 'AdminE&C',
      { count: loaded.length }
    );
  };

  // Toggle selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all or deselect
  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedIds(travelers.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Open single preview
  const handlePreviewTraveler = (traveler: TravelerRecord) => {
    const idx = travelers.findIndex(t => t.id === traveler.id);
    if (idx >= 0) {
      setPreviewIndex(idx);
      setActiveTab('preview');
    }
  };

  // Delete traveler
  const handleDeleteTraveler = async (id: string) => {
    const updated = travelers.filter(t => t.id !== id);
    setTravelers(updated);
    setSelectedIds(prev => prev.filter(item => item !== id));
    if (previewIndex >= travelers.length - 1) {
      setPreviewIndex(Math.max(0, travelers.length - 2));
    }
    recordActivityLog(
      'Traveler Deleted',
      `Deleted traveler record (ID ${id}) from manifest.`,
      currentUser || 'AdminE&C',
      { targetId: id }
    );
    try {
      await fetch(`/api/travelers/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Delete from DB failed:', e);
    }
  };

  // Edit traveler save
  const handleSaveTraveler = async (updated: TravelerRecord) => {
    const exists = travelers.some(t => t.id === updated.id);
    const nextList = exists
      ? travelers.map(t => (t.id === updated.id ? updated : t))
      : [updated, ...travelers];
    setTravelers(nextList);
    if (!exists) {
      setSelectedIds(prev => [updated.id, ...prev]);
    }
    recordActivityLog(
      exists ? 'Traveler Modified' : 'Traveler Added',
      `${exists ? 'Updated' : 'Added'} traveler record for ${updated.surname} (${updated.passportOrIdNumber || updated.id}).`,
      currentUser || 'AdminE&C',
      { targetId: updated.id, count: 1 }
    );
    const success = await syncToDatabase(nextList);
    if (success) {
      addToast({
        title: exists ? 'Changes Saved' : 'Traveler Added',
        message: `${updated.surname || 'Traveler'} (${updated.passportOrIdNumber || 'ID'}) synced to database.`,
        type: 'success',
        showDatabaseBadge: true,
        duration: 3500
      });
    } else {
      addToast({
        title: 'Saved Locally',
        message: `${updated.surname || 'Traveler'} saved locally, but database sync encountered an issue.`,
        type: 'error',
        duration: 4500
      });
    }
  };

  // Add new blank traveler
  const handleAddNewTraveler = () => {
    const newId = `T-${Date.now()}`;
    const blankTraveler: TravelerRecord = {
      id: newId,
      surname: 'NEW TRAVELER',
      nameAndGender: 'FIRSTNAME / MALE',
      finalDestination: 'Afungi',
      rotationType: 'Regular',
      purposeOfTrip: 'Business Trip',
      companyId: '30' + Math.floor(100 + Math.random() * 900),
      company: 'DAEWOO',
      projectPosition: 'SITE SPECIALIST',
      projectDepartment: 'CONSTRUCTION',
      mobileNumber: '+258 84 000 0000',
      emailAddress: 'traveler@ccsjv.com',
      substituteInAbsence: 'N/A',
      frequentFlyerCard: 'N/A',
      passportOrIdNumber: '1100' + Math.floor(1000 + Math.random() * 9000),
      dateOfBirth: '01-Jan-90',
      nationality: 'MOZAMBICAN',
      passportExpiryDate: '01-Jan-32',
      signatureDate: '06 AUGUST 2026',
      signatureName: currentUser || 'AdminE&C',
      flights: [
        {
          date: '8/9/2026',
          from: 'PEMBA',
          to: 'AFUNGI',
          departureTime: '06:45',
          arrivalTime: '07:30',
          airlineAndFlightNo: 'SOLENTA'
        }
      ],
      accommodation: [
        {
          checkIn: '8/9/2026',
          checkOut: '',
          hotelOrCamp: '9500',
          location: 'AFUNGI',
          notes: 'SHARED'
        }
      ],
      isValid: true
    };
    setEditingTraveler(blankTraveler);
  };

  // Add travelers extracted from ID / Passport Optical & AI Scanner
  const handleAddTravelersFromScanner = async (newTravelers: TravelerRecord[]) => {
    if (!newTravelers || newTravelers.length === 0) return;
    const updated = [...newTravelers, ...travelers];
    setTravelers(updated);
    setSelectedIds(prev => [...newTravelers.map(t => t.id), ...prev]);
    recordActivityLog(
      'ID Scanned',
      `Extracted and added ${newTravelers.length} traveler profile${newTravelers.length > 1 ? 's' : ''} via high-precision ID & Passport OCR.`,
      currentUser || 'AdminE&C',
      { count: newTravelers.length }
    );
    const success = await syncToDatabase(updated);
    if (success) {
      addToast({
        title: 'ID Scan Added',
        message: `${newTravelers.length} traveler${newTravelers.length > 1 ? 's' : ''} added & synced to database.`,
        type: 'success',
        showDatabaseBadge: true,
        duration: 3500
      });
    }
  };

  // Batch update settings across travelers
  const handleApplyBatchSettings = async (settings: BatchSettings) => {
    const nextList = travelers.map(t => {
      // Only update selected if any selected, otherwise all
      if (selectedIds.length > 0 && !selectedIds.includes(t.id)) {
        return t;
      }

      const updated: TravelerRecord = { ...t };
      if (settings.finalDestination) updated.finalDestination = settings.finalDestination;
      if (settings.rotationType) updated.rotationType = settings.rotationType;
      if (settings.purposeOfTrip) updated.purposeOfTrip = settings.purposeOfTrip;
      if (settings.signatureDate) updated.signatureDate = settings.signatureDate;
      if (settings.signatureName) updated.signatureName = settings.signatureName;

      // Flight updates
      if (settings.flightDate || settings.flightFrom || settings.flightTo || settings.airline) {
        const flights = [...(updated.flights || [])];
        flights[0] = {
          date: settings.flightDate || flights[0]?.date || '8/9/2026',
          from: settings.flightFrom || flights[0]?.from || 'PEMBA',
          to: settings.flightTo || flights[0]?.to || 'AFUNGI',
          departureTime: settings.departureTime || flights[0]?.departureTime || '06:45',
          arrivalTime: settings.arrivalTime || flights[0]?.arrivalTime || '07:30',
          airlineAndFlightNo: settings.airline || flights[0]?.airlineAndFlightNo || 'SOLENTA'
        };
        updated.flights = flights;
      }

      // Accommodation updates
      if (settings.hotelOrCamp || settings.campLocation || settings.accommodationNotes) {
        const acc = [...(updated.accommodation || [])];
        acc[0] = {
          checkIn: settings.flightDate || acc[0]?.checkIn || '8/9/2026',
          checkOut: acc[0]?.checkOut || '',
          hotelOrCamp: settings.hotelOrCamp || acc[0]?.hotelOrCamp || '9500',
          location: settings.campLocation || acc[0]?.location || 'AFUNGI',
          notes: settings.accommodationNotes || acc[0]?.notes || 'SHARED'
        };
        updated.accommodation = acc;
      }

      return updated;
    });

    setTravelers(nextList);
    recordActivityLog(
      'Batch Parameters Applied',
      `Applied batch travel & camp configuration to ${selectedIds.length > 0 ? selectedIds.length : travelers.length} travelers.`,
      currentUser || 'AdminE&C',
      { count: selectedIds.length > 0 ? selectedIds.length : travelers.length }
    );
    const success = await syncToDatabase(nextList);
    if (success) {
      addToast({
        title: 'Batch Updates Synced',
        message: 'Flight & camp parameters applied to selected travelers in database.',
        type: 'success',
        showDatabaseBadge: true,
        duration: 3500
      });
    }
  };

  // Batch ZIP Export
  const handleBatchZipDownload = async (selectedOnly: boolean = false) => {
    const listToExport = selectedOnly
      ? travelers.filter(t => selectedIds.includes(t.id))
      : travelers;

    if (listToExport.length === 0) return;

    setBatchProgress({
      total: listToExport.length,
      current: 0,
      status: 'generating'
    });

    try {
      await exportTravelersToZip(listToExport, (current, total, travelerName) => {
        setBatchProgress({
          total,
          current,
          status: current === total ? 'zipping' : 'generating',
          currentTravelerName: travelerName
        });
      });

      setBatchProgress(prev => ({
        ...prev,
        status: 'completed'
      }));
      recordActivityLog(
        'Batch Generated',
        `Generated and downloaded ZIP package containing ${listToExport.length} official TAF documents.`,
        currentUser || 'AdminE&C',
        { count: listToExport.length }
      );
    } catch (err: any) {
      console.error(err);
      setBatchProgress({
        total: listToExport.length,
        current: 0,
        status: 'error',
        errorMessage: err.message || 'Failed to generate batch ZIP archive.'
      });
    }
  };

  // Combined Multi-page PDF Export
  const handleCombinedPdfDownload = (selectedOnly: boolean = false) => {
    const listToExport = selectedOnly
      ? travelers.filter(t => selectedIds.includes(t.id))
      : travelers;

    if (listToExport.length === 0) return;
    downloadCombinedPdf(listToExport);
    recordActivityLog(
      'PDF Combined Export',
      `Exported combined multi-traveler dossier containing ${listToExport.length} TAF forms.`,
      currentUser || 'AdminE&C',
      { count: listToExport.length }
    );
  };

  const handleSaveSignatureConfig = (updatedConfig: SignatureAutomationConfig) => {
    setSignatureConfig(updatedConfig);
    localStorage.setItem('taf_signature_config', JSON.stringify(updatedConfig));
    recordActivityLog(
      'Signature Updated',
      `Updated default approval signature stamp: ${updatedConfig.signatureName || 'Authorized Signatory'}.`,
      currentUser || 'AdminE&C'
    );

    // If autoStampGeneratedFiles is enabled, apply signature details to all travelers in memory
    if (updatedConfig.autoStampGeneratedFiles) {
      setTravelers(prev =>
        prev.map(t => ({
          ...t,
          signatureDate: updatedConfig.signatureDate || t.signatureDate,
          signatureName: updatedConfig.signatureName || t.signatureName,
          signatureImage: updatedConfig.signatureImageBase64 || t.signatureImage
        }))
      );
    }
  };

  const currentPreviewTraveler = travelers[previewIndex] || travelers[0];
  const readyCount = travelers.filter(t => t.isValid !== false).length;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100 antialiased selection:bg-indigo-600 selection:text-white">
      {/* App Header */}
      <Header
        totalTravelers={travelers.length}
        readyCount={readyCount}
        currentUser={currentUser}
        dbSyncStatus={dbSyncStatus}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Quick Instructions & Banner */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-zinc-100 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Automated Workflow
                </span>
                <span className="text-xs text-zinc-400">
                  Site Travel & Charter Flights
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-100">
                Upload Excel ➔ Generate 10+ Standard TAF PDFs in 1-Click
              </h1>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <button
                id="hero-scan-passport-btn"
                onClick={() => setIsScannerModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-semibold text-xs px-4 py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                title="Scan ID or Passport using Camera or Photo OCR"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Scan ID / Passport (AI OCR)</span>
              </button>

              <button
                id="hero-generate-all-btn"
                onClick={() => handleBatchZipDownload(false)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <FileArchive className="w-4 h-4" />
                <span>Generate All {travelers.length} TAFs (ZIP)</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. File Upload Drop Area */}
        <FileUploadArea
          onTravelersLoaded={handleTravelersLoaded}
          onOpenScanner={() => setIsScannerModalOpen(true)}
        />

        {/* 2. Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
          <div className="flex items-center gap-2">
            <button
              id="tab-manifest-btn"
              onClick={() => setActiveTab('manifest')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'manifest'
                  ? 'bg-zinc-900 text-indigo-400 shadow-sm border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Traveler Manifest Table ({travelers.length})</span>
            </button>

            <button
              id="tab-preview-btn"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'preview'
                  ? 'bg-zinc-900 text-indigo-400 shadow-sm border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Live PDF Form Inspector</span>
              {currentPreviewTraveler && (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-1.5 py-0.5 rounded border border-zinc-700">
                  {currentPreviewTraveler.surname}
                </span>
              )}
            </button>
          </div>

          {/* Quick jump to preview indicator */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Charter Notice Rule: 10 Business Days Minimum</span>
          </div>
        </div>

        {/* 3. Main Views Content */}
        {activeTab === 'manifest' ? (
          <TravelersTable
            travelers={travelers}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onPreviewTraveler={handlePreviewTraveler}
            onEditTraveler={t => setEditingTraveler(t)}
            onDeleteTraveler={handleDeleteTraveler}
            onAddTraveler={handleAddNewTraveler}
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onBatchSettings={() => setIsBatchSettingsOpen(true)}
            onBatchZipDownload={handleBatchZipDownload}
            onCombinedPdfDownload={handleCombinedPdfDownload}
            isProcessingBatch={batchProgress.status === 'generating' || batchProgress.status === 'zipping'}
          />
        ) : (
          <div className="min-h-[850px]">
            {currentPreviewTraveler ? (
              <TafFormPreview
                traveler={currentPreviewTraveler}
                totalCount={travelers.length}
                currentIndex={previewIndex}
                onNavigate={idx => setPreviewIndex(idx)}
                onEdit={t => setEditingTraveler(t)}
              />
            ) : (
              <div className="p-12 text-center bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-500">
                No traveler selected for preview. Please upload or load sample travelers.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 mt-12 py-5 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            CCS JV Travel & Accommodation Form (TAF) Batch Automation Engine
          </p>
          <p className="text-zinc-500">
            Compliant with Saipem & CCS JV Site Travel Standards
          </p>
        </div>
      </footer>

      {/* Modals */}
      <IdPassportScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onAddTravelers={handleAddTravelersFromScanner}
      />

      <SignatureAutomationModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        config={signatureConfig}
        onSaveConfig={handleSaveSignatureConfig}
        onToast={addToast}
      />

      <EditTravelerModal
        traveler={editingTraveler}
        isOpen={!!editingTraveler}
        onClose={() => setEditingTraveler(null)}
        onSave={handleSaveTraveler}
      />

      <BatchSettingsModal
        isOpen={isBatchSettingsOpen}
        onClose={() => setIsBatchSettingsOpen(false)}
        travelerCount={selectedIds.length > 0 ? selectedIds.length : travelers.length}
        onApplyBatchSettings={handleApplyBatchSettings}
      />

      <BatchProgressModal
        progress={batchProgress}
        onClose={() =>
          setBatchProgress({
            total: 0,
            current: 0,
            status: 'idle'
          })
        }
      />

      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        dbSyncStatus={dbSyncStatus}
      />

      {/* Global Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
