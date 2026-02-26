import 'package:flutter_test/flutter_test.dart';
import 'package:studium_tablet/providers/note_provider.dart';

void main() {
  group('NotesListState', () {
    test('default values', () {
      const state = NotesListState();
      expect(state.notes, isEmpty);
      expect(state.isLoading, false);
      expect(state.isSaving, false);
      expect(state.lastSaved, isNull);
      expect(state.error, isNull);
    });

    test('copyWith updates isSaving', () {
      const state = NotesListState();
      final updated = state.copyWith(isSaving: true);
      expect(updated.isSaving, true);
      expect(updated.notes, isEmpty);
    });

    test('copyWith updates lastSaved', () {
      const state = NotesListState();
      final now = DateTime.now();
      final updated = state.copyWith(lastSaved: now);
      expect(updated.lastSaved, now);
    });

    test('copyWith updates isLoading', () {
      const state = NotesListState();
      final updated = state.copyWith(isLoading: true);
      expect(updated.isLoading, true);
    });

    test('copyWith preserves unmodified fields', () {
      final state = NotesListState(
        isSaving: true,
        lastSaved: DateTime(2025, 1, 1),
      );
      final updated = state.copyWith(isSaving: false);
      expect(updated.isSaving, false);
      expect(updated.lastSaved, DateTime(2025, 1, 1));
    });
  });
}
