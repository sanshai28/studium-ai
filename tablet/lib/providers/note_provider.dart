import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/note.dart';
import '../services/note_service.dart';
import 'auth_provider.dart';

/// Provider for [NoteService].
final noteServiceProvider =
    Provider<NoteService>((ref) {
  return NoteService(
    ref.read(apiClientProvider).dio,
  );
});

/// Tracks the active (selected) note ID per
/// notebook.
final activeNoteIdProvider =
    StateProvider.family<String?, String>(
  (ref, notebookId) => null,
);

/// State for the notes list including auto-save.
class NotesListState {
  final List<Note> notes;
  final bool isLoading;
  final bool isSaving;
  final DateTime? lastSaved;
  final String? error;

  const NotesListState({
    this.notes = const [],
    this.isLoading = false,
    this.isSaving = false,
    this.lastSaved,
    this.error,
  });

  NotesListState copyWith({
    List<Note>? notes,
    bool? isLoading,
    bool? isSaving,
    DateTime? lastSaved,
    String? error,
  }) {
    return NotesListState(
      notes: notes ?? this.notes,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      lastSaved: lastSaved ?? this.lastSaved,
      error: error,
    );
  }
}

/// Manages the multi-note system for a notebook.
class NotesListNotifier
    extends FamilyNotifier<NotesListState, String> {
  Timer? _debounceTimer;

  @override
  NotesListState build(String arg) {
    ref.onDispose(
      () => _debounceTimer?.cancel(),
    );
    // Trigger initial fetch.
    _fetchNotes();
    return const NotesListState(isLoading: true);
  }

  Future<void> _fetchNotes() async {
    try {
      final service =
          ref.read(noteServiceProvider);
      final notes = await service.getAll(arg);
      final sorted = [...notes]
        ..sort((a, b) => a.order.compareTo(b.order));
      state = state.copyWith(
        notes: sorted,
        isLoading: false,
      );
      // Auto-select first note if none selected.
      if (sorted.isNotEmpty) {
        final active =
            ref.read(activeNoteIdProvider(arg));
        if (active == null) {
          ref
              .read(
                activeNoteIdProvider(arg)
                    .notifier,
              )
              .state = sorted.first.id;
        }
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load notes',
      );
    }
  }

  /// Refreshes the notes list from the API.
  Future<void> refresh() async {
    state = state.copyWith(isLoading: true);
    await _fetchNotes();
  }

  /// Creates a new note and selects it.
  Future<Note?> create({
    String? title,
    String? content,
  }) async {
    try {
      final service =
          ref.read(noteServiceProvider);
      final note = await service.create(
        arg,
        title: title,
        content: content,
      );
      state = state.copyWith(
        notes: [...state.notes, note],
      );
      ref
          .read(
            activeNoteIdProvider(arg).notifier,
          )
          .state = note.id;
      return note;
    } catch (e) {
      return null;
    }
  }

  /// Deletes a note by [noteId].
  Future<void> delete(String noteId) async {
    try {
      final service =
          ref.read(noteServiceProvider);
      await service.delete(arg, noteId);
      final remaining = state.notes
          .where((n) => n.id != noteId)
          .toList();
      state = state.copyWith(notes: remaining);
      // If deleted note was active, select first.
      final active =
          ref.read(activeNoteIdProvider(arg));
      if (active == noteId) {
        ref
            .read(
              activeNoteIdProvider(arg).notifier,
            )
            .state = remaining.isNotEmpty
            ? remaining.first.id
            : null;
      }
    } catch (_) {}
  }

  /// Renames a note.
  Future<void> rename(
    String noteId,
    String newTitle,
  ) async {
    // Optimistic update.
    state = state.copyWith(
      notes: state.notes
          .map(
            (n) => n.id == noteId
                ? n.copyWith(title: newTitle)
                : n,
          )
          .toList(),
    );
    try {
      final service =
          ref.read(noteServiceProvider);
      await service.update(
        arg,
        noteId,
        title: newTitle,
      );
    } catch (_) {}
  }

  /// Updates a note's content locally and
  /// schedules an auto-save after 2 seconds.
  void updateContent(
    String noteId,
    String content,
  ) {
    state = state.copyWith(
      notes: state.notes
          .map(
            (n) => n.id == noteId
                ? n.copyWith(content: content)
                : n,
          )
          .toList(),
    );
    _debounceTimer?.cancel();
    _debounceTimer = Timer(
      const Duration(seconds: 2),
      () => _saveContent(noteId, content),
    );
  }

  Future<void> _saveContent(
    String noteId,
    String content,
  ) async {
    state = state.copyWith(isSaving: true);
    try {
      final service =
          ref.read(noteServiceProvider);
      await service.update(
        arg,
        noteId,
        content: content,
      );
      state = state.copyWith(
        isSaving: false,
        lastSaved: DateTime.now(),
      );
    } catch (_) {
      state = state.copyWith(isSaving: false);
    }
  }

  /// Immediately saves the active note.
  Future<void> saveNow(String noteId) async {
    _debounceTimer?.cancel();
    final note =
        state.notes.where((n) => n.id == noteId);
    if (note.isEmpty) return;
    await _saveContent(
      noteId,
      note.first.content,
    );
  }

  /// Appends text to the active note or
  /// creates a new note if none is active.
  Future<void> addToNotes(String text) async {
    final activeId =
        ref.read(activeNoteIdProvider(arg));
    if (activeId != null) {
      final note = state.notes.firstWhere(
        (n) => n.id == activeId,
        orElse: () => state.notes.first,
      );
      final current = note.content;
      final newContent = current.isEmpty
          ? text
          : '$current\n\n---\n\n$text';
      updateContent(activeId, newContent);
    } else {
      await create(
        title: 'From Q&A',
        content: text,
      );
    }
  }

  /// Reorders notes by dragging.
  Future<void> reorder(
    List<String> noteIds,
  ) async {
    try {
      final service =
          ref.read(noteServiceProvider);
      final reordered =
          await service.reorder(arg, noteIds);
      final sorted = [...reordered]
        ..sort((a, b) => a.order.compareTo(b.order));
      state = state.copyWith(notes: sorted);
    } catch (_) {}
  }
}

/// Family provider for notes state keyed by
/// notebook ID.
final notesListProvider = NotifierProvider.family<
    NotesListNotifier, NotesListState, String>(
  NotesListNotifier.new,
);
