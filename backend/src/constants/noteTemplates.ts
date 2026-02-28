import { NotebookMethod } from '@prisma/client';

/**
 * Initial content applied to a new note based on the notebook's defaultMethod.
 * Most methods use plain HTML renderable by TipTap's StarterKit extensions.
 * Cornell uses a JSON string with three sections (cues, notes, summary).
 */
export const METHOD_TEMPLATES: Record<NotebookMethod, string> = {
  cornell:
    JSON.stringify({ cues: '<p></p>', notes: '<p></p>', summary: '<p></p>' }),
  sentence:
    '<ol><li></li></ol>',
  outlining:
    '<h2>Topic</h2><ul><li>Subtopic<ul><li></li></ul></li></ul>',
  charting:
    '<h2>Category 1</h2><ul><li></li></ul><h2>Category 2</h2><ul><li></li></ul>',
  blank:
    '<p></p>',
};
