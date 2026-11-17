import { useEffect, useState } from 'react';
import {
  INITIAL_ATTENDANCE,
  INITIAL_EVALUATION,
  INITIAL_LOGBOOKS,
  INITIAL_PLACEMENT,
  INITIAL_SUPERVISIONS,
} from './data/initialData';
import {
  AttendanceMode,
  AttendanceRecord,
  DesktopSection,
  EvaluationMetric,
  LogbookEntry,
  MobileTab,
  SupervisionSession,
  UserRole,
} from './types/pkl';
import { TopNav } from './components/TopNav';
import { MobileAppPrototype } from './components/MobileAppPrototype';
import { DesktopCompanion } from './components/DesktopCompanion';
import { BlueprintView } from './components/BlueprintView';
import { exportPklReportCsv } from './utils/exportCsv';

const STORAGE_KEY = 'jurnal_pkl_prototype_v1';

interface StoredState {
  attendances: AttendanceRecord[];
  logbooks: LogbookEntry[];
  supervisions: SupervisionSession[];
  evaluations: EvaluationMetric[];
}

function loadInitialState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      if (parsed.attendances && parsed.logbooks && parsed.supervisions && parsed.evaluations) {
        return {
          attendances: parsed.attendances,
          logbooks: parsed.logbooks,
          supervisions: parsed.supervisions,
          evaluations: parsed.evaluations,
        };
      }
    }
  } catch {
    // Fall back to default dataset
  }
  return {
    attendances: INITIAL_ATTENDANCE,
    logbooks: INITIAL_LOGBOOKS,
    supervisions: INITIAL_SUPERVISIONS,
    evaluations: INITIAL_EVALUATION,
  };
}

export default function App() {
  const initial = loadInitialState();

  const [role, setRole] = useState<UserRole>('student');
  const [desktopSection, setDesktopSection] = useState<DesktopSection>('prototype');
  const [mobileTab, setMobileTab] = useState<MobileTab>('home');

  const [attendances, setAttendances] = useState<AttendanceRecord[]>(initial.attendances);
  const [logbooks, setLogbooks] = useState<LogbookEntry[]>(initial.logbooks);
  const [supervisions, setSupervisions] = useState<SupervisionSession[]>(initial.supervisions);
  const [evaluations, setEvaluations] = useState<EvaluationMetric[]>(initial.evaluations);

  const [offlineMode, setOfflineMode] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ attendances, logbooks, supervisions, evaluations })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [attendances, logbooks, supervisions, evaluations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const getCurrentHHmm = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  const handleCheckInOut = (mode: AttendanceMode) => {
    const nowTime = getCurrentHHmm();
    setAttendances((prev) =>
      prev.map((att) => {
        if (att.date !== '2026-11-17') return att;
        if (!att.checkInTime) {
          return { ...att, mode, checkInTime: nowTime, verifiedLocation: true };
        }
        if (!att.checkOutTime) {
          return { ...att, checkOutTime: nowTime };
        }
        return att;
      })
    );

    if (offlineMode) {
      setPendingSyncCount((c) => c + 1);
      showToast(`Presensi (${nowTime}) disimpan ke antrean offline.`);
    } else {
      showToast(`Presensi pukul ${nowTime} berhasil tercatat.`);
    }
  };

  const handleSaveLogbook = (
    data: Omit<LogbookEntry, 'id' | 'status'>,
    existingId?: string
  ) => {
    if (existingId) {
      setLogbooks((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? { ...item, ...data, status: 'pending', mentorNote: undefined }
            : item
        )
      );
      showToast('Perbaikan logbook dikirim ulang untuk verifikasi.');
    } else {
      const newEntry: LogbookEntry = {
        ...data,
        id: `log-${Date.now()}`,
        status: 'pending',
      };
      setLogbooks((prev) => [newEntry, ...prev]);
      if (offlineMode) {
        setPendingSyncCount((c) => c + 1);
        showToast('Logbook disimpan di perangkat (antrean offline).');
      } else {
        showToast('Logbook baru disimpan dan diajukan ke pembimbing.');
      }
    }
  };

  const handleVerifyLogbook = (
    id: string,
    status: 'approved' | 'revision',
    note: string
  ) => {
    const nowTime = getCurrentHHmm();
    setLogbooks((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              mentorNote: note,
              verifiedAt: `17 Nov 2026 · ${nowTime}`,
            }
          : item
      )
    );
    showToast(
      status === 'approved'
        ? 'Entri logbook berhasil disetujui.'
        : 'Permintaan revisi telah dikirim ke peserta.'
    );
  };

  const handleUpdateEvaluation = (id: string, score: number) => {
    setEvaluations((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, score } : ev))
    );
  };

  const handleAddSupervision = (topic: string, summary: string) => {
    const newSession: SupervisionSession = {
      id: `sup-${Date.now()}`,
      date: '17 Nov 2026',
      supervisorName:
        role === 'industry_mentor'
          ? INITIAL_PLACEMENT.industryMentorName
          : INITIAL_PLACEMENT.academicSupervisorName,
      supervisorRole:
        role === 'industry_mentor' ? 'Pembimbing Industri (DUDI)' : 'Dosen Pembimbing Lapangan',
      topic,
      summary,
      nextAction: 'Tindak lanjuti pada pencatatan logbook minggu berjalan.',
    };
    setSupervisions((prev) => [newSession, ...prev]);
    showToast('Catatan sesi bimbingan berhasil ditambahkan.');
  };

  const handleSyncNow = () => {
    setOfflineMode(false);
    setPendingSyncCount(0);
    showToast('Seluruh data antrean offline berhasil disinkronkan.');
  };

  const handleExportCsv = () => {
    exportPklReportCsv(INITIAL_PLACEMENT, logbooks, attendances);
    showToast('Berkas rekap CSV PKL mulai diunduh.');
  };

  const handleResetDemo = () => {
    setAttendances(INITIAL_ATTENDANCE);
    setLogbooks(INITIAL_LOGBOOKS);
    setSupervisions(INITIAL_SUPERVISIONS);
    setEvaluations(INITIAL_EVALUATION);
    setOfflineMode(false);
    setPendingSyncCount(0);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Data simulasi dikembalikan ke kondisi awal.');
  };

  const sharedPrototypeProps = {
    role,
    onChangeRole: setRole,
    activeTab: mobileTab,
    onChangeTab: setMobileTab,
    placement: INITIAL_PLACEMENT,
    attendances,
    logbooks,
    supervisions,
    evaluations,
    offlineMode,
    pendingSyncCount,
    onToggleOffline: () => setOfflineMode((v) => !v),
    onSyncNow: handleSyncNow,
    onCheckInOut: handleCheckInOut,
    onSaveLogbook: handleSaveLogbook,
    onVerifyLogbook: handleVerifyLogbook,
    onUpdateEvaluation: handleUpdateEvaluation,
    onAddSupervision: handleAddSupervision,
    onExportCsv: handleExportCsv,
    onResetDemo: handleResetDemo,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Top Bar Contract */}
      <TopNav
        activeSection={desktopSection}
        onSelectSection={setDesktopSection}
        onExportCsv={handleExportCsv}
      />

      {/* Non-intrusive confirmation toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 lg:top-20 right-4 left-4 sm:left-auto sm:max-w-sm z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg"
        >
          {toastMessage}
        </div>
      )}

      {/* MOBILE VIEWPORT (< lg): Native full-bleed thumb-ergonomic mobile app */}
      <div className="lg:hidden">
        <MobileAppPrototype {...sharedPrototypeProps} embeddedInFrame={false} />
      </div>

      {/* DESKTOP VIEWPORT (>= lg): Full 1440px studio workspace */}
      <div className="hidden lg:block max-w-7xl mx-auto px-6 py-8">
        {desktopSection === 'prototype' ? (
          <div className="grid grid-cols-12 gap-10 items-start">
            <div className="col-span-5 flex justify-center sticky top-24">
              <MobileAppPrototype {...sharedPrototypeProps} embeddedInFrame />
            </div>
            <div className="col-span-7">
              <DesktopCompanion
                role={role}
                onChangeRole={setRole}
                activeMobileTab={mobileTab}
                onChangeMobileTab={setMobileTab}
                placement={INITIAL_PLACEMENT}
                attendances={attendances}
                logbooks={logbooks}
                evaluations={evaluations}
                offlineMode={offlineMode}
                pendingSyncCount={pendingSyncCount}
                onToggleOffline={() => setOfflineMode((v) => !v)}
                onSyncNow={handleSyncNow}
                onQuickApprove={(id) =>
                  handleVerifyLogbook(
                    id,
                    'approved',
                    'Kegiatan telah sesuai dengan target kompetensi lapangan.'
                  )
                }
              />
            </div>
          </div>
        ) : (
          <BlueprintView section={desktopSection === 'use-case' ? 'use-case' : desktopSection === 'database' ? 'database' : 'ui-spec'} />
        )}
      </div>
    </div>
  );
}
