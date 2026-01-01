/**
 * Timer Module - Countdown timer functionality with inline display
 */

const Timer = {
  intervalId: null,
  remainingSeconds: 0,
  isRunning: false,
  isPaused: false,
  onComplete: null,
  currentTimerId: null,

  /**
   * Initialize timer with duration
   */
  init(minutes = 5) {
    this.remainingSeconds = minutes * 60;
    this.isRunning = false;
    this.isPaused = false;
  },

  /**
   * Start the timer
   */
  start() {
    if (this.isRunning && !this.isPaused) return;

    this.isRunning = true;
    this.isPaused = false;

    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      this.updateInlineDisplay();

      if (this.remainingSeconds <= 0) {
        this.complete();
      }
    }, 1000);

    this.updateInlineControls();
  },

  /**
   * Pause the timer
   */
  pause() {
    if (!this.isRunning || this.isPaused) return;

    this.isPaused = true;
    clearInterval(this.intervalId);
    this.updateInlineControls();
  },

  /**
   * Resume the timer
   */
  resume() {
    if (!this.isPaused) return;
    this.start();
  },

  /**
   * Stop and reset the timer
   */
  stop() {
    clearInterval(this.intervalId);
    this.isRunning = false;
    this.isPaused = false;

    // Hide inline timer and show button again
    if (this.currentTimerId) {
      const container = document.getElementById(`timer-container-${this.currentTimerId}`);
      const button = document.getElementById(`timer-button-${this.currentTimerId}`);
      if (container) container.classList.add('hidden');
      if (button) button.classList.remove('hidden');
    }

    // Also hide modal if open
    this.hideModal();
  },

  /**
   * Timer completed
   */
  complete() {
    clearInterval(this.intervalId);
    this.isRunning = false;
    this.isPaused = false;

    // Play sound
    this.playSound();

    // Vibrate if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Show notification
    this.showNotification();

    // Update display to show complete
    this.updateInlineControls();

    // Callback
    if (this.onComplete) {
      this.onComplete();
    }
  },

  /**
   * Play completion sound
   */
  playSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
      }, 300);
    } catch (e) {
      console.log('Audio not supported');
    }
  },

  /**
   * Show notification
   */
  showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: 'Your reflection time is up. Feel free to continue or move on.',
        icon: '/assets/icons/icon-192.png'
      });
    }
  },

  /**
   * Update inline timer display
   */
  updateInlineDisplay() {
    if (!this.currentTimerId) return;

    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const timeEl = document.getElementById(`timer-time-${this.currentTimerId}`);
    if (timeEl) {
      timeEl.textContent = display;
    }
  },

  /**
   * Update inline control visibility
   */
  updateInlineControls() {
    if (!this.currentTimerId) return;

    const pauseBtn = document.getElementById(`timer-pause-${this.currentTimerId}`);
    const resumeBtn = document.getElementById(`timer-resume-${this.currentTimerId}`);
    const stopBtn = document.getElementById(`timer-stop-${this.currentTimerId}`);
    const completeMsg = document.getElementById(`timer-complete-${this.currentTimerId}`);

    if (!pauseBtn || !resumeBtn) return;

    if (this.remainingSeconds <= 0) {
      // Timer complete
      pauseBtn.classList.add('hidden');
      resumeBtn.classList.add('hidden');
      stopBtn.classList.add('hidden');
      if (completeMsg) completeMsg.classList.remove('hidden');
    } else if (this.isPaused) {
      pauseBtn.classList.add('hidden');
      resumeBtn.classList.remove('hidden');
    } else if (this.isRunning) {
      pauseBtn.classList.remove('hidden');
      resumeBtn.classList.add('hidden');
    }
  },

  /**
   * Show confirmation modal
   */
  showModal(minutes = 5, timerId) {
    this.currentTimerId = timerId;
    this.init(minutes);

    const modal = document.getElementById('timer-modal');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');

    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = '00';

    if (modal) {
      modal.classList.remove('hidden');
    }

    this.bindModalEvents(minutes, timerId);
  },

  /**
   * Hide modal
   */
  hideModal() {
    const modal = document.getElementById('timer-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  },

  /**
   * Bind modal events
   */
  bindModalEvents(minutes, timerId) {
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const closeBtn = document.getElementById('timer-close');

    // Remove old listeners by cloning
    const newStart = startBtn.cloneNode(true);
    const newStop = stopBtn.cloneNode(true);
    const newClose = closeBtn.cloneNode(true);

    startBtn.parentNode.replaceChild(newStart, startBtn);
    stopBtn.parentNode.replaceChild(newStop, stopBtn);
    closeBtn.parentNode.replaceChild(newClose, closeBtn);

    // Add new listeners
    document.getElementById('timer-start').addEventListener('click', () => {
      this.hideModal();
      this.showInlineTimer(timerId);
      this.start();
    });
    document.getElementById('timer-stop').addEventListener('click', () => this.hideModal());
    document.getElementById('timer-close').addEventListener('click', () => this.hideModal());
  },

  /**
   * Show inline timer (replace button with countdown)
   */
  showInlineTimer(timerId) {
    const button = document.getElementById(`timer-button-${timerId}`);
    const container = document.getElementById(`timer-container-${timerId}`);

    if (button) button.classList.add('hidden');
    if (container) {
      container.classList.remove('hidden');
      this.updateInlineDisplay();
    }
  },

  /**
   * Create inline timer button and hidden countdown
   */
  createInlineButton(minutes = 5, text = 'Start Timer') {
    const timerId = 'timer-' + Date.now() + Math.random().toString(36).substr(2, 9);

    return `
      <div class="timer-wrapper">
        <button id="timer-button-${timerId}" class="timer-inline" onclick="Timer.showModal(${minutes}, '${timerId}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          ${text} (${minutes} min)
        </button>
        <div id="timer-container-${timerId}" class="timer-inline-display hidden">
          <span class="timer-inline-time" id="timer-time-${timerId}">${minutes.toString().padStart(2, '0')}:00</span>
          <button id="timer-pause-${timerId}" class="timer-inline-btn" onclick="Timer.pause()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
          <button id="timer-resume-${timerId}" class="timer-inline-btn hidden" onclick="Timer.resume()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          <button id="timer-stop-${timerId}" class="timer-inline-btn" onclick="Timer.stop()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            </svg>
          </button>
          <span id="timer-complete-${timerId}" class="timer-complete-msg hidden">Done!</span>
        </div>
      </div>
    `;
  }
};

// Make Timer globally available
window.Timer = Timer;
