/**
 * NextSignal Panel Drag & Drop Reordering Engine
 *
 * Allows all dashboard panels in #panelsGrid to be dragged and reordered into any slot.
 * Persists user arrangement to localStorage and restores it on startup.
 *
 * Built on World Monitor (AGPL-3.0) — © 2024-2026 Elie Habib
 */

const STORAGE_ORDER_KEY = 'nextsignal_panel_order_v1';

let isInitialized = false;
let draggedElement: HTMLElement | null = null;

export function initPanelDragAndDrop(): void {
  if (isInitialized || typeof window === 'undefined') return;

  const grid = document.getElementById('panelsGrid');
  if (!grid) {
    // Retry once grid mounts
    setTimeout(initPanelDragAndDrop, 500);
    return;
  }

  isInitialized = true;
  setupGridObserver(grid);
  attachDragHandlersToAllPanels(grid);
  restorePanelOrder(grid);
}

/**
 * Observe dynamic panel additions and attach drag handles automatically
 */
function setupGridObserver(grid: HTMLElement): void {
  const observer = new MutationObserver((mutations) => {
    let hasAddedPanels = false;
    for (const m of mutations) {
      if (m.addedNodes.length > 0) {
        hasAddedPanels = true;
        break;
      }
    }
    if (hasAddedPanels) {
      attachDragHandlersToAllPanels(grid);
    }
  });

  observer.observe(grid, { childList: true });
}

/**
 * Attach HTML5 drag handles to every .panel card in the grid
 */
function attachDragHandlersToAllPanels(grid: HTMLElement): void {
  const panels = grid.querySelectorAll<HTMLElement>('.panel:not(.panel-add-placeholder)');

  panels.forEach((panel) => {
    if (panel.dataset.nsDraggable === 'true') return;
    panel.dataset.nsDraggable = 'true';

    // 1. Find or create drag handle in panel header
    const headerLeft = panel.querySelector<HTMLElement>('.panel-header-left');
    if (headerLeft && !headerLeft.querySelector('.ns-panel-grip')) {
      const grip = document.createElement('span');
      grip.className = 'ns-panel-grip';
      grip.innerHTML = '⠿';
      grip.title = 'Drag to reorder slot';
      headerLeft.prepend(grip);
    }

    // 2. Make panel draggable
    panel.setAttribute('draggable', 'true');

    panel.addEventListener('dragstart', (e: DragEvent) => {
      // Only drag if originating from header or grip (prevent dragging text selection)
      const target = e.target as HTMLElement;
      const isHeaderClick = target.closest('.panel-header') || target.classList.contains('panel');
      if (!isHeaderClick && target.closest('.panel-content')) {
        e.preventDefault();
        return;
      }

      draggedElement = panel;
      panel.classList.add('ns-panel-dragging');

      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', panel.id || 'panel');
        // Drag image styling
        try {
          const crt = panel.cloneNode(false) as HTMLElement;
          crt.style.opacity = '0';
          document.body.appendChild(crt);
          e.dataTransfer.setDragImage(crt, 0, 0);
          setTimeout(() => crt.remove(), 100);
        } catch {
          // fallback default drag image
        }
      }
    });

    panel.addEventListener('dragend', () => {
      panel.classList.remove('ns-panel-dragging');
      clearAllDropIndicators(grid);
      draggedElement = null;
    });

    panel.addEventListener('dragover', (e: DragEvent) => {
      if (!draggedElement || draggedElement === panel) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

      const rect = panel.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const isBefore = e.clientY < midpoint;

      panel.classList.toggle('ns-drop-target-before', isBefore);
      panel.classList.toggle('ns-drop-target-after', !isBefore);
    });

    panel.addEventListener('dragleave', (e: DragEvent) => {
      // Only clear if actually leaving the panel bounds
      const rect = panel.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX >= rect.right ||
        e.clientY < rect.top ||
        e.clientY >= rect.bottom
      ) {
        panel.classList.remove('ns-drop-target-before', 'ns-drop-target-after');
      }
    });

    panel.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      if (!draggedElement || draggedElement === panel) return;

      const rect = panel.getBoundingClientRect();
      const isBefore = e.clientY < rect.top + rect.height / 2;

      // Re-insert dragged panel
      if (isBefore) {
        grid.insertBefore(draggedElement, panel);
      } else {
        grid.insertBefore(draggedElement, panel.nextSibling);
      }

      clearAllDropIndicators(grid);
      savePanelOrder(grid);

      // Trigger subtle pulse animation on dropped panel
      draggedElement.classList.add('ns-panel-just-dropped');
      setTimeout(() => draggedElement?.classList.remove('ns-panel-just-dropped'), 800);
    });
  });
}

function clearAllDropIndicators(grid: HTMLElement): void {
  grid.querySelectorAll<HTMLElement>('.ns-drop-target-before, .ns-drop-target-after').forEach((el) => {
    el.classList.remove('ns-drop-target-before', 'ns-drop-target-after');
  });
}

/**
 * Save panel layout order into localStorage
 */
function savePanelOrder(grid: HTMLElement): void {
  const panelIds: string[] = [];
  grid.querySelectorAll<HTMLElement>('.panel').forEach((p) => {
    const key = p.id || p.dataset.panelKey;
    if (key) panelIds.push(key);
  });

  try {
    localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(panelIds));
  } catch {
    // quota
  }
}

/**
 * Restore panel order from localStorage
 */
function restorePanelOrder(grid: HTMLElement): void {
  try {
    const saved = localStorage.getItem(STORAGE_ORDER_KEY);
    if (!saved) return;
    const order: string[] = JSON.parse(saved);
    if (!Array.isArray(order) || order.length === 0) return;

    // Create lookup of current panels
    const panelMap = new Map<string, HTMLElement>();
    grid.querySelectorAll<HTMLElement>('.panel').forEach((p) => {
      const key = p.id || p.dataset.panelKey;
      if (key) panelMap.set(key, p);
    });

    // Re-append in saved order
    order.forEach((id) => {
      const el = panelMap.get(id);
      if (el && el.parentElement === grid) {
        grid.appendChild(el);
      }
    });
  } catch {
    // ignore parse error
  }
}
