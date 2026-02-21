import { NotebookMethod } from '@prisma/client';

/**
 * Initial HTML content applied to a new note based on the notebook's defaultMethod.
 * All values must be valid HTML renderable by TipTap's StarterKit extensions
 * (headings, ordered/unordered lists, paragraphs).
 */
export const METHOD_TEMPLATES: Record<NotebookMethod, string> = {
  cornell:
    '<h2>Cues / Questions</h2><p></p><h2>Notes</h2><p></p><h2>Summary</h2><p></p>',
  sentence:
    '<ol><li></li></ol>',
  outlining:
    '<h2>Topic</h2><ul><li>Subtopic<ul><li></li></ul></li></ul>',
  charting:
    '<h2>Category 1</h2><ul><li></li></ul><h2>Category 2</h2><ul><li></li></ul>',
  blank:
    '<p></p>',
};
