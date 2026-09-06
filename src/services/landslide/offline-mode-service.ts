// NexSignal Offline Mode & Connectivity State Service
// Provides automatic network detection (online/offline) and manual offline tactical mode simulation

export type NetworkStatusListener = (isOffline: boolean) => void;

class OfflineModeService {
  private isBrowserOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isManualOfflineOverride: boolean = false;
  private listeners: Set<NetworkStatusListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexsignal_force_offline');
      this.isManualOfflineOverride = saved === 'true';

      window.addEventListener('online', () => {
        this.isBrowserOnline = true;
        this.notify();
      });

      window.addEventListener('offline', () => {
        this.isBrowserOnline = false;
        this.notify();
      });
    }
  }

  public isOffline(): boolean {
    return !this.isBrowserOnline || this.isManualOfflineOverride;
  }

  public isManualOffline(): boolean {
    return this.isManualOfflineOverride;
  }

  public toggleManualOffline(): boolean {
    this.isManualOfflineOverride = !this.isManualOfflineOverride;
    localStorage.setItem('nexsignal_force_offline', String(this.isManualOfflineOverride));
    this.notify();
    return this.isOffline();
  }

  public setManualOffline(val: boolean) {
    this.isManualOfflineOverride = val;
    localStorage.setItem('nexsignal_force_offline', String(this.isManualOfflineOverride));
    this.notify();
  }

  public subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.isOffline());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const offline = this.isOffline();
    this.listeners.forEach((fn) => fn(offline));
  }
}

export const offlineService = new OfflineModeService();
