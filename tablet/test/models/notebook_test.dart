import 'package:flutter_test/flutter_test.dart';
import 'package:studium_tablet/models/notebook.dart';

void main() {
  group('Notebook', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'nb-1',
        'title': 'Test Notebook',
        'content': 'Some notes',
        'defaultMethod': 'cornell',
        'createdAt': '2025-01-15T10:00:00.000Z',
        'updatedAt': '2025-01-16T12:30:00.000Z',
      };

      final notebook = Notebook.fromJson(json);

      expect(notebook.id, 'nb-1');
      expect(notebook.title, 'Test Notebook');
      expect(notebook.content, 'Some notes');
      expect(notebook.defaultMethod, 'cornell');
      expect(notebook.createdAt, DateTime.parse('2025-01-15T10:00:00.000Z'));
      expect(notebook.updatedAt, DateTime.parse('2025-01-16T12:30:00.000Z'));
    });

    test('fromJson defaults content to empty string when null', () {
      final json = {
        'id': 'nb-2',
        'title': 'Empty',
        'content': null,
        'createdAt': '2025-01-15T10:00:00.000Z',
        'updatedAt': '2025-01-15T10:00:00.000Z',
      };

      final notebook = Notebook.fromJson(json);
      expect(notebook.content, '');
    });

    test('fromJson defaults defaultMethod to blank when null', () {
      final json = {
        'id': 'nb-3',
        'title': 'No Method',
        'content': '',
        'createdAt': '2025-01-15T10:00:00.000Z',
        'updatedAt': '2025-01-15T10:00:00.000Z',
      };

      final notebook = Notebook.fromJson(json);
      expect(notebook.defaultMethod, 'blank');
    });

    test('copyWith creates new instance with updated fields', () {
      final notebook = Notebook(
        id: 'nb-1',
        title: 'Original',
        content: 'Old content',
        defaultMethod: 'blank',
        createdAt: DateTime(2025, 1, 1),
        updatedAt: DateTime(2025, 1, 1),
      );

      final updated = notebook.copyWith(title: 'New Title', content: 'New content');

      expect(updated.id, 'nb-1');
      expect(updated.title, 'New Title');
      expect(updated.content, 'New content');
      expect(updated.defaultMethod, 'blank');
      expect(updated.createdAt, notebook.createdAt);
    });

    test('copyWith preserves fields when not specified', () {
      final notebook = Notebook(
        id: 'nb-1',
        title: 'Keep',
        content: 'Keep content',
        defaultMethod: 'cornell',
        createdAt: DateTime(2025, 1, 1),
        updatedAt: DateTime(2025, 1, 1),
      );

      final updated = notebook.copyWith();

      expect(updated.title, 'Keep');
      expect(updated.content, 'Keep content');
      expect(updated.defaultMethod, 'cornell');
    });

    test('copyWith updates defaultMethod', () {
      final notebook = Notebook(
        id: 'nb-1',
        title: 'Test',
        content: '',
        defaultMethod: 'blank',
        createdAt: DateTime(2025, 1, 1),
        updatedAt: DateTime(2025, 1, 1),
      );

      final updated = notebook.copyWith(defaultMethod: 'outlining');
      expect(updated.defaultMethod, 'outlining');
    });
  });
}
