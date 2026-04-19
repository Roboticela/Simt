import { LocationCard } from '../components/LocationCard';
import { QiblaCard } from '../components/QiblaCard';
import { Card } from '../components/ui/Card';

export function QiblaPage() {
  return (
    <div className="space-y-6">
      <LocationCard />
      <QiblaCard />
      <Card title="Method" subtitle="Spherical trigonometry — great-circle bearing to Makkah">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Qibla is computed using the standard great-circle formula:
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-slate-100 p-3 text-xs font-mono text-slate-800 dark:bg-slate-900 dark:text-slate-200">
{`Q = atan2( sin(LGM - LGR),
           cos(LTR) * tan(LT2) - sin(LTR) * cos(LGM - LGR) )`}
        </pre>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Where <code>LTR, LGR</code> are the observer latitude/longitude and <code>LT2 = 21.42253°N</code>,
          <code> LGM = 39.82621°E</code> are the Kaaba coordinates as used in the source workbook.
          The Saff (row) bearing is the perpendicular: <code>(Q + 90°) mod 360°</code>.
        </p>
      </Card>
    </div>
  );
}
