import { useState } from 'react';
import { LocationCard } from '../components/LocationCard';
import { MonthSelector } from '../components/MonthSelector';
import { YearSelector } from '../components/YearSelector';
import { PrayerYearTable } from '../components/PrayerYearTable';

export function PrayerCalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  return (
    <div className="space-y-6">
      <LocationCard />
      <div className="flex flex-wrap items-end gap-3">
        <MonthSelector value={month} onChange={setMonth} />
        <YearSelector value={year} onChange={setYear} />
      </div>
      <PrayerYearTable month={month} year={year} />
    </div>
  );
}
