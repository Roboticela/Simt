import { useState } from 'react';
import { LocationCard } from '../components/LocationCard';
import { MonthSelector } from '../components/MonthSelector';
import { YearSelector } from '../components/YearSelector';
import { QiblaShadowMonthTable } from '../components/QiblaShadowMonthTable';
import { Card } from '../components/ui/Card';

export function QiblaShadowPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  return (
    <div className="space-y-6">
      <LocationCard />
      <Card title="What is Qibla Shadow Time?" subtitle="When the sun aligns with Qibla / Saff azimuth">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          On any sunny day, an object's shadow points <strong>away from the sun</strong>. This page lists the
          two daily moments (fore-noon &amp; after-noon) when the sun's azimuth equals the Qibla bearing or its
          perpendicular Saff bearing — at those instants any vertical stick's shadow indicates the prayer
          direction without a compass.
        </p>
      </Card>
      <div className="flex flex-wrap items-end gap-3">
        <MonthSelector value={month} onChange={setMonth} />
        <YearSelector value={year} onChange={setYear} />
      </div>
      <QiblaShadowMonthTable month={month} year={year} />
    </div>
  );
}
