/*
// ==============================================================================
// UI RENDERER MODULE
// Handles left sidebar navigation rendering, item loading, and active styles.
// ==============================================================================
*/

import { LayoutController } from './layoutController.js';

export const UIManager = {
  
  // ==============================================================================
  // 1. INITIALIZATION & LAYOUT BINDING
  // ==============================================================================
  initUI() {
    LayoutController.init();
  },

  // ==============================================================================
  // 2. NAVIGATION STATE & RENDER MANAGEMENT
  // ==============================================================================
  setActiveNavLink(clickedLink) {
    const navLinks = document.querySelectorAll('.sidebar-left .nav-list a');
    navLinks.forEach(link => link.classList.remove('active'));
    if (clickedLink) clickedLink.classList.add('active');
  },

  // ---------------------------------------------
  // SIDEBAR ITEM LIST BUILDER
  // ---------------------------------------------
  renderLeftSidebar(contentList, onSelectCallback) {
    const navList = document.querySelector('.sidebar-left .nav-list');
    if (!navList) return;

    navList.innerHTML = '';
    const savedFilePath = localStorage.getItem('activeFilePath');

    contentList.forEach((item, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = item.title;

      if (savedFilePath ? item.filePath === savedFilePath : index === 0) {
        a.classList.add('active');
      }

      a.addEventListener('click', (e) => {
        e.preventDefault();
        onSelectCallback(item.filePath, a);
      });

      li.appendChild(a);
      navList.appendChild(li);
    });
  }
};