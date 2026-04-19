import { LocationCard } from '../components/LocationCard';
import { QiblaCard } from '../components/QiblaCard';
import { TodayPrayerCard } from '../components/TodayPrayerCard';
import { TodayQiblaShadowCard } from '../components/TodayQiblaShadowCard';

export function HomePage() {
  return (
    <div className="space-y-6">
      <LocationCard />
      <div className="grid gap-6 lg:grid-cols-2">
        <TodayPrayerCard />
        <div className="space-y-6">
          <QiblaCard />
          <TodayQiblaShadowCard />
        </div>
      </div>
    </div>
  );
}
