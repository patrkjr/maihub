import { ChevronLeft, ChevronRight, Home, LayoutGrid } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

const navItemClass = ({ isActive }) =>
  `w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
    isActive
      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
  }`;

const Sidebar = ({
  themePreference,
  isSidebarOpen,
  nicheApps,
  onToggleSidebar,
  onThemePreferenceChange,
  onNavigate,
}) => (
  <aside
    id="app-sidebar"
    className={`group fixed left-0 top-0 z-40 flex h-full flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-900 lg:transition-[width,transform] ${
      isSidebarOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'
    } w-[min(100vw,16rem)] ${isSidebarOpen ? 'lg:w-64' : 'lg:w-20'}`}
  >
    <div
      className={`flex gap-2 p-4 ${
        isSidebarOpen
          ? 'flex-row items-center justify-between'
          : 'flex-col items-center gap-3 max-lg:flex-row max-lg:items-center max-lg:justify-between'
      }`}
    >
      <NavLink
        to='/'
        onClick={onNavigate}
        className={`flex items-center gap-3 overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isSidebarOpen ? 'min-w-0 flex-1' : ''
        }`}
        title='Home'
      >
        <div className='flex h-8 w-8 min-w-[32px] shrink-0 items-center justify-center rounded-lg bg-indigo-600'>
          <LayoutGrid className='text-white' size={20} />
        </div>
        {isSidebarOpen && (
          <span className='animate-in fade-in text-xl font-bold tracking-tight whitespace-nowrap text-slate-900 duration-300 dark:text-slate-100'>
            Maihub
          </span>
        )}
      </NavLink>

      <button
        type='button'
        onClick={onToggleSidebar}
        aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        className='shrink-0 rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'
      >
        {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>
    </div>

    <nav className='flex-1 px-4 space-y-2 mt-4 overflow-x-hidden'>
      <NavLink to='/' end title='Dashboard' className={navItemClass} onClick={onNavigate}>
        <div className='min-w-[20px]'>
          <Home size={20} />
        </div>
        {isSidebarOpen && (
          <span className='whitespace-nowrap animate-in fade-in duration-300'>
            Dashboard
          </span>
        )}
      </NavLink>

      <div
        className={`pt-4 pb-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
      >
        <p className='text-[10px] uppercase font-bold text-slate-400 px-3 tracking-widest whitespace-nowrap'>
          My Apps
        </p>
      </div>

      {nicheApps.map((app) => {
        const Icon = app.icon;
        return (
          <NavLink
            key={app.id}
            to={`/app/${app.id}`}
            title={app.name}
            className={navItemClass}
            onClick={onNavigate}
          >
            <div className='min-w-[20px]'>
              <Icon size={20} />
            </div>
            {isSidebarOpen && (
              <span className='whitespace-nowrap animate-in fade-in duration-300'>
                {app.name}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>

    <div className='border-t border-slate-200 p-4 dark:border-slate-800'>
      <ThemeToggle
        value={themePreference}
        onChange={onThemePreferenceChange}
        expanded={isSidebarOpen}
      />
    </div>
  </aside>
);

export default Sidebar;
