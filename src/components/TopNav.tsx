import { DesktopSection } from '../types/pkl';

interface TopNavProps {
  activeSection: DesktopSection;
  onSelectSection: (section: DesktopSection) => void;
  onExportCsv: () => void;
}

const NAV_ITEMS: { id: DesktopSection; label: string }[] = [
  { id: 'prototype', label: 'Prototipe Mobile' },
  { id: 'use-case', label: 'Alur & Use Case' },
  { id: 'database', label: 'Skema Database' },
  { id: 'ui-spec', label: 'Spesifikasi UI' },
];

export function TopNav({ activeSection, onSelectSection, onExportCsv }: TopNavProps) {
  return (
    <header className="hidden lg:block sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand wordmark */}
        <button
          type="button"
          onClick={() => onSelectSection('prototype')}
          className="text-lg font-display font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 cursor-pointer"
        >
          JurnalPKL
        </button>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav aria-label="Navigasi Perancangan" className="flex items-center gap-7">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700 ${
                  isActive
                    ? 'text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[17px] h-0.5 bg-blue-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onExportCsv}
            className="px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Ekspor CSV
          </button>
        </div>
      </div>
    </header>
  );
}
