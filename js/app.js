/**
 * Main Application Controller
 * Initializes the app and coordinates all modules
 */

const App = {
  /**
   * Initialize the application
   */
  init() {
    console.log('Life Planner App initializing...');

    // Register service worker
    this.registerServiceWorker();

    // Initialize router
    Router.init();
    this.registerRoutes();

    // Navigate to initial route
    const { route, params } = Router.getInitialRoute();
    Router.navigate(route, params);

    console.log('Life Planner App initialized');
  },

  /**
   * Register service worker for PWA
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show refresh prompt
              this.showUpdateAvailable();
            }
          });
        });
      } catch (error) {
        console.log('Service Worker registration failed:', error);
      }
    }
  },

  /**
   * Show update available notification
   */
  showUpdateAvailable() {
    const updateBar = document.createElement('div');
    updateBar.className = 'update-bar';
    updateBar.innerHTML = `
      <p>A new version is available!</p>
      <button onclick="location.reload()">Refresh</button>
    `;
    updateBar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--primary-teal);
      color: white;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
    `;
    updateBar.querySelector('button').style.cssText = `
      background: white;
      color: var(--primary-teal);
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    `;
    document.body.prepend(updateBar);
  },

  /**
   * Register all application routes
   */
  registerRoutes() {
    // Onboarding
    Router.register('onboarding', (params) => {
      Onboarding.render(params.screen || 1);
    });

    // Planning steps
    Router.register('step', (params) => {
      Steps.render(params.step || 1, params.substep || 'a');
    });

    // Transition screen between Life Visioning (Steps 1-3) and Life Planning (Steps 4-7)
    Router.register('transition', () => {
      Steps.renderTransition();
    });

    // Dashboard
    Router.register('dashboard', () => {
      Dashboard.render();
    });

    // Settings
    Router.register('settings', () => {
      Settings.render();
    });
  },

  /**
   * Handle app install prompt
   */
  setupInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install button (could add to settings)
      console.log('Install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      console.log('App installed');
      deferredPrompt = null;
    });
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Make App globally available
window.App = App;
