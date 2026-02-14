import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'notebook_provider.dart';

class NotesState {
  final String content;
  final bool isSaving;
  final DateTime? lastSaved;

  const NotesState({
    this.content = '',
    this.isSaving = false,
    this.lastSaved,
  });

  NotesState copyWith({String? content, bool? isSaving, DateTime? lastSaved}) {
    return NotesState(
      content: content ?? this.content,
      isSaving: isSaving ?? this.isSaving,
      lastSaved: lastSaved ?? this.lastSaved,
    );
  }
}

class NotesNotifier extends FamilyNotifier<NotesState, String> {
  Timer? _debounceTimer;

  @override
  NotesState build(String arg) {
    ref.onDispose(() => _debounceTimer?.cancel());
    return const NotesState();
  }

  void setInitialContent(String content) {
    state = state.copyWith(content: content);
  }

  void updateContent(String content) {
    state = state.copyWith(content: content);
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(seconds: 2), () => save());
  }

  void addToNotes(String text) {
    final newContent = state.content.isEmpty ? text : '${state.content}\n\n---\n\n$text';
    updateContent(newContent);
  }

  Future<void> save() async {
    state = state.copyWith(isSaving: true);
    try {
      final service = ref.read(notebookServiceProvider);
      await service.update(arg, content: state.content);
      state = state.copyWith(isSaving: false, lastSaved: DateTime.now());
    } catch (e) {
      state = state.copyWith(isSaving: false);
    }
  }
}

final notesProvider =
    NotifierProvider.family<NotesNotifier, NotesState, String>(
  NotesNotifier.new,
);
