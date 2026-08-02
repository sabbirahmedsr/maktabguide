/* ==============================================================================
 *  CONTENT VIEWER COMPONENT
 *  Renders parsed content into viewport, manages anti-flicker loading states,
 *  and handles page scroll resets.
 * ============================================================================== */

import { TagParser } from '../modules/tagParser.js';

export const ContentViewerComponent = {
  loaderTimer: null,
  spinnerShownTime: null,
  isLoaderVisible: false,

  /* ==============================================================================
   *  1. LOADER & ERROR STATE RENDERERS
   *  Handles UI loading spinner and error message elements injection.
   * ============================================================================== */
  showLoader() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="page-loader">
          <div class="spinner"></div>
          <p>লোড হচ্ছে...</p>
        </div>
      `;
    }
  },

  showError() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
      mainContent.innerHTML = `<div class="error-msg">⚠️ কনটেন্ট লোড করতে সমস্যা হয়েছে।</div>`;
    }
  },

  /* ==============================================================================
   *  2. ASYNC LOADING CONTROLLER (ANTI-FLICKER ENGINE)
   *  Coordinates fetch timing, enforces minimum display duration for smooth UX.
   * ============================================================================== */
  async loadAndRender(fetchPromise, onRenderSuccess) {
    this.isLoaderVisible = false;
    this.spinnerShownTime = null;

    /* ----------------------------------------------------------------------------------------------------
     *  2.1 SHOW SPINNER DELAY TIMER (200ms)
     * -----------------------------------------------------------------------------------------------------*/
    this.loaderTimer = setTimeout(() => {
      this.isLoaderVisible = true;
      this.spinnerShownTime = Date.now();
      this.showLoader();
    }, 200);

    try {
      this.scrollToTop();
      const rawText = await fetchPromise;
      clearTimeout(this.loaderTimer);

      /* ----------------------------------------------------------------------------------------------------
       *  2.2 MINIMUM SPINNER DISPLAY GUARD (300ms)
       * -----------------------------------------------------------------------------------------------------*/
      if (this.isLoaderVisible && this.spinnerShownTime) {
        const elapsedTime = Date.now() - this.spinnerShownTime;
        const minDisplayDuration = 300; // Minimum visibility duration in ms
        
        if (elapsedTime < minDisplayDuration) {
          await new Promise(resolve => setTimeout(resolve, minDisplayDuration - elapsedTime));
        }
      }

      if (onRenderSuccess) onRenderSuccess();
      this.renderPage(rawText);
      this.scrollToTop();

    } catch (error) {
      clearTimeout(this.loaderTimer);
      console.error('Error in ContentViewer:', error);
      this.showError();
    }
  },

  /* ==============================================================================
   *  3. PAGE DOM RENDERING & ANIMATION
   *  Parses raw content, appends nodes, and triggers fade-in animation.
   * ============================================================================== */
  renderPage(rawText) {
    const mainContent = document.getElementById('mainContent');
    const rightSidebarNav = document.getElementById('rightSidebarNav');

    if (!mainContent) return;
    mainContent.innerHTML = '';

    const parsedElements = TagParser.parseText(rawText, rightSidebarNav);
    mainContent.appendChild(parsedElements);

    // Re-trigger CSS animation
    mainContent.classList.remove('fade-in-content');
    void mainContent.offsetWidth; 
    mainContent.classList.add('fade-in-content');
  },

  /* ==============================================================================
   *  4. SCROLL MANAGEMENT
   *  Resets viewport scroll position smoothly on page transition.
   * ============================================================================== */
  scrollToTop() {
    const mainContent = document.getElementById('mainContent');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
      mainContent.scrollTop = 0;
    }
    window.scrollTo(0, 0);
  }
};