import 'package:flutter_test/flutter_test.dart';
import 'package:studium_tablet/providers/notes_provider.dart';

void main() {
  group('NotesState', () {
    test('default values', () {
      const state = NotesState();
      expect(state.content, '');
      expect(state.isSaving, false);
      expect(state.lastSaved, isNull);
    });

    test('copyWith updates content', () {
      const state = NotesState();
      final updated = state.copyWith(content: 'Hello');
      expect(updated.content, 'Hello');
      expect(updated.isSaving, false);
    });

    test('copyWith updates isSaving', () {
      const state = NotesState();
      final updated = state.copyWith(isSaving: true);
      expect(updated.isSaving, true);
      expect(updated.content, '');
    });

    test('copyWith updates lastSaved', () {
      const state = NotesState();
      final now = DateTime.now();
      final updated = state.copyWith(lastSaved: now);
      expect(updated.lastSaved, now);
    });

    test('copyWith preserves unmodified fields', () {
      final state = NotesState(
        content: 'Existing',
        isSaving: true,
        lastSaved: DateTime(2025, 1, 1),
      );
      final updated = state.copyWith(content: 'New');
      expect(updated.content, 'New');
      expect(updated.isSaving, true);
      expect(updated.lastSaved, DateTime(2025, 1, 1));
    });
  });
}
