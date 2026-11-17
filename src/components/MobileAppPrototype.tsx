import { useState } from 'react';
import {
  Home,
  BookOpen,
  ClipboardCheck,
  User,
  Compass,
  MapPin,
  Plus,
  Search,
  ChevronRight,
  WifiOff,
  RefreshCw,
  Download,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  AttendanceMode,
  AttendanceRecord,
  EvaluationMetric,
  LogbookEntry,
  MobileTab,
  StudentPlacement,
  SupervisionSession,
  UserRole,
} from '../types/pkl';
import { LogbookStatusText } from './LogbookStatusText';
import { ResilientImage } from './ResilientImage';
import { LogbookSheet } from './LogbookSheet';
import { BlueprintView } from './BlueprintView';

interface MobileAppPrototypeProps {
  embeddedInFrame?: boolean;
  role: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeTab: MobileTab;
  onChangeTab: (tab: MobileTab) => void;
  placement: StudentPlacement;
  attendances: AttendanceRecord[];
  logbooks: LogbookEntry[];
  supervisions: SupervisionSession[];
  evaluations: EvaluationMetric[];
  offlineMode: boolean;
  pendingSyncCount: number;
  onToggleOffline: () => void;
  onSyncNow: () => void;
  onCheckInOut: (mode: AttendanceMode, coords?: string) => void;
  onSaveLogbook: (data: Omit<LogbookEntry, 'id' | 'status'>, existingId?: string) => void;
  onVerifyLogbook: (id: string, status: 'approved' | 'revision', note: string) => void;
  onUpdateEvaluation: (id: string, score: number) => void;
  onAddSupervision: (topic: string, summary: string) => void;
  onExportCsv: () => void;
  onResetDemo: () => void;
}

export function MobileAppPrototype({
  embeddedInFrame = false,
  role,
  onChangeRole,
  activeTab,
  onChangeTab,
  placement,
  attendances,
  logbooks,
  supervisions,
  evaluations,
  offlineMode,
  pendingSyncCount,
  onToggleOffline,
  onSyncNow,
  onCheckInOut,
  onSaveLogbook,
  onVerifyLogbook,
  onUpdateEvaluation,
  onAddSupervision,
  onExportCsv,
  onResetDemo,
}: MobileAppPrototypeProps) {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-17');
  const [workMode, setWorkMode] = useState<AttendanceMode>('WFO');
  const [gpsStatus, setGpsStatus] = useState<string>('Radius 16m · Kantor DUDI');
  const [locating, setLocating] = useState(false);

  const [logFilter, setLogFilter] = useState<'all' | 'approved' | 'pending' | 'revision'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit' | 'detail'>('create');
  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(null);

  const [bimbinganTopic, setBimbinganTopic] = useState('');
  const [bimbinganNote, setBimbinganNote] = useState('');
  const [showBimbinganForm, setShowBimbinganForm] = useState(false);

  const todayRecord = attendances.find((a) => a.date === '2026-11-17') || attendances[attendances.length - 1];
  const selectedDayRecord = attendances.find((a) => a.date === selectedDate) || todayRecord;

  const approvedCount = logbooks.filter((l) => l.status === 'approved').length;
  const pendingCount = logbooks.filter((l) => l.status === 'pending').length;
  const revisionCount = logbooks.filter((l) => l.status === 'revision').length;

  const completedDays = 38 + attendances.filter((a) => a.checkInTime !== null).length;
  const accumulatedHours = completedDays * 8;
  const progressPercent = Math.min(100, Math.round((completedDays / placement.targetDays) * 100));

  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPercent / 100) * ringCircumference;

  const weightedScore = evaluations.reduce(
    (sum, item) => sum + (item.score * item.weight) / 100,
    0
  );

  const filteredLogs = logbooks.filter((entry) => {
    const matchesStatus = logFilter === 'all' || entry.status === logFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      entry.title.toLowerCase().includes(q) ||
      entry.competency.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleRefreshGps = () => {
    setLocating(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          setGpsStatus(`GPS Terkunci (${lat}, ${lng})`);
          setLocating(false);
        },
        () => {
          setGpsStatus('Radius 14m · Lokasi Terverifikasi');
          setLocating(false);
        },
        { timeout: 3500 }
      );
    } else {
      setTimeout(() => {
        setGpsStatus('Radius 14m · Lokasi Terverifikasi');
        setLocating(false);
      }, 300);
    }
  };

  const openCreateSheet = () => {
    setSelectedEntry(null);
    setSheetMode('create');
    setSheetOpen(true);
  };

  const openDetailSheet = (entry: LogbookEntry) => {
    setSelectedEntry(entry);
    setSheetMode('detail');
    setSheetOpen(true);
  };

  const handleSaveFromSheet = (data: Omit<LogbookEntry, 'id' | 'status'>, existingId?: string) => {
    onSaveLogbook(data, existingId);
    setSheetOpen(false);
    if (activeTab === 'home') {
      onChangeTab('logbook');
    }
  };

  const handleVerifyFromSheet = (id: string, status: 'approved' | 'revision', note: string) => {
    onVerifyLogbook(id, status, note);
    setSheetOpen(false);
  };

  const handleSubmitBimbingan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bimbinganTopic.trim() || !bimbinganNote.trim()) return;
    onAddSupervision(bimbinganTopic.trim(), bimbinganNote.trim());
    setBimbinganTopic('');
    setBimbinganNote('');
    setShowBimbinganForm(false);
  };

  const roleLabel =
    role === 'student'
      ? 'Peserta PKL'
      : role === 'industry_mentor'
      ? 'Pembimbing DUDI'
      : 'Dosen Pembimbing';

  const navTabs: { id: MobileTab; label: string; icon: typeof Home }[] = embeddedInFrame
    ? [
        { id: 'home', label: 'Beranda', icon: Home },
        { id: 'logbook', label: 'Logbook', icon: BookOpen },
        { id: 'validation', label: 'Validasi', icon: ClipboardCheck },
        { id: 'profile', label: 'Profil', icon: User },
      ]
    : [
        { id: 'home', label: 'Beranda', icon: Home },
        { id: 'logbook', label: 'Logbook', icon: BookOpen },
        { id: 'validation', label: 'Validasi', icon: ClipboardCheck },
        { id: 'blueprint', label: 'Rancangan', icon: Compass },
        { id: 'profile', label: 'Profil', icon: User },
      ];

  const effectiveTab = embeddedInFrame && activeTab === 'blueprint' ? 'home' : activeTab;

  const containerClass = embeddedInFrame
    ? 'relative w-full max-w-[390px] h-[740px] mx-auto rounded-[36px] border-[6px] border-slate-900 bg-slate-50 shadow-xl overflow-hidden flex flex-col'
    : 'min-h-screen bg-slate-50 flex flex-col';

  return (
    <div className={containerClass}>
      {/* Mobile Top App Bar (52px) */}
      <header
        className={`${
          embeddedInFrame ? 'sticky top-0' : 'sticky top-0'
        } z-30 h-[52px] shrink-0 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <ResilientImage
            src={
              role === 'industry_mentor'
                ? placement.industryMentorAvatar
                : placement.studentAvatar
            }
            alt={role === 'industry_mentor' ? placement.industryMentorName : placement.studentName}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0">
            <div className="font-display font-bold text-sm text-slate-900 truncate">
              {effectiveTab === 'home' && 'JurnalPKL'}
              {effectiveTab === 'logbook' && 'Logbook Harian'}
              {effectiveTab === 'validation' && 'Validasi & Bimbingan'}
              {effectiveTab === 'blueprint' && 'Perancangan Sistem'}
              {effectiveTab === 'profile' && 'Profil & Pengaturan'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
            {roleLabel}
          </span>
          {offlineMode && (
            <button
              type="button"
              onClick={onSyncNow}
              aria-label="Mode offline aktif, ketuk untuk sinkronisasi"
              className="min-h-[36px] px-2 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="tabular-nums">{pendingSyncCount}</span>
            </button>
          )}
        </div>
      </header>

      {/* Scrollable Mobile Content Canvas */}
      <main
        className={`flex-1 overflow-y-auto px-4 pt-4 ${
          embeddedInFrame ? 'pb-20' : 'pb-24'
        } space-y-5`}
      >
        {/* Role Switcher on mobile (so mobile users can test all 3 actors directly!) */}
        {!embeddedInFrame && effectiveTab !== 'blueprint' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center gap-1">
            {(
              [
                { id: 'student', label: 'Peserta' },
                { id: 'industry_mentor', label: 'Pembimbing DUDI' },
                { id: 'academic_supervisor', label: 'Dosen' },
              ] as { id: UserRole; label: string }[]
            ).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onChangeRole(r.id)}
                className={`flex-1 min-h-[38px] px-2 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  role === r.id
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* TAB 1: BERANDA */}
        {effectiveTab === 'home' && (
          <div className="space-y-5">
            {/* Placement Context Header */}
            <div className="space-y-1">
              <div className="text-xs text-slate-500">
                {placement.companyName} · {placement.division}
              </div>
              <h1 className="font-display font-bold text-xl text-slate-900 tracking-tight">
                {role === 'student'
                  ? `Halo, ${placement.studentName.split(' ')[0]}`
                  : role === 'industry_mentor'
                  ? `Panel ${placement.industryMentorName.split(',')[0]}`
                  : `Pantauan ${placement.academicSupervisorName.split(',')[0]}`}
              </h1>
            </div>

            {/* 2-Column Stat Summary (Progress Ring + Metric Card) */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
                    <circle
                      cx="32"
                      cy="32"
                      r={ringRadius}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={ringRadius}
                      fill="none"
                      stroke="#1D4ED8"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringOffset}
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-bold text-slate-900 tabular-nums">
                    {progressPercent}%
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-lg text-slate-900 tabular-nums leading-tight">
                    {completedDays}
                    <span className="text-xs font-normal text-slate-500">/{placement.targetDays}h</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">Hari PKL</div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between">
                <div className="font-display font-bold text-2xl text-slate-900 tabular-nums leading-tight">
                  {accumulatedHours}
                  <span className="text-xs font-normal text-slate-500 ml-1">jam</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {approvedCount} disetujui · {pendingCount} antre
                </div>
              </div>
            </div>

            {/* Geofence Attendance Card (Student Primary Action) */}
            {role === 'student' ? (
              <section
                aria-label="Presensi Harian Geofence"
                className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display font-semibold text-sm text-slate-900">
                      Presensi Selasa, 17 Nov 2026
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" aria-hidden="true" />
                      <span className="truncate">{gpsStatus}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshGps}
                    disabled={locating}
                    aria-label="Perbarui koordinat GPS"
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Work Mode Segmented Selector */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                  {(['WFO', 'Lapangan', 'Izin'] as AttendanceMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setWorkMode(m)}
                      className={`min-h-[38px] rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        workMode === m
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3">
                    <div className="text-[11px] text-slate-500">Jam Masuk</div>
                    <div className="font-mono font-semibold text-base text-slate-900 tabular-nums mt-0.5">
                      {todayRecord.checkInTime || '--:--'}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3">
                    <div className="text-[11px] text-slate-500">Jam Pulang</div>
                    <div className="font-mono font-semibold text-base text-slate-900 tabular-nums mt-0.5">
                      {todayRecord.checkOutTime || '--:--'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {!todayRecord.checkInTime ? (
                    <button
                      type="button"
                      onClick={() => onCheckInOut(workMode)}
                      className="w-full min-h-[48px] rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-medium text-sm transition-all cursor-pointer"
                    >
                      Catat Masuk Kerja ({workMode})
                    </button>
                  ) : !todayRecord.checkOutTime ? (
                    <button
                      type="button"
                      onClick={() => onCheckInOut(workMode)}
                      className="w-full min-h-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-medium text-sm transition-all cursor-pointer"
                    >
                      Catat Pulang Kerja
                    </button>
                  ) : (
                    <div className="min-h-[44px] rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      <span>Presensi hari ini telah lengkap</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={openCreateSheet}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-blue-700" aria-hidden="true" />
                    <span>Catat Logbook Kegiatan</span>
                  </button>
                </div>
              </section>
            ) : (
              <section className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-semibold text-sm text-slate-900">
                    Ringkasan Antrean Verifikasi
                  </h2>
                  <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                    {pendingCount} Menunggu
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Peserta <span className="font-medium text-slate-900">{placement.studentName}</span> telah melakukan presensi masuk pada pukul{' '}
                  <span className="font-mono font-medium tabular-nums">
                    {todayRecord.checkInTime || '07:56'}
                  </span>{' '}
                  ({todayRecord.mode}).
                </p>
                <button
                  type="button"
                  onClick={() => onChangeTab('validation')}
                  className="w-full min-h-[48px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm transition-colors cursor-pointer"
                >
                  Tinjau Logbook & Beri Nilai
                </button>
              </section>
            )}

            {/* Horizontal Weekly Date Scroller */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm text-slate-900">
                  Jadwal Mingguan
                </h2>
                <span className="text-xs text-slate-500 font-mono tabular-nums">
                  {selectedDayRecord.checkInTime
                    ? `${selectedDayRecord.checkInTime} – ${selectedDayRecord.checkOutTime || 'Aktif'}`
                    : 'Libur / Tidak Hadir'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {attendances.map((att) => {
                  const isSelected = att.date === selectedDate;
                  return (
                    <button
                      key={att.id}
                      type="button"
                      onClick={() => setSelectedDate(att.date)}
                      className={`min-w-[46px] min-h-[56px] flex-1 rounded-2xl flex flex-col items-center justify-center gap-0.5 text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {att.dayLabel}
                      </span>
                      <span className="font-mono font-bold text-sm tabular-nums">
                        {att.dayNum}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recent Logbooks */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm text-slate-900">
                  Catatan Terbaru
                </h2>
                <button
                  type="button"
                  onClick={() => onChangeTab('logbook')}
                  className="min-h-[44px] px-2 text-xs font-medium text-blue-700 hover:underline cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {logbooks.slice(0, 3).map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => openDetailSheet(entry)}
                    className="w-full min-h-[64px] p-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums truncate">
                        {entry.displayDate} · {entry.competency}
                      </div>
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {entry.title}
                      </div>
                      <LogbookStatusText status={entry.status} compact />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: LOGBOOK HARIAN */}
        {effectiveTab === 'logbook' && (
          <div className="space-y-4">
            {role === 'student' && (
              <button
                type="button"
                onClick={openCreateSheet}
                className="w-full min-h-[48px] rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>Tambah Logbook Baru</span>
              </button>
            )}

            {/* Search */}
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kegiatan atau kompetensi..."
                aria-label="Cari catatan logbook"
                className="w-full min-h-[44px] bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            {/* Segmented Filter */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-xl">
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'approved', label: 'Sah' },
                  { id: 'pending', label: 'Antre' },
                  { id: 'revision', label: 'Revisi' },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setLogFilter(f.id)}
                  className={`min-h-[38px] rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    logFilter === f.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Logbook List */}
            {filteredLogs.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-2">
                <div className="text-sm font-medium text-slate-900">
                  Tidak ada catatan ditemukan
                </div>
                <p className="text-xs text-slate-500">
                  Ubah kata kunci pencarian atau filter status untuk melihat entri lainnya.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {filteredLogs.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => openDetailSheet(entry)}
                    className="w-full p-3.5 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {entry.photoUrl && (
                      <ResilientImage
                        src={entry.photoUrl}
                        alt={entry.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 mt-0.5"
                      />
                    )}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[11px] text-slate-500 font-mono tabular-nums truncate">
                        {entry.displayDate} · {entry.startTime}–{entry.endTime} · {entry.competency}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                        {entry.title}
                      </div>
                      <LogbookStatusText status={entry.status} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VALIDASI & BIMBINGAN */}
        {effectiveTab === 'validation' && (
          <div className="space-y-5">
            {/* Queue for mentors or status for student */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm text-slate-900">
                  {role === 'student'
                    ? 'Status Verifikasi Logbook'
                    : 'Antrean Verifikasi Pembimbing'}
                </h2>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {pendingCount} antre · {revisionCount} revisi
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                {logbooks
                  .filter((l) => (role === 'student' ? l.status !== 'approved' : l.status === 'pending' || l.status === 'revision'))
                  .map((entry) => (
                    <div key={entry.id} className="p-3.5 space-y-2.5">
                      <button
                        type="button"
                        onClick={() => openDetailSheet(entry)}
                        className="w-full text-left space-y-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                            {entry.displayDate} · {entry.competency}
                          </span>
                          <LogbookStatusText status={entry.status} compact />
                        </div>
                        <div className="text-sm font-semibold text-slate-900 leading-snug">
                          {entry.title}
                        </div>
                      </button>

                      {role !== 'student' && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => openDetailSheet(entry)}
                            className="min-h-[40px] rounded-xl border border-slate-300 text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
                          >
                            Tinjau & Revisi
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onVerifyLogbook(
                                entry.id,
                                'approved',
                                'Kegiatan telah sesuai dengan target kompetensi.'
                              )
                            }
                            className="min-h-[40px] rounded-xl bg-blue-700 hover:bg-blue-800 text-xs font-medium text-white cursor-pointer"
                          >
                            Setujui Cepat
                          </button>
                        </div>
                      )}

                      {role === 'student' && entry.status === 'revision' && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-900 space-y-2">
                          <div>{entry.mentorNote}</div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEntry(entry);
                              setSheetMode('edit');
                              setSheetOpen(true);
                            }}
                            className="min-h-[36px] px-3 rounded-lg bg-rose-700 text-white text-xs font-medium cursor-pointer"
                          >
                            Perbaiki Sekarang
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {logbooks.filter((l) =>
                  role === 'student' ? l.status !== 'approved' : l.status === 'pending' || l.status === 'revision'
                ).length === 0 && (
                  <div className="p-5 text-center text-xs text-slate-500">
                    Seluruh catatan logbook telah terverifikasi.
                  </div>
                )}
              </div>
            </section>

            {/* Supervision / Bimbingan Log */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm text-slate-900">
                  Riwayat Bimbingan Lapangan
                </h2>
                <button
                  type="button"
                  onClick={() => setShowBimbinganForm((v) => !v)}
                  className="min-h-[36px] px-2.5 text-xs font-medium text-blue-700 hover:bg-blue-50 rounded-lg cursor-pointer"
                >
                  {showBimbinganForm ? 'Batal' : '+ Catat Sesi'}
                </button>
              </div>

              {showBimbinganForm && (
                <form
                  onSubmit={handleSubmitBimbingan}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-2.5"
                >
                  <input
                    type="text"
                    value={bimbinganTopic}
                    onChange={(e) => setBimbinganTopic(e.target.value)}
                    placeholder="Topik bimbingan..."
                    className="w-full min-h-[42px] rounded-xl border border-slate-300 px-3 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={bimbinganNote}
                    onChange={(e) => setBimbinganNote(e.target.value)}
                    placeholder="Ringkasan arahan pembimbing..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full min-h-[42px] rounded-xl bg-blue-700 text-white text-xs font-medium cursor-pointer"
                  >
                    Simpan Catatan Bimbingan
                  </button>
                </form>
              )}

              <div className="space-y-2.5">
                {supervisions.map((sup) => (
                  <div
                    key={sup.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1.5"
                  >
                    <div className="text-[11px] font-mono text-slate-500 tabular-nums">
                      {sup.date} · {sup.supervisorName}
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{sup.topic}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{sup.summary}</p>
                    <div className="text-xs font-medium text-blue-700 pt-1">
                      Tindak lanjut: {sup.nextAction}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Evaluation Rubric */}
            <section className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-sm text-slate-900">
                  Rubrik Penilaian Akhir PKL
                </h2>
                <span className="font-mono text-sm font-bold text-blue-700 tabular-nums">
                  {weightedScore.toFixed(1)} / 100
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-3.5">
                {evaluations.map((ev) => (
                  <div key={ev.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-slate-900">
                        {ev.aspect}{' '}
                        <span className="text-slate-500 font-normal">({ev.weight}%)</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {ev.score}
                      </span>
                    </div>
                    {role !== 'student' ? (
                      <input
                        type="range"
                        min={50}
                        max={100}
                        value={ev.score}
                        aria-label={`Nilai ${ev.aspect}`}
                        onChange={(e) => onUpdateEvaluation(ev.id, Number(e.target.value))}
                        className="w-full accent-blue-700 cursor-pointer"
                      />
                    ) : (
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-700 rounded-full"
                          style={{ width: `${ev.score}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4 (MOBILE ONLY): RANCANGAN SISTEM */}
        {effectiveTab === 'blueprint' && <BlueprintView section="all" compactMobile />}

        {/* TAB 5: PROFIL & PENGATURAN */}
        {effectiveTab === 'profile' && (
          <div className="space-y-4">
            {/* Student Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3.5">
              <ResilientImage
                src={placement.studentAvatar}
                alt={placement.studentName}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="font-display font-bold text-base text-slate-900 truncate">
                  {placement.studentName}
                </div>
                <div className="font-mono text-xs text-slate-500 tabular-nums">
                  {placement.studentId} · {placement.program}
                </div>
                <div className="text-xs text-slate-600 truncate mt-0.5">
                  {placement.institution}
                </div>
              </div>
            </div>

            {/* Placement & Mentor Details */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
              <div className="font-display font-semibold text-sm text-slate-900">
                Informasi Penempatan DUDI
              </div>
              <div className="space-y-2 text-slate-600">
                <div>
                  <div className="text-slate-500">Perusahaan Mitra</div>
                  <div className="font-medium text-slate-900 text-sm">{placement.companyName}</div>
                  <div>{placement.companyAddress}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <div className="text-slate-500">Periode</div>
                    <div className="font-medium text-slate-900">
                      {placement.periodStart} – {placement.periodEnd}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Target Durasi</div>
                    <div className="font-mono font-medium text-slate-900 tabular-nums">
                      {placement.targetDays} Hari / {placement.targetHours} Jam
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <ResilientImage
                  src={placement.industryMentorAvatar}
                  alt={placement.industryMentorName}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {placement.industryMentorName}
                  </div>
                  <div className="text-slate-500 truncate">
                    {placement.industryMentorTitle} · Pembimbing DUDI
                  </div>
                </div>
              </div>
            </div>

            {/* Offline-First Simulation */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Simulasi Mode Offline
                  </div>
                  <div className="text-xs text-slate-500">
                    Simpan presensi & logbook ke antrean lokal saat sinyal terputus.
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={offlineMode}
                  onClick={onToggleOffline}
                  className={`min-h-[32px] w-12 rounded-full p-1 transition-colors shrink-0 cursor-pointer ${
                    offlineMode ? 'bg-amber-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-6 h-6 rounded-full bg-white transition-transform ${
                      offlineMode ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {pendingSyncCount > 0 && (
                <button
                  type="button"
                  onClick={onSyncNow}
                  className="w-full min-h-[44px] rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sinkronkan {pendingSyncCount} Data Lokal Sekarang</span>
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={onExportCsv}
                className="w-full min-h-[48px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Ekspor Rekap PKL (CSV)</span>
              </button>
              <button
                type="button"
                onClick={onResetDemo}
                className="w-full min-h-[44px] rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Simulasi</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Tab Bar (64px) */}
      <nav
        aria-label="Navigasi Utama Aplikasi Mobile"
        className={`${
          embeddedInFrame ? 'absolute bottom-0 left-0 right-0' : 'fixed bottom-0 left-0 right-0'
        } z-30 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 pb-safe`}
      >
        <div
          className={`h-full grid ${
            navTabs.length === 5 ? 'grid-cols-5' : 'grid-cols-4'
          } items-center`}
        >
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = effectiveTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-700 ${
                  isActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
                <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Sheet Overlay */}
      <LogbookSheet
        isOpen={sheetOpen}
        mode={sheetMode}
        entry={selectedEntry}
        role={role}
        embedded={embeddedInFrame}
        onClose={() => setSheetOpen(false)}
        onSaveEntry={handleSaveFromSheet}
        onSwitchToEdit={() => setSheetMode('edit')}
        onVerifyEntry={handleVerifyFromSheet}
      />
    </div>
  );
}
