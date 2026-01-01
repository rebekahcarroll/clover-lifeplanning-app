/**
 * Router Module - Handles navigation and screen rendering
 */

const Router = {
  currentRoute: null,
  routes: {},

  /**
   * Initialize router
   */
  init() {
    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.route) {
        this.navigate(e.state.route, e.state.params, false);
      }
    });
  },

  /**
   * Register a route
   */
  register(path, handler) {
    this.routes[path] = handler;
  },

  /**
   * Navigate to a route
   */
  navigate(path, params = {}, pushState = true) {
    this.currentRoute = path;

    // Scroll to top of page
    window.scrollTo(0, 0);

    // Update browser history
    if (pushState) {
      window.history.pushState({ route: path, params }, '', `#${path}`);
    }

    // Call route handler
    if (this.routes[path]) {
      this.routes[path](params);
    } else {
      console.error('Route not found:', path);
      this.navigate('dashboard');
    }
  },

  /**
   * Go back in history
   */
  back() {
    window.history.back();
  },

  /**
   * Get current route
   */
  getCurrentRoute() {
    return this.currentRoute;
  },

  /**
   * Determine initial route based on app state
   */
  getInitialRoute() {
    const onboarding = Storage.getOnboarding();
    const stepProgress = Storage.getStepProgress();

    // Not onboarded yet
    if (!onboarding.completed) {
      return { route: 'onboarding', params: { screen: onboarding.currentScreen } };
    }

    // Completed all steps - go to dashboard
    if (stepProgress.completedSteps.includes(7)) {
      return { route: 'dashboard', params: {} };
    }

    // In progress - go to current step
    return {
      route: 'step',
      params: {
        step: stepProgress.currentStep,
        substep: stepProgress.currentSubstep
      }
    };
  }
};

// Make Router globally available
window.Router = Router;
