/* ==============================================================================
 *  SETTINGS MODAL COMPONENT
 *  Handles application modal settings interface, theme switching, and user preferences.
 * ============================================================================== */

export const SettingsModalComponent = {

  /* ==============================================================================
   *  1. INITIALIZATION & EVENT BINDINGS
   * ============================================================================== */
  init() {
    // ১. প্রথমে পূর্বে সংরক্ষিত থিম লোড করে অ্যাপ্লাই করবে
    this.applyInitialTheme();

    // ২. UI ইনজেক্ট করবে
    this.injectSettingsUI();

    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.getElementById('closeSettingsBtn');
    const overlay = document.getElementById('modalOverlay');
    const themeSelect = document.getElementById('themeSelect');

    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openModal());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeModal());
    }

    // ৩. থিম চেঞ্জের ইভেন্ট লিসেনার
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => this.setTheme(e.target.value));
    }
  },

  /* ==============================================================================
   *  2. UI INJECTION & MODAL TOGGLES
   * ============================================================================== */
  injectSettingsUI() {
    if (document.getElementById('settingsModal')) return;

    const currentTheme = localStorage.getItem('appTheme') || 'light';

    const modalHTML = `
      <div class="modal-overlay" id="modalOverlay"></div>
      <div class="settings-modal" id="settingsModal">
        <div class="settings-header">
          <h2>সেটিংস</h2>
          <button class="close-btn" id="closeSettingsBtn" aria-label="বন্ধ করুন">&times;</button>
        </div>
        <div class="settings-body">
          <div class="setting-item">
            <label for="themeSelect">অ্যাপ থিম</label>
            <select id="themeSelect" class="settings-select">
              <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>লাইট থিম (Light)</option>
              <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>ডার্ক থিম (Dark)</option>
            </select>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  openModal() {
    const modal = document.getElementById('settingsModal');
    const overlay = document.getElementById('modalOverlay');

    if (modal && overlay) {
      modal.classList.add('active');
      overlay.classList.add('active');
    }
  },

  closeModal() {
    const modal = document.getElementById('settingsModal');
    const overlay = document.getElementById('modalOverlay');

    if (modal && overlay) {
      modal.classList.remove('active');
      overlay.classList.remove('active');
    }
  },

  /* ==============================================================================
   *  3. THEME MANAGEMENT LOGIC
   * ============================================================================== */
  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('appTheme', theme);
  },

  applyInitialTheme() {
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    this.setTheme(savedTheme);
  }
};