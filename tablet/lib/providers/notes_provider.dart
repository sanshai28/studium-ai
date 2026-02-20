import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'notebook_provider.dart';

/// Immutable state for the notes editor.
class NotesState {
  /// The current notes content.
  final String content;

  /// Whether a save is in progress.
  final bool isSaving;

  /// Timestamp of the last successful save.
  final DateTime? lastSaved;

  /// Creates a [NotesState].
  const NotesState({
    this.content = '',
    this.isSaving = false,
    this.lastSaved,
  });

  /// Returns a copy with the given fields.
  NotesState copyWith({
    String? content,
    bool? isSaving,
    DateTime? lastSaved,
  }) {
    return NotesState(
      content: content ?? this.content,
      isSaving: isSaving ?? this.isSaving,
      lastSaved:
          lastSaved ?? this.lastSaved,
    );
  }
}

/// Manages notes content with auto-save.
class NotesNotifier
    extends FamilyNotifier<NotesState, String> {
  Timer? _debounceTimer;

  /// Builds initial state and registers cleanup.
  @override
  NotesState build(String arg) {
    ref.onDispose(
      () => _debounceTimer?.cancel(),
    );
    return const NotesState();
  }

  /// Sets notes content without triggering save.
  void setInitialContent(String content) {
    state = state.copyWith(content: content);
  }

  /// Updates content and schedules auto-save
  /// after a 2-second debounce.
  void updateContent(String content) {
    state = state.copyWith(content: content);
    _debounceTimer?.cancel();
    _debounceTimer = Timer(
      const Duration(seconds: 2),
      () => save(),
    );
  }

  /// Appends [text] to notes with a divider.
  void addToNotes(String text) {
    final current = state.content;
    final newContent = current.isEmpty
        ? text
        : '$current\n\n---\n\n$text';
    updateContent(newContent);
  }

  /// Persists current content to the backend.
  Future<void> save() async {
    state = state.copyWith(isSaving: true);
    try {
      final service =
          ref.read(notebookServiceProvider);
      await service.update(
        arg,
        content: state.content,
      );
      state = state.copyWith(
        isSaving: false,
        lastSaved: DateTime.now(),
      );
    } catch (e) {
      state = state.copyWith(isSaving: false);
    }
  }
}

/// Family provider for notes state keyed by
/// notebook ID.
final notesProvider = NotifierProvider
    .family<NotesNotifier, NotesState, String>(
  NotesNotifier.new,
);
