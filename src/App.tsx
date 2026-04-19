import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SettingsProvider } from './context/SettingsContext';
import { HomePage } from './pages/HomePage';
import { PrayerCalendarPage } from './pages/PrayerCalendarPage';
import { QiblaPage } from './pages/QiblaPage';
import { QiblaShadowPage } from './pages/QiblaShadowPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/prayer-calendar" element={<PrayerCalendarPage />} />
            <Route path="/qibla" element={<QiblaPage />} />
            <Route path="/qibla-shadow" element={<QiblaShadowPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
