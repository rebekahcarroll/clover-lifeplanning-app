/**
 * Settings Module - User preferences and export
 */

const Settings = {
  /**
   * Render settings page
   */
  render() {
    const app = document.getElementById('app');
    const user = Storage.getUser();
    const settings = Storage.getSettings();

    Components.showFooter();

    app.innerHTML = `
      ${Components.appHeader(true, 'dashboard')}
      <div class="screen">
        <div class="container">
          <h1 class="page-title">Settings</h1>
          ${this.renderProfileSection(user)}
          ${this.renderExportSection()}
          ${this.renderDataSection()}
        </div>
      </div>
    `;

    this.bindEvents();
  },

  /**
   * Render profile section
   */
  renderProfileSection(user) {
    const currentYear = new Date().getFullYear();
    const planningYear = user.planningYear || currentYear;

    return `
      <div class="settings-section">
        <h3 class="settings-section-title">Profile</h3>
        <div class="card">
          <div class="form-group mb-md">
            <label class="form-label">Your Name</label>
            <input
              type="text"
              id="username-input"
              class="form-input"
              value="${Components.escapeHtml(user.name || '')}"
              placeholder="Enter your name"
            >
          </div>
          <div class="form-group mb-0">
            <label class="form-label">Planning Year</label>
            <select id="planning-year-select" class="form-select">
              <option value="${currentYear}" ${planningYear === currentYear ? 'selected' : ''}>${currentYear}</option>
              <option value="${currentYear + 1}" ${planningYear === currentYear + 1 ? 'selected' : ''}>${currentYear + 1}</option>
              <option value="${currentYear + 2}" ${planningYear === currentYear + 2 ? 'selected' : ''}>${currentYear + 2}</option>
            </select>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render export section
   */
  renderExportSection() {
    return `
      <div class="settings-section">
        <h3 class="settings-section-title">Export</h3>
        <div class="card">
          <p class="mb-md">Export your complete life plan as a PDF document.</p>
          <button id="export-pdf-btn" class="btn btn-primary btn-block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export to PDF
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Render data management section
   */
  renderDataSection() {
    return `
      <div class="settings-section">
        <h3 class="settings-section-title">Data Management</h3>
        <div class="card">
          <p class="mb-md text-secondary">Your data is stored locally on this device. Clearing your browser data will remove your plan.</p>

          <button id="export-json-btn" class="btn btn-outline btn-block mb-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Data (JSON)
          </button>

          <button id="clear-data-btn" class="btn btn-outline btn-block" style="color: var(--error-red); border-color: var(--error-red);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear All Data
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Bind settings events
   */
  bindEvents() {
    // Username change
    const usernameInput = document.getElementById('username-input');
    usernameInput.addEventListener('change', () => {
      Storage.setUser({ name: usernameInput.value.trim() });
    });

    // Planning year change
    const yearSelect = document.getElementById('planning-year-select');
    yearSelect.addEventListener('change', () => {
      Storage.setUser({ planningYear: parseInt(yearSelect.value) });
    });

    // Export PDF
    document.getElementById('export-pdf-btn').addEventListener('click', () => {
      PDFExport.generate();
    });

    // Export JSON
    document.getElementById('export-json-btn').addEventListener('click', () => {
      this.exportJSON();
    });

    // Clear data
    document.getElementById('clear-data-btn').addEventListener('click', () => {
      Components.showConfirm(
        'Clear All Data',
        'Are you sure you want to delete all your data? This action cannot be undone.',
        () => {
          Storage.clearAll();
          Router.navigate('onboarding', { screen: 1 });
        }
      );
    });
  },

  /**
   * Export data as JSON
   */
  exportJSON() {
    const data = Storage.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `life-plan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Make Settings globally available
window.Settings = Settings;
