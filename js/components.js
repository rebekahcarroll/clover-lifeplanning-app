/**
 * Components Module - Reusable UI components
 */

const Components = {
  /**
   * Create app header with dark teal background
   */
  appHeader(showBack = true, backRoute = null, backParams = {}) {
    // Escape JSON for HTML attribute (replace double quotes with HTML entities)
    const paramsJson = JSON.stringify(backParams).replace(/"/g, '&quot;');
    const backOnclick = backRoute ? `Router.navigate('${backRoute}', ${paramsJson})` : 'Router.back()';

    return `
      <header class="app-header">
        <div class="app-header-nav">
          ${showBack ? `
            <button class="app-header-back" onclick="${backOnclick}" aria-label="Go back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          ` : '<div style="width: 40px;"></div>'}
          <div class="app-header-menu-wrapper">
            <button class="app-header-menu" onclick="Components.toggleHeaderMenu(event)" aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div class="header-dropdown hidden" id="header-dropdown">
              <button class="header-dropdown-item" onclick="Components.closeHeaderMenu(); Router.navigate('dashboard')">My Dashboard</button>
              <button class="header-dropdown-item" onclick="Components.closeHeaderMenu(); Router.navigate('settings')">Settings</button>
            </div>
          </div>
        </div>
      </header>
    `;
  },

  /**
   * Toggle header dropdown menu
   */
  toggleHeaderMenu(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('header-dropdown');
    if (dropdown) {
      const isHidden = dropdown.classList.contains('hidden');
      dropdown.classList.toggle('hidden');

      if (isHidden) {
        // Add click-outside listener when opening
        setTimeout(() => {
          document.addEventListener('click', Components.handleOutsideClick);
        }, 0);
      } else {
        document.removeEventListener('click', Components.handleOutsideClick);
      }
    }
  },

  /**
   * Handle click outside dropdown
   */
  handleOutsideClick(event) {
    const dropdown = document.getElementById('header-dropdown');
    const menuBtn = document.querySelector('.app-header-menu');
    if (dropdown && !dropdown.contains(event.target) && !menuBtn.contains(event.target)) {
      Components.closeHeaderMenu();
    }
  },

  /**
   * Close header dropdown menu
   */
  closeHeaderMenu() {
    const dropdown = document.getElementById('header-dropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
      document.removeEventListener('click', Components.handleOutsideClick);
    }
  },

  /**
   * Create clover logo SVG
   */
  cloverLogo(size = 48, color = '#3C5F6A') {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C9.5 2 7.5 4 7.5 6.5C7.5 7.5 7.8 8.4 8.3 9.1C6.3 9.5 4.8 11.3 4.8 13.5C4.8 16 6.8 18 9.3 18C10.3 18 11.2 17.7 12 17.2C12.8 17.7 13.7 18 14.7 18C17.2 18 19.2 16 19.2 13.5C19.2 11.3 17.7 9.5 15.7 9.1C16.2 8.4 16.5 7.5 16.5 6.5C16.5 4 14.5 2 12 2Z" fill="${color}"/>
        <path d="M12 18V22" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
        <path d="M10 20H14" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  },

  /**
   * Create a bubble/tag element
   * @param {string} text - The text to display
   * @param {string} id - Unique identifier
   * @param {boolean} showDelete - Whether to show the delete button
   */
  bubble(text, id, showDelete = true) {
    return `
      <div class="bubble" data-id="${id}">
        <span class="bubble-text">${this.escapeHtml(text)}</span>
        ${showDelete ? `
          <button class="bubble-delete" onclick="Components.handleBubbleDelete('${id}', true)" aria-label="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  },

  /**
   * Handle bubble delete - dispatches custom event
   */
  handleBubbleDelete(id, hasCallback) {
    const event = new CustomEvent('bubbleDelete', { detail: { id } });
    document.dispatchEvent(event);
  },

  /**
   * Create bubble input with submit
   */
  bubbleInput(placeholder = 'Type and press Enter...', inputId = 'bubble-input') {
    return `
      <div class="input-with-submit">
        <input
          type="text"
          id="${inputId}"
          class="form-input"
          placeholder="${placeholder}"
          autocomplete="off"
        >
        <button class="btn btn-primary btn-icon" onclick="Components.submitBubbleInput('${inputId}')" aria-label="Add">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    `;
  },

  /**
   * Submit bubble input
   */
  submitBubbleInput(inputId) {
    const input = document.getElementById(inputId);
    if (input && input.value.trim()) {
      const event = new CustomEvent('bubbleSubmit', { detail: { value: input.value.trim(), inputId } });
      document.dispatchEvent(event);
      input.value = '';
      input.focus();
    }
  },

  /**
   * Create progress indicator
   */
  progressIndicator(current, total) {
    let html = '<div class="step-progress">';
    for (let i = 1; i <= total; i++) {
      let className = 'step-indicator';
      if (i < current) className += ' complete';
      if (i === current) className += ' current';
      html += `<div class="${className}"></div>`;
    }
    html += '</div>';
    return html;
  },

  /**
   * Create progress dots for filled/empty display
   */
  progressDots(completed, total) {
    let html = '<div class="progress-bar">';
    for (let i = 0; i < total; i++) {
      html += `<div class="progress-dot ${i < completed ? 'complete' : ''}"></div>`;
    }
    html += `<span class="progress-text">${completed}/${total}</span>`;
    html += '</div>';
    return html;
  },

  /**
   * Create status badge
   */
  statusBadge(status) {
    const labels = {
      'not-started': 'Not Started',
      'in-progress': 'In Progress',
      'complete': 'Complete',
      'abandon': 'Abandoned'
    };

    return `<span class="status-badge status-${status}">${labels[status] || status}</span>`;
  },

  /**
   * Create status selector
   */
  statusSelector(currentStatus, itemId) {
    const statuses = [
      { value: 'not-started', label: 'Not Started' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'complete', label: 'Complete' },
      { value: 'abandon', label: 'Abandon' }
    ];

    let html = `<select class="reminder-select" onchange="Components.handleStatusChange('${itemId}', this.value)">`;
    statuses.forEach(s => {
      html += `<option value="${s.value}" ${currentStatus === s.value ? 'selected' : ''}>${s.label}</option>`;
    });
    html += '</select>';
    return html;
  },

  /**
   * Handle status change
   */
  handleStatusChange(itemId, newStatus) {
    const event = new CustomEvent('statusChange', { detail: { id: itemId, status: newStatus } });
    document.dispatchEvent(event);
  },

  /**
   * Create collapsible section
   */
  collapsible(title, content, isOpen = false, icon = '') {
    const id = 'collapsible-' + Date.now() + Math.random().toString(36).substr(2, 9);
    return `
      <div class="collapsible ${isOpen ? 'open' : ''}" id="${id}">
        <div class="collapsible-header" onclick="Components.toggleCollapsible('${id}')">
          <div class="collapsible-title">
            ${icon ? `<span class="collapsible-icon-left">${icon}</span>` : ''}
            ${title}
          </div>
          <svg class="collapsible-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <div class="collapsible-content">
          <div class="collapsible-body">
            ${content}
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Toggle collapsible
   */
  toggleCollapsible(id) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.toggle('open');
    }
  },

  /**
   * Create back navigation
   */
  backNav(text = 'Back', route = null, params = {}) {
    const onclick = route ? `Router.navigate('${route}', ${JSON.stringify(params)})` : 'Router.back()';
    return `
      <button class="nav-back" onclick="${onclick}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        ${text}
      </button>
    `;
  },

  /**
   * Create settings gear icon
   */
  settingsNav() {
    return `
      <button class="nav-settings btn-icon" onclick="Router.navigate('settings')" aria-label="Settings">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    `;
  },

  /**
   * Create card
   */
  card(title, content, actions = '') {
    return `
      <div class="card">
        ${title ? `<div class="card-header"><h3 class="card-title">${title}</h3></div>` : ''}
        <div class="card-body">${content}</div>
        ${actions ? `<div class="card-actions">${actions}</div>` : ''}
      </div>
    `;
  },

  /**
   * Create focus area card
   */
  focusAreaCard(area, showActions = true) {
    let actionsHtml = '';
    if (showActions && area.topActions && area.topActions.length > 0) {
      actionsHtml = '<div class="focus-area-actions">';
      area.topActions.forEach(action => {
        actionsHtml += `<div class="action-item">${this.escapeHtml(action)}</div>`;
      });
      actionsHtml += '</div>';
    }

    return `
      <div class="focus-area-card" data-id="${area.id}">
        <div class="focus-area-header">
          ${area.emoji ? `<span class="focus-area-emoji">${area.emoji}</span>` : ''}
          <span class="focus-area-title">${this.escapeHtml(area.title)}</span>
          ${this.statusBadge(area.status)}
        </div>
        ${area.description ? `<p class="focus-area-description">${this.escapeHtml(area.description)}</p>` : ''}
        ${actionsHtml}
      </div>
    `;
  },

  /**
   * Create quarterly item
   */
  quarterlyItem(item, focusAreaTitle = '') {
    const isChecked = item.status === 'complete';
    return `
      <div class="quarterly-item" data-id="${item.id}">
        <div class="quarterly-item-checkbox ${isChecked ? 'checked' : ''}" onclick="Components.toggleQuarterlyItem('${item.id}')">
          ${isChecked ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
        </div>
        <div class="quarterly-item-content">
          <div class="quarterly-item-title ${item.status === 'abandon' ? 'text-abandoned' : ''}">${this.escapeHtml(item.text)}</div>
          ${focusAreaTitle ? `<div class="quarterly-item-focus">${this.escapeHtml(focusAreaTitle)}</div>` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Toggle quarterly item completion
   */
  toggleQuarterlyItem(id) {
    const event = new CustomEvent('quarterlyToggle', { detail: { id } });
    document.dispatchEvent(event);
  },

  /**
   * Create whimsy item
   */
  whimsyItem(item) {
    const emojis = ['✨', '🌟', '💫', '🎯', '🚀', '🎨', '🎭', '🎪', '🎢', '🌈'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    return `
      <div class="whimsy-item" data-id="${item.id}">
        <span class="whimsy-icon">${emoji}</span>
        <span class="whimsy-text">${this.escapeHtml(item.text)}</span>
        <button class="bubble-delete" onclick="Components.handleWhimsyDelete('${item.id}')" aria-label="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
  },

  /**
   * Handle whimsy delete
   */
  handleWhimsyDelete(id) {
    const event = new CustomEvent('whimsyDelete', { detail: { id } });
    document.dispatchEvent(event);
  },

  /**
   * Create confirm modal content
   */
  showConfirm(title, message, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const cancelBtn = document.getElementById('confirm-cancel');
    const okBtn = document.getElementById('confirm-ok');

    titleEl.textContent = title;
    messageEl.textContent = message;

    modal.classList.remove('hidden');

    // Clone buttons to remove old listeners
    const newCancel = cancelBtn.cloneNode(true);
    const newOk = okBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
    okBtn.parentNode.replaceChild(newOk, okBtn);

    document.getElementById('confirm-cancel').addEventListener('click', () => {
      modal.classList.add('hidden');
    });

    document.getElementById('confirm-ok').addEventListener('click', () => {
      modal.classList.add('hidden');
      if (onConfirm) onConfirm();
    });
  },

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Show/hide footer
   */
  showFooter() {
    const footer = document.getElementById('app-footer');
    if (footer) footer.classList.remove('hidden');
  },

  hideFooter() {
    const footer = document.getElementById('app-footer');
    if (footer) footer.classList.add('hidden');
  }
};

// Make Components globally available
window.Components = Components;
