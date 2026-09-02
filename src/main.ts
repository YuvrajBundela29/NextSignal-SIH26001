import './styles/sih26001.css';
import { LandslideDashboard } from './ui/LandslideDashboard';
import { DemoTour, injectStartTourButton } from './ui/components/DemoTour';

console.log('[SIH26001] Initializing MDoNER Landslide Risk Intelligence Platform...');

document.addEventListener('DOMContentLoaded', () => {
  try {
    const dashboard = new LandslideDashboard('app');
    (window as any).__dashboard = dashboard;
    console.log('[SIH26001] Dashboard initialized successfully.');

    // Inject guided demo tour button after a brief delay (allow initial render)
    setTimeout(() => {
      const tour = new DemoTour();
      injectStartTourButton(tour);
    }, 800);
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
      setTimeout(() => {
        const tour = new DemoTour();
        injectStartTourButton(tour);
      }, 800);
    } catch (err) {
      console.error('[SIH26001] Immediate boot failed:', err);
    }
  }
}