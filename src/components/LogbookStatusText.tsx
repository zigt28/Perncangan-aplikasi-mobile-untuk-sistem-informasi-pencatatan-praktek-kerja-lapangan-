import { CheckCircle2, Clock3, AlertCircle } from 'lucide-react';
import { LogbookStatus } from '../types/pkl';

interface LogbookStatusTextProps {
  status: LogbookStatus;
  compact?: boolean;
}

export function LogbookStatusText({ status, compact = false }: LogbookStatusTextProps) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{compact ? 'Disetujui' : 'Disetujui Pembimbing'}</span>
      </span>
    );
  }

  if (status === 'revision') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 whitespace-nowrap shrink-0">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{compact ? 'Revisi' : 'Perlu Revisi'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap shrink-0">
      <Clock3 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>{compact ? 'Menunggu' : 'Menunggu Verifikasi'}</span>
    </span>
  );
}
