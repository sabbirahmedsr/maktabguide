/* ==============================================================================
 *  SETTINGS MODAL COMPONENT
 *  Handles application modal settings interface and user preference interactions.
 * ============================================================================== */

export const SettingsModalComponent = {

  /* ==============================================================================
   *  1. INITIALIZATION & EVENT BINDINGS
   * ============================================================================== */
  init() {
    this.injectSettingsUI();

    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.getElementById('closeSettingsBtn');
    const overlay = document.getElementById('modalOverlay');

    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openModal());
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    if (overlay) {
      overlay.addEventListener('click', () => this.closeModal());
    }
  },

  /* ==============================================================================
   *  2. UI INJECTION & MODAL TOGGLES
   * ============================================================================== */
  injectSettingsUI() {
    if (document.getElementById('settingsModal')) return;

    const modalHTML = `
      <div class="modal-overlay" id="modalOverlay"></div>
      <div class="settings-modal" id="settingsModal">
        <div class="settings-header">
          <h2>সেটিংস</h2>
          <button class="close-btn" id="closeSettingsBtn" aria-label="বন্ধ করুন">&times;</button>
        </div>
        <div class="settings-body">
          <p>এখানে সেটিংস সম্পর্কিত সুবিধাগুলো রাখা যাবে।</p>
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
  }
};