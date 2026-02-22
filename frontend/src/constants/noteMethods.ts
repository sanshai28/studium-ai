import type { NotebookMethod } from '../types';

/**
 * Display metadata for each note-taking method.
 * Used in the notebook creation flow and anywhere methods are listed in the UI.
 */
export const METHODS: {
  id: NotebookMethod;
  icon: string;
  name: string;
  description: string;
}[] = [
  {
    id: 'cornell',
    icon: '📝',
    name: 'Cornell',
    description: 'Organized sections for cues, notes, and summary',
  },
  {
    id: 'sentence',
    icon: '📋',
    name: 'Sentence',
    description: 'Each thought as a numbered line',
  },
  {
    id: 'outlining',
    icon: '📑',
    name: 'Outlining',
    description: 'Hierarchical structure with topics and subtopics',
  },
  {
    id: 'charting',
    icon: '📊',
    name: 'Charting',
    description: 'Compare and categorize with structured sections',
  },
  {
    id: 'blank',
    icon: '📄',
    name: 'Blank',
    description: 'Free-form notes with no structure',
  },
];
