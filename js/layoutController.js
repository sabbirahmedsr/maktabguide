/*
// ==============================================================================
// LAYOUT CONTROLLER WITH TOUCH DRAG GESTURES
// Complete touch gesture handler for mobile sidebars with backdrop tracking.
// ==============================================================================
*/

export const LayoutController = {
  leftSidebar: null,
  rightSidebar: null,
  overlay: null,

  startX: 0,
  startY: 0,
  isDraggingLeft: false,
  isDraggingRight: false,
  isScrollLocked: false,
  sidebarWidth: 280,
  rafId: null,

  // ==============================================================================
  // 1. LAYOUT INITIALIZATION & EVENT BINDINGS
  // DOM element discovery and event listener registrations.
  // ==============================================================================
  init() {
    this.leftSidebar = document.getElementById('sidebarLeft') || document.querySelector('.sidebar-left');
    this.rightSidebar = document.getElementById('sidebarRight') || document.querySelector('.sidebar-right');
    this.overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeAll());
    }

    this.initTouchGestures();

    // Reset drawer states when returning to desktop screen sizes
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) {
        this.closeAll();
        document.body.style.overflow = ''; // স্ক্রল লক ক্লিনআউট নিশ্চিত করবে
      }
    });
  },

  // ==============================================================================
  // 2. TOGGLE & OPEN/CLOSE ACTION HANDLERS
  // Controls drawer open and close states explicitly.
  // ==============================================================================
  toggleLeft() {
    if (this.leftSidebar?.classList.contains('open')) {
      this.closeAll();
    } else {
      this.openLeft();
    }
  },

  toggleRight() {
    if (this.rightSidebar?.classList.contains('open')) {
      this.closeAll();
    } else {
      this.openRight();
    }
  },

  openLeft() {
    this.closeAll();
    if (this.leftSidebar) {
      this.leftSidebar.style.transform = 'translateX(0)';
      this.leftSidebar.classList.add('open');
    }
    this.showOverlay(1);
    document.body.style.overflow = 'hidden';
  },

  openRight() {
    this.closeAll();
    if (this.rightSidebar) {
      this.rightSidebar.style.transform = 'translateX(0)';
      this.rightSidebar.classList.add('open');
    }
    this.showOverlay(1);
    document.body.style.overflow = 'hidden';
  },

  closeAll() {
    if (this.leftSidebar) {
      this.leftSidebar.classList.remove('open');
      this.leftSidebar.style.transform = '';
    }
    if (this.rightSidebar) {
      this.rightSidebar.classList.remove('open');
      this.rightSidebar.style.transform = '';
    }
    this.hideOverlay();
    document.body.style.overflow = '';
  },

  // ---------------------------------------------
  // OVERLAY CONTROLLERS
  // Controls background overlay opacity dynamically
  // ---------------------------------------------
  showOverlay(opacity = 1) {
    if (this.overlay) {
      this.overlay.classList.add('active');
      this.overlay.style.opacity = opacity;
      this.overlay.style.visibility = opacity > 0 ? 'visible' : 'hidden';
    }
  },

  hideOverlay() {
    if (this.overlay) {
      this.overlay.classList.remove('active');
      this.overlay.style.opacity = '';
      this.overlay.style.visibility = '';
    }
  },

  // ==============================================================================
  // 3. TOUCH DRAG GESTURE ENGINE
  // Advanced touch listeners for edge gestures and dynamic drag transforms.
  // ==============================================================================
  initTouchGestures() {
    const edgePercentage = 0.10; // 10% Edge Area

    document.addEventListener('touchstart', (e) => {
      if (window.innerWidth > 992) return;

      const touch = e.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
      this.isScrollLocked = false;

      const windowWidth = window.innerWidth;
      const edgeThreshold = windowWidth * edgePercentage;

      const isLeftOpen = this.leftSidebar?.classList.contains('open');
      const isRightOpen = this.rightSidebar?.classList.contains('open');

      // ---------------------------------------------
      // LEFT SIDEBAR DRAG CHECK
      // ---------------------------------------------
      if ((this.startX <= edgeThreshold && !isRightOpen) || isLeftOpen) {
        this.isDraggingLeft = true;
        this.prepareDrag(this.leftSidebar);
      }

      // ---------------------------------------------
      // RIGHT SIDEBAR DRAG CHECK
      // ---------------------------------------------
      if ((this.startX >= windowWidth - edgeThreshold && !isLeftOpen) || isRightOpen) {
        this.isDraggingRight = true;
        this.prepareDrag(this.rightSidebar);
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!this.isDraggingLeft && !this.isDraggingRight) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - this.startX;
      const deltaY = touch.clientY - this.startY;

      // Vertical vs Horizontal scroll detection logic
      if (!this.isScrollLocked) {
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
          this.resetDragStates();
          return;
        } else if (Math.abs(deltaX) > 10) {
          this.isScrollLocked = true;
        }
      }

      if (e.cancelable && this.isScrollLocked) {
        e.preventDefault();
      }

      if (this.rafId) cancelAnimationFrame(this.rafId);

      this.rafId = requestAnimationFrame(() => {
        // --- Left Sidebar Movement ---
        if (this.isDraggingLeft && this.leftSidebar) {
          const isAlreadyOpen = this.leftSidebar.classList.contains('open');
          let translateX;

          if (isAlreadyOpen) {
            translateX = Math.min(0, Math.max(-this.sidebarWidth, deltaX));
          } else {
            translateX = Math.min(0, Math.max(-this.sidebarWidth, -this.sidebarWidth + deltaX));
          }

          this.leftSidebar.style.transform = `translateX(${translateX}px)`;
          const progress = Math.max(0, Math.min(1, (this.sidebarWidth + translateX) / this.sidebarWidth));
          this.showOverlay(progress);
        }

        // --- Right Sidebar Movement ---
        if (this.isDraggingRight && this.rightSidebar) {
          const isAlreadyOpen = this.rightSidebar.classList.contains('open');
          let translateX;

          if (isAlreadyOpen) {
            translateX = Math.max(0, Math.min(this.sidebarWidth, deltaX));
          } else {
            translateX = Math.max(0, Math.min(this.sidebarWidth, this.sidebarWidth + deltaX));
          }

          this.rightSidebar.style.transform = `translateX(${translateX}px)`;
          const progress = Math.max(0, Math.min(1, (this.sidebarWidth - translateX) / this.sidebarWidth));
          this.showOverlay(progress);
        }
      });
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (!this.isDraggingLeft && !this.isDraggingRight) return;

      if (this.rafId) cancelAnimationFrame(this.rafId);

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.startX;

      // ---------------------------------------------
      // LEFT SIDEBAR RELEASE THRESHOLD
      // ---------------------------------------------
      if (this.isDraggingLeft && this.leftSidebar) {
        this.cleanupDrag(this.leftSidebar);
        const isAlreadyOpen = this.leftSidebar.classList.contains('open');

        if (!isAlreadyOpen && deltaX > this.sidebarWidth * 0.3) {
          this.openLeft();
        } else if (isAlreadyOpen && deltaX < -this.sidebarWidth * 0.3) {
          this.closeAll();
        } else if (isAlreadyOpen) {
          this.openLeft();
        } else {
          this.closeAll();
        }
      }

      // ---------------------------------------------
      // RIGHT SIDEBAR RELEASE THRESHOLD
      // ---------------------------------------------
      if (this.isDraggingRight && this.rightSidebar) {
        this.cleanupDrag(this.rightSidebar);
        const isAlreadyOpen = this.rightSidebar.classList.contains('open');

        if (!isAlreadyOpen && deltaX < -this.sidebarWidth * 0.3) {
          this.openRight();
        } else if (isAlreadyOpen && deltaX > this.sidebarWidth * 0.3) {
          this.closeAll();
        } else if (isAlreadyOpen) {
          this.openRight();
        } else {
          this.closeAll();
        }
      }

      this.resetDragStates();
    });
  },

  // ---------------------------------------------
  // DRAG HELPERS
  // ---------------------------------------------
  prepareDrag(element) {
    if (!element) return;
    element.style.transition = 'none';
  },

  cleanupDrag(element) {
    if (!element) return;
    element.style.transition = '';
  },

  resetDragStates() {
    this.isDraggingLeft = false;
    this.isDraggingRight = false;
    this.isScrollLocked = false;
  }
};