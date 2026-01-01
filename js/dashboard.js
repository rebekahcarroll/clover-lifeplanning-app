/**
 * Dashboard Module - Restructured with proper hierarchy
 */

const Dashboard = {
  stepMenuOpen: false,

  // Track expanded state for each item
  expandedItems: {},

  // Whimsy emojis for random assignment
  whimsyEmojis: ['⭐', '🌟', '🌈', '🦄', '✨', '💫'],

  /**
   * Render dashboard
   */
  render() {
    const app = document.getElementById('app');
    const user = Storage.getUser();
    const currentYear = new Date().getFullYear();
    const planningYear = user.planningYear || currentYear;

    Components.showFooter();

    app.innerHTML = `
      ${Components.appHeader(false)}
      <div class="screen">
        <div class="container dashboard-container">
          <h1 class="page-title dashboard-main-title">${Components.escapeHtml(user.name)}'s ${planningYear} Life Plan</h1>

          ${this.renderLifeVisioningHeader()}
          ${this.renderLifePlanningHeader()}
          ${this.renderWhimsySection()}

          ${this.renderBottomButtons()}
        </div>
      </div>
      ${this.renderStepMenu()}
    `;

    this.bindEvents();
  },

  // ==================
  // LIFE VISIONING HEADER
  // ==================

  renderLifeVisioningHeader() {
    const vision = Storage.getVision();
    const focusAreas = Storage.getFocusAreas().filter(a => a.title && a.title.trim());
    const years = vision.yearsFromNow || 5;

    return `
      <div class="dashboard-header-section">
        <div class="dashboard-header">
          <h2 class="dashboard-header-title">Life Visioning</h2>
          <p class="dashboard-header-subtitle">Done once, validated annually, updated every few years</p>
        </div>

        <div class="dashboard-sections">
          ${this.renderLifeVisionSection(vision)}
          ${this.renderCurrentStateSection(vision)}
          ${this.renderFocusAreasSection(focusAreas, years)}
        </div>
      </div>
    `;
  },

  renderLifeVisionSection(vision) {
    const hasVisionStatement = vision.lifeVisionStatement;
    const hasVisionIdeas = vision.lifeVisionIdeas && vision.lifeVisionIdeas.length > 0;

    return `
      <div class="dashboard-section">
        <div class="dashboard-section-header-static">
          <span class="dashboard-section-emoji">📝</span>
          <div class="dashboard-section-info">
            <h3 class="dashboard-section-title">Life Vision</h3>
            <p class="dashboard-section-desc">What does a life well-lived look like for you?</p>
          </div>
        </div>
        <div class="dashboard-section-body">
          ${hasVisionStatement ? `
            <div class="vision-statement-display">
              <p class="vision-statement-inline">"${Components.escapeHtml(vision.lifeVisionStatement)}"</p>
            </div>
            ${hasVisionIdeas ? `
              <div class="dashboard-collapsible-item ${this.expandedItems['vision-ideas'] ? 'expanded' : ''}" data-item="vision-ideas">
                <div class="dashboard-item-header" onclick="Dashboard.toggleItem('vision-ideas')">
                  <span class="dashboard-item-title">Vision Ideas</span>
                  <svg class="dashboard-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="dashboard-item-content">
                  <div class="bubble-container">
                    ${vision.lifeVisionIdeas.map(item => `
                      <span class="bubble">
                        <span class="bubble-text">${Components.escapeHtml(item.text)}</span>
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : ''}
          ` : `
            <p class="text-secondary section-empty">Complete Step 1 to add your life vision statement.</p>
          `}
        </div>
      </div>
    `;
  },

  renderCurrentStateSection(vision) {
    const hasStrengths = vision.highMarks && vision.highMarks.length > 0;
    const hasGaps = vision.regrets && vision.regrets.length > 0;
    const hasContent = hasStrengths || hasGaps;

    return `
      <div class="dashboard-section">
        <div class="dashboard-section-header-static">
          <span class="dashboard-section-emoji">📊</span>
          <div class="dashboard-section-info">
            <h3 class="dashboard-section-title">Current State Baseline</h3>
            <p class="dashboard-section-desc">How am I doing today living according to my vision?</p>
          </div>
        </div>
        <div class="dashboard-section-body">
          ${hasContent ? `
            ${hasStrengths ? `
              <div class="dashboard-collapsible-item ${this.expandedItems['strengths'] ? 'expanded' : ''}" data-item="strengths">
                <div class="dashboard-item-header" onclick="Dashboard.toggleItem('strengths')">
                  <span class="dashboard-item-title">Strengths</span>
                  <svg class="dashboard-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="dashboard-item-content">
                  <div class="bubble-container">
                    ${vision.highMarks.map(item => `
                      <span class="bubble bubble-success">
                        <span class="bubble-text">${Components.escapeHtml(item.text)}</span>
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : ''}
            ${hasGaps ? `
              <div class="dashboard-collapsible-item ${this.expandedItems['gaps'] ? 'expanded' : ''}" data-item="gaps">
                <div class="dashboard-item-header" onclick="Dashboard.toggleItem('gaps')">
                  <span class="dashboard-item-title">Gaps</span>
                  <svg class="dashboard-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="dashboard-item-content">
                  <div class="bubble-container">
                    ${vision.regrets.map(item => `
                      <span class="bubble bubble-neutral">
                        <span class="bubble-text">${Components.escapeHtml(item.text)}</span>
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : ''}
          ` : `
            <p class="text-secondary section-empty">Complete Step 2 to add your baseline assessment.</p>
          `}
        </div>
      </div>
    `;
  },

  renderFocusAreasSection(focusAreas, years) {
    return `
      <div class="dashboard-section">
        <div class="dashboard-section-header-static">
          <span class="dashboard-section-emoji">🎯</span>
          <div class="dashboard-section-info">
            <h3 class="dashboard-section-title">${years}-Year Focus Areas</h3>
            <p class="dashboard-section-desc">What are those areas I need to work on over the next 3-5 years to get me closer to where I want to be?</p>
          </div>
        </div>
        <div class="dashboard-section-body">
          ${focusAreas.length > 0 ? `
            ${focusAreas.map(area => `
              <div class="dashboard-collapsible-item ${this.expandedItems['fa-' + area.id] ? 'expanded' : ''}" data-item="fa-${area.id}">
                <div class="dashboard-item-header" onclick="Dashboard.toggleItem('fa-${area.id}')">
                  <div class="dashboard-item-title-with-emoji">
                    <span class="item-emoji">${area.emoji || '📌'}</span>
                    <span class="dashboard-item-title">${Components.escapeHtml(area.title)}</span>
                  </div>
                  <svg class="dashboard-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="dashboard-item-content">
                  ${(area.linkedIdeas && area.linkedIdeas.length > 0) ? `
                    <p class="subsection-label">${years}-Year Objectives</p>
                    <div class="bubble-container">
                      ${area.linkedIdeas.map(idea => `
                        <span class="bubble">
                          <span class="bubble-text">${Components.escapeHtml(idea)}</span>
                        </span>
                      `).join('')}
                    </div>
                  ` : '<p class="text-secondary">No objectives linked.</p>'}
                </div>
              </div>
            `).join('')}
          ` : `
            <p class="text-secondary section-empty">Complete Step 3 to define your focus areas.</p>
          `}
        </div>
      </div>
    `;
  },

  // ==================
  // LIFE PLANNING HEADER
  // ==================

  renderLifePlanningHeader() {
    const vision = Storage.getVision();
    const focusAreas = Storage.getFocusAreas();

    return `
      <div class="dashboard-header-section">
        <div class="dashboard-header">
          <h2 class="dashboard-header-title">Life Planning</h2>
          <p class="dashboard-header-subtitle">Done Annually, Reviewed Quarterly</p>
        </div>

        <div class="dashboard-sections">
          ${this.renderAnnualReflectionsSection(vision)}
          ${this.renderQuarterlyRoadmapSection(focusAreas)}
        </div>
      </div>
    `;
  },

  renderAnnualReflectionsSection(vision) {
    const hasProud = vision.proudOf && vision.proudOf.length > 0;
    const hasLearnings = vision.learnings && vision.learnings.length > 0;
    const hasBarriers = vision.barriers && vision.barriers.length > 0;
    const hasContent = hasProud || hasLearnings || hasBarriers;

    return `
      <div class="dashboard-section">
        <div class="dashboard-section-header-static">
          <span class="dashboard-section-emoji">💭</span>
          <div class="dashboard-section-info">
            <h3 class="dashboard-section-title">Annual Reflections</h3>
            <p class="dashboard-section-desc">Over the last year, what can I learn from how I did in each focus area?</p>
          </div>
        </div>
        <div class="dashboard-section-body">
          ${hasContent ? `
            ${hasProud ? `
              <div class="dashboard-collapsible-item ${this.expandedItems['proud'] ? 'expanded' : ''}" data-item="proud">
                <div class="dashboard-item-header" onclick="Dashboard.toggleItem('proud')">
                  <span class="dashboard-item-title">What I'm Proud Of</span>
                  <svg class="dashboard-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="dashboard-item-content">
                  <div class="bubble-container">
                    ${vision.proudOf.map(item => `
                      <span class="bubble bubble-success">
                        <span class="bubble-text">${Components.escapeHtml(item.text)}</span>
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : ''}
            ${hasLearnings ? `
              <div class="dashboard-collapsible-item ${this.expandedItems['learnings'] ? 'expanded' : ''}" data-item="learnings">
                <div class="dashboard-item-header" onclick="Dashboard.toggleItem('learnings')">
                  <span class="dashboard-item-title">Learnings</span>
                  <svg class="dashboard-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="dashboard-item-content">
                  <div class="bubble-container">
                    ${vision.learnings.map(item => `
                      <span class="bubble">
                        <span class="bubble-text">${Components.escapeHtml(item.text)}</span>
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : ''}
            ${hasBarriers ? `
              <div class="dashboard-collapsible-item ${this.expandedItems['barriers'] ? 'expanded' : ''}" data-item="barriers">
                <div class="dashboard-item-header" onclick="Dashboard.toggleItem('barriers')">
                  <span class="dashboard-item-title">Barriers</span>
                  <svg class="dashboard-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="dashboard-item-content">
                  <div class="bubble-container">
                    ${vision.barriers.map(item => `
                      <span class="bubble bubble-neutral">
                        <span class="bubble-text">${Components.escapeHtml(item.text)}</span>
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>
            ` : ''}
          ` : `
            <p class="text-secondary section-empty">Complete Step 4 to add your annual reflections.</p>
          `}
        </div>
      </div>
    `;
  },

  renderQuarterlyRoadmapSection(focusAreas) {
    // Collect all actions by timing from actionTimings
    const actionsByTiming = { q1: [], q2: [], q3: [], q4: [], might: [] };

    focusAreas.forEach(area => {
      const actionTimings = area.actionTimings || {};
      const actionStatuses = area.actionStatuses || {};
      const noSubStepsFlags = area.noSubStepsFlags || {};
      const actionSubSteps = area.actionSubSteps || {};
      const actionFinalMilestones = area.actionFinalMilestones || {};
      const prioritizedActions = area.prioritizedActions || [];
      const allActions = (area.actions || []).map(a => a.text);

      // Get all strategies
      const allStrategies = [
        ...prioritizedActions,
        ...allActions.filter(a => !prioritizedActions.includes(a))
      ];

      // For each strategy, get its action items
      allStrategies.forEach(strategyText => {
        const hasNoSubSteps = noSubStepsFlags[strategyText] === true;
        const subSteps = actionSubSteps[strategyText] || [];
        const finalMilestone = actionFinalMilestones[strategyText] || '';

        let actionItems = [];
        if (hasNoSubSteps || (subSteps.length === 0 && !finalMilestone)) {
          actionItems = [strategyText];
        } else {
          actionItems = [...subSteps];
          if (finalMilestone) {
            actionItems.push(finalMilestone);
          }
        }

        // Add each action item to the appropriate timing category
        actionItems.forEach(actionText => {
          const timing = actionTimings[actionText];
          if (timing && actionsByTiming[timing]) {
            actionsByTiming[timing].push({
              text: actionText,
              focusAreaId: area.id,
              focusAreaTitle: area.title,
              focusAreaEmoji: area.emoji,
              status: actionStatuses[actionText] || 'not-started'
            });
          }
        });
      });
    });

    const hasActions = Object.values(actionsByTiming).some(q => q.length > 0);

    const timingLabels = {
      q1: 'Q1 (Jan-Mar)',
      q2: 'Q2 (Apr-Jun)',
      q3: 'Q3 (Jul-Sep)',
      q4: 'Q4 (Oct-Dec)',
      might: 'Might Do'
    };

    // Default quarterly roadmap items to expanded
    ['q1', 'q2', 'q3', 'q4', 'might'].forEach(q => {
      if (this.expandedItems['quarter-' + q] === undefined) {
        this.expandedItems['quarter-' + q] = true;
      }
    });

    return `
      <div class="dashboard-section">
        <div class="dashboard-section-header-static">
          <span class="dashboard-section-emoji">🗓️</span>
          <div class="dashboard-section-info">
            <h3 class="dashboard-section-title">Quarterly Roadmap</h3>
            <p class="dashboard-section-desc">Top priorities for the year and quarterly action items.</p>
          </div>
        </div>
        <div class="dashboard-section-body">
          ${hasActions ? `
            ${['q1', 'q2', 'q3', 'q4', 'might'].map(timing => {
              const actions = actionsByTiming[timing];
              const itemId = 'quarter-' + timing;
              const isExpanded = this.expandedItems[itemId] !== false;

              return `
                <div class="dashboard-collapsible-item ${isExpanded ? 'expanded' : ''}" data-item="${itemId}">
                  <div class="dashboard-item-header" onclick="Dashboard.toggleItem('${itemId}')">
                    <div class="dashboard-item-title-with-count">
                      <span class="dashboard-item-title">${timingLabels[timing]}</span>
                      <span class="dashboard-item-count">${actions.length} item${actions.length !== 1 ? 's' : ''}</span>
                    </div>
                    <svg class="dashboard-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <div class="dashboard-item-content">
                    ${actions.length > 0 ? `
                      <div class="quarterly-actions-list">
                        ${actions.map(action => `
                          <div class="quarterly-action-item ${action.status === 'complete' ? 'completed' : ''}">
                            <div class="quarterly-action-info">
                              <span class="quarterly-action-text">${Components.escapeHtml(action.text)}</span>
                              <span class="quarterly-action-focus">${action.focusAreaEmoji || '📌'} ${Components.escapeHtml(action.focusAreaTitle)}</span>
                            </div>
                            <div class="quarterly-action-controls">
                              <select class="form-select quarterly-timing-select" onchange="Dashboard.changeActionTiming('${action.focusAreaId}', '${Components.escapeHtml(action.text).replace(/'/g, "\\'")}', this.value)">
                                <option value="q1" ${timing === 'q1' ? 'selected' : ''}>Do in Q1</option>
                                <option value="q2" ${timing === 'q2' ? 'selected' : ''}>Do in Q2</option>
                                <option value="q3" ${timing === 'q3' ? 'selected' : ''}>Do in Q3</option>
                                <option value="q4" ${timing === 'q4' ? 'selected' : ''}>Do in Q4</option>
                                <option value="might" ${timing === 'might' ? 'selected' : ''}>Might Do</option>
                              </select>
                              <select class="form-select quarterly-status-select" onchange="Dashboard.changeActionStatus('${action.focusAreaId}', '${Components.escapeHtml(action.text).replace(/'/g, "\\'")}', this.value, this)">
                                <option value="not-started" ${action.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                                <option value="in-progress" ${action.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                <option value="complete" ${action.status === 'complete' ? 'selected' : ''}>Complete</option>
                              </select>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    ` : '<p class="text-secondary quarterly-empty">No actions scheduled.</p>'}
                  </div>
                </div>
              `;
            }).join('')}
          ` : `
            <p class="text-secondary section-empty">Complete Step 6 to build your quarterly roadmap.</p>
          `}
        </div>
      </div>
    `;
  },

  // ==================
  // WHIMSY SECTION
  // ==================

  renderWhimsySection() {
    const whimsy = Storage.getWhimsy();

    // Assign consistent random emoji to each whimsy item based on its id
    const getWhimsyEmoji = (id) => {
      const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return this.whimsyEmojis[hash % this.whimsyEmojis.length];
    };

    // Default whimsy to collapsed
    if (this.expandedItems['whimsy'] === undefined) {
      this.expandedItems['whimsy'] = false;
    }

    return `
      <div class="dashboard-header-section whimsy-section-container">
        <div class="dashboard-section whimsy-section">
          <div class="dashboard-collapsible-item whimsy-item-container ${this.expandedItems['whimsy'] ? 'expanded' : ''}" data-item="whimsy">
            <div class="dashboard-item-header whimsy-header" onclick="Dashboard.toggleItem('whimsy')">
              <div class="dashboard-item-title-with-emoji">
                <span class="item-emoji whimsy-emoji">🌟</span>
                <div class="dashboard-section-info">
                  <h3 class="dashboard-section-title whimsy-title">Whimsy List</h3>
                  <p class="dashboard-section-desc">Fun ideas, bucket list items, and spontaneous dreams</p>
                </div>
              </div>
              <svg class="dashboard-item-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <div class="dashboard-item-content whimsy-content">
              ${whimsy.length > 0 ? `
                <div class="whimsy-list">
                  ${whimsy.map(item => `
                    <div class="whimsy-item ${item.status === 'did-it' || item.status === 'complete' ? 'completed' : ''}">
                      <div class="whimsy-item-left">
                        <span class="whimsy-item-emoji">${getWhimsyEmoji(item.id)}</span>
                        <span class="whimsy-item-text">${Components.escapeHtml(item.text)}</span>
                      </div>
                      <select class="form-select whimsy-status-select" onchange="Dashboard.updateWhimsyStatus('${item.id}', this.value, this)">
                        <option value="still-a-dream" ${item.status === 'still-a-dream' || item.status === 'not-started' || !item.status ? 'selected' : ''}>Still a Dream</option>
                        <option value="did-it" ${item.status === 'did-it' || item.status === 'complete' ? 'selected' : ''}>Did it!</option>
                      </select>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <p class="text-secondary">Complete Step 7 to add whimsical ideas.</p>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ==================
  // BOTTOM BUTTONS
  // ==================

  renderBottomButtons() {
    return `
      <div class="dashboard-bottom-buttons">
        <button class="btn btn-primary flex-1" onclick="Dashboard.toggleStepMenu()">
          Edit Current Year Plan
        </button>
        <button class="btn btn-outline flex-1" onclick="Router.navigate('settings')">
          Export to PDF
        </button>
      </div>
    `;
  },

  renderStepMenu() {
    const steps = [
      { num: 1, title: 'Paint Your Life Vision' },
      { num: 2, title: 'Baseline Your Current Reality' },
      { num: 3, title: 'Bring Your Vision to Life' },
      { num: 4, title: 'Reflect on & Learn from Prior Year' },
      { num: 5, title: 'Identify Priorities for Next Year' },
      { num: 6, title: 'Build a Quarterly Roadmap' },
      { num: 7, title: 'Be Whimsical' }
    ];

    return `
      <div class="step-menu-overlay ${this.stepMenuOpen ? 'active' : ''}" onclick="Dashboard.closeStepMenu()">
        <div class="step-menu" onclick="event.stopPropagation()">
          <div class="step-menu-header">
            <h3>Select a Step to Edit</h3>
            <button class="btn btn-ghost" onclick="Dashboard.closeStepMenu()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="step-menu-list">
            ${steps.map(step => `
              <button class="step-menu-item" onclick="Dashboard.navigateToStep(${step.num})">
                <span class="step-menu-number">${step.num}</span>
                <span class="step-menu-title">${step.title}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // ==================
  // INTERACTIONS
  // ==================

  toggleItem(itemId) {
    this.expandedItems[itemId] = !this.expandedItems[itemId];
    const item = document.querySelector(`[data-item="${itemId}"]`);
    if (item) {
      item.classList.toggle('expanded', this.expandedItems[itemId]);
    }
  },

  toggleStepMenu() {
    this.stepMenuOpen = !this.stepMenuOpen;
    const overlay = document.querySelector('.step-menu-overlay');
    if (overlay) {
      overlay.classList.toggle('active', this.stepMenuOpen);
    }
  },

  closeStepMenu() {
    this.stepMenuOpen = false;
    const overlay = document.querySelector('.step-menu-overlay');
    if (overlay) {
      overlay.classList.remove('active');
    }
  },

  navigateToStep(stepNum) {
    this.closeStepMenu();
    Router.navigate('step', { step: stepNum, substep: 'a' });
  },

  changeActionTiming(areaId, actionText, newTiming) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (area) {
      if (!area.actionTimings) {
        area.actionTimings = {};
      }
      area.actionTimings[actionText] = newTiming;
      Storage.setFocusAreas(areas);
      // Re-render to show the action in its new quarter
      this.render();
    }
  },

  changeActionStatus(areaId, actionText, status, selectEl) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (area) {
      if (!area.actionStatuses) {
        area.actionStatuses = {};
      }
      area.actionStatuses[actionText] = status;
      Storage.setFocusAreas(areas);

      // Immediately update the DOM to show/hide completed styling
      if (selectEl) {
        const actionItem = selectEl.closest('.quarterly-action-item');
        if (actionItem) {
          actionItem.classList.toggle('completed', status === 'complete');
        }
      }
    }
  },

  updateWhimsyStatus(id, status, selectEl) {
    const whimsy = Storage.getWhimsy();
    const item = whimsy.find(w => w.id === id);
    if (item) {
      item.status = status;
      Storage.setWhimsy(whimsy);

      // Immediately update the DOM to show/hide completed styling
      if (selectEl) {
        const itemEl = selectEl.closest('.whimsy-item');
        if (itemEl) {
          itemEl.classList.toggle('completed', status === 'did-it');
        }
      }
    }
  },

  /**
   * Bind dashboard events
   */
  bindEvents() {
    // No additional events needed - all handled via onclick
  }
};

// Make Dashboard globally available
window.Dashboard = Dashboard;
