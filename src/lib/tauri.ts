export async function isTauriApp(): Promise<boolean> {
  try {
    const core = await import('@tauri-apps/api/core');
    return core.isTauri();
  } catch {
    return false;
  }
}

export async function requestAppNotificationPermission(): Promise<boolean> {
  if (await isTauriApp()) {
    try {
      const notification = await import('@tauri-apps/plugin-notification');
      const granted = await notification.isPermissionGranted();
      if (granted) return true;
      const permission = await notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function sendAppNotification(title: string, body: string): Promise<void> {
  if (await isTauriApp()) {
    try {
      const notification = await import('@tauri-apps/plugin-notification');
      notification.sendNotification({ title, body });
      return;
    } catch {
      // fall through to web
    }
  }

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

export async function pickAudioFile(): Promise<string | null> {
  if (await isTauriApp()) {
    try {
      const dialog = await import('@tauri-apps/plugin-dialog');
      const core = await import('@tauri-apps/api/core');
      const selected = await dialog.open({
        filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] }],
        multiple: false,
      });
      if (!selected || Array.isArray(selected)) return null;
      return core.convertFileSrc(selected);
    } catch {
      return null;
    }
  }
  return null;
}
