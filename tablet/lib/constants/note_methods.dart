import 'package:flutter/material.dart';

/// Metadata for a note-taking method.
class NoteMethod {
  /// API identifier (matches backend enum).
  final String id;

  /// Material icon for display.
  final IconData icon;

  /// Human-readable name.
  final String name;

  /// Short description.
  final String description;

  const NoteMethod({
    required this.id,
    required this.icon,
    required this.name,
    required this.description,
  });
}

/// All available note-taking methods.
///
/// Order matches the frontend's `noteMethods.ts`.
const List<NoteMethod> noteMethods = [
  NoteMethod(
    id: 'cornell',
    icon: Icons.edit_note,
    name: 'Cornell',
    description:
        'Organized sections for cues, '
        'notes, and summary',
  ),
  NoteMethod(
    id: 'sentence',
    icon: Icons.format_list_numbered,
    name: 'Sentence',
    description:
        'Each thought as a numbered line',
  ),
  NoteMethod(
    id: 'outlining',
    icon: Icons.segment,
    name: 'Outlining',
    description:
        'Hierarchical structure with '
        'topics and subtopics',
  ),
  NoteMethod(
    id: 'charting',
    icon: Icons.table_chart_outlined,
    name: 'Charting',
    description:
        'Compare and categorize with '
        'structured sections',
  ),
  NoteMethod(
    id: 'blank',
    icon: Icons.description_outlined,
    name: 'Blank',
    description:
        'Free-form notes with no structure',
  ),
];

/// Returns the [NoteMethod] matching [id],
/// or the 'blank' method as fallback.
NoteMethod noteMethodById(String id) {
  return noteMethods.firstWhere(
    (m) => m.id == id,
    orElse: () => noteMethods.last,
  );
}
