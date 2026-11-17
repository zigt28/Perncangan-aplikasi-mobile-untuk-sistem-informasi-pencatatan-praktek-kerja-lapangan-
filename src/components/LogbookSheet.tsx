import React, { useState, useEffect } from 'react';
import { X, Camera, CheckCircle2, AlertCircle, Pencil } from 'lucide-react';
import { LogbookEntry, UserRole } from '../types/pkl';
import { LogbookStatusText } from './LogbookStatusText';
import { ResilientImage } from './ResilientImage';

interface LogbookSheetProps {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'detail';
  entry: LogbookEntry | null;
  role: UserRole;
  embedded?: boolean;
  onClose: () => void;
  onSaveEntry: (entryData: Omit<LogbookEntry, 'id' | 'status'>, existingId?: string) => void;
  onSwitchToEdit: () => void;
  onVerifyEntry: (entryId: string, status: 'approved' | 'revision', note: string) => void;
}

const COMPETENCY_OPTIONS = [
  'Backend API',
  'Jaringan & Server',
  'Frontend & UI Mobile',
  'DevOps & Monitoring',
  'Basis Data & SQL',
  'Analisis & Pengujian',
];

const SAMPLE_PHOTOS = [
  {
    label: 'Meja Kerja & Kode',
    url: '/src/assets/images/evidence_coding_workspace_1794913006330.jpg',
  },
  {
    label: 'Rak Server & Jaringan',
    url: '/src/assets/images/evidence_server_rack_1794913005697.jpg',
  },
];

export function LogbookSheet({
  isOpen,
  mode,
  entry,
  role,
  embedded = false,
  onClose,
  onSaveEntry,
  onSwitchToEdit,
  onVerifyEntry,
}: LogbookSheetProps) {
  const [date, setDate] = useState('2026-11-17');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [competency, setCompetency] = useState(COMPETENCY_OPTIONS[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [solution, setSolution] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [photoCaption, setPhotoCaption] = useState('');
  const [formError, setFormError] = useState('');

  const [mentorNoteInput, setMentorNoteInput] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormError('');
      setShowRevisionInput(false);
      setMentorNoteInput('');
      if ((mode === 'edit' || mode === 'detail') && entry) {
        setDate(entry.date);
        setStartTime(entry.startTime);
        setEndTime(entry.endTime);
        setCompetency(entry.competency);
        setTitle(entry.title);
        setDescription(entry.description);
        setObstacle(entry.obstacle);
        setSolution(entry.solution);
        setPhotoUrl(entry.photoUrl);
        setPhotoCaption(entry.photoCaption || '');
      } else if (mode === 'create') {
        setDate('2026-11-17');
        setStartTime('08:00');
        setEndTime('17:00');
        setCompetency(COMPETENCY_OPTIONS[0]);
        setTitle('');
        setDescription('');
        setObstacle('');
        setSolution('');
        setPhotoUrl(undefined);
        setPhotoCaption('');
      }
    }
  }, [isOpen, mode, entry]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setPhotoCaption(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatDisplayDate = (isoDate: string) => {
    const parts = isoDate.split('-');
    if (parts.length !== 3) return isoDate;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const mIdx = parseInt(parts[1], 10) - 1;
    return `${parseInt(parts[2], 10)} ${months[mIdx] || parts[1]} ${parts[0]}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Judul kegiatan dan uraian pekerjaan wajib diisi.');
      return;
    }

    onSaveEntry(
      {
        date,
        displayDate: formatDisplayDate(date),
        startTime,
        endTime,
        competency,
        title: title.trim(),
        description: description.trim(),
        obstacle: obstacle.trim() || 'Tidak ada kendala berarti.',
        solution: solution.trim() || 'Kegiatan berjalan sesuai rencana kerja.',
        photoUrl,
        photoCaption: photoCaption || (photoUrl ? 'Dokumentasi kegiatan lapangan' : undefined),
      },
      mode === 'edit' && entry ? entry.id : undefined
    );
  };

  const positionClass = embedded ? 'absolute inset-0 z-40' : 'fixed inset-0 z-50';

  return (
    <div
      className={`${positionClass} flex items-end justify-center bg-slate-900/50 backdrop-blur-[2px]`}
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'detail' ? 'Detail Logbook PKL' : 'Catat Logbook PKL'}
    >
      <div
        className="w-full max-h-[90%] bg-white rounded-t-3xl flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-slate-300" aria-hidden="true" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <h3 className="font-display font-bold text-base text-slate-900 truncate">
            {mode === 'create' && 'Catat Logbook Harian'}
            {mode === 'edit' && 'Perbaiki Entri Logbook'}
            {mode === 'detail' && 'Rincian Catatan PKL'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel"
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sheet Scrollable Body */}
        {mode === 'detail' && entry ? (
          <>
            <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs text-slate-500 font-mono tabular-nums">
                    {entry.displayDate} · {entry.startTime}–{entry.endTime} · {entry.competency}
                  </div>
                  <LogbookStatusText status={entry.status} />
                </div>
                <h4 className="font-display font-bold text-base text-slate-900 leading-snug">
                  {entry.title}
                </h4>
              </div>

              {entry.photoUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                  <ResilientImage
                    src={entry.photoUrl}
                    alt={entry.photoCaption || entry.title}
                    className="w-full h-44 object-cover"
                    fallbackLabel="Foto dokumentasi tidak tersedia"
                  />
                  {entry.photoCaption && (
                    <div className="px-3 py-2 text-xs text-slate-600 border-t border-slate-200">
                      {entry.photoCaption}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-700">Uraian Kegiatan</div>
                <p className="text-sm text-slate-700 leading-relaxed">{entry.description}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <div>
                  <div className="text-xs font-semibold text-slate-700">Kendala Lapangan</div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{entry.obstacle}</p>
                </div>
                <div className="border-t border-slate-200 pt-2.5">
                  <div className="text-xs font-semibold text-slate-700">Solusi & Tindak Lanjut</div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{entry.solution}</p>
                </div>
              </div>

              {entry.mentorNote && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-800">
                    <span>Catatan Pembimbing</span>
                    {entry.verifiedAt && (
                      <span className="font-mono font-normal text-[11px] text-slate-500 tabular-nums">
                        {entry.verifiedAt}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{entry.mentorNote}</p>
                </div>
              )}

              {role !== 'student' && showRevisionInput && (
                <div className="space-y-2 pt-1">
                  <label
                    htmlFor="mentor-revision-note"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    Catatan Revisi untuk Peserta PKL
                  </label>
                  <textarea
                    id="mentor-revision-note"
                    rows={3}
                    value={mentorNoteInput}
                    onChange={(e) => setMentorNoteInput(e.target.value)}
                    placeholder="Tuliskan bagian yang perlu dilengkapi atau diperbaiki..."
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 bg-white shrink-0 pb-safe">
              {role === 'student' ? (
                entry.status === 'revision' ? (
                  <button
                    type="button"
                    onClick={onSwitchToEdit}
                    className="w-full min-h-[48px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Perbaiki & Kirim Ulang</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full min-h-[48px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium text-sm transition-colors cursor-pointer"
                  >
                    Tutup Rincian
                  </button>
                )
              ) : showRevisionInput ? (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowRevisionInput(false)}
                    className="min-h-[48px] rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onVerifyEntry(
                        entry.id,
                        'revision',
                        mentorNoteInput.trim() || 'Mohon lengkapi dokumentasi dan rincian teknis.'
                      )
                    }
                    className="min-h-[48px] rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-medium text-sm cursor-pointer"
                  >
                    Kirim Revisi
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowRevisionInput(true)}
                    className="min-h-[48px] rounded-xl border border-slate-300 text-slate-800 font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-700" />
                    <span>Minta Revisi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onVerifyEntry(
                        entry.id,
                        'approved',
                        'Kegiatan telah sesuai dengan target kompetensi lapangan.'
                      )
                    }
                    className="min-h-[48px] rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Setujui</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 overflow-y-auto space-y-4 text-sm flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-3 sm:col-span-1">
                  <label htmlFor="log-date" className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    id="log-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-xs font-mono text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="log-start" className="block text-xs font-semibold text-slate-700 mb-1">
                    Mulai
                  </label>
                  <input
                    id="log-start"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 px-2.5 text-xs font-mono text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="log-end" className="block text-xs font-semibold text-slate-700 mb-1">
                    Selesai
                  </label>
                  <input
                    id="log-end"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 px-2.5 text-xs font-mono text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="log-competency" className="block text-xs font-semibold text-slate-700 mb-1">
                  Bidang Kompetensi
                </label>
                <select
                  id="log-competency"
                  value={competency}
                  onChange={(e) => setCompetency(e.target.value)}
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm text-slate-900 bg-white focus:border-blue-700 focus:outline-none"
                >
                  {COMPETENCY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="log-title" className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Kegiatan
                </label>
                <input
                  id="log-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pengujian API Sinkronisasi Presensi"
                  className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="log-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Pekerjaan
                </label>
                <textarea
                  id="log-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan langkah kerja, perangkat/teknologi, serta hasil yang dicapai..."
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label htmlFor="log-obstacle" className="block text-xs font-semibold text-slate-700 mb-1">
                    Kendala Lapangan (Opsional)
                  </label>
                  <input
                    id="log-obstacle"
                    type="text"
                    value={obstacle}
                    onChange={(e) => setObstacle(e.target.value)}
                    placeholder="Contoh: Timeout saat koneksi ke server staging"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="log-solution" className="block text-xs font-semibold text-slate-700 mb-1">
                    Solusi / Mitigasi (Opsional)
                  </label>
                  <input
                    id="log-solution"
                    type="text"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Contoh: Menambah retry policy dan pengecekan log"
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 px-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Attachment */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700">Bukti Foto Lapangan</div>
                <div className="flex flex-wrap gap-2">
                  <label className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 inline-flex items-center gap-2 hover:bg-slate-50 cursor-pointer">
                    <Camera className="w-4 h-4 text-blue-700" />
                    <span>Unggah Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="sr-only"
                    />
                  </label>

                  {SAMPLE_PHOTOS.map((sample) => (
                    <button
                      key={sample.url}
                      type="button"
                      onClick={() => {
                        setPhotoUrl(sample.url);
                        setPhotoCaption(sample.label);
                      }}
                      className={`min-h-[44px] px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                        photoUrl === sample.url
                          ? 'border-blue-700 bg-blue-50 text-blue-800'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>

                {photoUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 mt-2">
                    <ResilientImage
                      src={photoUrl}
                      alt="Pratinjau foto logbook"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl(undefined);
                        setPhotoCaption('');
                      }}
                      className="absolute top-2 right-2 min-h-[32px] px-2.5 rounded-lg bg-slate-900/80 text-white text-xs font-medium cursor-pointer"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white shrink-0 pb-safe">
              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white font-medium text-sm transition-all cursor-pointer"
              >
                {mode === 'edit' ? 'Kirim Ulang Perbaikan' : 'Simpan & Ajukan Verifikasi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
