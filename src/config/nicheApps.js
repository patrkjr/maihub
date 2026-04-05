import { Car, StickyNote, Compass } from 'lucide-react';
import CarLeaseComparator from '../apps/CarLeaseComparator.jsx';
import CarCostNavigator from '../apps/CarCostNavigator.jsx';
import Notes from '../apps/Notes.jsx';

export const nicheApps = [
  {
    id: 'car-lease',
    name: 'Car Lease Comparator',
    icon: Car,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    Component: CarLeaseComparator,
  },
  {
    id: 'car-cost-navigator',
    name: 'Car Cost Navigator',
    icon: Compass,
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    Component: CarCostNavigator,
  },
  {
    id: 'notes',
    name: 'Notes',
    icon: StickyNote,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    Component: Notes,
  },
];
