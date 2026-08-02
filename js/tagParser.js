/* ==============================================================================
 *  TAG PARSER MODULE (OFFLINE OPTIMIZED & RAW HTML SUPPORTED)
 *  Purpose: Converts custom text/markdown short tags into structured HTML elements.
 * ============================================================================== */

export const TagParser = {

  // =======================================================
  // 1. MAIN TEXT PARSING ENGINE
  // =======================================================

  parseText(rawText, rightSidebarNav) {
    if (rightSidebarNav) rightSidebarNav.innerHTML = '';

    const fragment = document.createDocumentFragment();
    const lines = rawText.split('\n');
    let currentBlockLines = [];

    const flushBlock = () => {
      if (currentBlockLines.length === 0) return;

      const blockText = currentBlockLines.join('\n').trim();
      currentBlockLines = [];

      if (!blockText) return;

      const element = this.createHTMLElement(blockText, rightSidebarNav);
      if (element) {
        fragment.appendChild(element);
      }
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Ignore lines starting with '==='
      if (trimmedLine.startsWith('===')) {
        return;
      }

      // Standalone '---' (Global Section Break)
      if (trimmedLine === '---') {
        flushBlock();
        const hr = document.createElement('hr');
        hr.className = 'section-break-divider';
        fragment.appendChild(hr);
        return;
      }

      // Check for start of new block tags (excluding inline tags like [ar])
      if (trimmedLine.startsWith('[') && !trimmedLine.startsWith('[//')) {
        const isNewTag = /^\[\/?[a-zA-Z\-]+(?::.*)?\]/.test(trimmedLine);
        const isInlineTag = /^\[\/?ar\]/i.test(trimmedLine);

        if (isNewTag && !isInlineTag && currentBlockLines.length > 0) {
          flushBlock();
        }
      }

      currentBlockLines.push(line);
    });

    flushBlock();
    return fragment;
  },




  // =======================================================
  // 2. CONTENT FORMATTING HELPERS
  // =======================================================

  formatBlockContent(rawContent, isInlineFirstLine = false) {
    const lines = rawContent.split('\n');
    let htmlLines = [];

    lines.forEach((line, index) => {
      let trimmedLine = line.trim();
      if (!trimmedLine) return;

      if (trimmedLine === '- - -' || trimmedLine === '***') {
        htmlLines.push('<hr class="tag-body-divider">');
        return;
      }

      // Check if line starts with [ar] tag
      if (/^\[ar\]/i.test(trimmedLine)) {
        const arabicContent = trimmedLine.replace(/^\[ar\]/i, '').trim();
        htmlLines.push(`<div class="arabic-text">${arabicContent}</div>`);
        return;
      }

      // Process bold formatting
      trimmedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="tag-body-bold">$1</strong>');

      if (trimmedLine.startsWith('~')) {
        const cleanText = trimmedLine.replace(/^~\s*/, '');
        htmlLines.push(`<div class="tag-body-subtext">${cleanText}</div>`);
      } else {
        if (index === 0 && isInlineFirstLine) {
          htmlLines.push(`<span>${trimmedLine}</span>`);
        } else {
          htmlLines.push(`<div>${trimmedLine}</div>`);
        }
      }
    });

    return htmlLines.join('');
  },




  // =======================================================
  // 3. HTML ELEMENT GENERATORS
  // =======================================================

  createHTMLElement(trimmed, rightSidebarNav) {
    const match = trimmed.match(/^\[([a-zA-Z\-]+)(?::\s*([^\]]+))?\]\s*([\s\S]*)/);
    if (!match) return null;

    const tagName = match[1].toLowerCase();
    const rawCaptionAndMod = match[2] ? match[2].trim() : null;
    const content = match[3].trim();




    // =======================================================
    // 1. TITLE & SECTION HEADINGS
    // =======================================================

    // [title] / [t]
    if (['title', 't'].includes(tagName)) {
      const el = document.createElement('h2');
      el.className = 'tag-title';
      el.innerHTML = content;
      return el;
    }

    // [section] / [sec] / [s]
    if (['section', 'sec', 's'].includes(tagName)) {
      const sectionId = 'sec-' + Math.random().toString(36).substring(2, 7);

      const el = document.createElement('h3');
      el.id = sectionId;
      el.className = 'section-title-divider';
      el.innerHTML = `◈ ${content} ◈`;

      if (rightSidebarNav) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${sectionId}`;
        a.innerHTML = content;

        a.addEventListener('click', (e) => {
          e.preventDefault();
          const targetElement = document.getElementById(sectionId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            targetElement.classList.remove('highlight-pulse');
            void targetElement.offsetWidth;
            targetElement.classList.add('highlight-pulse');
          }
        });

        li.appendChild(a);
        rightSidebarNav.appendChild(li);
      }
      return el;
    }




    // =======================================================
    // 2. BODY COMPONENT (Unified Block)
    // =======================================================

    // [body] / [bdy]
    if (['body', 'bdy'].includes(tagName)) {
      let caption = null;
      let modifierClass = '';

      if (rawCaptionAndMod) {
        const parts = rawCaptionAndMod.split('|').map(p => p.trim());
        caption = parts[0];
        if (parts[1]) {
          modifierClass = ` tag-body-${parts[1].toLowerCase()}`;
        }
      }

      const div = document.createElement('div');
      div.className = `tag-body${modifierClass}`;

      let html = '';
      if (caption) {
        let cleanContent = content.trim();
        if (cleanContent === '') {
          html += `<span class="tag-body-title">${caption}</span>`;
        } else {
          html += `<span class="tag-body-title">${caption} </span>${this.formatBlockContent(cleanContent, true)}`;
        }
      } else {
        html += this.formatBlockContent(content.trim(), false);
      }

      div.innerHTML = html;
      return div;
    }




    // =======================================================
    // 3. DIALOGUES (TEACHER & STUDENT)
    // =======================================================

    // [teacher] / [teach] / [tchr]
    if (['teacher', 'teach', 'tchr'].includes(tagName)) {
      const formattedContent = this.formatBlockContent(content);
      const div = document.createElement('div');
      div.className = 'dialogue-container';
      div.innerHTML = `
        <div class="teacher-msg">
          <div class="speaker-tag">🟢 ওস্তাদ:</div>
          <div class="msg-body">${formattedContent}</div>
        </div>`;
      return div;
    }

    // [student] / [stud] / [std]
    if (['student', 'stud', 'std'].includes(tagName)) {
      const formattedContent = this.formatBlockContent(content);
      const div = document.createElement('div');
      div.className = 'dialogue-container';
      div.innerHTML = `
        <div class="student-msg">
          <div class="speaker-tag">🟡 ছাত্ররা:</div>
          <div class="msg-body">${formattedContent}</div>
        </div>`;
      return div;
    }




    // =======================================================
    // 4. BOARD & NOTES
    // =======================================================

    // [board] / [brd] / [b]
    if (['board', 'brd', 'b'].includes(tagName)) {
      const div = document.createElement('div');
      div.className = 'tag-board';
      div.innerHTML = `<div class="arabic-text">${content}</div>`;
      return div;
    }

    // [note] / [tip] / [n]
    if (['note', 'tip', 'n'].includes(tagName)) {
      const formattedContent = this.formatBlockContent(content);
      const div = document.createElement('div');
      div.className = 'tag-note';
      
      let headerHtml = rawCaptionAndMod ? `<div class="tag-note-title">${rawCaptionAndMod}</div>` : '';
      div.innerHTML = `${headerHtml}${formattedContent}`;
      return div;
    }




    // =======================================================
    // 5. STEPS
    // =======================================================

    // [step] / [stp]
    if (['step', 'stp'].includes(tagName)) {
      const div = document.createElement('div');
      div.className = 'tag-step';
      div.innerHTML = `<strong>🔹 </strong> ${this.formatBlockContent(content, true)}`;
      return div;
    }
    


    // =======================================================
    // 6. IMAGE COMPONENT
    // =======================================================

    // [image] / [img]
    if (['image', 'img'].includes(tagName)) {
      const div = document.createElement('div');
      div.className = 'tag-image-container';

      const imgPath = content.trim();
      const caption = rawCaptionAndMod ? rawCaptionAndMod.trim() : null;

      let html = `<img src="${imgPath}" alt="${caption || 'Image'}" class="tag-image">`;

      if (caption) {
        html += `<div class="tag-image-caption">${caption}</div>`;
      }

      div.innerHTML = html;
      return div;    
    }

    return null;
  }
};