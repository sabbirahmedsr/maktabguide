/*
// ==============================================================================
// MASTER CONTROLLER ENGINE
// Purpose: Application initialization, fetching content, and rendering pages.
// ==============================================================================
*/

import { TagParser } from './tagParser.js';
import { UIManager } from './ui.js';
import { Settings } from './settings.js';
import { LayoutController } from './layoutController.js';

let currentContents = [];

// ==============================================================================
// 1. DOM READY LISTENER & EVENT BINDING
// Handles toolbar toggles and initiates core app load.
// ==============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  UIManager.initUI();
  Settings.init();
  LayoutController.init();

  // ---------------------------------------------
  // SIDEBAR TOGGLE BUTTON LISTENERS
  // ---------------------------------------------
  const leftToggleBtn = document.getElementById('sidebar-toggle-btn');
  if (leftToggleBtn) {
    leftToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      LayoutController.toggleLeft();
    });
  }

  const rightToggleBtn = document.getElementById('right-sidebar-toggle-btn');
  if (rightToggleBtn) {
    rightToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      LayoutController.toggleRight();
    });
  }

  await initApp();
});

// ==============================================================================
// 2. APPLICATION INITIALIZATION & DATA FETCHING
// Loads content list JSON and restores cached selection state.
// ==============================================================================
async function initApp() {
  try {
    const response = await fetch('content/content-list.json');
    if (!response.ok) throw new Error('Failed to load menu list');

    currentContents = await response.json();

    UIManager.renderLeftSidebar(currentContents, (filePath, element) => {
      localStorage.setItem('activeFilePath', filePath);
      loadTextContent(filePath, element);
    });

    if (currentContents.length > 0) {
      const savedFilePath = localStorage.getItem('activeFilePath');
      const targetItem = currentContents.find(item => item.filePath === savedFilePath);

      if (targetItem) {
        loadTextContent(targetItem.filePath);
      } else {
        loadTextContent(currentContents[0].filePath);
      }
    }
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// ==============================================================================
// 3. CONTENT LOADING & PAGE RENDERING LOGIC
// Fetches text files and updates main viewport & title bar.
// ==============================================================================
async function loadTextContent(filePath, element = null) {
  try {
    if (!filePath) throw new Error('File path is undefined');

    if (element) {
      UIManager.setActiveNavLink(element);
    } else {
      const navLinks = document.querySelectorAll('.sidebar-left .nav-list a');
      navLinks.forEach(link => {
        const matched = currentContents.find(item => item.filePath === filePath && item.title === link.textContent);
        if (matched) {
          UIManager.setActiveNavLink(link);
        }
      });
    }

    if (currentContents.length > 0) {
      const matchedItem = currentContents.find(item => item.filePath === filePath);
      if (matchedItem && matchedItem.title) {
        updateHeaderTitle(matchedItem.title);
      }
    }

    const response = await fetch(filePath);
    if (!response.ok) throw new Error('File not found: ' + filePath);

    const rawText = await response.text();
    renderPage(rawText);
  } catch (error) {
    console.error('Error loading text content:', error);
  }
}

// ---------------------------------------------
// HEADER TITLE UPDATE HELPER
// ---------------------------------------------
function updateHeaderTitle(titleText) {
  const pageTitleElement = document.getElementById('page-title');
  if (pageTitleElement) {
    pageTitleElement.textContent = `📖 ${titleText}`;
  }
}

// ---------------------------------------------
// MAIN DOM RENDER HELPER
// ---------------------------------------------
function renderPage(rawText) {
  const mainContent = document.getElementById('mainContent');
  const rightSidebarNav = document.getElementById('rightSidebarNav');

  if (!mainContent) return;
  mainContent.innerHTML = '';

  const parsedElements = TagParser.parseText(rawText, rightSidebarNav);
  mainContent.appendChild(parsedElements);
}
