/* ==============================================================================
 *  MASTER APPLICATION CONTROLLER
 *  Main entry point that connects all modules, components and initiates app loading.
 * ============================================================================== */

import { ContentLoader } from './modules/contentLoader.js';
import { HeaderComponent } from './components/header.js';
import { SidebarComponent } from './components/sidebar.js';
import { ContentViewerComponent } from './components/contentViewer.js';
import { SettingsModalComponent } from './components/settingsModal.js';

let currentContents = [];

/* ==============================================================================
 *  1. DOM READY INITIALIZATION
 *  Registers components and triggers initial content fetch.
 * ============================================================================== */
document.addEventListener('DOMContentLoaded', async () => {
  SidebarComponent.init();
  SettingsModalComponent.init();
  
  HeaderComponent.init(
    () => SidebarComponent.toggleLeft(),
    () => SidebarComponent.toggleRight()
  );

  await initApp();
});

/* ==============================================================================
 *  2. APPLICATION BOOTSTRAP & DATA FETCHING
 * ============================================================================== */
async function initApp() {
  try {
    currentContents = await ContentLoader.fetchContentList();

    SidebarComponent.renderLeftSidebar(currentContents, (filePath, element) => {
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


/* ==============================================================================
 *  3. CONTENT LOADING CONTROLLER
 * ============================================================================== */
async function loadTextContent(filePath, element = null) {
  // ১. UI স্টেট (Sidebar & Header) আপডেট
  if (element) {
    SidebarComponent.setActiveNavLink(element);
  } else {
    const navLinks = document.querySelectorAll('.sidebar-left .nav-list a');
    navLinks.forEach(link => {
      if (link.getAttribute('data-filepath') === filePath) {
        SidebarComponent.setActiveNavLink(link);
      }
    });
  }

  if (currentContents.length > 0) {
    const matchedItem = currentContents.find(item => item.filePath === filePath);
    if (matchedItem && matchedItem.title) {
      HeaderComponent.updateTitle(matchedItem.title);
    }
  }

  // ২. ContentViewer-কে ডেটা আনার প্রমিস (ContentLoader) দিয়ে দায়িত্ব হস্তান্তর
  await ContentViewerComponent.loadAndRender(
    ContentLoader.fetchTextContent(filePath)
  );
}