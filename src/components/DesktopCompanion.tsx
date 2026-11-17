import { CheckCircle2, Clock3, AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import {
  AttendanceRecord,
  EvaluationMetric,
  LogbookEntry,
  MobileTab,
  StudentPlacement,
  UserRole,
} from '../types/pkl';
import { LogbookStatusText } from './LogbookStatusText';

interface DesktopCompanionProps {
  role: UserRole;
  onChangeRole: (role: UserRole) => void;
  activeMobileTab: MobileTab;
  onChangeMobileTab: (tab: MobileTab) => void;
  placement: StudentPlacement;
  attendances: AttendanceRecord[];
  logbooks: LogbookEntry[];
  evaluations: EvaluationMetric[];
  offlineMode: boolean;
  pendingSyncCount: number;
  onToggleOffline: () => void;
  onSyncNow: () => void;
  onQuickApprove: (id: string) => void;
}

const SCREEN_NOTES: Record<MobileTab, { title: string; focus: string; components: string[] }> = {
  home: {
    title: 'Layar Beranda & Presensi Geofence',
    focus: 'Mengutamakan aksi check-in/out dan pencatatan harian di zona bawah yang mudah dijangkau ibu jari.',
    components: [
      'Kartu progres target hari & jam kerja memakai SVG ring + angka tabular.',
      'Pemilih mode kerja (WFO, Lapangan, Izin) dengan verifikasi radius koordinat GPS.',
      'Pemilih tanggal horizontal 7 hari untuk memantau riwayat masuk/pulang sepekan.',
    ],
  },
  logbook: {
    title: 'Layar Logbook Kegiatan Harian',
    focus: 'Pencatatan cepat melalui Bottom Sheet agar peserta tetap fokus di lapangan tanpa berpindah halaman.',
    components: [
      'Pencarian teks dan filter segmen status (Semua, Sah, Antre, Revisi).',
      'Baris daftar berjarak sentuh >= 64px dengan pratinjau foto lapangan.',
      'Formulir Bottom Sheet mendukung lampiran foto, kendala lapangan, dan solusi.',
    ],
  },
  validation: {
    title: 'Layar Validasi Pembimbing & Rubrik Nilai',
    focus: 'Memungkinkan pembimbing DUDI menyetujui atau meminta revisi logbook dalam satu ketukan.',
    components: [
      'Antrean verifikasi kontekstual sesuai peran (Peserta, Pembimbing DUDI, Dosen).',
      'Catatan bimbingan berkala lengkap dengan rencana tindak lanjut.',
      'Rubrik penilaian berbobot 0–100 dengan kalkulasi nilai akhir otomatis.',
    ],
  },
  blueprint: {
    title: 'Dokumentasi Perancangan Sistem',
    focus: 'Menampilkan matriks Use Case, skema relasional PostgreSQL, dan standar ergonomi UI.',
    components: [],
  },
  profile: {
    title: 'Layar Profil, Penempatan & Mode Offline',
    focus: 'Menjaga transparansi data mitra DUDI serta simulasi antrean sinkronisasi lokal.',
    components: [
      'Detail perusahaan mitra, divisi penempatan, serta profil pembimbing industri.',
      'Simulasi mode offline untuk menguji penyimpanan antrean data lokal perangkat.',
      'Ekspor laporan PKL menjadi berkas CSV siap cetak atau arsip sekolah/kampus.',
    ],
  },
};

export function DesktopCompanion({
  role,
  onChangeRole,
  activeMobileTab,
  onChangeMobileTab,
  placement,
  attendances,
  logbooks,
  evaluations,
  offlineMode,
  pendingSyncCount,
  onToggleOffline,
  onSyncNow,
  onQuickApprove,
}: DesktopCompanionProps) {
  const approvedCount = logbooks.filter((l) => l.status === 'approved').length;
  const pendingCount = logbooks.filter((l) => l.status === 'pending').length;
  const revisionCount = logbooks.filter((l) => l.status === 'revision').length;
  const completedDays = 38 + attendances.filter((a) => a.checkInTime !== null).length;
  const weightedScore = evaluations.reduce(
    (sum, item) => sum + (item.score * item.weight) / 100,
    0
  );

  const note = SCREEN_NOTES[activeMobileTab] || SCREEN_NOTES.home;

  return (
    <div className="space-y-6">
      {/* Intro & Role Switcher */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-blue-700">
          Prototipe Interaktif & Simulasi Multi-Aktor
        </p>
        <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight text-balance">
          Sistem Pencatatan Praktek Kerja Lapangan Mobile
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          Uji langsung alur presensi geofence, pencatatan logbook harian, serta verifikasi pembimbing pada pratinjau smartphone di sebelah kiri. Setiap perubahan tersinkronisasi langsung dengan ringkasan di panel ini.
        </p>

        {/* Workspace Toolbar: Actor Switcher + Offline Toggle */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-3">
          <div
            role="group"
            aria-label="Simulasi Peran Pengguna"
            className="inline-flex items-center gap-1 p-1 bg-slate-200/75 rounded-xl"
          >
            {(
              [
                { id: 'student', label: 'Peserta PKL' },
                { id: 'industry_mentor', label: 'Pembimbing DUDI' },
                { id: 'academic_supervisor', label: 'Dosen Pembimbing' },
              ] as { id: UserRole; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeRole(item.id)}
                className={`min-h-[38px] px-3.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  role === item.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleOffline}
              className={`min-h-[38px] px-3 rounded-xl border text-xs font-medium inline-flex items-center gap-2 transition-colors cursor-pointer ${
                offlineMode
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{offlineMode ? 'Mode Offline Aktif' : 'Simulasikan Offline'}</span>
            </button>

            {pendingSyncCount > 0 && (
              <button
                type="button"
                onClick={onSyncNow}
                className="min-h-[38px] px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="tabular-nums">Sync ({pendingSyncCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-500">Kehadiran PKL</div>
          <div className="font-display font-bold text-2xl text-slate-900 tabular-nums">
            {completedDays}
            <span className="text-xs font-normal text-slate-500">/{placement.targetDays} hr</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-500">Logbook Sah</div>
          <div className="font-display font-bold text-2xl text-emerald-700 tabular-nums flex items-baseline gap-1.5">
            <span>{approvedCount}</span>
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-500">Menunggu / Revisi</div>
          <div className="font-display font-bold text-2xl text-amber-700 tabular-nums flex items-baseline gap-1.5">
            <span>{pendingCount + revisionCount}</span>
            {revisionCount > 0 ? (
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" aria-hidden="true" />
            ) : (
              <Clock3 className="w-4 h-4 shrink-0" aria-hidden="true" />
            )}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1">
          <div className="text-xs text-slate-500">Nilai Terbobot</div>
          <div className="font-display font-bold text-2xl text-blue-700 tabular-nums">
            {weightedScore.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Active Screen Specification */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display font-semibold text-base text-slate-900">
            {note.title}
          </h2>
          <div className="flex items-center gap-1 text-xs">
            {(['home', 'logbook', 'validation', 'profile'] as MobileTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChangeMobileTab(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeMobileTab === t
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {t === 'home'
                  ? 'Beranda'
                  : t === 'logbook'
                  ? 'Logbook'
                  : t === 'validation'
                  ? 'Validasi'
                  : 'Profil'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{note.focus}</p>
        {note.components.length > 0 && (
          <ul className="space-y-1.5 pt-1 text-xs text-slate-700">
            {note.components.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-blue-700 font-bold" aria-hidden="true">
                  ·
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Synced Live Logbook Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
          <h3 className="font-display font-semibold text-sm text-slate-900">
            Data Logbook Tersinkronisasi
          </h3>
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            {logbooks.length} entri tercatat
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-700">
                <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4">Kegiatan & Kompetensi</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                {role !== 'student' && <th className="py-3 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {logbooks.slice(0, 5).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                    {entry.displayDate}
                    <div className="text-[11px] text-slate-400">
                      {entry.startTime}–{entry.endTime}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900 line-clamp-1">{entry.title}</div>
                    <div className="text-slate-500 mt-0.5">{entry.competency}</div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <LogbookStatusText status={entry.status} compact />
                  </td>
                  {role !== 'student' && (
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {entry.status !== 'approved' ? (
                        <button
                          type="button"
                          onClick={() => onQuickApprove(entry.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium cursor-pointer"
                        >
                          Setujui
                        </button>
                      ) : (
                        <span className="text-slate-400">Terverifikasi</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
