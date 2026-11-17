import { useState } from 'react';
import { Database, Layers, Smartphone, ArrowRight, Check, KeyRound } from 'lucide-react';
import { DATABASE_TABLES, USE_CASE_SPECS, USER_FLOW_STEPS } from '../data/initialData';
import { DesktopSection } from '../types/pkl';

interface BlueprintViewProps {
  section?: Exclude<DesktopSection, 'prototype'> | 'all';
  compactMobile?: boolean;
}

export function BlueprintView({ section = 'all', compactMobile = false }: BlueprintViewProps) {
  const [selectedTable, setSelectedTable] = useState<string>(DATABASE_TABLES[0].name);
  const [mobileSubTab, setMobileSubTab] = useState<'use-case' | 'database' | 'ui-spec'>('use-case');

  const activeMode = section === 'all' ? mobileSubTab : section;

  const activeDbTable =
    DATABASE_TABLES.find((t) => t.name === selectedTable) || DATABASE_TABLES[0];

  return (
    <div className={compactMobile ? 'space-y-6 pb-8' : 'space-y-10 pb-12'}>
      {/* Section Header */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-blue-700 tracking-tight">
          Dokumentasi Perancangan Sistem
        </p>
        <h2
          className={`font-display font-bold text-slate-900 tracking-tight text-balance ${
            compactMobile ? 'text-xl' : 'text-2xl sm:text-3xl'
          }`}
        >
          {activeMode === 'use-case' && 'Arsitektur Aktor, Use Case & Alur Pencatatan'}
          {activeMode === 'database' && 'Skema Relasional Basis Data & Antrean Offline'}
          {activeMode === 'ui-spec' && 'Spesifikasi Ergonomi Mobile & Sistem Desain UI'}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          {activeMode === 'use-case' &&
            'Pemetaan kebutuhan fungsional untuk peserta PKL, pembimbing industri (DUDI), serta guru atau dosen pembimbing lapangan.'}
          {activeMode === 'database' &&
            'Struktur tabel relasional PostgreSQL dengan dukungan sinkronisasi offline-first untuk area kerja lapangan minim sinyal.'}
          {activeMode === 'ui-spec' &&
            'Standar keterjangkauan ibu jari (thumb zone), target sentuh minimal 44px, serta hirarki tipografi luar ruang.'}
        </p>

        {section === 'all' && (
          <div className="pt-2">
            <div
              role="tablist"
              aria-label="Bagian Perancangan"
              className="grid grid-cols-3 gap-1 p-1 bg-slate-200/70 rounded-xl"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mobileSubTab === 'use-case'}
                onClick={() => setMobileSubTab('use-case')}
                className={`min-h-[40px] px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  mobileSubTab === 'use-case'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Use Case
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileSubTab === 'database'}
                onClick={() => setMobileSubTab('database')}
                className={`min-h-[40px] px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  mobileSubTab === 'database'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Basis Data
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobileSubTab === 'ui-spec'}
                onClick={() => setMobileSubTab('ui-spec')}
                className={`min-h-[40px] px-2.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  mobileSubTab === 'ui-spec'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ergonomi UI
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: USE CASE & USER FLOW */}
      {activeMode === 'use-case' && (
        <div className="space-y-10">
          {/* User Flow Steps */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Layers className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
              <h3 className="text-lg font-display font-semibold">
                01. Alur Pengguna End-to-End (User Flow)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {USER_FLOW_STEPS.map((flow, index) => (
                <div
                  key={flow.step}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono font-semibold text-blue-700 tabular-nums">
                        Langkah {flow.step}
                      </span>
                      {index < USER_FLOW_STEPS.length - 1 && (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 hidden md:block" aria-hidden="true" />
                      )}
                    </div>
                    <h4 className="font-display font-semibold text-sm text-slate-900 leading-snug">
                      {flow.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{flow.detail}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1">
                    <div className="text-[11px] font-medium text-slate-700">
                      Aktor: {flow.actor}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Offline: {flow.offlineBehavior}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Use Case Matrix */}
          <section className="space-y-4">
            <h3 className="text-lg font-display font-semibold text-slate-900">
              02. Matriks Spesifikasi Use Case (UC-01 – UC-07)
            </h3>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-700">
                      <th className="py-3.5 px-4 whitespace-nowrap">Kode</th>
                      <th className="py-3.5 px-4">Aktor Utama</th>
                      <th className="py-3.5 px-4">Kebutuhan Fungsional</th>
                      <th className="py-3.5 px-4 whitespace-nowrap">Kanal</th>
                      <th className="py-3.5 px-4">Keluaran Sistem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {USE_CASE_SPECS.map((uc) => (
                      <tr key={uc.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap tabular-nums align-top">
                          {uc.id}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700 align-top min-w-[160px]">
                          {uc.actor}
                        </td>
                        <td className="py-3.5 px-4 align-top min-w-[220px]">
                          <div className="font-medium text-slate-900 text-sm">{uc.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{uc.trigger}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap align-top">
                          {uc.channel}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 leading-relaxed align-top min-w-[220px]">
                          {uc.outcome}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SECTION 2: DATABASE SCHEMA */}
      {activeMode === 'database' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-slate-900">
            <Database className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
            <h3 className="text-lg font-display font-semibold">
              01. Entitas & Relasi Tabel (PostgreSQL + Local Cache)
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table selector list */}
            <div className="lg:col-span-4 space-y-2">
              {DATABASE_TABLES.map((table) => {
                const isSelected = table.name === activeDbTable.name;
                return (
                  <button
                    key={table.name}
                    type="button"
                    onClick={() => setSelectedTable(table.name)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer min-h-[56px] ${
                      isSelected
                        ? 'bg-white border-blue-700 ring-1 ring-blue-700/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-semibold text-slate-900">
                        {table.name}
                      </span>
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {table.columns.length} kolom
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{table.purpose}</p>
                  </button>
                );
              })}
            </div>

            {/* Active table inspector */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h4 className="font-mono text-base font-semibold text-slate-900">
                    Tabel: {activeDbTable.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">{activeDbTable.purpose}</p>
                </div>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {activeDbTable.columns.length} atribut
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-700">
                      <th className="py-3 px-4">Atribut</th>
                      <th className="py-3 px-4">Tipe Data</th>
                      <th className="py-3 px-4">Kunci</th>
                      <th className="py-3 px-4">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {activeDbTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-mono text-xs font-medium text-slate-900 whitespace-nowrap">
                          {col.name}
                          {col.nullable && <span className="text-slate-400 ml-1">?</span>}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-blue-700 whitespace-nowrap">
                          {col.type}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-700 whitespace-nowrap">
                          {col.key ? (
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <KeyRound className="w-3 h-3 text-slate-500" aria-hidden="true" />
                              {col.key}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600">{col.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Relationship summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <h4 className="font-display font-semibold text-sm text-slate-900">
              Relasi Kardinalitas & Strategi Sinkronisasi Offline
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
              <div>
                <div className="font-semibold text-slate-900 mb-1">1. Relasi Penempatan (1 : N)</div>
                Satu akun <span className="font-mono text-slate-800">users</span> dapat memiliki satu penempatan aktif pada <span className="font-mono text-slate-800">placements</span>, sedangkan satu penempatan menaungi banyak <span className="font-mono text-slate-800">attendances</span> dan <span className="font-mono text-slate-800">logbooks</span>.
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">2. Antrean Lokal Perangkat</div>
                Ketika peserta berada di ruang server atau proyek lapangan tanpa koneksi internet, kolom <span className="font-mono text-slate-800">sync_status = pending_upload</span> menyimpan data di IndexedDB/SQLite terlebih dahulu.
              </div>
              <div>
                <div className="font-semibold text-slate-900 mb-1">3. Audit Trail Verifikasi</div>
                Setiap perubahan status menjadi <span className="font-mono text-slate-800">approved</span> atau <span className="font-mono text-slate-800">revision</span> mencatat <span className="font-mono text-slate-800">verified_at</span> dan catatan pembimbing yang tidak dapat dimanipulasi mundur oleh peserta.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: MOBILE UI & ERGONOMICS */}
      {activeMode === 'ui-spec' && (
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-slate-900">
            <Smartphone className="w-4 h-4 text-blue-700 shrink-0" aria-hidden="true" />
            <h3 className="text-lg font-display font-semibold">
              01. Ergonomi Zona Jempol (Thumb-Zone) & Standar Aksesibilitas
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Thumb Zone Visual Schematic */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <h4 className="font-display font-semibold text-sm text-slate-900">
                  Distribusi Layar Smartphone (375px – 430px)
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Pengoperasian satu tangan saat berdiri di lokasi proyek atau ruang praktik.
                </p>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                <div className="bg-slate-100 p-3.5 border-b border-slate-200">
                  <div className="flex items-center justify-between font-medium text-slate-700">
                    <span>Zona Atas (30%)</span>
                    <span className="font-mono text-[11px] text-slate-500">52px Sticky</span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    Judul halaman, informasi penempatan, dan aksi non-destruktif sekunder.
                  </p>
                </div>

                <div className="bg-white p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between font-medium text-slate-900">
                    <span>Zona Tengah (30%)</span>
                    <span className="font-mono text-[11px] text-slate-500">Scrollable</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    Ringkasan jam PKL, kartu presensi geofence, daftar logbook harian, dan galeri bukti foto.
                  </p>
                </div>

                <div className="bg-blue-50/70 p-4">
                  <div className="flex items-center justify-between font-semibold text-blue-800">
                    <span>Zona Jempol Natural (40%)</span>
                    <span className="font-mono text-[11px]">Hitbox &ge; 44px</span>
                  </div>
                  <p className="text-blue-900/80 mt-1">
                    Tombol utama Catat Masuk/Pulang, tombol tambah logbook, modal bottom sheet, serta 4–5 tab navigasi bawah (64px).
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Total tinggi elemen sticky (header + bottom bar) dijaga &le; 15% tinggi layar mobile agar 85% ruang konten tetap lega.
              </div>
            </div>

            {/* Design System Tokens & Ergonomic Rules */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 space-y-6">
              <div>
                <h4 className="font-display font-semibold text-sm text-slate-900">
                  Sistem Warna 60-30-10 & Keterbacaan Luar Ruang
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <div className="h-8 rounded-lg bg-slate-50 border border-slate-200" />
                    <div className="text-xs font-semibold text-slate-900">60% Kanvas Netral</div>
                    <div className="font-mono text-[11px] text-slate-500">#F8FAFC · Slate 50</div>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <div className="h-8 rounded-lg bg-white border border-slate-200" />
                    <div className="text-xs font-semibold text-slate-900">30% Permukaan Kartu</div>
                    <div className="font-mono text-[11px] text-slate-500">#FFFFFF · Border #E2E8F0</div>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <div className="h-8 rounded-lg bg-blue-700" />
                    <div className="text-xs font-semibold text-slate-900">10% Aksi Utama</div>
                    <div className="font-mono text-[11px] text-slate-500">#1D4ED8 · Kontras 6.7:1</div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h4 className="font-display font-semibold text-sm text-slate-900 mb-3">
                  Checklist Ergonomi & Tipografi Terimplementasi
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Semua tombol & tab memiliki target sentuh minimal 44&times;44px (48px untuk CTA utama).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Status verifikasi selalu memakai teks eksplisit + ikon (tidak hanya warna).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Pasangan font Plus Jakarta Sans (judul), DM Sans (bacaan), dan JetBrains Mono (angka tabular).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Formulir pencatatan memakai Bottom Sheet agar ibu jari tetap berada di area bawah layar.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
