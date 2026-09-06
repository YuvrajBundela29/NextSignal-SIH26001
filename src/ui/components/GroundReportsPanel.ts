import {
  groundReportsService,
  type GroundReport,
  type ReportStatus,
} from '../../services/landslide/ground-reports';

export class GroundReportsPanel {
  private container: HTMLElement;
  private currentFilter: 'ALL' | ReportStatus = 'ALL';
  private unsubscribe?: () => void;
  private onFlyToReport?: (report: GroundReport) => void;

  constructor(container: HTMLElement, onFlyToReport?: (report: GroundReport) => void) {
    this.container = container;
    this.onFlyToReport = onFlyToReport;
    this.init();
  }

  private init() {
    this.unsubscribe = groundReportsService.subscribe(() => {
      this.render();
    });
  }

  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public render() {
    const allReports = groundReportsService.getReports();
    const pendingCount = allReports.filter((r) => r.status === 'PENDING').length;
    const verifiedCount = allReports.filter((r) => r.status === 'VERIFIED').length;
    const escalatedCount = allReports.filter((r) => r.status === 'ESCALATED').length;
    const resolvedCount = allReports.filter((r) => r.status === 'RESOLVED').length;

    let filtered = allReports;
    if (this.currentFilter !== 'ALL') {
      filtered = allReports.filter((r) => r.status === this.currentFilter);
    }

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; font-family: 'Inter', sans-serif; color: #f1f5f9; box-sizing: border-box;">
        
        <!-- Header Banner -->
        <div style="background: #0f172a; border-bottom: 1px solid #1e293b; padding: 12px 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
              <span>📍</span> CITIZEN &amp; FIELD GROUND TRUTH
            </div>
            <span style="font-size: 10px; font-weight: 700; background: #0284c720; color: #38bdf8; border: 1px solid #0284c7; padding: 2px 6px; border-radius: 4px;">
              ${allReports.length} Total Reports
            </span>
          </div>

          <!-- Status Counts Bar -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 8px;">
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 6px; padding: 4px; text-align: center;">
              <div style="font-size: 9px; color: #94a3b8;">Pending</div>
              <div style="font-size: 13px; font-weight: 800; color: #eab308;">${pendingCount}</div>
            </div>
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 6px; padding: 4px; text-align: center;">
              <div style="font-size: 9px; color: #94a3b8;">Verified</div>
              <div style="font-size: 13px; font-weight: 800; color: #22c55e;">${verifiedCount}</div>
            </div>
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 6px; padding: 4px; text-align: center;">
              <div style="font-size: 9px; color: #94a3b8;">Escalated</div>
              <div style="font-size: 13px; font-weight: 800; color: #ef4444;">${escalatedCount}</div>
            </div>
            <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 6px; padding: 4px; text-align: center;">
              <div style="font-size: 9px; color: #94a3b8;">Resolved</div>
              <div style="font-size: 13px; font-weight: 800; color: #38bdf8;">${resolvedCount}</div>
            </div>
          </div>

          <!-- Filter Pills -->
          <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 2px;">
            <button class="report-filter-pill ${this.currentFilter === 'ALL' ? 'active' : ''}" data-filter="ALL" style="padding: 3px 8px; font-size: 9px; font-weight: 700; border-radius: 4px; border: 1px solid ${this.currentFilter === 'ALL' ? '#38bdf8' : '#334155'}; background: ${this.currentFilter === 'ALL' ? '#0284c7' : '#0b1120'}; color: #ffffff; cursor: pointer; white-space: nowrap;">
              All (${allReports.length})
            </button>
            <button class="report-filter-pill ${this.currentFilter === 'PENDING' ? 'active' : ''}" data-filter="PENDING" style="padding: 3px 8px; font-size: 9px; font-weight: 700; border-radius: 4px; border: 1px solid ${this.currentFilter === 'PENDING' ? '#eab308' : '#334155'}; background: ${this.currentFilter === 'PENDING' ? '#ca8a04' : '#0b1120'}; color: #ffffff; cursor: pointer; white-space: nowrap;">
              Pending (${pendingCount})
            </button>
            <button class="report-filter-pill ${this.currentFilter === 'VERIFIED' ? 'active' : ''}" data-filter="VERIFIED" style="padding: 3px 8px; font-size: 9px; font-weight: 700; border-radius: 4px; border: 1px solid ${this.currentFilter === 'VERIFIED' ? '#22c55e' : '#334155'}; background: ${this.currentFilter === 'VERIFIED' ? '#16a34a' : '#0b1120'}; color: #ffffff; cursor: pointer; white-space: nowrap;">
              Verified (${verifiedCount})
            </button>
            <button class="report-filter-pill ${this.currentFilter === 'ESCALATED' ? 'active' : ''}" data-filter="ESCALATED" style="padding: 3px 8px; font-size: 9px; font-weight: 700; border-radius: 4px; border: 1px solid ${this.currentFilter === 'ESCALATED' ? '#ef4444' : '#334155'}; background: ${this.currentFilter === 'ESCALATED' ? '#dc2626' : '#0b1120'}; color: #ffffff; cursor: pointer; white-space: nowrap;">
              Escalated (${escalatedCount})
            </button>
          </div>
        </div>

        <!-- Reports List -->
        <div id="ground-reports-scroll-list" style="flex: 1; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
          ${filtered.length === 0 ? `
            <div style="text-align: center; padding: 40px 10px; color: #64748b; font-size: 11px;">
              No ground reports matching current filter.
            </div>
          ` : filtered.map((r) => {
            const isPending = r.status === 'PENDING';
            const isVerified = r.status === 'VERIFIED';
            const isEscalated = r.status === 'ESCALATED';
            const isResolved = r.status === 'RESOLVED';

            const statusBg = isEscalated ? '#ef4444' : isPending ? '#eab308' : isVerified ? '#22c55e' : '#38bdf8';
            const timeAgo = this.formatTimeAgo(r.timestamp);

            return `
              <div class="ground-report-card" data-id="${r.id}" style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 10px; cursor: pointer; transition: all 0.15s ease;">
                <div style="display: flex; gap: 10px;">
                  <div style="width: 60px; height: 60px; border-radius: 6px; overflow: hidden; background: #020617; border: 1px solid #1e293b; flex-shrink: 0;">
                    <img src="${r.mediaUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Thumbnail" />
                  </div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px;">
                      <span style="font-size: 11px; font-weight: 800; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${r.categoryLabel}
                      </span>
                      <span style="font-size: 9px; font-weight: 800; background: ${statusBg}20; color: ${statusBg}; border: 1px solid ${statusBg}; padding: 1px 6px; border-radius: 4px; text-transform: uppercase;">
                        ${r.status}
                      </span>
                    </div>

                    <div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px;">
                      📍 ${r.locationName} &bull; <strong style="color: #cbd5e1;">${r.districtName}</strong>
                    </div>

                    <div style="font-size: 10px; color: #64748b; display: flex; justify-content: space-between;">
                      <span>${r.reporterRole === 'CITIZEN' ? '👤 Citizen' : '🛡️ Official'} &bull; ${r.reporterName || 'Observer'}</span>
                      <span>${timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    // Filter Pills Click
    const filterPills = this.container.querySelectorAll('.report-filter-pill');
    filterPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter') as any;
        this.currentFilter = filter;
        this.render();
      });
    });

    // Report Card Click -> Open Detail Modal
    const cards = this.container.querySelectorAll('.ground-report-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        if (id) {
          const report = groundReportsService.getReportById(id);
          if (report) {
            if (this.onFlyToReport) {
              this.onFlyToReport(report);
            }
            this.openEvidenceDetailModal(report);
          }
        }
      });
    });
  }

  public openEvidenceDetailModal(report: GroundReport) {
    const existing = document.getElementById('evidence-detail-modal-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'evidence-detail-modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(8px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
      animation: fadeIn 0.2s ease-out;
    `;

    const isPending = report.status === 'PENDING';
    const isVerified = report.status === 'VERIFIED';
    const isEscalated = report.status === 'ESCALATED';
    const statusBg = isEscalated ? '#ef4444' : isPending ? '#eab308' : isVerified ? '#22c55e' : '#38bdf8';

    overlay.innerHTML = `
      <div style="background: #0b1120; border: 1px solid #1e293b; border-radius: 16px; width: 100%; max-width: 640px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; color: #f1f5f9; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);">
        
        <!-- Header -->
        <div style="background: #0f172a; border-bottom: 1px solid #1e293b; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 20px;">🛡️</span>
            <div>
              <div style="font-size: 15px; font-weight: 800; color: #ffffff;">
                REPORT #${report.id} &bull; ${report.categoryLabel}
              </div>
              <div style="font-size: 11px; color: #94a3b8;">
                ${report.districtName}, ${report.state} &bull; Geotagged Ground Truth
              </div>
            </div>
          </div>
          <button id="btn-close-evidence-modal" style="background: #1e293b; border: 1px solid #334155; color: #94a3b8; width: 30px; height: 30px; border-radius: 6px; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            &times;
          </button>
        </div>

        <!-- Body -->
        <div style="padding: 18px 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; flex: 1;">
          
          <!-- Image Evidence -->
          <div style="width: 100%; height: 220px; border-radius: 10px; overflow: hidden; background: #020617; border: 1px solid #1e293b; position: relative;">
            <img src="${report.mediaUrl}" style="width: 100%; height: 100%; object-fit: contain; background: #020617;" alt="Evidence" />
            <div style="position: absolute; top: 10px; right: 10px; background: ${statusBg}; color: white; font-weight: 800; font-size: 10px; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
              ${report.status}
            </div>
          </div>

          <!-- Metadata Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 12px; font-size: 11px;">
            <div>
              <span style="color: #64748b;">Exact Location:</span>
              <div style="font-weight: 700; color: #f1f5f9; margin-top: 2px;">${report.locationName}</div>
            </div>
            <div>
              <span style="color: #64748b;">GPS Coordinates:</span>
              <div style="font-weight: 700; color: #38bdf8; font-family: monospace; margin-top: 2px;">${report.lat.toFixed(5)}°N, ${report.lon.toFixed(5)}°E</div>
            </div>
            <div>
              <span style="color: #64748b;">Reported By:</span>
              <div style="font-weight: 700; color: #f1f5f9; margin-top: 2px;">${report.reporterName || 'Citizen'} (${report.reporterRole})</div>
            </div>
            <div>
              <span style="color: #64748b;">Timestamp:</span>
              <div style="font-weight: 700; color: #f1f5f9; margin-top: 2px;">${new Date(report.timestamp).toLocaleString()}</div>
            </div>
          </div>

          <!-- Description -->
          <div style="background: #050811; border: 1px solid #1e293b; border-radius: 8px; padding: 12px;">
            <div style="font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">
              Reporter Observation:
            </div>
            <div style="font-size: 12px; color: #e2e8f0; line-height: 1.5;">
              ${report.description}
            </div>
          </div>

          ${report.adminNotes ? `
            <div style="background: #0369a115; border: 1px solid #0284c740; border-radius: 8px; padding: 10px; font-size: 11px;">
              <div style="font-size: 10px; color: #38bdf8; font-weight: 700; margin-bottom: 2px;">ADMIN ACTION LOG:</div>
              <div style="color: #cbd5e1;">${report.adminNotes}</div>
              ${report.verifiedBy ? `<div style="color: #64748b; font-size: 9px; margin-top: 4px;">Updated by ${report.verifiedBy} at ${new Date(report.verifiedAt || '').toLocaleTimeString()}</div>` : ''}
            </div>
          ` : ''}

          <!-- Operational Workflow Controls -->
          <div style="background: #0f172a; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;">
            <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; margin-bottom: 8px;">
              AUTHORITY VERIFICATION &amp; DISPATCH WORKFLOW:
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
              <button id="btn-verify-report" style="background: #16a34a; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 8px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span>✓</span> Verify Ground Evidence
              </button>
              <button id="btn-escalate-report" style="background: #dc2626; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 8px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span>🚨</span> Escalate to SDRF/PWD
              </button>
              <button id="btn-resolve-report" style="background: #0284c7; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 8px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span>🛠️</span> Mark Hazard Resolved
              </button>
              <button id="btn-reject-report" style="background: #334155; border: none; color: #94a3b8; font-size: 11px; font-weight: 700; padding: 8px 10px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;">
                <span>✕</span> Reject / Invalid
              </button>
            </div>
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => {
      overlay.remove();
      this.render();
    };

    overlay.querySelector('#btn-close-evidence-modal')?.addEventListener('click', closeModal);

    overlay.querySelector('#btn-verify-report')?.addEventListener('click', () => {
      groundReportsService.updateReportStatus(report.id, 'VERIFIED', 'Verified by District EOC Duty Officer. Added to active risk picture.', 'DEOC Duty Officer');
      closeModal();
    });

    overlay.querySelector('#btn-escalate-report')?.addEventListener('click', () => {
      groundReportsService.updateReportStatus(report.id, 'ESCALATED', 'Escalated to State Disaster Management Authority & SDRF Rapid Response unit.', 'SDMA Control Room');
      closeModal();
    });

    overlay.querySelector('#btn-resolve-report')?.addEventListener('click', () => {
      groundReportsService.updateReportStatus(report.id, 'RESOLVED', 'Road cleared / slope stabilized by PWD & local administration.', 'PWD Field Command');
      closeModal();
    });

    overlay.querySelector('#btn-reject-report')?.addEventListener('click', () => {
      groundReportsService.updateReportStatus(report.id, 'REJECTED', 'Marked as non-hazardous or duplicate report.', 'DEOC Screener');
      closeModal();
    });
  }

  private formatTimeAgo(timestamp: string): string {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
