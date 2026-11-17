import { AttendanceRecord, LogbookEntry, StudentPlacement } from '../types/pkl';

export function exportPklReportCsv(
  placement: StudentPlacement,
  logbooks: LogbookEntry[],
  attendances: AttendanceRecord[]
): void {
  const escapeCell = (val: string | number | undefined | null) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const lines: string[] = [];
  lines.push(['LAPORAN REKAP PRAKTEK KERJA LAPANGAN (PKL)'].map(escapeCell).join(','));
  lines.push(['Nama Peserta', placement.studentName, 'NIM/NISN', placement.studentId].map(escapeCell).join(','));
  lines.push(['Instansi Mitra', placement.companyName, 'Divisi', placement.division].map(escapeCell).join(','));
  lines.push(['Pembimbing Industri', placement.industryMentorName, 'Dosen/Guru Pembimbing', placement.academicSupervisorName].map(escapeCell).join(','));
  lines.push('');

  lines.push(['REKAP LOGBOOK KEGIATAN HARIAN'].map(escapeCell).join(','));
  lines.push(['ID', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Kompetensi', 'Judul Kegiatan', 'Uraian', 'Kendala', 'Solusi', 'Status', 'Catatan Pembimbing'].map(escapeCell).join(','));

  logbooks.forEach((entry) => {
    const statusText =
      entry.status === 'approved'
        ? 'Disetujui'
        : entry.status === 'revision'
        ? 'Perlu Revisi'
        : 'Menunggu Verifikasi';

    lines.push(
      [
        entry.id,
        entry.date,
        entry.startTime,
        entry.endTime,
        entry.competency,
        entry.title,
        entry.description,
        entry.obstacle,
        entry.solution,
        statusText,
        entry.mentorNote || '-',
      ]
        .map(escapeCell)
        .join(',')
    );
  });

  lines.push('');
  lines.push(['REKAP PRESENSI HARIAN'].map(escapeCell).join(','));
  lines.push(['Tanggal', 'Mode', 'Jam Masuk', 'Jam Pulang', 'Koordinat GPS', 'Radius (m)'].map(escapeCell).join(','));

  attendances.forEach((att) => {
    lines.push(
      [
        att.date,
        att.mode,
        att.checkInTime || '-',
        att.checkOutTime || '-',
        att.coordinates,
        att.radiusMeters,
      ]
        .map(escapeCell)
        .join(',')
    );
  });

  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Rekap_PKL_${placement.studentName.replace(/\s+/g, '_')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
