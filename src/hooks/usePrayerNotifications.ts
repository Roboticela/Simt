import { useEffect, useMemo, useRef } from 'react';
import { useAppSettings } from '../context/SettingsContext';
import { useLang } from '../contexts/LanguageContext';
import { t, prayerLabel } from '../lib/i18n';
import { computePrayerTimes } from '../lib/prayerTimes';
import { decimalToHMS } from '../lib/time';
import { sendAppNotification } from '../lib/tauri';

type NotifyPrayer = 'fajr' | 'zuhr' | 'asr' | 'maghrib' | 'isha';
type ClockPrayer = 'fajr' | 'zuhr' | 'asrShafi' | 'asrHanafi' | 'maghrib' | 'isha';

const CHECK_EVERY_MS = 20_000;
const TRIGGER_WINDOW_MS = 60_000;

function prayerToClockPrayer(prayer: NotifyPrayer, asrSchool: 1 | 2): ClockPrayer {
  if (prayer !== 'asr') return prayer;
  return asrSchool === 2 ? 'asrHanafi' : 'asrShafi';
}

function clockFromDecimal(baseDate: Date, decimal: number): Date | null {
  const hms = decimalToHMS(decimal);
  if (!hms) return null;
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hms.h,
    hms.m,
    hms.s,
    0,
  );
}

export function usePrayerNotifications() {
  const { settings, method } = useAppSettings();
  const { lang } = useLang();
  const firedRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundUrl = settings.useDefaultAlertSound
    ? '/allahuakbar.mp3'
    : settings.notificationSoundUrl;

  function shouldSendSystemNotification() {
    return settings.notificationDelivery === 'notification' || settings.notificationDelivery === 'both';
  }

  function shouldPlaySound() {
    return settings.notificationDelivery === 'sound' || settings.notificationDelivery === 'both';
  }

  function playAlertSound() {
    if (!shouldPlaySound() || !soundUrl) return;
    try {
      if (!audioRef.current || audioRef.current.src !== soundUrl) {
        audioRef.current = new Audio(soundUrl);
      }
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
    } catch {
      // Browser autoplay policies may block audio; ignore gracefully.
    }
  }

  const activePrayers = useMemo(
    () => (Object.keys(settings.prayerNotifications) as NotifyPrayer[]).filter((k) => settings.prayerNotifications[k].enabled),
    [settings.prayerNotifications],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!settings.notificationsEnabled) return;
    if (!activePrayers.length) return;

    const checkAndNotify = () => {
      const now = new Date();
      const times = computePrayerTimes(settings.location, now.getMonth() + 1, now.getDate(), {
        method,
        asrSchool: settings.asrSchool,
      });

      for (const prayer of activePrayers) {
        const selected = settings.prayerNotifications[prayer];
        const clockPrayer = prayerToClockPrayer(prayer, settings.asrSchool);
        const prayerDecimal = times[clockPrayer];
        if (prayerDecimal == null) continue;

        const prayerDate = clockFromDecimal(now, prayerDecimal);
        if (!prayerDate) continue;
        const prayerName = prayerLabel(lang, clockPrayer);

        if (settings.notifyBeforePrayer && selected.minutesBefore > 0) {
          const beforeDate = new Date(prayerDate.getTime() - selected.minutesBefore * 60_000);
          const beforeId = `${now.toDateString()}:${prayer}:before:${selected.minutesBefore}`;
          if (
            now.getTime() >= beforeDate.getTime() &&
            now.getTime() < beforeDate.getTime() + TRIGGER_WINDOW_MS &&
            !firedRef.current.has(beforeId)
          ) {
            if (shouldSendSystemNotification()) {
              void sendAppNotification(
                `${prayerName} ${t(lang, 'notificationReminderTitle')}`,
                `${t(lang, 'notificationReminderBodyPrefix')} ${selected.minutesBefore} ${t(lang, 'minutes')}.`,
              );
            }
            playAlertSound();
            firedRef.current.add(beforeId);
          }
        }

        if (settings.notifyAtPrayerTime) {
          const atId = `${now.toDateString()}:${prayer}:at`;
          if (
            now.getTime() >= prayerDate.getTime() &&
            now.getTime() < prayerDate.getTime() + TRIGGER_WINDOW_MS &&
            !firedRef.current.has(atId)
          ) {
            if (shouldSendSystemNotification()) {
              void sendAppNotification(
                `${t(lang, 'notificationNowTitle')}: ${prayerName}`,
                t(lang, 'notificationNowBody'),
              );
            }
            playAlertSound();
            firedRef.current.add(atId);
          }
        }
      }

      if (firedRef.current.size > 240) {
        const todayToken = now.toDateString();
        firedRef.current = new Set(
          [...firedRef.current].filter((id) => id.includes(todayToken)),
        );
      }
    };

    checkAndNotify();
    const id = window.setInterval(checkAndNotify, CHECK_EVERY_MS);
    return () => window.clearInterval(id);
  }, [
    settings.notificationsEnabled,
    settings.notifyAtPrayerTime,
    settings.notifyBeforePrayer,
    settings.prayerNotifications,
    settings.notificationDelivery,
    settings.notificationSoundUrl,
    settings.useDefaultAlertSound,
    settings.location,
    settings.asrSchool,
    method,
    lang,
    activePrayers,
  ]);
}
