import { Sun, Moon, Monitor } from 'lucide-react';

const OPTIONS = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

const ThemeToggle = ({ value, onChange, expanded }) => (
  <div
    className={`flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-0.5 ${expanded ? 'flex-row' : 'flex-col'}`}
    role="group"
    aria-label="Theme"
  >
    {OPTIONS.map((option) => {
      const { id, label, icon: IconComponent } = option;
      const selected = value === id;
      return (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={selected}
          onClick={() => onChange(id)}
          className={`flex flex-1 items-center justify-center rounded-lg transition-colors py-2 min-h-[2.25rem] ${
            selected
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <IconComponent size={expanded ? 18 : 20} className="shrink-0" />
        </button>
      );
    })}
  </div>
);

export default ThemeToggle;
