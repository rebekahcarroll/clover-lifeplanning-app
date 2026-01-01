/**
 * Steps Module - Handles all 7 planning steps
 */

const Steps = {
  // Step configuration
  config: {
    1: {
      title: 'Paint Your Life Vision',
      substeps: ['a', 'b', 'c'],
      timerMinutes: 5
    },
    2: {
      title: 'Baseline Your Current Reality',
      substeps: ['a', 'b'],
      timerMinutes: 5
    },
    3: {
      title: 'Bring Your Vision to Life',
      substeps: ['a', 'b'],
      timerMinutes: 10
    },
    4: {
      title: 'Reflect on & Learn from Prior Year',
      substeps: ['a', 'b', 'c'],
      timerMinutes: 10
    },
    5: {
      title: 'Identify Priorities for Next Year',
      substeps: ['a', 'b'],
      timerMinutes: 10
    },
    6: {
      title: 'Build a Quarterly Roadmap',
      substeps: ['a', 'b', 'c'],
      timerMinutes: null
    },
    7: {
      title: 'Be Whimsical',
      substeps: ['a'],
      timerMinutes: null
    }
  },

  currentStep: 1,
  currentSubstep: 'a',
  eventsBound: false,
  collapsedSubsteps: {}, // Track which substeps are collapsed

  /**
   * Render a step
   */
  render(step = 1, substep = 'a') {
    this.currentStep = parseInt(step);
    this.currentSubstep = substep;

    const app = document.getElementById('app');
    Components.showFooter();

    const config = this.config[this.currentStep];
    if (!config) {
      Router.navigate('dashboard');
      return;
    }

    app.innerHTML = this.renderStepLayout(config);
    this.renderSubsteps();
    this.bindEvents();
  },

  /**
   * Render transition screen between Life Visioning and Life Planning
   */
  renderTransition() {
    const app = document.getElementById('app');
    const vision = Storage.getVision();
    // Filter out blank/unused focus areas - only include ones with a title
    const focusAreas = Storage.getFocusAreas().filter(area => area.title && area.title.trim() !== '');
    Components.showFooter();

    app.innerHTML = `
      ${Components.appHeader(true, 'step', { step: 3, substep: 'b' })}
      <div class="transition-screen">
        <div class="container">
          <div class="transition-header">
            <div class="transition-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 class="transition-title">Life Visioning Complete!</h1>
            <p class="transition-subtitle">You've completed the first phase of your strategic life plan.</p>
          </div>

          <div class="transition-summary">
            <h3>What You've Created</h3>

            ${vision.lifeVisionStatement ? `
              <div class="summary-section">
                <h4>Your Life Vision</h4>
                <p class="summary-text">${Components.escapeHtml(vision.lifeVisionStatement)}</p>
              </div>
            ` : ''}

            ${((vision.highMarks || []).length > 0 || (vision.regrets || []).length > 0) ? `
              <div class="summary-section">
                <h4>Current State Baseline</h4>
                ${(vision.highMarks || []).length > 0 ? `
                  <div class="baseline-subsection">
                    <h5 class="baseline-subsection-title">Strengths</h5>
                    <div class="baseline-items">
                      ${(vision.highMarks || []).map(item => `
                        <span class="baseline-item">${Components.escapeHtml(item.text)}</span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
                ${(vision.regrets || []).length > 0 ? `
                  <div class="baseline-subsection">
                    <h5 class="baseline-subsection-title">Gaps</h5>
                    <div class="baseline-items">
                      ${(vision.regrets || []).map(item => `
                        <span class="baseline-item">${Components.escapeHtml(item.text)}</span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            ${focusAreas.length > 0 ? `
              <div class="summary-section">
                <h4>Your ${vision.yearsFromNow || 5}-Year Focus Areas</h4>
                <div class="focus-areas-summary">
                  ${focusAreas.map(area => `
                    <div class="focus-area-chip">
                      <span class="focus-area-chip-emoji">${area.emoji || '📌'}</span>
                      <span>${Components.escapeHtml(area.title || 'Untitled')}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <div class="transition-next">
            <h3>What's Next: Life Planning</h3>
            <p>Now that you have your vision and focus areas defined, it's time to create an actionable plan for the coming year.</p>

            <div class="next-steps-preview">
              <div class="next-step-item">
                <span class="next-step-number">4</span>
                <span class="next-step-text">Reflect on & Learn from Prior Year</span>
              </div>
              <div class="next-step-item">
                <span class="next-step-number">5</span>
                <span class="next-step-text">Identify Priorities for Next Year</span>
              </div>
              <div class="next-step-item">
                <span class="next-step-number">6</span>
                <span class="next-step-text">Build a Quarterly Roadmap</span>
              </div>
              <div class="next-step-item">
                <span class="next-step-number">7</span>
                <span class="next-step-text">Be Whimsical</span>
              </div>
            </div>
          </div>

          <div class="transition-actions">
            <button class="btn btn-primary btn-block" onclick="Steps.showBreakPopup()">
              Continue to Life Planning
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Show break popup before continuing to Step 4
   */
  showBreakPopup() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'break-popup-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3 class="modal-title">Take a Break?</h3>
        <p class="modal-message">It may be helpful to take a break before continuing to allow your mind some space and come back to the annual reflection with a clear head. Do you want to take a break or keep going?</p>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="Steps.continueToStep4()">Keep Going</button>
          <button class="btn btn-outline" onclick="Steps.takeBreak()">Take a Break</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  takeBreak() {
    // Just close the popup and stay on the Life Visioning Complete screen
    const modal = document.getElementById('break-popup-modal');
    if (modal) modal.remove();
  },

  /**
   * Continue from transition to Step 4
   */
  continueToStep4() {
    const modal = document.getElementById('break-popup-modal');
    if (modal) modal.remove();
    Storage.markStepComplete(3);
    this.currentStep = 4;
    this.currentSubstep = 'a';
    Storage.setStepProgress({ currentStep: 4, currentSubstep: 'a' });
    Router.navigate('step', { step: 4, substep: 'a' });
  },

  /**
   * Check if a substep should be visible based on current substep
   */
  isSubstepVisible(substep) {
    const config = this.config[this.currentStep];
    const currentIndex = config.substeps.indexOf(this.currentSubstep);
    const targetIndex = config.substeps.indexOf(substep);
    return targetIndex <= currentIndex;
  },

  /**
   * Check if a substep is completed (user has moved past it)
   */
  isSubstepComplete(substep) {
    const config = this.config[this.currentStep];
    const currentIndex = config.substeps.indexOf(this.currentSubstep);
    const targetIndex = config.substeps.indexOf(substep);
    return targetIndex < currentIndex;
  },

  /**
   * Render substep label with optional checkmark
   */
  // Substep titles mapping
  substepTitles: {
    '1a': 'Brainstorm',
    '1b': 'Validate',
    '1c': 'Create Vision Statement',
    '2a': 'Identify Areas of Alignment',
    '2b': 'Identify Gaps',
    '3a': 'Define Near-Term Objectives',
    '3b': 'Create Near-Term Focus Areas',
    '4a': 'Brainstorm What You\'re Proud Of',
    '4b': 'Brainstorm Learnings',
    '4c': 'Identify Barriers to Near-Term Objectives',
    '5a': 'Brainstorm Strategies',
    '5b': 'Focus Your Efforts',
    '6a': 'Get Specific',
    '6b': 'Build a Roadmap',
    '6c': 'Validate',
    '7a': 'Be Whimsical!'
  },

  renderSubstepLabel(label, substep) {
    const isComplete = this.isSubstepComplete(substep);
    const isPreviousSubstep = this.isPreviousSubstep(substep);
    const isCollapsed = this.collapsedSubsteps[`${this.currentStep}-${substep}`] === true;

    const checkmark = isComplete ? '<svg class="substep-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success-green)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : '';

    // Get the title for this substep
    const stepKey = `${this.currentStep}${substep}`;
    const title = this.substepTitles[stepKey] || '';
    const titleDisplay = title ? `: ${title}` : '';

    // For previous completed substeps, make the header clickable to toggle collapse
    if (isPreviousSubstep) {
      return `
        <div class="substep-header-collapsible" onclick="Steps.toggleSubstep('${substep}')">
          <div class="substep-header-left">
            ${checkmark}
            <h3 class="substep-title ${isComplete ? 'complete' : ''}">${label}${titleDisplay}</h3>
          </div>
          <svg class="substep-chevron ${isCollapsed ? '' : 'expanded'}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>`;
    }

    return `<h3 class="substep-title ${isComplete ? 'complete' : ''}">${checkmark}${label}${titleDisplay}</h3>`;
  },

  /**
   * Check if substep is before the current substep
   */
  isPreviousSubstep(substep) {
    const config = this.config[this.currentStep];
    if (!config) return false;
    const currentIndex = config.substeps.indexOf(this.currentSubstep);
    const substepIndex = config.substeps.indexOf(substep);
    return substepIndex < currentIndex;
  },

  /**
   * Toggle a substep's collapsed state
   */
  toggleSubstep(substep) {
    const key = `${this.currentStep}-${substep}`;
    this.collapsedSubsteps[key] = !this.collapsedSubsteps[key];

    const substepEl = document.getElementById(`substep-${substep}`);
    if (substepEl) {
      substepEl.classList.toggle('collapsed', this.collapsedSubsteps[key]);
      // Update chevron direction
      const chevron = substepEl.querySelector('.substep-chevron');
      if (chevron) {
        chevron.classList.toggle('expanded', !this.collapsedSubsteps[key]);
      }
    }
  },

  /**
   * Get CSS class for a substep including collapsed state
   */
  getSubstepClass(substep) {
    const isCollapsed = this.collapsedSubsteps[`${this.currentStep}-${substep}`] === true;
    const isPrevious = this.isPreviousSubstep(substep);
    return `substep${isPrevious ? ' previous-substep' : ''}${isCollapsed ? ' collapsed' : ''}`;
  },

  /**
   * Render step layout
   */
  renderStepLayout(config) {
    const progress = Storage.getStepProgress();
    const canNavigateFreely = progress.completedSteps.includes(7);

    return `
      ${Components.appHeader(true, canNavigateFreely ? 'dashboard' : null)}
      <div class="step-screen">
        <div class="container">
          ${Components.progressIndicator(this.currentStep, 7)}
          <h1 class="page-title">Step ${this.currentStep}: ${config.title}</h1>

          <div id="substeps-container" class="step-content">
            <!-- Substeps rendered here -->
          </div>

          <div id="step-actions" class="mt-lg">
            <!-- Actions rendered here -->
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render substeps based on current step
   */
  renderSubsteps() {
    const container = document.getElementById('substeps-container');
    if (!container) return;

    switch (this.currentStep) {
      case 1:
        container.innerHTML = this.renderStep1();
        break;
      case 2:
        container.innerHTML = this.renderStep2();
        break;
      case 3:
        container.innerHTML = this.renderStep3();
        break;
      case 4:
        container.innerHTML = this.renderStep4();
        break;
      case 5:
        container.innerHTML = this.renderStep5();
        break;
      case 6:
        container.innerHTML = this.renderStep6();
        break;
      case 7:
        container.innerHTML = this.renderStep7();
        break;
    }

    this.renderActions();
  },

  /**
   * Re-render content and rebind events (convenience method)
   */
  renderContent() {
    this.renderSubsteps();
    this.bindEvents();
  },

  /**
   * Render navigation actions
   */
  renderActions() {
    const actionsContainer = document.getElementById('step-actions');
    if (!actionsContainer) return;

    const config = this.config[this.currentStep];
    const currentIndex = config.substeps.indexOf(this.currentSubstep);
    const isLastSubstep = currentIndex === config.substeps.length - 1;
    const isLastStep = this.currentStep === 7;

    let html = '<div class="flex gap-md">';

    // Previous substep/step button
    if (currentIndex > 0) {
      html += `<button class="btn btn-outline flex-1" onclick="Steps.prevSubstep()">Previous</button>`;
    } else if (this.currentStep > 1) {
      html += `<button class="btn btn-outline flex-1" onclick="Steps.prevStep()">Previous Step</button>`;
    }

    // Next substep/step button
    if (!isLastSubstep) {
      html += `<button class="btn btn-primary flex-1" onclick="Steps.nextSubstep()">Continue</button>`;
    } else if (!isLastStep) {
      html += `<button class="btn btn-primary flex-1" onclick="Steps.nextStep()">Next Step</button>`;
    } else {
      html += `<button class="btn btn-primary flex-1" onclick="Steps.complete()">Complete Planning</button>`;
    }

    html += '</div>';
    actionsContainer.innerHTML = html;
  },

  // ==================
  // STEP 1: Paint Your Life Vision
  // ==================

  renderStep1() {
    const vision = Storage.getVision();
    const config = this.config[1];
    let html = '';

    // Step 1a - Always visible
    html += `
      <div class="${this.getSubstepClass('a')}" id="substep-a">
        ${this.renderSubstepLabel('Step 1a', 'a')}
        <div class="substep-body">
          <p class="substep-prompt">
            Imagine you've reached your 100th birthday... as you reflect back on the life you've lived - how you showed up, your relationships, how you spent your time, the decisions you made - you feel an overwhelming sensation of peace, gratitude, joy, and zero regrets... how would you describe your life well-lived?
          </p>
          <div class="timer-row">
            <span class="timer-label">Recommended Time Limit:</span>
            ${Timer.createInlineButton(config.timerMinutes, 'Start Timer')}
          </div>
          ${Components.bubbleInput('Add one thought at a time…', 'vision-input')}
          <div class="bubble-container" id="vision-bubbles">
            ${(vision.lifeVisionIdeas || []).map(item =>
              Components.bubble(item.text, item.id, true)
            ).join('')}
          </div>
        </div>
      </div>
    `;

    // Step 1b - Only visible when user clicks Continue to substep b
    if (this.isSubstepVisible('b')) {
      html += `
        <hr class="substep-divider">
        <div class="${this.getSubstepClass('b')}" id="substep-b">
          ${this.renderSubstepLabel('Step 1b', 'b')}
          <div class="substep-body">
            <p class="substep-prompt">
              Take a step back and reflect on your answers to the above. Ask yourself, if all of these things were true about my life, would I feel zero regrets? Listen closely - add what's missing, modify what doesn't feel quite right, and take away the things that don't really matter.
            </p>
          </div>
        </div>
      `;
    }

    // Step 1c - Only visible when user clicks Continue to substep c
    if (this.isSubstepVisible('c')) {
      html += `
        <hr class="substep-divider">
        <div class="${this.getSubstepClass('c')}" id="substep-c">
          ${this.renderSubstepLabel('Step 1c', 'c')}
          <div class="substep-body">
            <p class="substep-prompt">
              Summarize your ideas into one sentence that captures the vision of what you hope will be true for your time on earth.
            </p>
            <p class="substep-note">
              Here are some snippets and examples from my own life vision... being unafraid to take measured risks, approaching life with continuous curiosity, achieving freedom through full acceptance of myself and others, etc. You get the idea. Make it yours!
            </p>
            <div class="form-group">
              <textarea
                id="vision-statement"
                class="form-textarea"
                placeholder="My life vision is..."
                rows="4"
              >${vision.lifeVisionStatement || ''}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    return html;
  },

  // ==================
  // STEP 2: Baseline Current Reality
  // ==================

  renderStep2() {
    const vision = Storage.getVision();
    const config = this.config[2];
    let html = '';

    // Display vision statement from Step 1 if available
    if (vision.lifeVisionStatement) {
      html += `
        <div class="vision-reference card mb-lg">
          <p class="vision-reference-label">Your Life Vision (from Step 1)</p>
          <p class="vision-reference-text">${Components.escapeHtml(vision.lifeVisionStatement)}</p>
        </div>
      `;
    }

    // Step 2a
    html += `
      <div class="${this.getSubstepClass('a')}" id="substep-a">
        ${this.renderSubstepLabel('Step 2a', 'a')}
        <div class="substep-body">
          <p class="substep-prompt">
            Imagine tomorrow was your last day here on earth. In what ways have you lived up to the vision you painted in Step 1? Be specific.
          </p>
          ${Components.bubbleInput('Add one thought at a time…', 'highmarks-input')}
          <div class="bubble-container" id="highmarks-bubbles">
            ${(vision.highMarks || []).map(item =>
              Components.bubble(item.text, item.id, true)
            ).join('')}
          </div>
        </div>
      </div>
    `;

    // Step 2b - Only visible when user clicks Continue
    if (this.isSubstepVisible('b')) {
      html += `
        <hr class="substep-divider">
        <div class="${this.getSubstepClass('b')}" id="substep-b">
          ${this.renderSubstepLabel('Step 2b', 'b')}
          <div class="substep-body">
            <p class="substep-prompt">
              What areas create a nagging feeling inside of you that indicates maybe you haven't quite lived up to your full potential as you'd like? Where would you have regrets?
            </p>
            ${Components.bubbleInput('Add one thought at a time…', 'regrets-input')}
            <div class="bubble-container" id="regrets-bubbles">
              ${(vision.regrets || []).map(item =>
                Components.bubble(item.text, item.id, true)
              ).join('')}
            </div>
          </div>
        </div>
      `;
    }

    return html;
  },

  // ==================
  // STEP 3: Near-Term Goals & Focus Areas
  // ==================

  renderStep3() {
    const vision = Storage.getVision();
    const focusAreas = Storage.getFocusAreas();
    const config = this.config[3];
    const years = vision.yearsFromNow || 5;
    let html = '';

    // Years selector
    html += `
      <div class="form-group">
        <label class="form-label">Select Your Planning Horizon (3-5 years recommended)</label>
        <select id="years-selector" class="form-select" onchange="Steps.updateYearsAndRefresh(this.value)">
          <option value="3" ${years === 3 ? 'selected' : ''}>3 years from now</option>
          <option value="5" ${years === 5 ? 'selected' : ''}>5 years from now</option>
          <option value="10" ${years === 10 ? 'selected' : ''}>10 years from now</option>
        </select>
      </div>
    `;

    // Step 3a - becomes read-only once user advances to Step 3b
    const isStep3aReadOnly = this.isSubstepVisible('b');

    html += `
      <div class="${this.getSubstepClass('a')}" id="substep-a">
        ${this.renderSubstepLabel('Step 3a', 'a')}
        <div class="substep-body">
        <p class="substep-prompt">
          Fast forward <strong>${years} years</strong> from today and ask: what do you hope looks different about your life? What tangible and intangible outcomes can you see, feel, or know? For example, if financial independence is important to you, you might like to have a robust passive income stream. Or if health is important to you, you might like to be sober or arrive at a place where exercise is not just a habit but is enjoyable. If your career is important to you, you might like to be thriving in a new role or even own your own business.
        </p>

        <!-- For Reference section (below note, above timer) -->
        <div class="reference-box-white mb-lg">
          <p class="reference-heading">For Reference:</p>
          <div class="reference-sections">
            ${vision.lifeVisionStatement ? `
              <div class="reference-section reference-section-teal" data-ref="vision">
                <div class="reference-section-header" onclick="Steps.toggleReferenceSection('vision')">
                  <span class="reference-section-title">Life Vision</span>
                  <svg class="reference-section-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="reference-section-content">
                  <div class="reference-section-body">
                    <p class="reference-vision-text">${Components.escapeHtml(vision.lifeVisionStatement)}</p>
                  </div>
                </div>
              </div>
            ` : ''}

            ${(vision.highMarks || []).length > 0 ? `
              <div class="reference-section reference-section-teal" data-ref="highmarks">
                <div class="reference-section-header" onclick="Steps.toggleReferenceSection('highmarks')">
                  <span class="reference-section-title">Current State Baseline: Strengths</span>
                  <svg class="reference-section-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="reference-section-content">
                  <div class="reference-section-body">
                    <div class="bubble-container">
                      ${(vision.highMarks || []).map(item => Components.bubble(item.text, item.id, false)).join('')}
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            ${(vision.regrets || []).length > 0 ? `
              <div class="reference-section reference-section-teal" data-ref="regrets">
                <div class="reference-section-header" onclick="Steps.toggleReferenceSection('regrets')">
                  <span class="reference-section-title">Current State Baseline: Gaps</span>
                  <svg class="reference-section-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="reference-section-content">
                  <div class="reference-section-body">
                    <div class="bubble-container">
                      ${(vision.regrets || []).map(item => Components.bubble(item.text, item.id, false)).join('')}
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        ${!isStep3aReadOnly ? `
          <div class="timer-row">
            <span class="timer-label">Recommended Time Limit:</span>
            ${Timer.createInlineButton(config.timerMinutes, 'Start Timer')}
          </div>
        ` : ''}
        ${Components.bubbleInput('Add one idea at a time…', 'goals-input')}
        <div class="bubble-container" id="goals-bubbles">
          ${(vision.futureGoals || []).map(item =>
            Components.bubble(item.text, item.id, true)
          ).join('')}
        </div>
        </div>
      </div>
    `;

    // Step 3b - Create Focus Areas (only visible when user clicks Continue)
    if (this.isSubstepVisible('b')) {
      const futureGoals = vision.futureGoals || [];

      // Initialize 3 default focus areas if none exist
      let currentFocusAreas = focusAreas;
      if (currentFocusAreas.length === 0) {
        for (let i = 0; i < 3; i++) {
          Storage.addFocusArea({ title: '', emoji: '', description: '' });
        }
        currentFocusAreas = Storage.getFocusAreas();
      }

      html += `
        <hr class="substep-divider">
        <div class="${this.getSubstepClass('b')}" id="substep-b">
          ${this.renderSubstepLabel('Step 3b', 'b')}
          <div class="substep-body">
          <p class="substep-prompt">
            Review the objectives you created above (step 3a) and look for themes. Create Focus Areas below for each theme, titling them in a way that summarizes the end state of what you hope to achieve in ${years} years. Start with an action verb! For example, if you have three objectives pertaining to health, your theme might be "Prioritize my Well-Being" or "Get in the Best Shape of my Life." Next, link your objectives to a focus area by selecting them from the drop down. Note: I recommend limiting yourself to no more than 5 themes or focus areas.
          </p>

          <div id="focus-areas-list" class="mb-lg">
            ${currentFocusAreas.map(area => this.renderFocusAreaCard(area, futureGoals, currentFocusAreas, years)).join('')}
          </div>

          ${currentFocusAreas.length < 5 ? `
            <button class="btn btn-outline btn-block" onclick="Steps.addFocusArea()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Focus Area
            </button>
          ` : ''}
          </div>
        </div>
      `;
    }

    return html;
  },

  renderFocusAreaCard(area, futureGoals = [], allFocusAreas = [], years = 5) {
    const isExpanded = area.expanded !== false;
    const linkedIdeas = area.linkedIdeas || [];

    // Collect all ideas already assigned to ANY focus area
    const allAssignedIdeas = new Set();
    allFocusAreas.forEach(fa => {
      (fa.linkedIdeas || []).forEach(idea => allAssignedIdeas.add(idea));
    });

    // Filter to only show unassigned ideas in dropdown
    const unassignedGoals = futureGoals.filter(g => !allAssignedIdeas.has(g.text));

    return `
      <div class="focus-area-card ${isExpanded ? 'expanded' : ''}" data-focus-id="${area.id}">
        <div class="focus-area-header" onclick="Steps.toggleFocusArea('${area.id}')">
          <div class="focus-area-header-left">
            <span class="focus-area-emoji">${area.emoji || '📌'}</span>
            <span class="focus-area-title">${Components.escapeHtml(area.title) || 'New Focus Area'}</span>
          </div>
          <div class="focus-area-header-right">
            <button class="btn btn-ghost btn-sm focus-area-delete" onclick="event.stopPropagation(); Steps.deleteFocusArea('${area.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <svg class="focus-area-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>

        <div class="focus-area-content">
          <div class="flex gap-sm mb-md">
            <div class="form-group mb-0" style="width: 60px;">
              <label class="form-label-sm">Icon</label>
              <input
                type="text"
                class="form-input"
                placeholder="📌"
                maxlength="2"
                value="${area.emoji || ''}"
                onchange="Steps.updateFocusArea('${area.id}', 'emoji', this.value)"
              >
            </div>
            <div class="form-group mb-0 flex-1">
              <label class="form-label-sm">Title</label>
              <input
                type="text"
                class="form-input"
                placeholder="Focus Area Title"
                value="${Components.escapeHtml(area.title || '')}"
                onchange="Steps.updateFocusArea('${area.id}', 'title', this.value)"
              >
            </div>
          </div>

          <div class="form-group mb-md">
            <label class="form-label-sm">${years}-Year Objectives</label>
            <select class="form-select" onchange="Steps.addIdeaToFocusArea('${area.id}', this.value); this.value='';">
              <option value="">Select relevant objectives...</option>
              ${unassignedGoals.map(goal => `
                <option value="${Components.escapeHtml(goal.text)}">${Components.escapeHtml(goal.text)}</option>
              `).join('')}
            </select>
          </div>

          ${linkedIdeas.length > 0 ? `
            <div class="form-group mb-0">
              <label class="form-label-sm">Linked Objectives</label>
              <div class="linked-ideas-container">
                ${linkedIdeas.map(idea => `
                  <span class="linked-idea-chip">
                    ${Components.escapeHtml(idea)}
                    <button class="linked-idea-remove" onclick="Steps.removeIdeaFromFocusArea('${area.id}', '${Components.escapeHtml(idea).replace(/'/g, "\\'")}')">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  renderFocusAreaForm(area) {
    return `
      <div class="card mb-md" data-focus-id="${area.id}">
        <div class="flex justify-between items-center mb-md">
          <h4>Focus Area</h4>
          <button class="btn btn-ghost btn-sm" onclick="Steps.deleteFocusArea('${area.id}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>

        <div class="flex gap-sm mb-md">
          <div class="form-group mb-0" style="width: 60px;">
            <input
              type="text"
              class="form-input"
              placeholder="📌"
              maxlength="2"
              value="${area.emoji || ''}"
              onchange="Steps.updateFocusArea('${area.id}', 'emoji', this.value)"
            >
          </div>
          <div class="form-group mb-0 flex-1">
            <input
              type="text"
              class="form-input"
              placeholder="Focus Area Title (e.g., Prioritize my well-being)"
              value="${Components.escapeHtml(area.title || '')}"
              onchange="Steps.updateFocusArea('${area.id}', 'title', this.value)"
            >
          </div>
        </div>

        <div class="form-group mb-0">
          <textarea
            class="form-textarea"
            placeholder="Goal statement/description (optional)"
            rows="2"
            onchange="Steps.updateFocusArea('${area.id}', 'description', this.value)"
          >${Components.escapeHtml(area.description || '')}</textarea>
        </div>
      </div>
    `;
  },

  // ==================
  // STEP 4: Reflect on Prior Year
  // ==================

  renderStep4() {
    const vision = Storage.getVision();
    const focusAreas = Storage.getFocusAreas();
    const config = this.config[4];
    let html = '';

    // Step 4a
    html += `
      <div class="${this.getSubstepClass('a')}" id="substep-a">
        ${this.renderSubstepLabel('Step 4a', 'a')}
        <div class="substep-body">
        <p class="substep-prompt">
          Reflect on the last year, think about all the people you interacted with, the decisions you made, what you achieved, how you spent your time... what are you MOST proud of?
        </p>
        <div class="timer-row">
          <span class="timer-label">Recommended Time Limit:</span>
          ${Timer.createInlineButton(config.timerMinutes, 'Start Timer')}
        </div>
        ${Components.bubbleInput('Add one idea at a time…', 'proud-input')}
        <div class="bubble-container" id="proud-bubbles">
          ${(vision.proudOf || []).map(item =>
            Components.bubble(item.text, item.id, true)
          ).join('')}
        </div>
        </div>
      </div>
    `;

    // Step 4b (only visible when user clicks Continue)
    if (this.isSubstepVisible('b')) {
      html += `
        <hr class="substep-divider">
        <div class="${this.getSubstepClass('b')}" id="substep-b">
          ${this.renderSubstepLabel('Step 4b', 'b')}
          <div class="substep-body">
          <p class="substep-prompt">
            Over the last year, what did you learn that changed your perspective on your ability to lead the life you desire, whether it be a learning about yourself, others, the world, your life, priorities, beliefs, etc.?
          </p>
          <div class="timer-row">
            <span class="timer-label">Recommended Time Limit:</span>
            ${Timer.createInlineButton(config.timerMinutes, 'Start Timer')}
          </div>
          ${Components.bubbleInput('Add one idea at a time…', 'learnings-input')}
          <div class="bubble-container" id="learnings-bubbles">
            ${(vision.learnings || []).map(item =>
              Components.bubble(item.text, item.id, true)
            ).join('')}
          </div>
          </div>
        </div>
      `;
    }

    // Step 4c (only visible when user clicks Continue)
    if (this.isSubstepVisible('c')) {
      const years = vision.yearsFromNow || 5;
      html += `
        <hr class="substep-divider">
        <div class="${this.getSubstepClass('c')}" id="substep-c">
          ${this.renderSubstepLabel('Step 4c', 'c')}
          <div class="substep-body">
          <p class="substep-prompt">
            Given what you've learned over the last year, what are the biggest barriers facing you today that might keep you from achieving the ${years}-Year objectives you set out in Step 3?
          </p>

          <p class="substep-note">
            Example: If one of your Goals/Focus Areas from Step 3 is "prioritize my well-being," one of your learnings might be: "I need accountability to live a healthy lifestyle," and a barrier might be: "I don't currently have a community of people around me who will hold me accountable."
          </p>

          ${focusAreas.length > 0 ? `
            <div class="reference-box-white mb-lg">
              <p class="reference-heading">Your ${years}-Year Focus Areas:</p>
              <div class="reference-sections">
                ${focusAreas.map(area => `
                  <div class="reference-section reference-section-teal" data-ref="focus-${area.id}">
                    <div class="reference-section-header" onclick="Steps.toggleReferenceSection('focus-${area.id}')">
                      <span class="reference-section-title">${area.emoji || '📌'} ${Components.escapeHtml(area.title || 'Untitled')}</span>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.8rem; color: var(--light-gray);">See Objectives</span>
                        <svg class="reference-section-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div class="reference-section-content">
                      <div class="reference-section-body">
                        ${(area.linkedIdeas || []).length > 0 ? `
                          <div class="bubble-container">
                            ${(area.linkedIdeas || []).map(idea => `
                              <span class="bubble" style="cursor: default;">
                                <span class="bubble-text">${Components.escapeHtml(idea)}</span>
                              </span>
                            `).join('')}
                          </div>
                        ` : '<p style="color: var(--light-gray); font-style: italic;">No objectives linked</p>'}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="timer-row">
            <span class="timer-label">Recommended Time Limit:</span>
            ${Timer.createInlineButton(config.timerMinutes, 'Start Timer')}
          </div>
          ${Components.bubbleInput('Add one idea at a time…', 'barriers-input')}
          <div class="bubble-container" id="barriers-bubbles">
            ${(vision.barriers || []).map(item =>
              Components.bubble(item.text, item.id, true)
            ).join('')}
          </div>
          </div>
        </div>
      `;
    }

    return html;
  },

  // ==================
  // STEP 5: Identify Priorities
  // ==================

  renderStep5() {
    const focusAreas = Storage.getFocusAreas();
    const vision = Storage.getVision();
    const years = vision.yearsFromNow || 5;
    const config = this.config[5];
    let html = '';

    // Step 5a - Actionable steps per focus area
    html += `
      <div class="${this.getSubstepClass('a')}" id="substep-a">
        ${this.renderSubstepLabel('Step 5a', 'a')}
        <div class="substep-body">
        <p class="substep-prompt">
          Given your learnings and where you are today, what strategies could you employ in the next year to move you closer to the life you want to lead and address any barriers you face? For example: if Prioritize my Well-Being is my focus area, strategies might be: run a marathon, take up yoga, go to a mindfulness retreat, adopt a mediterranean diet.
        </p>

        <!-- For Reference section -->
        <div class="reference-box-white mb-lg">
          <p class="reference-heading">For Reference:</p>
          <div class="reference-sections">
            ${(vision.proudOf || []).length > 0 ? `
              <div class="reference-section reference-section-teal" data-ref="proudof">
                <div class="reference-section-header" onclick="Steps.toggleReferenceSection('proudof')">
                  <span class="reference-section-title">Prior Year: What I'm Proud Of</span>
                  <svg class="reference-section-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="reference-section-content">
                  <div class="reference-section-body">
                    <div class="bubble-container">
                      ${(vision.proudOf || []).map(item => Components.bubble(item.text, item.id, false)).join('')}
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            ${(vision.learnings || []).length > 0 ? `
              <div class="reference-section reference-section-teal" data-ref="learnings">
                <div class="reference-section-header" onclick="Steps.toggleReferenceSection('learnings')">
                  <span class="reference-section-title">Prior Year: Learnings</span>
                  <svg class="reference-section-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="reference-section-content">
                  <div class="reference-section-body">
                    <div class="bubble-container">
                      ${(vision.learnings || []).map(item => Components.bubble(item.text, item.id, false)).join('')}
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}

            ${(vision.barriers || []).length > 0 ? `
              <div class="reference-section reference-section-teal" data-ref="barriers">
                <div class="reference-section-header" onclick="Steps.toggleReferenceSection('barriers')">
                  <span class="reference-section-title">Barriers to Achieving ${years}-Year Objectives</span>
                  <svg class="reference-section-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                <div class="reference-section-content">
                  <div class="reference-section-body">
                    <div class="bubble-container">
                      ${(vision.barriers || []).map(item => Components.bubble(item.text, item.id, false)).join('')}
                    </div>
                  </div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="timer-row">
          <span class="timer-label">Recommended Time Limit:</span>
          ${Timer.createInlineButton(config.timerMinutes, 'Start Timer')}
        </div>

        ${focusAreas.length > 0 ? `
          <div class="focus-areas-actions mt-lg">
            ${focusAreas.map(area => `
              <div class="card mb-md">
                <h4 class="mb-md">${area.emoji || ''} ${Components.escapeHtml(area.title)}</h4>

                ${(area.linkedIdeas || []).length > 0 ? `
                  <div class="focus-area-detail-section mb-md">
                    <div class="focus-area-detail-header" onclick="Steps.toggleFocusAreaDetail('${area.id}')">
                      <span class="focus-area-detail-title">See Objectives</span>
                      <svg class="focus-area-detail-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                    <div class="focus-area-detail-content" id="focus-detail-${area.id}">
                      <div class="focus-area-detail-body">
                        <p class="focus-area-detail-label">What You'd Like to Look Different in ${years} Years:</p>
                        <div class="bubble-container">
                          ${(area.linkedIdeas || []).map(idea => `
                            <div class="bubble">
                              <span class="bubble-text">${Components.escapeHtml(idea)}</span>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  </div>
                ` : ''}

                ${Components.bubbleInput('Add a potential strategy…', `action-input-${area.id}`)}
                <div class="bubble-container" id="actions-bubbles-${area.id}">
                  ${(area.actions || []).map(item =>
                    Components.bubble(item.text, item.id, true)
                  ).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p class="text-secondary">No Focus Areas defined. Please go back to Step 3 to create Focus Areas.</p>'}
        </div>
      </div>
    `;

    // Step 5b - Prioritize actions (only visible when user clicks Continue)
    if (this.isSubstepVisible('b')) {
      html += `
        <hr class="substep-divider">
        <div class="${this.getSubstepClass('b')}" id="substep-b">
          ${this.renderSubstepLabel('Step 5b', 'b')}
          <div class="substep-body">
          <p class="substep-prompt">
            One focus area at a time, review your ideas. Consider, which strategies would move the needle the furthest toward my overall objectives? Are there any strategies that are important to try first? Are there any budget limitations for what I can reasonably tackle in the next year?
          </p>
          <p class="substep-prompt">
            With these questions in mind, prioritize up to 3 strategies within each focus area. This doesn't mean you cannot do the others, we're just trying to figure out which ones are most important and/or viable.
          </p>

          ${focusAreas.length > 0 ? `
            <div class="focus-areas-prioritize mt-lg">
              ${focusAreas.map(area => {
                const actions = area.actions || [];
                const prioritizedActions = area.prioritizedActions || [];

                return actions.length > 0 ? `
                  <div class="card mb-md" data-focus-id="${area.id}">
                    <h4 class="mb-md">${area.emoji || '📌'} ${Components.escapeHtml(area.title)}</h4>
                    <p class="form-label-sm mb-md">Select up to 3</p>
                    <div class="priority-actions-list">
                      ${actions.map(action => {
                        const isChecked = prioritizedActions.includes(action.text);
                        return `
                          <div class="priority-action-item">
                            <label class="priority-checkbox-label">
                              <input
                                type="checkbox"
                                class="priority-checkbox"
                                data-area-id="${area.id}"
                                data-action-text="${Components.escapeHtml(action.text).replace(/"/g, '&quot;')}"
                                ${isChecked ? 'checked' : ''}
                                onchange="Steps.togglePriorityAction('${area.id}', '${Components.escapeHtml(action.text).replace(/'/g, "\\'")}', this.checked)"
                              >
                              <span class="priority-checkbox-custom"></span>
                              <span class="priority-action-text">${Components.escapeHtml(action.text)}</span>
                            </label>
                          </div>
                        `;
                      }).join('')}
                    </div>
                    <p class="priority-count-display mt-sm" id="priority-count-${area.id}">
                      ${prioritizedActions.length}/3 selected
                    </p>
                  </div>
                ` : '';
              }).join('')}
            </div>
          ` : '<p class="text-secondary">No actions to prioritize. Please go back to Step 5a to add actions.</p>'}
          </div>
        </div>
      `;
    }

    return html;
  },

  // ==================
  // STEP 6: Quarterly Roadmap
  // ==================

  renderStep6() {
    const focusAreas = Storage.getFocusAreas();
    const areasWithActions = focusAreas.filter(a => a.actions && a.actions.length > 0);
    const vision = Storage.getVision();
    const years = vision.yearsFromNow || 5;
    let html = '';

    // Step 6b becomes read-only when user advances to Step 6c
    const isStep6bReadOnly = this.isSubstepVisible('c');

    // Step 6a - "Get Specific" - Add sub-steps to prioritized actions
    html += `
      <div class="${this.getSubstepClass('a')}" id="substep-a">
        ${this.renderSubstepLabel('Step 6a', 'a')}
        <div class="substep-body">
        <p class="substep-prompt">
          One focus area at a time, review your strategies. Consider if breaking them down into bite-sized steps or actions would create more clarity, drive accountability, and allocate efforts across the year. If you don't want to break a strategy down, simply check the box entitled 'Do Not Add Sub-Steps.'
        </p>
        <p class="substep-prompt">
          For example, back to the 'Prioritize my well-being' example from Step 4, a strategy might be: run a marathon. But you might consider breaking that down further into digestible steps that can be spread across the year, such as: establish gym days 2x per week, create a training plan, find a friend to do the race with me, run 3 miles, run 6 miles, run 15 miles, etc. You get the idea – be specific and make it actionable!
        </p>

        ${areasWithActions.length > 0 ? `
          <div class="substeps-builder mt-lg">
            ${areasWithActions.map(area => {
              const prioritizedActions = area.prioritizedActions || [];
              const allActions = (area.actions || []).map(a => a.text);
              const actionSubSteps = area.actionSubSteps || {};
              const actionFinalMilestones = area.actionFinalMilestones || {};
              const noSubStepsFlags = area.noSubStepsFlags || {};

              // Sort: prioritized first, then non-prioritized
              const sortedActions = [
                ...prioritizedActions,
                ...allActions.filter(a => !prioritizedActions.includes(a))
              ];

              return sortedActions.length > 0 ? `
                <div class="card mb-md" data-focus-id="${area.id}">
                  <h4 class="mb-md">${area.emoji || '📌'} ${Components.escapeHtml(area.title)}</h4>
                  <div class="substeps-actions-list">
                    ${sortedActions.map(actionText => {
                      const isPrioritized = prioritizedActions.includes(actionText);
                      const subSteps = actionSubSteps[actionText] || [];
                      const finalMilestone = actionFinalMilestones[actionText] || '';
                      const hasSubSteps = subSteps.length > 0;
                      const hasMilestone = !!finalMilestone;
                      const hasContent = hasSubSteps || hasMilestone;
                      const noSubSteps = noSubStepsFlags[actionText] === true;
                      const isExpanded = hasContent || (area.expandedActions && area.expandedActions[actionText]);
                      const sanitizedAction = actionText.replace(/[^a-zA-Z0-9]/g, '_');

                      return `
                        <div class="substep-action-container ${hasContent ? 'has-substeps' : ''} ${isPrioritized ? 'is-prioritized' : ''}" data-action="${Components.escapeHtml(actionText).replace(/"/g, '&quot;')}">
                          ${isPrioritized ? '<div class="priority-label">Top Priority</div>' : ''}
                          <div class="substep-action-header">
                            <div class="substep-action-main">
                              <span class="substep-action-text">${Components.escapeHtml(actionText)}</span>
                              ${hasContent && !noSubSteps ? '<span class="substep-parent-badge">Parent</span>' : ''}
                            </div>
                            ${!noSubSteps ? `
                              <button class="btn btn-sm ${hasContent ? 'btn-outline' : 'btn-ghost'}" onclick="Steps.toggleSubStepsExpansion('${area.id}', '${Components.escapeHtml(actionText).replace(/'/g, "\\'")}')">
                                ${hasContent ? 'Edit sub-steps' : '+ Add sub-steps'}
                              </button>
                            ` : ''}
                          </div>

                          <div class="no-substeps-option">
                            <label class="checkbox-label">
                              <input type="checkbox" ${noSubSteps ? 'checked' : ''} onchange="Steps.toggleNoSubSteps('${area.id}', '${Components.escapeHtml(actionText).replace(/'/g, "\\'")}', this.checked)">
                              <span>Do Not Add Sub-Steps</span>
                            </label>
                          </div>

                          ${!noSubSteps ? `
                            <div class="substep-expansion ${isExpanded ? 'expanded' : ''}" id="substeps-${area.id}-${sanitizedAction}">
                              <div class="substep-expansion-content">
                                ${hasSubSteps || hasMilestone ? `
                                  <div class="substeps-bubbles mb-md">
                                    ${subSteps.map((subStep, idx) => `
                                      <div class="substep-bubble">
                                        <span class="substep-bubble-text">${Components.escapeHtml(subStep)}</span>
                                        <button class="substep-bubble-remove" onclick="Steps.removeSubStep('${area.id}', '${Components.escapeHtml(actionText).replace(/'/g, "\\'")}', ${idx}, false)">
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                          </svg>
                                        </button>
                                      </div>
                                    `).join('')}
                                    ${hasMilestone ? `
                                      <div class="substep-bubble final-milestone">
                                        <span class="substep-bubble-text">${Components.escapeHtml(finalMilestone)}</span>
                                        <span class="milestone-badge">Final Milestone</span>
                                        <button class="substep-bubble-remove" onclick="Steps.removeSubStep('${area.id}', '${Components.escapeHtml(actionText).replace(/'/g, "\\'")}', -1, true)">
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                          </svg>
                                        </button>
                                      </div>
                                    ` : ''}
                                  </div>
                                ` : ''}
                                <div class="substep-add-form">
                                  <div class="input-with-submit mb-sm">
                                    <input
                                      type="text"
                                      class="form-input substep-input"
                                      placeholder="Add a sub-step..."
                                      id="substep-input-${area.id}-${sanitizedAction}"
                                      onkeypress="if(event.key === 'Enter') Steps.addSubStep('${area.id}', '${Components.escapeHtml(actionText).replace(/'/g, "\\'")}', this.value, false)"
                                    >
                                    <button class="btn btn-primary btn-icon" onclick="Steps.addSubStep('${area.id}', '${Components.escapeHtml(actionText).replace(/'/g, "\\'")}', document.getElementById('substep-input-${area.id}-${sanitizedAction}').value, false)">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                      </svg>
                                    </button>
                                  </div>
                                  <div class="final-milestone-form">
                                    <div class="input-with-submit">
                                      <input
                                        type="text"
                                        class="form-input substep-input"
                                        placeholder="Add final milestone..."
                                        id="milestone-input-${area.id}-${sanitizedAction}"
                                        onkeypress="if(event.key === 'Enter') Steps.addSubStep('${area.id}', '${Components.escapeHtml(actionText).replace(/'/g, "\\'")}', this.value, true)"
                                        ${hasMilestone ? 'disabled' : ''}
                                      >
                                      <button class="btn btn-primary btn-icon" onclick="Steps.addSubStep('${area.id}', '${Components.escapeHtml(actionText).replace(/'/g, "\\'")}', document.getElementById('milestone-input-${area.id}-${sanitizedAction}').value, true)" ${hasMilestone ? 'disabled' : ''}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                          <line x1="12" y1="5" x2="12" y2="19"></line>
                                          <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                      </button>
                                    </div>
                                    <p class="milestone-hint">The final milestone is required and represents your 12-month goal for this strategy.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ` : ''}
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              ` : '';
            }).join('')}
          </div>
        ` : '<p class="text-secondary">No strategies to display. Please go back to Step 5 to add strategies.</p>'}
        </div>
      </div>
    `;

    // Step 6b - "Build a Roadmap" - Quarterly assignment organized by Strategy
    if (this.isSubstepVisible('b')) {
      html += `
        <hr class="substep-divider">
        <div class="${this.getSubstepClass('b')}" id="substep-b">
          ${this.renderSubstepLabel('Step 6b', 'b')}
          <div class="substep-body">
          <p class="substep-prompt">
            One focus area at a time, sequence your action items throughout the year by selecting when you plan to complete each item. Choose Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec), or "Might Do" for items you're unsure about.
          </p>

        <div id="focus-areas-roadmap" class="mt-lg">
          ${areasWithActions.length > 0 ? areasWithActions.map(area => {
            const isExpanded = area.quarterlyExpanded !== false;
            const actionTimings = area.actionTimings || {};
            const noSubStepsFlags = area.noSubStepsFlags || {};
            const actionSubSteps = area.actionSubSteps || {};
            const actionFinalMilestones = area.actionFinalMilestones || {};
            const prioritizedActions = area.prioritizedActions || [];
            const allActions = (area.actions || []).map(a => a.text);

            // Get all strategies (prioritized first, then non-prioritized)
            const allStrategies = [
              ...prioritizedActions,
              ...allActions.filter(a => !prioritizedActions.includes(a))
            ];

            return `
              <div class="roadmap-focus-area ${isExpanded ? 'expanded' : ''}" data-area-id="${area.id}">
                <div class="roadmap-focus-header" onclick="Steps.toggleQuarterlyFocusArea('${area.id}')">
                  <div class="roadmap-focus-left">
                    <span class="focus-area-emoji">${area.emoji || '📌'}</span>
                    <span class="focus-area-title">${Components.escapeHtml(area.title)}</span>
                  </div>
                  <svg class="roadmap-focus-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>

                <div class="roadmap-focus-content">
                  ${allStrategies.map(strategyText => {
                    const hasNoSubSteps = noSubStepsFlags[strategyText] === true;
                    const subSteps = actionSubSteps[strategyText] || [];
                    const finalMilestone = actionFinalMilestones[strategyText] || '';
                    const isPrioritized = prioritizedActions.includes(strategyText);

                    // Determine action items for this strategy
                    let actionItems = [];
                    if (hasNoSubSteps || (subSteps.length === 0 && !finalMilestone)) {
                      // The strategy itself is the action item
                      actionItems = [{ text: strategyText, isFinalMilestone: false }];
                    } else {
                      // Sub-steps are the action items, plus milestone at end
                      actionItems = subSteps.map(ss => ({
                        text: ss,
                        isFinalMilestone: false
                      }));
                      if (finalMilestone) {
                        actionItems.push({ text: finalMilestone, isFinalMilestone: true });
                      }
                    }

                    return `
                      <div class="roadmap-strategy ${isPrioritized ? 'is-prioritized' : ''}">
                        <div class="roadmap-strategy-header">
                          <span class="roadmap-strategy-title">${Components.escapeHtml(strategyText)}</span>
                          ${isPrioritized ? '<span class="roadmap-priority-badge">Priority</span>' : ''}
                        </div>
                        <div class="roadmap-actions-list">
                          ${actionItems.map(item => {
                            const currentTiming = actionTimings[item.text] || '';
                            return `
                              <div class="roadmap-action-item ${item.isFinalMilestone ? 'final-milestone' : ''}">
                                <div class="roadmap-action-text">
                                  ${Components.escapeHtml(item.text)}
                                  ${item.isFinalMilestone ? '<span class="roadmap-milestone-badge">Final Milestone</span>' : ''}
                                </div>
                                <select class="form-select roadmap-timing-select ${currentTiming ? 'has-selection' : ''}"
                                        onchange="Steps.setActionTiming('${area.id}', '${Components.escapeHtml(item.text).replace(/'/g, "\\'")}', this.value)"
                                        ${isStep6bReadOnly ? 'disabled' : ''}>
                                  <option value="" ${!currentTiming ? 'selected' : ''}>Select timing...</option>
                                  <option value="q1" ${currentTiming === 'q1' ? 'selected' : ''}>Do in Q1</option>
                                  <option value="q2" ${currentTiming === 'q2' ? 'selected' : ''}>Do in Q2</option>
                                  <option value="q3" ${currentTiming === 'q3' ? 'selected' : ''}>Do in Q3</option>
                                  <option value="q4" ${currentTiming === 'q4' ? 'selected' : ''}>Do in Q4</option>
                                  <option value="might" ${currentTiming === 'might' ? 'selected' : ''}>Might Do</option>
                                </select>
                              </div>
                            `;
                          }).join('')}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('') : '<p class="text-secondary">No Focus Areas with strategies. Please go back to Step 5 to add strategies.</p>'}
        </div>
          </div>
        </div>
      `;
    }

    // Step 6c - "Validate" - Review and Quarterly Summary
    if (this.isSubstepVisible('c')) {
      // Collect all actions across all focus areas by timing category
      const actionsByTiming = { q1: [], q2: [], q3: [], q4: [], might: [] };

      areasWithActions.forEach(area => {
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

      const timingLabels = {
        q1: 'Q1 (Jan-Mar)',
        q2: 'Q2 (Apr-Jun)',
        q3: 'Q3 (Jul-Sep)',
        q4: 'Q4 (Oct-Dec)',
        might: 'Might Do'
      };

      html += `
        <hr class="substep-divider">
        <div class="${this.getSubstepClass('c')}" id="substep-c">
          ${this.renderSubstepLabel('Step 6c', 'c')}
          <div class="substep-body">
          <p class="substep-prompt">
            Take a step back and review your plan - ask: is this achievable? Remember to pace yourself! Adjust the time frames below as needed.
          </p>

          <div class="quarterly-summary mt-lg">
            <h4 class="mb-md">Your Roadmap</h4>
            ${['q1', 'q2', 'q3', 'q4', 'might'].map(timing => {
              const actions = actionsByTiming[timing];
              const isMightDo = timing === 'might';

              return `
                <div class="quarterly-summary-section ${isMightDo ? 'might-do-section' : ''}">
                  <div class="quarterly-summary-header">
                    <h5 class="quarterly-summary-title">${timingLabels[timing]}</h5>
                  </div>
                  ${actions.length > 0 ? `
                    <div class="quarterly-summary-items">
                      ${actions.map(action => `
                        <div class="quarterly-summary-item">
                          <div class="quarterly-summary-item-content">
                            <span class="quarterly-summary-action">${Components.escapeHtml(action.text)}</span>
                            <span class="quarterly-summary-focus-area">${action.focusAreaEmoji || '📌'} ${Components.escapeHtml(action.focusAreaTitle)}</span>
                          </div>
                          <select class="form-select quarterly-summary-select" onchange="Steps.setActionTiming('${action.focusAreaId}', '${Components.escapeHtml(action.text).replace(/'/g, "\\'")}', this.value); Steps.renderContent();">
                            <option value="q1" ${timing === 'q1' ? 'selected' : ''}>Q1</option>
                            <option value="q2" ${timing === 'q2' ? 'selected' : ''}>Q2</option>
                            <option value="q3" ${timing === 'q3' ? 'selected' : ''}>Q3</option>
                            <option value="q4" ${timing === 'q4' ? 'selected' : ''}>Q4</option>
                            <option value="might" ${timing === 'might' ? 'selected' : ''}>Might Do</option>
                          </select>
                        </div>
                      `).join('')}
                    </div>
                  ` : `<p class="text-secondary empty-section">No actions scheduled${isMightDo ? '' : ' for this quarter'}.</p>`}
                </div>
              `;
            }).join('')}
          </div>
          </div>
        </div>
      `;
    }

    return html;
  },

  // Assign an action to a quarter
  assignActionToQuarter(areaId, quarter, actionText) {
    if (!actionText) return;

    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (area) {
      if (!area.quarterlyAssignments) {
        area.quarterlyAssignments = { q1: [], q2: [], q3: [], q4: [] };
      }
      if (!area.quarterlyAssignments[quarter].includes(actionText)) {
        area.quarterlyAssignments[quarter].push(actionText);
        Storage.setFocusAreas(areas);
        this.renderSubsteps();
        this.bindEvents();
      }
    }
  },

  // Remove an action from a quarter
  removeActionFromQuarter(areaId, quarter, actionText) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (area && area.quarterlyAssignments) {
      area.quarterlyAssignments[quarter] = area.quarterlyAssignments[quarter].filter(a => a !== actionText);
      Storage.setFocusAreas(areas);
      this.renderSubsteps();
      this.bindEvents();
    }
  },

  // Move an action from one quarter to another (legacy - kept for 6c compatibility)
  moveActionToQuarter(areaId, fromQuarter, actionText, toQuarter) {
    if (fromQuarter === toQuarter) return;
    // Use new timing system
    this.setActionTiming(areaId, actionText, toQuarter);
  },

  // Set timing for an action item (new Step 6b structure)
  setActionTiming(areaId, actionText, timing) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    // Initialize actionTimings if not exists
    if (!area.actionTimings) {
      area.actionTimings = {};
    }

    if (timing) {
      area.actionTimings[actionText] = timing;
    } else {
      delete area.actionTimings[actionText];
    }

    Storage.setFocusAreas(areas);

    // Update just the select element without full re-render for better UX
    const selectEl = event?.target;
    if (selectEl) {
      selectEl.classList.toggle('has-selection', !!timing);
    }
  },

  showQuarter(quarter) {
    // Update tabs
    document.querySelectorAll('.quarter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.quarter === quarter);
    });

    // Update content
    document.querySelectorAll('.quarter-content').forEach(content => {
      content.classList.toggle('active', content.id === `quarter-${quarter}`);
    });
  },

  toggleQuarterlyFocusArea(areaId) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (area) {
      area.quarterlyExpanded = area.quarterlyExpanded === false ? true : false;
      Storage.setFocusAreas(areas);

      // Toggle UI
      const card = document.querySelector(`.quarterly-focus-area[data-area-id="${areaId}"]`);
      if (card) {
        card.classList.toggle('expanded');
      }
    }
  },

  // ==================
  // STEP 7: Whimsy List
  // ==================

  renderStep7() {
    const whimsy = Storage.getWhimsy();

    return `
      <div class="${this.getSubstepClass('a')}" id="substep-a">
        ${this.renderSubstepLabel('Step 7', 'a')}
        <div class="substep-body">
        <p class="substep-note mb-md" style="font-style: italic;">(Optional but Recommended)</p>
        <p class="substep-prompt">
          Each year, I like to make a whimsy list for those things that just sound plain fun or things I'm afraid of but hold significance for me personally.
        </p>
        <p class="substep-prompt">
          A whimsy could be something you've always wanted to do but doubt you'll do this year (hike the Appalachian trail) or something you think is silly (try bangs), not a good use of your time (create my own board game), or maybe even terrifying but impossible to stop thinking about (write a book).
        </p>
        <p class="substep-prompt">
          The goal is to explore your own version of joy and challenge without judging yourself or committing to anything. After all, it's just a whimsy. You're not committed to it, which means you don't need to feel any pressure.
        </p>

        <div class="tip-box mb-lg">
          <span class="tip-icon">✨</span>
          <p>
            <strong>Tip:</strong> In full transparency, in any given year, I usually end up doing around 30% of my whimsies subconsciously, simply because I had the audacity to write them down. It's a powerful tool. A few of my past whimsies that became a reality: take an improv class, teach boxing classes, travel to Iceland, learn to paint, and even start my own business! I regret doing zero of it, FYI.
          </p>
        </div>

        ${Components.bubbleInput('Add a whimsy...', 'whimsy-input')}
        <div id="whimsy-list" class="mt-lg">
          ${whimsy.map(item => Components.whimsyItem(item)).join('')}
        </div>
        </div>
      </div>
    `;
  },

  // ==================
  // Event Handlers
  // ==================

  bindEvents() {
    // Remove old event listeners first to prevent duplicates
    if (this.boundBubbleSubmit) {
      document.removeEventListener('bubbleSubmit', this.boundBubbleSubmit);
    }
    if (this.boundBubbleDelete) {
      document.removeEventListener('bubbleDelete', this.boundBubbleDelete);
    }
    if (this.boundWhimsyDelete) {
      document.removeEventListener('whimsyDelete', this.boundWhimsyDelete);
    }

    // Create bound handlers
    this.boundBubbleSubmit = this.handleBubbleSubmit.bind(this);
    this.boundBubbleDelete = this.handleBubbleDelete.bind(this);
    this.boundWhimsyDelete = this.handleWhimsyDelete.bind(this);

    // Bubble submit handler
    document.addEventListener('bubbleSubmit', this.boundBubbleSubmit);

    // Bubble delete handler
    document.addEventListener('bubbleDelete', this.boundBubbleDelete);

    // Whimsy delete handler
    document.addEventListener('whimsyDelete', this.boundWhimsyDelete);

    // Enter key on inputs
    document.querySelectorAll('.form-input').forEach(input => {
      // Clone and replace to remove old listeners
      const newInput = input.cloneNode(true);
      input.parentNode.replaceChild(newInput, input);
      newInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          Components.submitBubbleInput(newInput.id);
        }
      });
    });

    // Auto-save textareas
    document.querySelectorAll('.form-textarea').forEach(textarea => {
      const newTextarea = textarea.cloneNode(true);
      textarea.parentNode.replaceChild(newTextarea, textarea);
      newTextarea.addEventListener('change', () => this.autoSave());
      newTextarea.addEventListener('blur', () => this.autoSave());
    });
  },

  handleBubbleSubmit(e) {
    const { value, inputId } = e.detail;
    if (!value.trim()) return;

    const newItem = { id: Date.now().toString(), text: value.trim() };
    let containerId = null;

    // Determine which data to update based on input ID
    if (inputId === 'vision-input') {
      const vision = Storage.getVision();
      vision.lifeVisionIdeas = [...(vision.lifeVisionIdeas || []), newItem];
      Storage.setVision(vision);
      containerId = 'vision-bubbles';
    } else if (inputId === 'highmarks-input') {
      const vision = Storage.getVision();
      vision.highMarks = [...(vision.highMarks || []), newItem];
      Storage.setVision(vision);
      containerId = 'highmarks-bubbles';
    } else if (inputId === 'regrets-input') {
      const vision = Storage.getVision();
      vision.regrets = [...(vision.regrets || []), newItem];
      Storage.setVision(vision);
      containerId = 'regrets-bubbles';
    } else if (inputId === 'goals-input') {
      const vision = Storage.getVision();
      vision.futureGoals = [...(vision.futureGoals || []), newItem];
      Storage.setVision(vision);
      containerId = 'goals-bubbles';
      // If on Step 3b, refresh the focus area dropdowns to include new objective
      if (this.currentStep === 3 && this.isSubstepVisible('b')) {
        this.refreshFocusAreaDropdowns();
      }
    } else if (inputId === 'proud-input') {
      const vision = Storage.getVision();
      vision.proudOf = [...(vision.proudOf || []), newItem];
      Storage.setVision(vision);
      containerId = 'proud-bubbles';
    } else if (inputId === 'learnings-input') {
      const vision = Storage.getVision();
      vision.learnings = [...(vision.learnings || []), newItem];
      Storage.setVision(vision);
      containerId = 'learnings-bubbles';
    } else if (inputId === 'barriers-input') {
      const vision = Storage.getVision();
      vision.barriers = [...(vision.barriers || []), newItem];
      Storage.setVision(vision);
      containerId = 'barriers-bubbles';
    } else if (inputId.startsWith('action-input-')) {
      const areaId = inputId.replace('action-input-', '');
      const areas = Storage.getFocusAreas();
      const area = areas.find(a => a.id === areaId);
      if (area) {
        // Ensure action items have default status of 'not-started'
        const actionItem = { ...newItem, quarterlyStatus: 'not-started' };
        area.actions = [...(area.actions || []), actionItem];
        Storage.setFocusAreas(areas);
        containerId = `actions-bubbles-${areaId}`;
      }
    } else if (inputId.startsWith('quarterly-input-')) {
      const parts = inputId.replace('quarterly-input-', '').split('-');
      const quarter = parts[0];
      const areaId = parts[1];
      Storage.addQuarterlyItem(quarter, { text: value, focusAreaId: areaId });
      containerId = `quarterly-bubbles-${quarter}-${areaId}`;
    } else if (inputId === 'whimsy-input') {
      Storage.addWhimsy(value);
      containerId = 'whimsy-list';
    }

    // Add bubble directly to container instead of re-rendering
    if (containerId) {
      const container = document.getElementById(containerId);
      if (container) {
        if (inputId === 'whimsy-input') {
          container.insertAdjacentHTML('beforeend', Components.whimsyItem(newItem));
        } else {
          container.insertAdjacentHTML('beforeend', Components.bubble(newItem.text, newItem.id, true));
        }
      }
    }
  },

  handleBubbleDelete(e) {
    const { id } = e.detail;

    // Try to find and delete from various sources
    const vision = Storage.getVision();

    ['lifeVisionIdeas', 'highMarks', 'regrets', 'futureGoals', 'proudOf', 'learnings', 'barriers'].forEach(key => {
      if (vision[key]) {
        vision[key] = vision[key].filter(item => item.id !== id);
      }
    });

    Storage.setVision(vision);

    // Check focus areas
    const areas = Storage.getFocusAreas();
    areas.forEach(area => {
      if (area.actions) {
        area.actions = area.actions.filter(item => item.id !== id);
      }
    });
    Storage.setFocusAreas(areas);

    // Check quarterly
    const quarterly = Storage.getQuarterly();
    ['q1', 'q2', 'q3', 'q4'].forEach(q => {
      if (quarterly[q]) {
        quarterly[q] = quarterly[q].filter(item => item.id !== id);
      }
    });
    Storage.setQuarterly(quarterly);

    // Remove the bubble element from DOM instead of re-rendering
    const bubbleEl = document.querySelector(`.bubble[data-id="${id}"]`);
    if (bubbleEl) {
      bubbleEl.remove();
    }
  },

  handleWhimsyDelete(e) {
    const { id } = e.detail;
    Storage.deleteWhimsy(id);
    // Remove the whimsy element from DOM instead of re-rendering
    const whimsyEl = document.querySelector(`.whimsy-item[data-id="${id}"]`);
    if (whimsyEl) {
      whimsyEl.remove();
    }
  },

  autoSave() {
    const visionStatement = document.getElementById('vision-statement');
    if (visionStatement) {
      Storage.setVision({ lifeVisionStatement: visionStatement.value });
    }
  },

  // Focus Area Management
  addFocusArea() {
    const focusAreas = Storage.getFocusAreas();
    // Limit to 5 focus areas
    if (focusAreas.length >= 5) {
      alert('You can have a maximum of 5 Focus Areas.');
      return;
    }
    Storage.addFocusArea({ title: '', emoji: '', description: '' });
    // Re-render to update the UI with the new focus area
    this.renderSubsteps();
    this.bindEvents();
  },

  updateFocusArea(id, field, value) {
    Storage.updateFocusArea(id, { [field]: value });
    // Update the header in real-time
    const card = document.querySelector(`[data-focus-id="${id}"]`);
    if (card) {
      if (field === 'title') {
        const titleEl = card.querySelector('.focus-area-title');
        if (titleEl) {
          titleEl.textContent = value || 'New Focus Area';
        }
      } else if (field === 'emoji') {
        const emojiEl = card.querySelector('.focus-area-emoji');
        if (emojiEl) {
          emojiEl.textContent = value || '📌';
        }
      }
    }
  },

  addIdeaToFocusArea(areaId, ideaText) {
    if (!ideaText) return;
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (area) {
      area.linkedIdeas = area.linkedIdeas || [];
      if (!area.linkedIdeas.includes(ideaText)) {
        area.linkedIdeas.push(ideaText);
        Storage.setFocusAreas(areas);
        // Re-render to update the UI
        this.renderSubsteps();
        this.bindEvents();
        // Explicitly refresh all dropdowns to ensure assigned items are removed from all
        this.refreshFocusAreaDropdowns();
      }
    }
  },

  removeIdeaFromFocusArea(areaId, ideaText) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (area && area.linkedIdeas) {
      area.linkedIdeas = area.linkedIdeas.filter(idea => idea !== ideaText);
      Storage.setFocusAreas(areas);
      // Re-render to update the UI
      this.renderSubsteps();
      this.bindEvents();
      // Refresh dropdowns to show the removed item again in all dropdowns
      this.refreshFocusAreaDropdowns();
    }
  },

  refreshFocusAreaDropdowns() {
    // Refresh all focus area dropdown selects with updated objectives list
    const vision = Storage.getVision();
    const futureGoals = vision.futureGoals || [];
    const allFocusAreas = Storage.getFocusAreas();

    // Collect all ideas already assigned to ANY focus area
    const allAssignedIdeas = new Set();
    allFocusAreas.forEach(fa => {
      (fa.linkedIdeas || []).forEach(idea => allAssignedIdeas.add(idea));
    });

    // Filter to only show unassigned ideas
    const unassignedGoals = futureGoals.filter(g => !allAssignedIdeas.has(g.text));

    // Update all dropdowns
    document.querySelectorAll('.focus-area-card .form-select').forEach(select => {
      // Preserve the first option
      const firstOption = select.querySelector('option[value=""]');
      select.innerHTML = '';
      if (firstOption) select.appendChild(firstOption);

      // Add unassigned goals
      unassignedGoals.forEach(goal => {
        const option = document.createElement('option');
        option.value = goal.text;
        option.textContent = goal.text;
        select.appendChild(option);
      });
    });
  },

  showAddToFocusAreaDropdown(ideaId, ideaText, buttonElement) {
    const focusAreas = Storage.getFocusAreas();
    if (focusAreas.length === 0) {
      alert('Please create a Focus Area first before adding ideas to it.');
      return;
    }

    // Remove any existing dropdown
    const existingDropdown = document.querySelector('.idea-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'idea-dropdown';
    dropdown.innerHTML = `
      <div class="idea-dropdown-header">Add to Focus Area:</div>
      ${focusAreas.map(area => `
        <button class="idea-dropdown-item" onclick="Steps.addIdeaToFocusAreaFromDropdown('${area.id}', '${ideaText.replace(/'/g, "\\'")}')">
          ${area.emoji || '📌'} ${Components.escapeHtml(area.title) || 'Untitled'}
        </button>
      `).join('')}
    `;

    // Position dropdown
    const rect = buttonElement.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + 5}px`;
    dropdown.style.left = `${rect.left}px`;

    document.body.appendChild(dropdown);

    // Close dropdown when clicking outside
    const closeDropdown = (e) => {
      if (!dropdown.contains(e.target) && e.target !== buttonElement) {
        dropdown.remove();
        document.removeEventListener('click', closeDropdown);
      }
    };
    setTimeout(() => document.addEventListener('click', closeDropdown), 0);
  },

  addIdeaToFocusAreaFromDropdown(areaId, ideaText) {
    this.addIdeaToFocusArea(areaId, ideaText);
    // Remove the dropdown
    const dropdown = document.querySelector('.idea-dropdown');
    if (dropdown) dropdown.remove();
  },

  deleteFocusArea(id) {
    Components.showConfirm(
      'Delete Focus Area',
      'Are you sure you want to delete this focus area? This action cannot be undone.',
      () => {
        Storage.deleteFocusArea(id);
        // Remove the element from DOM
        const el = document.querySelector(`[data-focus-id="${id}"]`);
        if (el) {
          el.remove();
        }
      }
    );
  },

  toggleTopAction(areaId, actionText, isChecked) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (area) {
      area.topActions = area.topActions || [];
      if (isChecked) {
        if (!area.topActions.includes(actionText)) {
          area.topActions.push(actionText);
        }
      } else {
        area.topActions = area.topActions.filter(a => a !== actionText);
      }
      Storage.setFocusAreas(areas);
    }
  },

  updateYears(value) {
    Storage.setVision({ yearsFromNow: parseInt(value) });
    // Just update the year references in prompts - no need for full re-render
  },

  updateYearsAndRefresh(value) {
    Storage.setVision({ yearsFromNow: parseInt(value) });
    // Re-render substeps to update dynamic text
    this.renderSubsteps();
    this.bindEvents();
  },

  toggleFocusArea(id) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === id);
    if (area) {
      area.expanded = area.expanded === false ? true : false;
      Storage.setFocusAreas(areas);

      // Toggle UI
      const card = document.querySelector(`[data-focus-id="${id}"]`);
      if (card) {
        card.classList.toggle('expanded');
      }
    }
  },

  toggleReferenceSection(refId) {
    const section = document.querySelector(`.reference-section[data-ref="${refId}"]`);
    if (section) {
      section.classList.toggle('expanded');
    }
  },

  toggleFocusAreaDetail(areaId) {
    const content = document.getElementById(`focus-detail-${areaId}`);
    const section = content?.closest('.focus-area-detail-section');
    if (section) {
      section.classList.toggle('expanded');
    }
  },

  /**
   * Toggle sub-steps expansion panel (Step 6a)
   */
  toggleSubStepsExpansion(areaId, actionText) {
    const sanitizedAction = actionText.replace(/[^a-zA-Z0-9]/g, '_');
    const expansionEl = document.getElementById(`substeps-${areaId}-${sanitizedAction}`);
    if (expansionEl) {
      expansionEl.classList.toggle('expanded');

      // Track expanded state in storage
      const areas = Storage.getFocusAreas();
      const area = areas.find(a => a.id === areaId);
      if (area) {
        if (!area.expandedActions) area.expandedActions = {};
        area.expandedActions[actionText] = expansionEl.classList.contains('expanded');
        Storage.setFocusAreas(areas);
      }
    }
  },

  /**
   * Toggle "Do Not Add Sub-Steps" option (Step 6a)
   */
  toggleNoSubSteps(areaId, actionText, isChecked) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    // Initialize noSubStepsFlags if not exists
    if (!area.noSubStepsFlags) {
      area.noSubStepsFlags = {};
    }

    if (isChecked) {
      // If checking, remove any existing sub-steps and milestone for this action
      if (area.actionSubSteps && area.actionSubSteps[actionText]) {
        delete area.actionSubSteps[actionText];
      }
      if (area.actionFinalMilestones && area.actionFinalMilestones[actionText]) {
        delete area.actionFinalMilestones[actionText];
      }
      area.noSubStepsFlags[actionText] = true;
    } else {
      area.noSubStepsFlags[actionText] = false;
    }

    Storage.setFocusAreas(areas);
    this.renderContent();
  },

  /**
   * Add a sub-step to a prioritized action (Step 6a)
   * @param {string} areaId - Focus area ID
   * @param {string} parentAction - Parent action text
   * @param {string} subStepText - Sub-step text to add
   * @param {boolean} isFinalMilestone - If true, this is the final milestone (goes to end)
   */
  addSubStep(areaId, parentAction, subStepText, isFinalMilestone = false) {
    if (!subStepText || !subStepText.trim()) return;

    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    if (isFinalMilestone) {
      // Store final milestone separately
      if (!area.actionFinalMilestones) {
        area.actionFinalMilestones = {};
      }
      area.actionFinalMilestones[parentAction] = subStepText.trim();
    } else {
      // Store regular sub-steps in array
      if (!area.actionSubSteps) {
        area.actionSubSteps = {};
      }
      if (!area.actionSubSteps[parentAction]) {
        area.actionSubSteps[parentAction] = [];
      }
      area.actionSubSteps[parentAction].push(subStepText.trim());
    }

    // Make sure expansion is shown
    if (!area.expandedActions) area.expandedActions = {};
    area.expandedActions[parentAction] = true;

    Storage.setFocusAreas(areas);

    // Re-render the step to show updated content
    this.renderContent();
  },

  /**
   * Remove a sub-step from a prioritized action (Step 6a)
   */
  removeSubStep(areaId, parentAction, subStepIndex, isMilestone = false) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    if (isMilestone) {
      // Remove the final milestone
      if (area.actionFinalMilestones && area.actionFinalMilestones[parentAction]) {
        delete area.actionFinalMilestones[parentAction];
      }
    } else {
      // Remove a regular sub-step
      if (!area.actionSubSteps || !area.actionSubSteps[parentAction]) return;

      area.actionSubSteps[parentAction].splice(subStepIndex, 1);

      // If no more sub-steps, remove the parent key
      if (area.actionSubSteps[parentAction].length === 0) {
        delete area.actionSubSteps[parentAction];
      }
    }

    Storage.setFocusAreas(areas);

    // Re-render the step to show updated content
    this.renderContent();
  },

  /**
   * Get all actionable items for a focus area (used in Step 6b/6c)
   * Returns: array of { text, parentAction (if sub-step), isSubStep }
   */
  getActionableItems(area) {
    const actionSubSteps = area.actionSubSteps || {};
    const noSubStepsFlags = area.noSubStepsFlags || {};
    const prioritizedActions = area.prioritizedActions || [];
    const allActions = area.actions || [];
    const actionableItems = [];

    // Get all actions (prioritized first, then non-prioritized)
    const allActionTexts = [
      ...prioritizedActions,
      ...allActions.map(a => a.text).filter(t => !prioritizedActions.includes(t))
    ];

    // For each action, check if it has sub-steps or if "no sub-steps" is checked
    allActionTexts.forEach(actionText => {
      const hasNoSubStepsFlag = noSubStepsFlags[actionText] === true;
      const subSteps = actionSubSteps[actionText] || [];

      if (hasNoSubStepsFlag || subSteps.length === 0) {
        // Either "Do Not Add Sub-Steps" is checked, or no sub-steps exist
        // The original action is the actionable item
        actionableItems.push({
          text: actionText,
          parentAction: null,
          isSubStep: false
        });
      } else {
        // Has sub-steps: add each sub-step as an actionable item (parent becomes category only)
        subSteps.forEach(subStep => {
          actionableItems.push({
            text: subStep,
            parentAction: actionText,
            isSubStep: true
          });
        });
      }
    });

    return actionableItems;
  },

  /**
   * Toggle priority action selection (Step 5b)
   * Enforces 3-item limit per focus area
   */
  togglePriorityAction(areaId, actionText, isChecked) {
    const areas = Storage.getFocusAreas();
    const area = areas.find(a => a.id === areaId);
    if (!area) return;

    // Initialize prioritizedActions if not exists
    if (!area.prioritizedActions) {
      area.prioritizedActions = [];
    }

    if (isChecked) {
      // Check if already at limit
      if (area.prioritizedActions.length >= 3) {
        // Uncheck the checkbox since we're at limit
        const checkbox = document.querySelector(`input.priority-checkbox[data-area-id="${areaId}"][data-action-text="${actionText.replace(/"/g, '&quot;')}"]`);
        if (checkbox) {
          checkbox.checked = false;
        }
        alert('You can only select up to 3 priority actions per focus area.');
        return;
      }
      // Add to prioritized list
      if (!area.prioritizedActions.includes(actionText)) {
        area.prioritizedActions.push(actionText);
      }
    } else {
      // Remove from prioritized list
      area.prioritizedActions = area.prioritizedActions.filter(a => a !== actionText);
    }

    Storage.setFocusAreas(areas);

    // Update the count display
    const countDisplay = document.getElementById(`priority-count-${areaId}`);
    if (countDisplay) {
      countDisplay.textContent = `${area.prioritizedActions.length}/3 selected`;
    }
  },

  // Navigation
  nextSubstep() {
    const config = this.config[this.currentStep];
    const currentIndex = config.substeps.indexOf(this.currentSubstep);

    // Check for unassigned objectives when leaving Step 3b
    if (this.currentStep === 3 && this.currentSubstep === 'b') {
      const unassignedCount = this.getUnassignedObjectivesCount();
      if (unassignedCount > 0) {
        this.showUnassignedObjectivesWarning(unassignedCount);
        return;
      }
    }

    if (currentIndex < config.substeps.length - 1) {
      // Auto-collapse the current substep when moving to the next one
      const previousSubstep = this.currentSubstep;
      this.collapsedSubsteps[`${this.currentStep}-${previousSubstep}`] = true;

      this.currentSubstep = config.substeps[currentIndex + 1];
      Storage.setStepProgress({ currentStep: this.currentStep, currentSubstep: this.currentSubstep });
      Router.navigate('step', { step: this.currentStep, substep: this.currentSubstep });

      // Scroll to the new substep after render
      setTimeout(() => {
        const newSubstepEl = document.getElementById(`substep-${this.currentSubstep}`);
        if (newSubstepEl) {
          newSubstepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  },

  getUnassignedObjectivesCount() {
    const vision = Storage.getVision();
    const futureGoals = vision.futureGoals || [];
    const focusAreas = Storage.getFocusAreas();

    // Collect all assigned objectives
    const assignedIdeas = new Set();
    focusAreas.forEach(fa => {
      (fa.linkedIdeas || []).forEach(idea => assignedIdeas.add(idea));
    });

    // Count unassigned
    return futureGoals.filter(g => !assignedIdeas.has(g.text)).length;
  },

  showUnassignedObjectivesWarning(count, isNextStep = false) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'unassigned-warning-modal';
    modal.dataset.isNextStep = isNextStep;
    modal.innerHTML = `
      <div class="modal-content">
        <h3 class="modal-title">Unassigned Objectives</h3>
        <p class="modal-message">${count} objective${count > 1 ? 's have' : ' has'} not been assigned to a focus area. If you do not assign ${count > 1 ? 'these' : 'this'}, ${count > 1 ? 'they' : 'it'} will not be part of your plan. Do you want to proceed?</p>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="Steps.closeUnassignedWarning()">Assign Objectives</button>
          <button class="btn btn-outline" onclick="Steps.proceedWithUnassigned()">Proceed Anyway</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  closeUnassignedWarning() {
    const modal = document.getElementById('unassigned-warning-modal');
    if (modal) modal.remove();
  },

  proceedWithUnassigned() {
    const modal = document.getElementById('unassigned-warning-modal');
    const isNextStep = modal?.dataset.isNextStep === 'true';
    this.closeUnassignedWarning();

    if (isNextStep) {
      // Proceed to transition screen
      this.cleanupBlankFocusAreas();
      Router.navigate('transition');
    } else {
      // Force proceed to next substep
      const config = this.config[this.currentStep];
      const currentIndex = config.substeps.indexOf(this.currentSubstep);

      if (currentIndex < config.substeps.length - 1) {
        this.currentSubstep = config.substeps[currentIndex + 1];
        Storage.setStepProgress({ currentStep: this.currentStep, currentSubstep: this.currentSubstep });
        Router.navigate('step', { step: this.currentStep, substep: this.currentSubstep });

        setTimeout(() => {
          const newSubstepEl = document.getElementById(`substep-${this.currentSubstep}`);
          if (newSubstepEl) {
            newSubstepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    }
  },

  prevSubstep() {
    const config = this.config[this.currentStep];
    const currentIndex = config.substeps.indexOf(this.currentSubstep);

    if (currentIndex > 0) {
      this.currentSubstep = config.substeps[currentIndex - 1];
      Storage.setStepProgress({ currentStep: this.currentStep, currentSubstep: this.currentSubstep });
      Router.navigate('step', { step: this.currentStep, substep: this.currentSubstep });
    }
  },

  nextStep() {
    // After Step 3, check for unassigned objectives first
    if (this.currentStep === 3) {
      const unassignedCount = this.getUnassignedObjectivesCount();
      if (unassignedCount > 0) {
        this.showUnassignedObjectivesWarning(unassignedCount, true);
        return;
      }
      // Clean up blank/unused focus areas before showing transition
      this.cleanupBlankFocusAreas();
      Router.navigate('transition');
      return;
    }

    Storage.markStepComplete(this.currentStep);

    if (this.currentStep < 7) {
      this.currentStep++;
      this.currentSubstep = 'a';
      Storage.setStepProgress({ currentStep: this.currentStep, currentSubstep: this.currentSubstep });
      Router.navigate('step', { step: this.currentStep, substep: this.currentSubstep });
    }
  },

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      const config = this.config[this.currentStep];
      this.currentSubstep = config.substeps[config.substeps.length - 1];
      Storage.setStepProgress({ currentStep: this.currentStep, currentSubstep: this.currentSubstep });
      Router.navigate('step', { step: this.currentStep, substep: this.currentSubstep });
    }
  },

  complete() {
    Storage.markStepComplete(7);
    Router.navigate('dashboard');
  },

  /**
   * Clean up blank/unused focus areas
   * Only keeps focus areas that have a title
   */
  cleanupBlankFocusAreas() {
    const focusAreas = Storage.getFocusAreas();
    const validAreas = focusAreas.filter(area => area.title && area.title.trim() !== '');
    Storage.setFocusAreas(validAreas);
  }
};

// Make Steps globally available
window.Steps = Steps;
