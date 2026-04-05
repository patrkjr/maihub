import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Car,
  Calculator,
  TrendingDown,
  CreditCard,
  Info,
  ShieldCheck,
  Gauge,
} from 'lucide-react';
import { useAppStorage } from '../lib/appStorage.js';

const CURRENT_YEAR = 2026;
const CURRENT_MONTH = 4;

const defaultCarCostState = {
  years: 3,
  outlook: 'neutral',
  purchasePrice: 456000,
  purchaseYear: 2023,
  purchaseMonth: 7,
  currentValue: 275000,
  monthlyInsuranceOwn: 600,
  annualMaintenanceOwn: 5000,
  leaseDownPayment: 16200,
  monthlyLease: 6000,
  monthlyInsuranceLease: 800,
  leaseDispositionFee: 2500,
};

const outlookOptions = [
  {
    id: 'conservative',
    label: 'Conservative',
    active: 'bg-red-600 text-white',
  },
  {
    id: 'neutral',
    label: 'Neutral',
    active: 'bg-slate-600 dark:bg-slate-500 text-white',
  },
  {
    id: 'optimistic',
    label: 'Optimistic',
    active: 'bg-emerald-600 text-white',
  },
];

const inputClass =
  'w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none';

const calculateFutureValue = (startValue, yearsFromNow, yearsOwnedSoFar, mode) => {
  let value = startValue;
  const outlookMultiplier = mode === 'conservative' ? 1.4 : mode === 'optimistic' ? 0.7 : 1.0;

  for (let i = 1; i <= yearsFromNow; i++) {
    const totalAge = yearsOwnedSoFar + i;
    const baseRate = totalAge <= 2 ? 0.2 : totalAge <= 5 ? 0.12 : 0.08;
    const finalRate = Math.min(0.4, baseRate * outlookMultiplier);
    value *= 1 - finalRate;
  }
  return value;
};

const CarCostNavigator = ({ appId }) => {
  const [data, setData] = useAppStorage(appId, defaultCarCostState);
  const {
    years,
    outlook,
    purchasePrice,
    purchaseYear,
    purchaseMonth,
    currentValue,
    monthlyInsuranceOwn,
    annualMaintenanceOwn,
    leaseDownPayment,
    monthlyLease,
    monthlyInsuranceLease,
    leaseDispositionFee,
  } = data;

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const el = document.documentElement;
    const sync = () => setIsDark(el.classList.contains('dark'));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  const chartTheme = useMemo(
    () => ({
      grid: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(100, 116, 139, 0.25)',
      tick: isDark ? '#94a3b8' : '#64748b',
      tooltipBg: isDark ? '#1e293b' : '#ffffff',
      tooltipFg: isDark ? '#f1f5f9' : '#0f172a',
      tooltipBorder: isDark ? '#334155' : '#e2e8f0',
    }),
    [isDark]
  );

  const formatNum = (val) => {
    if (val === undefined || val === null || Number.isNaN(val)) return '0';
    const num = Math.round(val);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  /** Recharts 3 clamps Y tick labels to 60px unless width="auto"; long grouped numbers get truncated. */
  const formatAxisNum = (val) => {
    const n = typeof val === 'number' ? val : Number(val);
    if (!Number.isFinite(n)) return '';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const comparisonData = useMemo(() => {
    const rows = [];
    const totalMonthsOwned =
      (CURRENT_YEAR - purchaseYear) * 12 + (CURRENT_MONTH - purchaseMonth);
    const yearsOwnedSoFar = totalMonthsOwned / 12;
    const incurredDepreciation = purchasePrice - currentValue;

    for (let i = 1; i <= years; i++) {
      const futureValue = calculateFutureValue(currentValue, i, yearsOwnedSoFar, outlook);
      const futureDepreciation = currentValue - futureValue;
      const maintenanceTotal = annualMaintenanceOwn * i;
      const insuranceTotal = monthlyInsuranceOwn * 12 * i;
      const totalOwn = incurredDepreciation + futureDepreciation + maintenanceTotal + insuranceTotal;

      const leasePayments = monthlyLease * 12 * i;
      const leaseInsurance = monthlyInsuranceLease * 12 * i;
      const totalLease =
        leaseDownPayment + leasePayments + leaseInsurance + (i === years ? leaseDispositionFee : 0);

      rows.push({
        year: `Year ${i}`,
        Ownership: Math.round(totalOwn),
        Leasing: Math.round(totalLease),
        ownValue: Math.round(futureValue),
        totalDep: Math.round(incurredDepreciation + futureDepreciation),
      });
    }
    return rows;
  }, [
    years,
    purchasePrice,
    purchaseYear,
    purchaseMonth,
    currentValue,
    monthlyInsuranceOwn,
    annualMaintenanceOwn,
    leaseDownPayment,
    monthlyLease,
    monthlyInsuranceLease,
    leaseDispositionFee,
    outlook,
  ]);

  const finalData = comparisonData[comparisonData.length - 1] ?? {
    Ownership: 0,
    Leasing: 0,
    ownValue: 0,
    totalDep: 0,
  };

  const setField = (key, value) => setData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="w-full min-w-0 max-w-full animate-in fade-in duration-300 font-sans text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg text-white shadow-lg">
            <Car size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Car Cost Navigator</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Comparing total vehicle impact (incurred + future costs)
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6 min-w-0">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                <Calculator size={20} className="text-blue-500 dark:text-blue-400" /> Comparison period
              </h2>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project {years} years into future
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={years}
                onChange={(e) => setField('years', parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 mb-6"
              />

              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Gauge size={16} /> Market outlook
              </h2>
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900/80 rounded-lg gap-1">
                {outlookOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setField('outlook', opt.id)}
                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                      outlook === opt.id
                        ? `${opt.active} shadow-sm`
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 italic">
                {outlook === 'conservative' && '* Assumes faster depreciation due to market downturn.'}
                {outlook === 'neutral' && '* Assumes standard historical depreciation rates.'}
                {outlook === 'optimistic' && '* Assumes strong resale value and stable market.'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <TrendingDown size={20} /> Current car (owned)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Original purchase price
                  </label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setField('purchasePrice', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Purchase year
                    </label>
                    <input
                      type="number"
                      value={purchaseYear}
                      onChange={(e) => setField('purchaseYear', Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Month (1–12)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={purchaseMonth}
                      onChange={(e) => setField('purchaseMonth', Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Value today (April {CURRENT_YEAR})
                  </label>
                  <input
                    type="number"
                    value={currentValue}
                    onChange={(e) => setField('currentValue', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <ShieldCheck size={12} /> Monthly insurance
                  </label>
                  <input
                    type="number"
                    value={monthlyInsuranceOwn}
                    onChange={(e) => setField('monthlyInsuranceOwn', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Annual maintenance
                  </label>
                  <input
                    type="number"
                    value={annualMaintenanceOwn}
                    onChange={(e) => setField('annualMaintenanceOwn', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Incurred depreciation:</span>
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">
                      {formatNum(purchasePrice - currentValue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CreditCard size={20} /> New lease option
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Down payment
                  </label>
                  <input
                    type="number"
                    value={leaseDownPayment}
                    onChange={(e) => setField('leaseDownPayment', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Monthly payment
                  </label>
                  <input
                    type="number"
                    value={monthlyLease}
                    onChange={(e) => setField('monthlyLease', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <ShieldCheck size={12} /> Monthly insurance
                  </label>
                  <input
                    type="number"
                    value={monthlyInsuranceLease}
                    onChange={(e) => setField('monthlyInsuranceLease', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Disposition fee (end of lease)
                  </label>
                  <input
                    type="number"
                    value={leaseDispositionFee}
                    onChange={(e) => setField('leaseDispositionFee', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-6 rounded-xl shadow-md transition-all duration-300">
                <p className="text-indigo-100 text-sm font-medium">
                  Total ownership impact ({outlook})
                </p>
                <h3 className="text-3xl font-bold">{formatNum(finalData.Ownership)}</h3>
                <p className="text-xs mt-2 text-indigo-200">
                  Total depreciation + insurance + service by Year {years}
                </p>
              </div>
              <div className="bg-emerald-600 dark:bg-emerald-700 text-white p-6 rounded-xl shadow-md">
                <p className="text-emerald-100 text-sm font-medium">New lease total cost</p>
                <h3 className="text-3xl font-bold">{formatNum(finalData.Leasing)}</h3>
                <p className="text-xs mt-2 text-emerald-200">Cumulative cost from today forward</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-w-0 max-w-full">
              <h2 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                Financial trajectory
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 italic">
                *Ownership line shifts based on your &quot;{outlook}&quot; market outlook.
              </p>
              <div className="h-80 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                  <XAxis dataKey="year" tick={{ fill: chartTheme.tick }} stroke={chartTheme.grid} />
                  <YAxis
                    width="auto"
                    tick={{ fill: chartTheme.tick, fontSize: 11 }}
                    stroke={chartTheme.grid}
                    tickFormatter={(val) => formatAxisNum(val)}
                  />
                    <Tooltip
                      formatter={(val) => formatNum(val)}
                      contentStyle={{
                        borderRadius: 12,
                        border: `1px solid ${chartTheme.tooltipBorder}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        backgroundColor: chartTheme.tooltipBg,
                        color: chartTheme.tooltipFg,
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      wrapperStyle={{ color: chartTheme.tick }}
                    />
                    <Line
                      name="Ownership (total loss)"
                      type="monotone"
                      dataKey="Ownership"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      animationDuration={500}
                    />
                    <Line
                      name="New lease (total cost)"
                      type="monotone"
                      dataKey="Leasing"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      animationDuration={500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Info size={20} className="text-slate-400 dark:text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Outlook impact breakdown
                </h2>
              </div>
              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>
                  With a <strong>{outlook}</strong> outlook, your car&apos;s value drop from today until
                  Year {years} is estimated at{' '}
                  <strong>{formatNum(currentValue - finalData.ownValue)} DKK</strong>. This results in
                  a total life-to-date loss of <strong>{formatNum(finalData.totalDep)} DKK</strong> by
                  the end of the period.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-lg border ${
                      outlook === 'conservative'
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900 text-red-900 dark:text-red-100'
                        : 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900 text-blue-900 dark:text-blue-100'
                    }`}
                  >
                    <h5 className="font-bold text-xs uppercase mb-1">Final resale value</h5>
                    <p className="text-xl font-bold">{formatNum(finalData.ownValue)} DKK</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100">
                    <h5 className="font-bold text-xs uppercase mb-1">Total loss (equity gone)</h5>
                    <p className="text-xl font-bold">{formatNum(finalData.totalDep)} DKK</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCostNavigator;
