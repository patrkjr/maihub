import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Car,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  PlusCircle,
  X,
  Percent,
  CalendarClock,
  ReceiptText,
} from 'lucide-react';
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
import { useAppStorage } from '../lib/appStorage.js';

const defaultLeaseState = {
  cars: [
    {
      id: 1,
      type: 'lease',
      name: 'Option 1',
      downpayment: 5000,
      monthlyLease: 350,
      monthlyInsurance: 80,
      color: '#3b82f6',
    },
    {
      id: 2,
      type: 'lease',
      name: 'Option 2',
      downpayment: 2000,
      monthlyLease: 450,
      monthlyInsurance: 90,
      color: '#ef4444',
    },
  ],
};

const DEPRECIATION_OUTLOOKS = [
  { id: 'pessimistic', label: 'Pessimistic', multiplier: 1.25 },
  { id: 'neutral', label: 'Neutral', multiplier: 1 },
  { id: 'optimistic', label: 'Optimistic', multiplier: 0.75 },
];

const CarLeaseComparator = ({ appId }) => {
  const [data, setData] = useAppStorage(appId, defaultLeaseState);
  const cars = useMemo(
    () =>
      (data.cars ?? []).map((car) => ({
        type: 'lease',
        carPrice: 30000,
        runtimeMonths: 48,
        interestRate: 4.5,
        startingFee: 0,
        depreciationOutlook: 'neutral',
        ...car,
      })),
    [data.cars]
  );
  const ANNUAL_DEPRECIATION_RATE = 0.12;

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

  const getNextColor = (index) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return colors[index % colors.length];
  };

  const addLeaseOption = () => {
    setData((prev) => {
      const list = prev.cars;
      const newId = list.length > 0 ? Math.max(...list.map((c) => c.id)) + 1 : 1;
      return {
        ...prev,
        cars: [
          ...list,
          {
            id: newId,
            type: 'lease',
            name: `Lease Option ${newId}`,
            downpayment: 0,
            monthlyLease: 0,
            monthlyInsurance: 0,
            color: getNextColor(list.length),
          },
        ],
      };
    });
  };

  const addFinancingOption = () => {
    setData((prev) => {
      const list = prev.cars;
      const newId = list.length > 0 ? Math.max(...list.map((c) => c.id)) + 1 : 1;
      return {
        ...prev,
        cars: [
          ...list,
          {
            id: newId,
            type: 'financing',
            name: `Financing Option ${newId}`,
            carPrice: 30000,
            downpayment: 3000,
            runtimeMonths: 48,
            interestRate: 4.5,
            startingFee: 0,
            depreciationOutlook: 'neutral',
            monthlyInsurance: 0,
            color: getNextColor(list.length),
          },
        ],
      };
    });
  };

  const removeCar = (id) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.filter((car) => car.id !== id),
    }));
  };

  const updateCar = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      cars: prev.cars.map((car) => (car.id === id ? { ...car, [field]: value } : car)),
    }));
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);

  /** Recharts 3 defaults Y-axis width to 60px and clamps tick labels to that width, which strips long de-DE strings. */
  const formatAxisCurrency = (val) => {
    const n = typeof val === 'number' ? val : Number(val);
    if (!Number.isFinite(n)) return '';
    return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(n);
  };

  const calculateMonthlyPayment = (principal, runtimeMonths, interestRatePercent) => {
    const months = Math.max(0, Number(runtimeMonths) || 0);
    if (months === 0 || principal <= 0) return 0;

    const monthlyRate = (Number(interestRatePercent) || 0) / 100 / 12;
    if (monthlyRate === 0) return principal / months;

    return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months);
  };

  const calculateLoanBalance = (principal, runtimeMonths, interestRatePercent, paymentsMade) => {
    const months = Math.max(0, Number(runtimeMonths) || 0);
    const paidMonths = Math.min(Math.max(0, paymentsMade), months);
    if (months === 0 || principal <= 0) return 0;

    const monthlyRate = (Number(interestRatePercent) || 0) / 100 / 12;
    const monthlyPayment = calculateMonthlyPayment(principal, months, interestRatePercent);

    if (monthlyRate === 0) {
      return Math.max(0, principal - monthlyPayment * paidMonths);
    }

    const balance =
      principal * (1 + monthlyRate) ** paidMonths -
      monthlyPayment * (((1 + monthlyRate) ** paidMonths - 1) / monthlyRate);
    return Math.max(0, balance);
  };

  const calculateCostAtYear = (car, year) => {
    const totalMonths = year * 12;

    if (car.type === 'financing') {
      const carPrice = Math.max(0, Number(car.carPrice) || 0);
      const downpayment = Math.max(0, Number(car.downpayment) || 0);
      const runtimeMonths = Math.max(0, Number(car.runtimeMonths) || 0);
      const interestRate = Math.max(0, Number(car.interestRate) || 0);
      const startingFee = Math.max(0, Number(car.startingFee) || 0);
      const monthlyInsurance = Math.max(0, Number(car.monthlyInsurance) || 0);
      const depreciationOutlook = DEPRECIATION_OUTLOOKS.find(
        (outlook) => outlook.id === car.depreciationOutlook
      );
      const adjustedDepreciationRate =
        ANNUAL_DEPRECIATION_RATE * (depreciationOutlook?.multiplier ?? 1);

      const principal = Math.max(0, carPrice - downpayment);
      const paidMonths = Math.min(totalMonths, runtimeMonths);
      const monthlyPayment = calculateMonthlyPayment(principal, runtimeMonths, interestRate);

      const totalOutflow =
        downpayment + startingFee + monthlyPayment * paidMonths + monthlyInsurance * totalMonths;

      const remainingLoan = calculateLoanBalance(
        principal,
        runtimeMonths,
        interestRate,
        paidMonths
      );
      const estimatedCarValue = carPrice * (1 - adjustedDepreciationRate) ** year;
      const equity = estimatedCarValue - remainingLoan;

      // Net ownership cost (cash paid minus current equity) for fair comparison with leasing.
      return Math.max(0, totalOutflow - equity);
    }

    return (
      (Number(car.downpayment) || 0) +
      (Number(car.monthlyLease) || 0) * totalMonths +
      (Number(car.monthlyInsurance) || 0) * totalMonths
    );
  };

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

  const comparisonRows = useMemo(() => {
    return [1, 2, 3, 4].map((y) => {
      const row = { year: `Year ${y}` };
      for (const car of cars) {
        row[`c_${car.id}`] = Math.round(calculateCostAtYear(car, y));
      }
      return row;
    });
  }, [cars]);

  return (
    <div className="animate-in fade-in duration-300 font-sans text-slate-900 dark:text-slate-100 w-full min-w-0 max-w-full">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Car className="text-blue-600 dark:text-blue-400" size={28} />
              Car Lease Comparator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Compare total costs across leasing and financing options.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addLeaseOption}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200/50 dark:shadow-blue-950/50 active:scale-95"
            >
              <PlusCircle size={18} /> Lease Option
            </button>
            <button
              type="button"
              onClick={addFinancingOption}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-200/50 dark:shadow-emerald-950/50 active:scale-95"
            >
              <PlusCircle size={18} /> Financing Option
            </button>
          </div>
        </header>

        <div className="flex gap-6 overflow-x-auto overflow-y-visible pb-8 snap-x no-scrollbar-lease w-full min-w-0 max-w-full">
          {cars.map((car) => (
            <div
              key={car.id}
              className="min-w-[320px] bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 shrink-0 snap-start transition-all hover:shadow-md relative group"
            >
              <button
                type="button"
                onClick={() => removeCar(car.id)}
                className="absolute top-4 right-4 text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors"
                title="Remove"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-4 h-10 rounded-full" style={{ backgroundColor: car.color }} />
                <input
                  type="text"
                  value={car.name}
                  onChange={(e) => updateCar(car.id, 'name', e.target.value)}
                  className="text-xl font-bold bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-400"
                  placeholder="Car Model Name"
                />
              </div>

              <div className="mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                {car.type === 'financing' ? 'Financing' : 'Leasing'}
              </div>

              <div className="space-y-5">
                {car.type === 'financing' ? (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Car Price
                      </label>
                      <div className="relative">
                        <Car
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={car.carPrice}
                          onChange={(e) =>
                            updateCar(car.id, 'carPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Downpayment
                      </label>
                      <div className="relative">
                        <CreditCard
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={car.downpayment}
                          onChange={(e) =>
                            updateCar(car.id, 'downpayment', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Running Time (Months)
                      </label>
                      <div className="relative">
                        <CalendarClock
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={car.runtimeMonths}
                          onChange={(e) =>
                            updateCar(car.id, 'runtimeMonths', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Interest Rate (%)
                      </label>
                      <div className="relative">
                        <Percent
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          step="0.01"
                          value={car.interestRate}
                          onChange={(e) =>
                            updateCar(car.id, 'interestRate', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Starting Fee (One Time)
                      </label>
                      <div className="relative">
                        <ReceiptText
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={car.startingFee}
                          onChange={(e) =>
                            updateCar(car.id, 'startingFee', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Depreciation Outlook
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {DEPRECIATION_OUTLOOKS.map((outlook) => (
                          <button
                            key={outlook.id}
                            type="button"
                            onClick={() => updateCar(car.id, 'depreciationOutlook', outlook.id)}
                            className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-colors ${
                              car.depreciationOutlook === outlook.id
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-blue-500'
                            }`}
                          >
                            {outlook.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Monthly Insurance
                      </label>
                      <div className="relative">
                        <ShieldCheck
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={car.monthlyInsurance}
                          onChange={(e) =>
                            updateCar(car.id, 'monthlyInsurance', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Downpayment
                      </label>
                      <div className="relative">
                        <CreditCard
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={car.downpayment}
                          onChange={(e) =>
                            updateCar(car.id, 'downpayment', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Monthly Lease
                      </label>
                      <div className="relative">
                        <TrendingUp
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={car.monthlyLease}
                          onChange={(e) =>
                            updateCar(car.id, 'monthlyLease', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Monthly Insurance
                      </label>
                      <div className="relative">
                        <ShieldCheck
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={18}
                        />
                        <input
                          type="number"
                          value={car.monthlyInsurance}
                          onChange={(e) =>
                            updateCar(car.id, 'monthlyInsurance', parseFloat(e.target.value) || 0)
                          }
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-end">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Total Cost (4 Years)
                  </span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white">
                    {formatCurrency(calculateCostAtYear(car, 4))}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addLeaseOption}
            className="min-w-[320px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500 transition-all group"
          >
            <Plus className="mb-2 group-hover:scale-125 transition-transform" size={48} />
            <span className="font-semibold text-lg">Add lease option</span>
          </button>
          <button
            type="button"
            onClick={addFinancingOption}
            className="min-w-[320px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all group"
          >
            <Plus className="mb-2 group-hover:scale-125 transition-transform" size={48} />
            <span className="font-semibold text-lg">Add financing option</span>
          </button>
        </div>

        <div className="mt-8 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-10 min-w-0 max-w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8 min-w-0">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Total Cost Projection</h2>
            <div className="text-sm font-medium text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-full shrink-0">
              4-Year Forecast
            </div>
          </div>

          <div className="h-[400px] w-full min-w-0 max-w-full">
            {cars.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonRows} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
                  <XAxis dataKey="year" tick={{ fill: chartTheme.tick }} stroke={chartTheme.grid} />
                  <YAxis
                    width="auto"
                    tick={{ fill: chartTheme.tick, fontSize: 11 }}
                    stroke={chartTheme.grid}
                    tickFormatter={(val) => formatAxisCurrency(val)}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    formatter={(val) => formatCurrency(val)}
                    labelFormatter={(label) => label}
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
                  {cars.map((car) => (
                    <Line
                      key={car.id}
                      name={car.name?.trim() || `Option ${car.id}`}
                      type="monotone"
                      dataKey={`c_${car.id}`}
                      stroke={car.color}
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      animationDuration={500}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 italic">
                Add at least one car to see the comparison graph.
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>
            Leasing uses cumulative payments. Financing uses net ownership cost (cash paid minus
            estimated equity) with {Math.round(ANNUAL_DEPRECIATION_RATE * 100)}% annual depreciation.
          </p>
        </footer>

      <style>{`
        .no-scrollbar-lease::-webkit-scrollbar { display: none; }
        .no-scrollbar-lease { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CarLeaseComparator;
