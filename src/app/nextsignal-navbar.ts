/**
 * NextSignal Navigation Controller
 *
 * Coordinates navigation across the unified NextSignal command-center header.
 *
 * Sections:
 * - Overview (Live global dashboard & panels)
 * - Markets (Market Radar & asset signals)
 * - Signals (Signal Engine feed)
 * - Scenarios (Scenario Engine / "What Happens Next?")
 * - Watchlist (Entity tracking with probability deltas)
 * - Alerts (Real-time threshold notifications)
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

export type NavSection =
  | 'overview'
  | 'markets'
  | 'signals'
  | 'scenarios'
  | 'watchlist'
  | 'alerts'
  | 'oracle'
  | 'world'
  | 'news'
  | 'settings';

let currentSection: NavSection = 'overview';
const sectionChangeCallbacks: Array<(section: NavSection) => void> = [];

export function onNavSectionChange(callback: (section: NavSection) => void): void {
  sectionChangeCallbacks.push(callback);
}

function notifySectionChange(section: NavSection): void {
  sectionChangeCallbacks.forEach((cb) => cb(section));
}

export function setActiveSection(section: NavSection): void {
  currentSection = section;

  // Update tab buttons inside the unified header
  document.querySelectorAll<HTMLButtonElement>('.ns-header-nav-btn').forEach((btn) => {
    const btnSection = btn.dataset.section as NavSection;
    const isActive = btnSection === section;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Sync hash
  if (location.hash.replace('#', '') !== section) {
    history.replaceState(null, '', `#${section}`);
  }
}

export function getActiveSection(): NavSection {
  return currentSection;
}

/**
 * Initialize the NextSignal navigation controller.
 * Wires click handlers directly to the unified header buttons.
 */
export function initNextSignalNavbar(): void {
  // Wire brand logo click to return to Overview
  document.querySelectorAll<HTMLElement>('.ns-brand-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveSection('overview');
      notifySectionChange('overview');
    });
  });

  // Wire header tab buttons
  document.querySelectorAll<HTMLButtonElement>('.ns-header-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = (btn.dataset.section ?? 'overview') as NavSection;
      setActiveSection(section);
      notifySectionChange(section);
    });
  });

  // Sync initial state from hash
  const hash = location.hash.replace('#', '') as NavSection;
  const validSections: NavSection[] = ['overview', 'markets', 'signals', 'scenarios', 'watchlist', 'alerts', 'oracle'];
  if (validSections.includes(hash)) {
    setActiveSection(hash);
    notifySectionChange(hash);
  }

  // Listen for external hash changes
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace('#', '') as NavSection;
    if (validSections.includes(h) && h !== currentSection) {
      setActiveSection(h);
      notifySectionChange(h);
    }
  });
}

/**
 * Set a numerical badge on a header tab (e.g. Alerts count)
 */
export function setNavBadge(section: NavSection, count: number): void {
  const btn = document.querySelector<HTMLButtonElement>(`.ns-header-nav-btn[data-section="${section}"]`);
  if (!btn) return;

  btn.querySelector('.ns-nav-badge')?.remove();

  if (count > 0) {
    const badge = document.createElement('span');
    badge.className = 'ns-nav-badge';
    badge.textContent = count > 99 ? '99+' : String(count);
    btn.appendChild(badge);
  }
}
