/* ==============================================================================
 *  TOUCH DRAG GESTURE ENGINE
 *  Handles edge touch detection and drag mechanics for responsive drawers.
 * ============================================================================== */

export const SidebarGestures = {
  startX: 0,
  startY: 0,
  isDraggingLeft: false,
  isDraggingRight: false,
  isScrollLocked: false,
  sidebarWidth: 320,
  rafId: null,

  init(drawerController) {
    const edgePercentage = 0.10; // 10% Edge Area

    document.addEventListener('touchstart', (e) => {
      if (window.innerWidth > 992) return;

      const touch = e.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
      this.isScrollLocked = false;

      const windowWidth = window.innerWidth;
      const edgeThreshold = windowWidth * edgePercentage;

      const isLeftOpen = drawerController.leftSidebar?.classList.contains('open');
      const isRightOpen = drawerController.rightSidebar?.classList.contains('open');

      if ((this.startX <= edgeThreshold && !isRightOpen) || isLeftOpen) {
        this.isDraggingLeft = true;
        this.prepareDrag(drawerController.leftSidebar);
      }

      if ((this.startX >= windowWidth - edgeThreshold && !isLeftOpen) || isRightOpen) {
        this.isDraggingRight = true;
        this.prepareDrag(drawerController.rightSidebar);
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!this.isDraggingLeft && !this.isDraggingRight) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - this.startX;
      const deltaY = touch.clientY - this.startY;

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
        if (this.isDraggingLeft && drawerController.leftSidebar) {
          const isAlreadyOpen = drawerController.leftSidebar.classList.contains('open');
          const translateX = isAlreadyOpen 
            ? Math.min(0, Math.max(-this.sidebarWidth, deltaX))
            : Math.min(0, Math.max(-this.sidebarWidth, -this.sidebarWidth + deltaX));

          drawerController.leftSidebar.style.transform = `translateX(${translateX}px)`;
          const progress = Math.max(0, Math.min(1, (this.sidebarWidth + translateX) / this.sidebarWidth));
          drawerController.showOverlay(progress);
        }

        if (this.isDraggingRight && drawerController.rightSidebar) {
          const isAlreadyOpen = drawerController.rightSidebar.classList.contains('open');
          const translateX = isAlreadyOpen
            ? Math.max(0, Math.min(this.sidebarWidth, deltaX))
            : Math.max(0, Math.min(this.sidebarWidth, this.sidebarWidth + deltaX));

          drawerController.rightSidebar.style.transform = `translateX(${translateX}px)`;
          const progress = Math.max(0, Math.min(1, (this.sidebarWidth - translateX) / this.sidebarWidth));
          drawerController.showOverlay(progress);
        }
      });
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (!this.isDraggingLeft && !this.isDraggingRight) return;

      if (this.rafId) cancelAnimationFrame(this.rafId);

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.startX;

      if (this.isDraggingLeft && drawerController.leftSidebar) {
        this.cleanupDrag(drawerController.leftSidebar);
        const isAlreadyOpen = drawerController.leftSidebar.classList.contains('open');

        if ((!isAlreadyOpen && deltaX > this.sidebarWidth * 0.3) || (isAlreadyOpen && deltaX >= -this.sidebarWidth * 0.3)) {
          drawerController.openLeft();
        } else {
          drawerController.closeAll();
        }
      }

      if (this.isDraggingRight && drawerController.rightSidebar) {
        this.cleanupDrag(drawerController.rightSidebar);
        const isAlreadyOpen = drawerController.rightSidebar.classList.contains('open');

        if ((!isAlreadyOpen && deltaX < -this.sidebarWidth * 0.3) || (isAlreadyOpen && deltaX <= this.sidebarWidth * 0.3)) {
          drawerController.openRight();
        } else {
          drawerController.closeAll();
        }
      }

      this.resetDragStates();
    });
  },

  prepareDrag(el) { if (el) el.style.transition = 'none'; },
  cleanupDrag(el) { if (el) el.style.transition = ''; },
  resetDragStates() {
    this.isDraggingLeft = false;
    this.isDraggingRight = false;
    this.isScrollLocked = false;
  }
};