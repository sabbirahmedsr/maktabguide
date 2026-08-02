/* ==============================================================================
 *  5. NAVIGATION MODULE
 *  Renders topic menus in left sidebar and section indexes in right sidebar
 * ============================================================================== */

export class Navigation {
  constructor({ onSelectTopic, onSelectSection }) {
    this.leftNavContainer = document.getElementById('sidebar-left-nav');
    this.rightNavContainer = document.getElementById('sidebar-right-nav');

    this.onSelectTopic = onSelectTopic;
    this.onSelectSection = onSelectSection;
  }

  /* ==============================================================================
   *  5.1 LEFT SIDEBAR: LESSON MENU RENDERER
   * ============================================================================== */
  renderTopics(topics, activeTopicId) {
    if (!this.leftNavContainer) return;

    let html = `<div class="sidebar-title">Lessons</div><ul class="nav-list">`;

    topics.forEach((topic) => {
      const isActive = topic.id === activeTopicId ? 'class="active"' : '';
      html += `
        <li>
          <a href="#" ${isActive} data-topic-id="${topic.id}">${topic.title}</a>
        </li>
      `;
    });

    html += `</ul>`;
    this.leftNavContainer.innerHTML = html;

    // Attach Event Listeners
    this.leftNavContainer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const topicId = link.getAttribute('data-topic-id');
        if (this.onSelectTopic) this.onSelectTopic(topicId);
      });
    });
  }

  /* ==============================================================================
   *  5.2 RIGHT SIDEBAR: IN-PAGE SECTION INDEX RENDERER
   * ============================================================================== */
  renderSections(sections) {
    if (!this.rightNavContainer) return;

    if (!sections || sections.length === 0) {
      this.rightNavContainer.innerHTML = `<div class="sidebar-title">Index</div><p style="font-size:0.9rem; color:#888;">No sections found.</p>`;
      return;
    }

    let html = `<div class="sidebar-title">On This Page</div><ul class="nav-list">`;

    sections.forEach((sec) => {
      html += `
        <li>
          <a href="#${sec.id}" data-section-id="${sec.id}">${sec.title}</a>
        </li>
      `;
    });

    html += `</ul>`;
    this.rightNavContainer.innerHTML = html;

    // Attach Event Listeners
    this.rightNavContainer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section-id');
        if (this.onSelectSection) this.onSelectSection(sectionId);
      });
    });
  }
}