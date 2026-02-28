import 'package:dio/dio.dart';

import '../models/note.dart';

/// Manages note CRUD operations via the API.
class NoteService {
  final Dio _dio;

  /// Creates a [NoteService] backed by [_dio].
  NoteService(this._dio);

  /// Fetches all notes for a notebook.
  Future<List<Note>> getAll(
    String notebookId,
  ) async {
    final response = await _dio.get(
      '/notebooks/$notebookId/notes',
    );
    final list =
        response.data['notes'] as List;
    return list
        .map(
          (j) => Note.fromJson(
            j as Map<String, dynamic>,
          ),
        )
        .toList();
  }

  /// Creates a new note in a notebook.
  Future<Note> create(
    String notebookId, {
    String? title,
    String? content,
  }) async {
    final response = await _dio.post(
      '/notebooks/$notebookId/notes',
      data: {
        // ignore: use_null_aware_elements
        if (title != null) 'title': title,
        // ignore: use_null_aware_elements
        if (content != null) 'content': content,
      },
    );
    return Note.fromJson(
      response.data['note']
          as Map<String, dynamic>,
    );
  }

  /// Updates a note's title, content, and/or method.
  Future<Note> update(
    String notebookId,
    String noteId, {
    String? title,
    String? content,
    String? method,
  }) async {
    final response = await _dio.put(
      '/notebooks/$notebookId/notes/$noteId',
      data: {
        // ignore: use_null_aware_elements
        if (title != null) 'title': title,
        // ignore: use_null_aware_elements
        if (content != null) 'content': content,
        // ignore: use_null_aware_elements
        if (method != null) 'method': method,
      },
    );
    return Note.fromJson(
      response.data['note']
          as Map<String, dynamic>,
    );
  }

  /// Deletes a note from a notebook.
  Future<void> delete(
    String notebookId,
    String noteId,
  ) async {
    await _dio.delete(
      '/notebooks/$notebookId/notes/$noteId',
    );
  }

  /// Reorders notes within a notebook.
  Future<List<Note>> reorder(
    String notebookId,
    List<String> noteIds,
  ) async {
    final response = await _dio.put(
      '/notebooks/$notebookId/notes/reorder',
      data: {'noteIds': noteIds},
    );
    final list =
        response.data['notes'] as List;
    return list
        .map(
          (j) => Note.fromJson(
            j as Map<String, dynamic>,
          ),
        )
        .toList();
  }
}
