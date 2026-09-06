import './styles/sih26001.css';
import { LandslideDashboard } from './ui/LandslideDashboard';
import { IntroAnimation } from './ui/components/IntroAnimation';
import { RoleSelectScreen } from './ui/components/RoleSelectScreen';
import { DemoTour, injectStartTourButton } from './ui/components/DemoTour';
import type { AppViewMode, CitizenProfile } from './services/landslide/types';

console.log('[SIH26001] Initializing MDoNER Landslide Risk Intelligence Platform...');

function launchApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const directRole = urlParams.get('role') as AppViewMode | null;
  const skipIntroParam = urlParams.get('skipIntro');

  const startRoleSelection = () => {
    appContainer.innerHTML = '';
    const roleScreen = new RoleSelectScreen('app', (selectedRole: AppViewMode, profile?: CitizenProfile) => {
      startDashboard(selectedRole, profile);
    });
    roleScreen.render();
  };

  const startDashboard = (role: AppViewMode, profile?: CitizenProfile) => {
    try {
      appContainer.innerHTML = '';
      const dashboard = new LandslideDashboard(
        'app',
        role,
        () => {
          // Replay Intro callback
          playIntroSequence();
        },
        () => {
          // Exit to Role Selection Gateway callback
          startRoleSelection();
        },
        profile
      );
      (window as any).__dashboard = dashboard;
      console.log(`[SIH26001] Dashboard initialized in ${role} mode.`);

      if (role === 'authority') {
        setTimeout(() => {
          const tour = new DemoTour();
          injectStartTourButton(tour);
        }, 800);
      }
    } catch (err) {
      console.error('[SIH26001] Failed to boot Landslide Dashboard:', err);
    }
  };

  const playIntroSequence = () => {
    appContainer.innerHTML = '';
    const intro = new IntroAnimation(() => {
      startRoleSelection();
    });
    intro.play();
  };

  if (directRole === 'authority' || directRole === 'citizen') {
    startDashboard(directRole);
  } else if (skipIntroParam === '1' || skipIntroParam === 'true') {
    startRoleSelection();
  } else {
    playIntroSequence();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', launchApp);
} else {
  launchApp();
}
