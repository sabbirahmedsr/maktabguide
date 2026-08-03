/* ==============================================================================
 *  MASTER APPLICATION CONTROLLER
 *  Main entry point that connects all modules, components and initiates app loading.
 * ============================================================================== */

import { ContentLoader } from './modules/contentLoader.js';
import { HeaderComponent } from './components/header.js';
import { SidebarComponent } from './components/sidebar.js';
import { ContentViewerComponent } from './components/contentViewer.js';
import { SettingsModalComponent } from './components/settingsModal.js';

let structuredSections = [];
let currentContents = [];

/* ==============================================================================
 *  1. DOM READY INITIALIZATION
 *  Registers components and triggers initial content fetch.
 * ============================================================================== */
document.addEventListener('DOMContentLoaded', async () => {

  // [Fix Here] SidebarComponent.init-এ ফাইল লোড করার ফাংশনটি পাস করা হলো
  SidebarComponent.init((filePath, element) => {
    localStorage.setItem('activeFilePath', filePath);
    loadTextContent(filePath, element);
  });

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
    // [note] Flattening nested sections into flat array for global item reference
    structuredSections = await ContentLoader.fetchContentList();
    currentContents = structuredSections.flatMap(section => section.items || []);

    SidebarComponent.renderLeftSidebar(structuredSections, (filePath, element) => {
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
  // 1. UI State (Sidebar & Header) update
  if (element) {
    SidebarComponent.setActiveNavLink(element);
  } else {
    // [Fix Here] .main-index-link সহ চেক করবে যেন হেডার লিংকও অ্যাক্টিভ সিলেক্ট হয়
    const navLinks = document.querySelectorAll('.sidebar-left .nav-list a, .main-index-link');
    navLinks.forEach(link => {
      if (link.getAttribute('data-filepath') === filePath || link.getAttribute('data-file-path') === filePath) {
        SidebarComponent.setActiveNavLink(link);
      }
    });
  }

  if (currentContents.length > 0) {
    const matchedItem = currentContents.find(item => item.filePath === filePath);
    if (matchedItem && matchedItem.title) {
      HeaderComponent.updateTitle(matchedItem.title);
    } else {
      // যদি 'কোর্স সূচিপত্র' লোড হয়, তবে হেডার টাইটেল আপডেট করবে
      HeaderComponent.updateTitle('কোর্স সূচিপত্র');
    }
  }

  // 2. Delegate rendering task to ContentViewerComponent
  await ContentViewerComponent.loadAndRender(
    ContentLoader.fetchTextContent(filePath)
  );
}