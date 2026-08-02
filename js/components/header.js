/* ==============================================================================
 *  HEADER COMPONENT
 *  Manages top title updates and header toggle button action listeners.
 * ============================================================================== */

export const HeaderComponent = {

  /* ==============================================================================
   *  1. INITIALIZE HEADER EVENT LISTENERS
   *  Binds click events to left sidebar toggle button.
   * ============================================================================== */
  init(onLeftToggle, onRightToggle) {
    const leftToggleBtn = document.getElementById('sidebar-toggle-btn');
    if (leftToggleBtn && onLeftToggle) {
      leftToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onLeftToggle();
      });
    }

    const rightToggleBtn = document.getElementById('right-sidebar-toggle-btn');
    if (rightToggleBtn && onRightToggle) {
      rightToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onRightToggle();
      });
    }
  },

  /* ==============================================================================
   *  2. UPDATE HEADER TITLE
   *  Sets the visible header title dynamically.
   * ============================================================================== */
  updateTitle(titleText) {
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
      pageTitleElement.textContent = `📖 ${titleText}`;
    }
  }
};