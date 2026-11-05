import React, { useState, useEffect } from 'react';
import { TravelerRecord, BatchProgress, SignatureAutomationConfig } from './types';
import { SAMPLE_TRAVELERS } from './utils/sampleData';
import { exportTravelersToZip, downloadCombinedPdf } from './utils/zipExporter';
import { DEFAULT_SIGNATURE_CONFIG } from './utils/signatureAutomationScripts';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { FileUploadArea } from './components/FileUploadArea';
import { TravelersTable, getTravelerCriticalIssues } from './components/TravelersTable';
import { TafFormPreview } from './components/TafFormPreview';
import { MobilizationFormPreview } from './components/MobilizationFormPreview';
import { EditTravelerModal } from './components/EditTravelerModal';
import { BatchSettingsModal, BatchSettings } from './components/BatchSettingsModal';
import { BatchProgressModal } from './components/BatchProgressModal';
import { DatabaseModal } from './components/DatabaseModal';
import { IdPassportScannerModal } from './components/IdPassportScannerModal';
import { SignatureAutomationModal } from './components/SignatureAutomationModal';
import { MobilizationFormModal } from './components/MobilizationFormModal';
import { Toast, ToastMessage } from './components/Toast';
import { recordActivityLog } from './utils/activityLogger';
import { getMozambiqueIdValidityByAge, isMozambican } from './utils/dateTimeValidation';
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
  FileSignature,
  Building2,
  Users,
  AlertTriangle,
  UserPlus,
  SlidersHorizontal
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('taf_auth_user') || sessionStorage.getItem('taf_auth_user') || null;
  });

  // Initialize with the 12 sample travelers so the user sees immediate results on load
  const [travelers, setTravelers] = useState<TravelerRecord[]>(SAMPLE_TRAVELERS);
  const [selectedIds, setSelectedIds] = useState<string[]>(SAMPLE_TRAVELERS.map(t => t.id));
  
  // UI Tabs & Views: Manifest Table, TAF Form Inspector, or Daewoo Mobilization Form Inspector
  const [activeTab, setActiveTab] = useState<'manifest' | 'taf-preview' | 'mobilization-preview'>('manifest');
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  
  // Modals
  const [editingTraveler, setEditingTraveler] = useState<TravelerRecord | null>(null);
  const [selectedMobilizationTraveler, setSelectedMobilizationTraveler] = useState<TravelerRecord | null>(null);
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

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    addToast({
      title: type === 'success' ? 'Excel Export' : type === 'error' ? 'Export Error' : 'TAF Manifest',
      message,
      type,
      duration: 3500
    });
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

  // Open single TAF preview tab
  const handlePreviewTraveler = (traveler: TravelerRecord) => {
    const idx = travelers.findIndex(t => t.id === traveler.id);
    if (idx >= 0) {
      setPreviewIndex(idx);
      setActiveTab('taf-preview');
    }
  };

  // Open single Daewoo Mobilization preview tab
  const handleViewMobilization = (traveler: TravelerRecord) => {
    const idx = travelers.findIndex(t => t.id === traveler.id);
    if (idx >= 0) {
      setPreviewIndex(idx);
      setActiveTab('mobilization-preview');
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
      emailAddress: 'DEC.TravelMZ@daewooenc.com',
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

      // Mozambique ID validity calculation by age (Under 40: 5y, 40-49: 10y, 50+: Vitalício)
      if (settings.applyMozambiqueIdValidityByAge) {
        if ((isMozambican(updated.nationality) || !updated.nationality) && updated.dateOfBirth) {
          const mozRule = getMozambiqueIdValidityByAge(updated.dateOfBirth, {
            flightDate: updated.flights?.[0]?.date
          });
          if (mozRule) {
            updated.passportExpiryDate = mozRule.expiryDate;
          }
        }
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
  const handleBatchZipDownload = async (
    selectedOnly: boolean = false,
    options: { includeTaf?: boolean; includeMobilization?: boolean } = { includeTaf: true, includeMobilization: false }
  ) => {
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
      await exportTravelersToZip(
        listToExport,
        (current, total, travelerName) => {
          setBatchProgress({
            total,
            current,
            status: current === total ? 'zipping' : 'generating',
            currentTravelerName: travelerName
          });
        },
        options
      );

      setBatchProgress(prev => ({
        ...prev,
        status: 'completed'
      }));
      const formTypes = [];
      if (options.includeTaf) formTypes.push('TAF');
      if (options.includeMobilization) formTypes.push('Mobilization');
      recordActivityLog(
        'Batch Generated',
        `Generated and downloaded ZIP package containing ${listToExport.length} official documents (${formTypes.join(' + ')}).`,
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
  const criticalCount = travelers.reduce((count, t) => {
    const issues = getTravelerCriticalIssues(t);
    return issues.isCritical ? count + 1 : count;
  }, 0);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100 antialiased selection:bg-indigo-600 selection:text-white">
      {/* App Header */}
      <Header
        totalTravelers={travelers.length}
        readyCount={readyCount}
        currentUser={currentUser}
        dbSyncStatus={dbSyncStatus}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
        onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Quick Command & Metrics Bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 text-zinc-100 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Metrics Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
              {/* Total Manifest */}
              <div
                onClick={() => setActiveTab('manifest')}
                className="bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 p-3 rounded-xl cursor-pointer transition-colors"
                title="View full manifest table"
              >
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Total Manifest</span>
                </div>
                <div className="text-xl font-bold text-zinc-100">
                  {travelers.length} <span className="text-xs font-normal text-zinc-500">travelers</span>
                </div>
              </div>

              {/* Ready for Flight */}
              <div
                onClick={() => setActiveTab('manifest')}
                className="bg-zinc-950/70 border border-zinc-800 hover:border-emerald-800/60 p-3 rounded-xl cursor-pointer transition-colors"
                title="View verified travelers ready for travel"
              >
                <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validated Ready</span>
                </div>
                <div className="text-xl font-bold text-emerald-400">
                  {readyCount} <span className="text-xs font-normal text-zinc-500">passed</span>
                </div>
              </div>

              {/* Critical Attention */}
              <div
                onClick={() => setActiveTab('manifest')}
                className={`bg-zinc-950/70 border p-3 rounded-xl cursor-pointer transition-colors ${
                  criticalCount > 0
                    ? 'border-rose-700/60 hover:border-rose-600 bg-rose-950/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
                title={criticalCount > 0 ? "Click to view travelers needing passport/flight fixes" : "All records valid"}
              >
                <div className="flex items-center gap-2 text-xs mb-1">
                  <AlertTriangle className={`w-3.5 h-3.5 ${criticalCount > 0 ? 'text-rose-400' : 'text-zinc-500'}`} />
                  <span className={criticalCount > 0 ? 'text-rose-300 font-semibold' : 'text-zinc-400'}>
                    Needs Fix
                  </span>
                </div>
                <div className={`text-xl font-bold ${criticalCount > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
                  {criticalCount} <span className="text-xs font-normal text-zinc-500">{criticalCount === 0 ? 'issues' : 'fix needed'}</span>
                </div>
              </div>

              {/* Current Site */}
              <div className="bg-zinc-950/70 border border-zinc-800 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Active Destination</span>
                </div>
                <div className="text-sm font-bold text-zinc-200 truncate">Afungi / OPBL1</div>
                <div className="text-[10px] text-zinc-500 truncate">CCS JV Mozambique LNG</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                id="hero-scan-passport-btn"
                onClick={() => setIsScannerModalOpen(true)}
                className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                title="Scan ID or Passport using Camera or Photo OCR"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <span>Scan ID / Passport</span>
              </button>

              <button
                id="hero-add-traveler-btn"
                onClick={handleAddNewTraveler}
                className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                title="Add single traveler manually"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Add Traveler</span>
              </button>

              <button
                id="hero-batch-settings-btn"
                onClick={() => setIsBatchSettingsOpen(true)}
                className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium text-xs px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                title="Apply shared flight date, camp, or airline to all travelers in 1 click"
              >
                <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                <span>Batch Settings</span>
              </button>

              <button
                id="hero-generate-all-btn"
                onClick={() => handleBatchZipDownload(false, { includeTaf: true, includeMobilization: true })}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                title="Generate all official PDFs (TAF + Daewoo Mobilization) in ZIP package"
              >
                <FileArchive className="w-4 h-4" />
                <span>Export ZIP ({travelers.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* 1. File Upload Drop Area */}
        <FileUploadArea
          onTravelersLoaded={handleTravelersLoaded}
          onOpenScanner={() => setIsScannerModalOpen(true)}
          savedTravelers={travelers}
          onToast={showToast}
        />

        {/* 2. Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              id="tab-manifest-btn"
              onClick={() => setActiveTab('manifest')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'manifest'
                  ? 'bg-zinc-900 text-indigo-400 shadow-md border border-zinc-800'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Manifest Table ({travelers.length})</span>
            </button>

            <button
              id="tab-taf-preview-btn"
              onClick={() => setActiveTab('taf-preview')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'taf-preview'
                  ? 'bg-indigo-950/80 text-indigo-300 shadow-md border border-indigo-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>TAF Form Inspector</span>
              {currentPreviewTraveler && (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-1.5 py-0.5 rounded border border-zinc-700">
                  {currentPreviewTraveler.surname}
                </span>
              )}
            </button>

            <button
              id="tab-mobilization-preview-btn"
              onClick={() => setActiveTab('mobilization-preview')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'mobilization-preview'
                  ? 'bg-emerald-950/80 text-emerald-300 shadow-md border border-emerald-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Daewoo Mobilization Forms</span>
              {currentPreviewTraveler && (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 font-mono px-1.5 py-0.5 rounded border border-zinc-700">
                  {currentPreviewTraveler.surname}
                </span>
              )}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-zinc-500">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Saipem / CCS JV Charter Standard</span>
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
            onViewMobilizationTab={handleViewMobilization}
            onEditTraveler={t => setEditingTraveler(t)}
            onDeleteTraveler={handleDeleteTraveler}
            onAddTraveler={handleAddNewTraveler}
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onOpenSignatureModal={() => setIsSignatureModalOpen(true)}
            onBatchSettings={() => setIsBatchSettingsOpen(true)}
            onBatchZipDownload={handleBatchZipDownload}
            onCombinedPdfDownload={handleCombinedPdfDownload}
            onOpenMobilizationModal={t => setSelectedMobilizationTraveler(t)}
            onToast={showToast}
            isProcessingBatch={batchProgress.status === 'generating' || batchProgress.status === 'zipping'}
          />
        ) : activeTab === 'taf-preview' ? (
          <div className="min-h-[850px]">
            {currentPreviewTraveler ? (
              <TafFormPreview
                traveler={currentPreviewTraveler}
                totalCount={travelers.length}
                currentIndex={previewIndex}
                onNavigate={idx => setPreviewIndex(idx)}
                onEdit={t => setEditingTraveler(t)}
                onOpenMobilizationModal={t => setSelectedMobilizationTraveler(t)}
              />
            ) : (
              <div className="p-12 text-center bg-zinc-900 rounded-2xl border border-zinc-800 text-zinc-500">
                No traveler selected for preview. Please upload or load sample travelers.
              </div>
            )}
          </div>
        ) : (
          <div className="min-h-[850px]">
            {currentPreviewTraveler ? (
              <MobilizationFormPreview
                traveler={currentPreviewTraveler}
                totalCount={travelers.length}
                currentIndex={previewIndex}
                onNavigate={idx => setPreviewIndex(idx)}
                onEdit={t => setEditingTraveler(t)}
                onOpenMobilizationModal={t => setSelectedMobilizationTraveler(t)}
                onSwitchToTaf={() => setActiveTab('taf-preview')}
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

      {/* Daewoo E&C Mobilization Form Modal */}
      {selectedMobilizationTraveler && (
        <MobilizationFormModal
          isOpen={!!selectedMobilizationTraveler}
          traveler={selectedMobilizationTraveler}
          onClose={() => setSelectedMobilizationTraveler(null)}
          onSaveTraveler={updated => {
            handleSaveTraveler(updated);
            setSelectedMobilizationTraveler(updated);
          }}
        />
      )}

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
