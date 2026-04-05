import { Search, Menu, X } from 'lucide-react';

const Header = ({
  searchQuery,
  onSearchChange,
  mobileMenuOpen,
  onMobileMenuToggle,
}) => (
  <header className="sticky top-0 z-50 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 sm:gap-4 sm:px-6 lg:px-8">
    <div className="flex min-w-0 w-full items-center gap-2 sm:gap-4">
      <button
        type="button"
        onClick={onMobileMenuToggle}
        className="shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        aria-expanded={mobileMenuOpen}
        aria-controls="app-sidebar"
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>
      <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-slate-400 transition-all has-[:focus-within]:ring-2 has-[:focus-within]:ring-indigo-500/30 dark:bg-slate-800 sm:max-w-md sm:gap-3 sm:py-1.5 md:max-w-lg">
        <Search size={18} className="shrink-0" aria-hidden />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search apps…"
          autoComplete="off"
          aria-label="Filter apps on dashboard"
          className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-w-0"
        />
      </label>
    </div>
  </header>
);

export default Header;
