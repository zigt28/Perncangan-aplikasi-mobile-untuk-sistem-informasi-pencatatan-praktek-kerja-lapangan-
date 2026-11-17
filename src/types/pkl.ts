export type UserRole = 'student' | 'industry_mentor' | 'academic_supervisor';

export type MobileTab = 'home' | 'logbook' | 'validation' | 'blueprint' | 'profile';

export type DesktopSection = 'prototype' | 'use-case' | 'database' | 'ui-spec';

export type LogbookStatus = 'approved' | 'pending' | 'revision';

export type AttendanceMode = 'WFO' | 'Lapangan' | 'Izin';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayLabel: string; // Sen, Sel, etc.
  dayNum: string; // 11, 12, etc.
  mode: AttendanceMode;
  checkInTime: string | null; // HH:mm
  checkOutTime: string | null; // HH:mm
  coordinates: string;
  radiusMeters: number;
  verifiedLocation: boolean;
}

export interface LogbookEntry {
  id: string;
  date: string; // YYYY-MM-DD
  displayDate: string; // 17 Nov 2026
  startTime: string;
  endTime: string;
  competency: string;
  title: string;
  description: string;
  obstacle: string;
  solution: string;
  photoUrl?: string;
  photoCaption?: string;
  status: LogbookStatus;
  mentorNote?: string;
  verifiedAt?: string;
}

export interface SupervisionSession {
  id: string;
  date: string;
  supervisorName: string;
  supervisorRole: string;
  topic: string;
  summary: string;
  nextAction: string;
}

export interface EvaluationMetric {
  id: string;
  aspect: string;
  description: string;
  weight: number; // percentage
  score: number; // 0-100
}

export interface StudentPlacement {
  studentName: string;
  studentId: string;
  program: string;
  institution: string;
  studentAvatar: string;
  companyName: string;
  companyAddress: string;
  division: string;
  periodStart: string;
  periodEnd: string;
  targetDays: number;
  targetHours: number;
  industryMentorName: string;
  industryMentorTitle: string;
  industryMentorAvatar: string;
  academicSupervisorName: string;
  academicSupervisorTitle: string;
}

export interface UseCaseSpec {
  id: string;
  actor: string;
  title: string;
  channel: 'Mobile App' | 'Mobile & Web';
  trigger: string;
  outcome: string;
}

export interface UserFlowStep {
  step: string;
  title: string;
  actor: string;
  detail: string;
  offlineBehavior: string;
}

export interface DbColumn {
  name: string;
  type: string;
  key?: 'PK' | 'FK' | 'UQ';
  nullable?: boolean;
  note: string;
}

export interface DbTable {
  name: string;
  purpose: string;
  columns: DbColumn[];
}
