import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';

const HomeView = ({ nicheApps, searchQuery = '', onSelectApp }) => {
  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return nicheApps;
    return nicheApps.filter(
      (app) =>
        app.name.toLowerCase().includes(q) || app.id.toLowerCase().includes(q)
    );
  }, [nicheApps, searchQuery]);

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          Welcome back, User
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Here is what&apos;s happening with your projects today.
        </p>
      </div>

      {filteredApps.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-center py-12 text-sm">
          {hasQuery ? 'No apps match your search.' : 'No apps to show.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            return (
              <button
                key={app.id}
                type="button"
                onClick={() => onSelectApp(app.id)}
                className="group flex flex-col items-start p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all hover:shadow-lg text-left"
              >
                <div
                  className={`p-3 rounded-xl mb-4 ${app.bg} ${app.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{app.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage your workflow efficiently with this tool.
                </p>
                <div className="mt-6 flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                  Launch App <ChevronRight size={16} className="ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomeView;
