/* ==============================================================================
 *  CONTENT LOADER MODULE
 *  Fetches menu JSON list and raw text files from the content directory.
 * ============================================================================== */

export const ContentLoader = {

  /* ==============================================================================
   *  1. FETCH CONTENT LIST
   *  Retrieves index list of available course files.
   * ============================================================================== */
  async fetchContentList() {
    const response = await fetch('content/content-list.json');
    if (!response.ok) {
      throw new Error('Failed to load menu list');
    }
    return await response.json();
  },

  /* ==============================================================================
   *  2. FETCH RAW TEXT CONTENT
   *  Fetches raw content from specific file path.
   * ============================================================================== */
  async fetchTextContent(filePath) {
    if (!filePath) {
      throw new Error('File path is undefined');
    }
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error('File not found: ' + filePath);
    }
    return await response.text();
  }
};