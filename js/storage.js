/**
 * Storage Module - Handles all localStorage operations
 */

const Storage = {
  KEYS: {
    USER: 'lifePlanner_user',
    ONBOARDING: 'lifePlanner_onboarding',
    STEPS: 'lifePlanner_steps',
    VISION: 'lifePlanner_vision',
    FOCUS_AREAS: 'lifePlanner_focusAreas',
    QUARTERLY: 'lifePlanner_quarterly',
    WHIMSY: 'lifePlanner_whimsy',
    SETTINGS: 'lifePlanner_settings',
    CURRENT_STEP: 'lifePlanner_currentStep'
  },

  /**
   * Get data from localStorage
   */
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  /**
   * Save data to localStorage
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  /**
   * Remove data from localStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  /**
   * Clear all app data
   */
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // ==================
  // User Data
  // ==================

  getUser() {
    return this.get(this.KEYS.USER) || { name: '', createdAt: null };
  },

  setUser(userData) {
    return this.set(this.KEYS.USER, {
      ...this.getUser(),
      ...userData,
      updatedAt: new Date().toISOString()
    });
  },

  // ==================
  // Onboarding State
  // ==================

  getOnboarding() {
    return this.get(this.KEYS.ONBOARDING) || {
      completed: false,
      currentScreen: 1
    };
  },

  setOnboarding(data) {
    return this.set(this.KEYS.ONBOARDING, {
      ...this.getOnboarding(),
      ...data
    });
  },

  isOnboardingComplete() {
    return this.getOnboarding().completed;
  },

  // ==================
  // Step Progress
  // ==================

  getStepProgress() {
    return this.get(this.KEYS.STEPS) || {
      currentStep: 1,
      currentSubstep: 'a',
      completedSteps: [],
      stepsData: {}
    };
  },

  setStepProgress(data) {
    return this.set(this.KEYS.STEPS, {
      ...this.getStepProgress(),
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  markStepComplete(stepNumber) {
    const progress = this.getStepProgress();
    if (!progress.completedSteps.includes(stepNumber)) {
      progress.completedSteps.push(stepNumber);
      progress.completedSteps.sort((a, b) => a - b);
    }
    return this.setStepProgress(progress);
  },

  isStepAccessible(stepNumber) {
    const progress = this.getStepProgress();
    // First time: must complete in order
    // After completion: can jump anywhere
    if (progress.completedSteps.includes(7)) {
      return true; // All steps accessible after completing once
    }
    // Otherwise, step is accessible if previous step is complete
    return stepNumber === 1 || progress.completedSteps.includes(stepNumber - 1);
  },

  // ==================
  // Vision Data (Steps 1-3)
  // ==================

  getVision() {
    return this.get(this.KEYS.VISION) || {
      // Step 1
      lifeVisionIdeas: [],
      lifeVisionStatement: '',
      // Step 2
      highMarks: [],
      regrets: [],
      // Step 3
      futureGoals: [],
      yearsFromNow: 5
    };
  },

  setVision(data) {
    return this.set(this.KEYS.VISION, {
      ...this.getVision(),
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  // ==================
  // Focus Areas (Step 3)
  // ==================

  getFocusAreas() {
    return this.get(this.KEYS.FOCUS_AREAS) || [];
  },

  setFocusAreas(areas) {
    return this.set(this.KEYS.FOCUS_AREAS, areas);
  },

  addFocusArea(area) {
    const areas = this.getFocusAreas();
    // Generate unique ID using timestamp + random suffix to avoid collisions
    const uniqueId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    const newArea = {
      id: uniqueId,
      title: area.title || '',
      emoji: area.emoji || '',
      description: area.description || '',
      ideas: area.ideas || [],
      linkedIdeas: [],
      actions: [],
      topActions: [],
      maybeActions: [],
      status: 'not-started',
      createdAt: new Date().toISOString()
    };
    areas.push(newArea);
    this.setFocusAreas(areas);
    return newArea;
  },

  updateFocusArea(id, updates) {
    const areas = this.getFocusAreas();
    const index = areas.findIndex(a => a.id === id);
    if (index !== -1) {
      areas[index] = { ...areas[index], ...updates, updatedAt: new Date().toISOString() };
      this.setFocusAreas(areas);
      return areas[index];
    }
    return null;
  },

  deleteFocusArea(id) {
    const areas = this.getFocusAreas().filter(a => a.id !== id);
    return this.setFocusAreas(areas);
  },

  // ==================
  // Annual Reflections (Step 4)
  // ==================

  getReflections() {
    const vision = this.getVision();
    return {
      proudOf: vision.proudOf || [],
      learnings: vision.learnings || [],
      barriers: vision.barriers || []
    };
  },

  setReflections(data) {
    return this.setVision({
      ...this.getVision(),
      ...data
    });
  },

  // ==================
  // Quarterly Roadmap (Step 6)
  // ==================

  getQuarterly() {
    return this.get(this.KEYS.QUARTERLY) || {
      q1: [],
      q2: [],
      q3: [],
      q4: []
    };
  },

  setQuarterly(data) {
    return this.set(this.KEYS.QUARTERLY, {
      ...this.getQuarterly(),
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  addQuarterlyItem(quarter, item) {
    const quarterly = this.getQuarterly();
    const newItem = {
      id: Date.now().toString(),
      text: item.text || '',
      focusAreaId: item.focusAreaId || null,
      status: 'not-started',
      createdAt: new Date().toISOString()
    };
    quarterly[quarter].push(newItem);
    this.setQuarterly(quarterly);
    return newItem;
  },

  updateQuarterlyItem(quarter, itemId, updates) {
    const quarterly = this.getQuarterly();
    const index = quarterly[quarter].findIndex(i => i.id === itemId);
    if (index !== -1) {
      quarterly[quarter][index] = { ...quarterly[quarter][index], ...updates };
      this.setQuarterly(quarterly);
      return quarterly[quarter][index];
    }
    return null;
  },

  // ==================
  // Whimsy List (Step 7)
  // ==================

  getWhimsy() {
    return this.get(this.KEYS.WHIMSY) || [];
  },

  setWhimsy(items) {
    return this.set(this.KEYS.WHIMSY, items);
  },

  addWhimsy(text) {
    const items = this.getWhimsy();
    const newItem = {
      id: Date.now().toString(),
      text: text,
      status: 'not-started',
      createdAt: new Date().toISOString()
    };
    items.push(newItem);
    this.setWhimsy(items);
    return newItem;
  },

  deleteWhimsy(id) {
    const items = this.getWhimsy().filter(i => i.id !== id);
    return this.setWhimsy(items);
  },

  // ==================
  // Settings
  // ==================

  getSettings() {
    return this.get(this.KEYS.SETTINGS) || {
      reminderFrequency: 'none', // none, daily, weekly, quarterly
      reminderTime: '12:00',
      reminderDay: 'monday', // For weekly
      notificationsEnabled: false
    };
  },

  setSettings(data) {
    return this.set(this.KEYS.SETTINGS, {
      ...this.getSettings(),
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  // ==================
  // Export All Data
  // ==================

  exportAllData() {
    return {
      user: this.getUser(),
      vision: this.getVision(),
      focusAreas: this.getFocusAreas(),
      quarterly: this.getQuarterly(),
      whimsy: this.getWhimsy(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString()
    };
  },

  // ==================
  // Calculate Progress
  // ==================

  calculateOverallProgress() {
    const stepProgress = this.getStepProgress();
    const totalSteps = 7;
    const completedSteps = stepProgress.completedSteps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  },

  calculateFocusAreaProgress() {
    const areas = this.getFocusAreas();
    if (areas.length === 0) return 0;

    const statuses = {
      'not-started': 0,
      'in-progress': 50,
      'complete': 100,
      'abandon': 0
    };

    const total = areas.reduce((sum, area) => sum + (statuses[area.status] || 0), 0);
    return Math.round(total / areas.length);
  }
};

// Make Storage globally available
window.Storage = Storage;
