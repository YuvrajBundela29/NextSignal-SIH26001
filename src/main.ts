import './styles/sih26001.css';
import { LandslideDashboard } from './ui/LandslideDashboard';

console.log('[SIH26001] Initializing MDoNER Landslide Risk Intelligence Platform...');

document.addEventListener('DOMContentLoaded', () => {
  try {
    const dashboard = new LandslideDashboard('app');
    (window as any).__dashboard = dashboard;
    console.log('[SIH26001] Dashboard initialized successfully.');
  } catch (err) {
    console.error('[SIH26001] Failed to boot Landslide Dashboard:', err);
  }
});

// Fallback in case DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  if (!(window as any).__dashboard) {
    try {
      const dashboard = new LandslideDashboard('app');
      (window as any).__dashboard = dashboard;
    } catch (err) {
      console.error('[SIH26001] Immediate boot failed:', err);
    }
  }
}
