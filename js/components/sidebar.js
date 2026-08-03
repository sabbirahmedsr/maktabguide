/* ==============================================================================
 *  SIDEBAR COMPONENT
 *  Handles left/right sidebar rendering, drawer toggles, and main index clicks.
 * ============================================================================== */

import { SidebarGestures } from './sidebarGestures.js';

export const SidebarComponent = {
  leftSidebar: null,
  rightSidebar: null,
  overlay: null,

  /* ==============================================================================
   *  1. INITIALIZATION & SETUP
   * ============================================================================== */
  init(onSelectCallback) {
    this.leftSidebar = document.getElementById('sidebarLeft') || document.querySelector('.sidebar-left');
    this.rightSidebar = document.getElementById('sidebarRight') || document.querySelector('.sidebar-right');
    this.overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');

    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.closeAll());
    }

    // [note] Handle Click on Main Course Index Title
    const mainIndexLink = document.querySelector('.main-index-link');
    if (mainIndexLink) {
      mainIndexLink.addEventListener('click', (e) => {
        e.preventDefault();
        const filePath = mainIndexLink.getAttribute('data-file-path');

        this.setActiveNavLink(mainIndexLink);

        if (typeof onSelectCallback === 'function' && filePath) {
          onSelectCallback(filePath, mainIndexLink);
        }

        if (window.innerWidth <= 992) {
          this.closeAll();
        }
      });
    }

    // [note] Initialize gesture listener by passing this sidebar instance
    SidebarGestures.init(this);

    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) {
        this.closeAll();
        document.body.style.overflow = '';
      }
    });
  },

  /* ==============================================================================
   *  2. RENDER LEFT SIDEBAR ACCORDION MENU
   * ============================================================================== */
  renderLeftSidebar(sectionList, onSelectCallback) {
    const navList = document.querySelector('.sidebar-left .nav-list');
    if (!navList) return;

    navList.innerHTML = '';
    const savedFilePath = localStorage.getItem('activeFilePath');

    sectionList.forEach((section, sIndex) => {
      const sectionLi = document.createElement('li');
      sectionLi.classList.add('nav-section');

      const headerBtn = document.createElement('button');
      headerBtn.type = 'button';
      headerBtn.classList.add('section-header');
      headerBtn.innerHTML = `
        <span class="section-title">${section.sectionTitle}</span>
        <i class="fas fa-chevron-right arrow-icon"></i>
      `;

      const subUl = document.createElement('ul');
      subUl.classList.add('sub-nav-list');

      let hasActiveChild = false;

      (section.items || []).forEach((item, iIndex) => {
        const itemLi = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = item.title;
        a.setAttribute('data-filepath', item.filePath);

        const isActive = savedFilePath ? item.filePath === savedFilePath : (sIndex === 0 && iIndex === 0);
        if (isActive) {
          a.classList.add('active');
          hasActiveChild = true;
        }

        a.addEventListener('click', (e) => {
          e.preventDefault();
          this.setActiveNavLink(a);
          onSelectCallback(item.filePath, a);

          if (window.innerWidth <= 992) {
            this.closeAll();
          }
        });

        itemLi.appendChild(a);
        subUl.appendChild(itemLi);
      });

      if (hasActiveChild) {
        sectionLi.classList.add('expanded');
      }

      headerBtn.addEventListener('click', () => {
        const isAlreadyExpanded = sectionLi.classList.contains('expanded');

        const allSections = navList.querySelectorAll('.nav-section');
        allSections.forEach(sec => sec.classList.remove('expanded'));

        if (!isAlreadyExpanded) {
          sectionLi.classList.add('expanded');
        }
      });

      sectionLi.appendChild(headerBtn);
      sectionLi.appendChild(subUl);
      navList.appendChild(sectionLi);
    });
  },

  setActiveNavLink(clickedLink) {
    const navLinks = document.querySelectorAll('.sidebar-left .nav-list a, .main-index-link');
    navLinks.forEach(link => link.classList.remove('active'));

    // [New] আগের সব সেকশন থেকে has-active-child ক্লাস সরিয়ে নেওয়া
    const allSections = document.querySelectorAll('.sidebar-left .nav-section');
    allSections.forEach(sec => sec.classList.remove('has-active-child'));

    if (clickedLink) {
      clickedLink.classList.add('active');

      const parentSection = clickedLink.closest('.nav-section');
      if (parentSection) {
        // [New] অ্যাক্টিভ আইটেমের প্যারেন্ট সেকশনটিকে চিহ্নিত করা
        parentSection.classList.add('has-active-child');

        if (!parentSection.classList.contains('expanded')) {
          allSections.forEach(sec => sec.classList.remove('expanded'));
          parentSection.classList.add('expanded');
        }
      }
    }
  },

  /* ==============================================================================
   *  3. DRAWER TOGGLE & OVERLAY ACTIONS
   * ============================================================================== */
  toggleLeft() {
    this.leftSidebar?.classList.contains('open') ? this.closeAll() : this.openLeft();
  },

  toggleRight() {
    this.rightSidebar?.classList.contains('open') ? this.closeAll() : this.openRight();
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
  }
};