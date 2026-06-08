import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { Layout } from './components/Layout';
import { PrayerNotificationsManager } from './components/PrayerNotificationsManager';
import { HomePage } from './pages/HomePage';
import { PrayerCalendarPage } from './pages/PrayerCalendarPage';
import { QiblaPage } from './pages/QiblaPage';
import { QiblaShadowPage } from './pages/QiblaShadowPage';
import { SettingsPage } from './pages/SettingsPage';
import { InfoPage } from './pages/InfoPage';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SettingsProvider>
          <PrayerNotificationsManager />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/"                 element={<HomePage />} />
                <Route path="/prayer-calendar"  element={<PrayerCalendarPage />} />
                <Route path="/qibla"            element={<QiblaPage />} />
                <Route path="/qibla-shadow"     element={<QiblaShadowPage />} />
                <Route path="/settings"         element={<SettingsPage />} />
                <Route path="/help"             element={<InfoPage page="help" />} />
                <Route path="/how-it-works"     element={<InfoPage page="how-it-works" />} />
                <Route path="/about"            element={<InfoPage page="about" />} />
                <Route path="/license"          element={<InfoPage page="license" />} />
                <Route path="*"                 element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </SettingsProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
