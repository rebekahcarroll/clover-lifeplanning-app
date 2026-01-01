/**
 * Onboarding Module - Handles the 3-screen onboarding flow
 */

const Onboarding = {
  /**
   * Render onboarding screen
   */
  render(screen = 1) {
    const app = document.getElementById('app');
    Components.showFooter(); // Show footer on all onboarding screens

    switch (screen) {
      case 1:
        app.innerHTML = this.renderScreen1();
        this.bindScreen1Events();
        break;
      case 2:
        app.innerHTML = this.renderScreen2();
        this.bindScreen2Events();
        break;
      case 3:
        app.innerHTML = this.renderScreen3();
        this.bindScreen3Events();
        break;
      default:
        app.innerHTML = this.renderScreen1();
        this.bindScreen1Events();
    }
  },

  /**
   * Screen 1: Username creation
   */
  renderScreen1() {
    const user = Storage.getUser();
    const currentYear = new Date().getFullYear();
    const planningYear = user.planningYear || currentYear;

    return `
      ${Components.appHeader(false)}
      <div class="onboarding-screen">
        <div class="onboarding-logo">
          <img src="assets/icons/clover-logo.png" alt="Clover Advisory" class="onboarding-logo-img">
        </div>

        <div class="onboarding-content">
          <h1 class="onboarding-title">Strategic Planning for Your Life</h1>
          <p class="onboarding-subtitle">A Methodology & Guide for Applying Business-Level Intentionality to Your Personal Life</p>

          <div class="card mt-lg profile-card">
            <p class="mb-md">Welcome! Let's begin by creating your profile.</p>
            <div class="form-group mb-md">
              <label class="form-label">Your Name</label>
              <input
                type="text"
                id="username-input"
                class="form-input"
                placeholder="Enter your name"
                value="${user.name || ''}"
                autocomplete="name"
                required
              >
            </div>
            <div class="form-group mb-md">
              <label class="form-label">Planning Year</label>
              <select id="planning-year-select" class="form-select">
                <option value="${currentYear}" ${planningYear === currentYear ? 'selected' : ''}>${currentYear}</option>
                <option value="${currentYear + 1}" ${planningYear === currentYear + 1 ? 'selected' : ''}>${currentYear + 1}</option>
                <option value="${currentYear + 2}" ${planningYear === currentYear + 2 ? 'selected' : ''}>${currentYear + 2}</option>
              </select>
            </div>
            <button id="continue-btn" class="btn btn-primary btn-block" ${!user.name ? 'disabled' : ''}>
              Continue
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bindScreen1Events() {
    const input = document.getElementById('username-input');
    const btn = document.getElementById('continue-btn');

    input.addEventListener('input', () => {
      btn.disabled = !input.value.trim();
    });

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.goToScreen2();
      }
    });

    btn.addEventListener('click', () => this.goToScreen2());

    // Focus input
    setTimeout(() => input.focus(), 100);
  },

  goToScreen2() {
    const input = document.getElementById('username-input');
    const yearSelect = document.getElementById('planning-year-select');
    const name = input.value.trim();
    const planningYear = parseInt(yearSelect.value);

    if (!name) return;

    Storage.setUser({ name, planningYear, createdAt: new Date().toISOString() });
    Storage.setOnboarding({ currentScreen: 2 });
    Router.navigate('onboarding', { screen: 2 });
  },

  /**
   * Screen 2: Welcome letter
   */
  renderScreen2() {
    const user = Storage.getUser();

    return `
      ${Components.appHeader(true, 'onboarding', { screen: 1 })}
      <div class="onboarding-screen">
        <div class="onboarding-logo">
          <img src="assets/icons/clover-logo.png" alt="Clover Advisory" class="onboarding-logo-img">
        </div>

        <div class="onboarding-content">
          <div class="welcome-content">
            <p class="welcome-greeting">Hello, ${Components.escapeHtml(user.name)} - we're glad you're here!</p>

            <p class="welcome-section-header">A Note from Rebekah, Founder of Clover Advisory</p>

            <div class="welcome-text">
              <p id="welcome-preview">As we approach the new year, it's natural to focus on setting goals and creating strategies for business success. But what about our personal lives?</p>

              <div id="welcome-full" class="hidden">
                <p>Just as intentionality and discipline are vital for driving business outcomes, they are equally—if not more—important for crafting a fulfilling and meaningful personal journey. We've all heard about New Year's resolutions. But consider this – what are we anchoring our resolutions in? If we only reflect on and react to the past to determine our future actions, how do we know we are driving toward something worthwhile and intentional?</p>

                <p>As a consultant, my job is to help my clients think intentionally and strategically about their futures and paint a compelling vision that inspires understanding, empowerment, and action. When I first became a business consultant over a decade ago, I realized I had been using strategic planning principles my whole life – on myself. As time passed, I continued to evolve my approach and process to incorporate all I've learned in a business setting. After 10+ years of diligently planning each and every year, I've seen how applying a structured approach to my personal life as I would to any business can be extremely meaningful and yield huge results.</p>

                <p>This playbook outlines the framework I use annually to reflect, plan, and align my personal life with my larger vision. Numerous individuals in my network have requested a documented playbook to try in their own lives, so here it is!</p>

                <p>I hope it inspires you to pause and design your life with the same care you put into your professional pursuits.</p>
              </div>

              <button id="read-more-btn" class="btn btn-ghost btn-sm" style="padding-left: 0;">
                <span id="read-more-text">Read more</span>
                <svg id="read-more-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s;">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            <button id="continue-btn" class="btn btn-primary btn-block mt-lg">
              Continue
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bindScreen2Events() {
    // Read more toggle
    const readMoreBtn = document.getElementById('read-more-btn');
    const fullText = document.getElementById('welcome-full');
    const readMoreText = document.getElementById('read-more-text');
    const readMoreIcon = document.getElementById('read-more-icon');

    readMoreBtn.addEventListener('click', () => {
      const isExpanded = !fullText.classList.contains('hidden');
      fullText.classList.toggle('hidden');
      readMoreText.textContent = isExpanded ? 'Read more' : 'Read less';
      readMoreIcon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
    });

    document.getElementById('continue-btn').addEventListener('click', () => {
      Storage.setOnboarding({ currentScreen: 3 });
      Router.navigate('onboarding', { screen: 3 });
    });
  },

  /**
   * Screen 3: What to expect
   */
  renderScreen3() {
    return `
      ${Components.appHeader(true, 'onboarding', { screen: 2 })}
      <div class="onboarding-screen">
        <div class="onboarding-content">
          <h1 class="page-title">What to Expect</h1>

          <div class="expect-section">
            <h3 class="expect-section-title">Before You Begin</h3>
            <p>Carve out some time (start to finish, this usually takes 2-4 hours) and find a space where you can think deeply relatively undistracted. If you're an IRL kind of person, you might want to grab a note pad and pen for brainstorming.</p>
            <p>Remove all distractions - silence your phone, and take some deep breaths.</p>

            <div class="tip-box">
              <span class="tip-icon">💡</span>
              <p><strong>Tip:</strong> You can save at any time and return later.</p>
            </div>
          </div>

          <div class="expect-section">
            <h3 class="expect-section-title">The Process</h3>

            <div class="card">
              <div class="process-item mb-lg">
                <h4 class="text-primary">Life Visioning</h4>
                <p class="tree-note mb-sm">Done once, validated annually, updated every few years</p>
                <ul class="process-steps-list">
                  <li>Step 1: Paint Your Life Vision</li>
                  <li>Step 2: Baseline Your Current Reality</li>
                  <li>Step 3: Bring Your Vision to Life</li>
                </ul>
              </div>

              <div class="process-item">
                <h4 class="text-primary">Life Planning</h4>
                <p class="tree-note mb-sm">Done Annually, Reviewed Quarterly</p>
                <ul class="process-steps-list">
                  <li>Step 4: Reflect on & Learn from Current Year</li>
                  <li>Step 5: Identify Priorities for Next Year</li>
                  <li>Step 6: Build a Quarterly Roadmap</li>
                  <li>Step 7: Be Whimsical</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="expect-section">
            <h3 class="expect-section-title">What You'll Walk Away With</h3>

            <div class="expect-item">
              <span class="expect-icon">📝</span>
              <div class="expect-item-content">
                <h4>Life Vision Statement</h4>
                <p>What does a life well-lived look like for you?</p>
              </div>
            </div>

            <div class="expect-item">
              <span class="expect-icon">📊</span>
              <div class="expect-item-content">
                <h4>Current State Baseline</h4>
                <p>How am I doing today living according to my vision?</p>
              </div>
            </div>

            <div class="expect-item">
              <span class="expect-icon">🎯</span>
              <div class="expect-item-content">
                <h4>Near-Term Focus Areas</h4>
                <p>What are those areas I need to work on over the next 3-5 years to get me closer to where I want to be?</p>
              </div>
            </div>

            <div class="expect-item">
              <span class="expect-icon">💭</span>
              <div class="expect-item-content">
                <h4>Annual Reflections</h4>
                <p>Over the last year, what can I learn from how I did in each focus area?</p>
              </div>
            </div>

            <div class="expect-item">
              <span class="expect-icon">🗓️</span>
              <div class="expect-item-content">
                <h4>Quarterly Roadmap</h4>
                <p>Top priorities for the year and quarterly action items.</p>
              </div>
            </div>

            <div class="tip-box mt-lg">
              <span class="tip-icon">💡</span>
              <p><strong>Tip:</strong> You can print your plan anytime via Settings > Export to PDF</p>
            </div>
          </div>

          <div class="onboarding-actions">
            <button id="start-btn" class="btn btn-primary btn-block">
              Get Started
            </button>
          </div>
        </div>
      </div>
    `;
  },

  bindScreen3Events() {
    document.getElementById('start-btn').addEventListener('click', () => {
      Storage.setOnboarding({ completed: true, currentScreen: 3 });
      Storage.setStepProgress({ currentStep: 1, currentSubstep: 'a' });
      Router.navigate('step', { step: 1, substep: 'a' });
    });
  }
};

// Make Onboarding globally available
window.Onboarding = Onboarding;
