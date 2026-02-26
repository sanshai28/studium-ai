import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/note.dart';
import '../../providers/note_provider.dart';
import '../../theme/colors.dart';

/// Multi-note pane with sidebar and editor area.
class NotesPane extends ConsumerStatefulWidget {
  /// The notebook ID for notes.
  final String notebookId;

  /// Creates a [NotesPane].
  const NotesPane({
    super.key,
    required this.notebookId,
  });

  @override
  ConsumerState<NotesPane> createState() =>
      _NotesPaneState();
}

class _NotesPaneState
    extends ConsumerState<NotesPane> {
  final _editorController =
      TextEditingController();
  final _titleController =
      TextEditingController();
  String? _currentEditorNoteId;

  @override
  void dispose() {
    _editorController.dispose();
    _titleController.dispose();
    super.dispose();
  }

  String _formatLastSaved(DateTime? lastSaved) {
    if (lastSaved == null) return '';
    final diff =
        DateTime.now().difference(lastSaved);
    if (diff.inSeconds < 5) return 'Just saved';
    if (diff.inMinutes < 1) {
      return 'Saved ${diff.inSeconds}s ago';
    }
    return 'Saved ${diff.inMinutes}m ago';
  }

  void _syncEditorToNote(Note note) {
    if (_currentEditorNoteId != note.id) {
      _editorController.text = note.content;
      _titleController.text = note.title;
      _currentEditorNoteId = note.id;
    }
  }

  @override
  Widget build(BuildContext context) {
    final notesState = ref.watch(
      notesListProvider(widget.notebookId),
    );
    final activeNoteId = ref.watch(
      activeNoteIdProvider(widget.notebookId),
    );

    final notes = notesState.notes;
    final activeNote = activeNoteId != null
        ? notes
            .where((n) => n.id == activeNoteId)
            .firstOrNull
        : null;

    // Sync editor controller when active note
    // changes or content updated externally.
    if (activeNote != null) {
      _syncEditorToNote(activeNote);
    } else {
      _currentEditorNoteId = null;
    }

    if (notesState.isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    return Row(
      children: [
        // Sidebar
        SizedBox(
          width: 180,
          child: _NotesSidebar(
            notebookId: widget.notebookId,
            notes: notes,
            activeNoteId: activeNoteId,
            onSelect: (id) {
              ref
                  .read(
                    activeNoteIdProvider(
                      widget.notebookId,
                    ).notifier,
                  )
                  .state = id;
            },
            onCreate: () {
              ref
                  .read(
                    notesListProvider(
                      widget.notebookId,
                    ).notifier,
                  )
                  .create();
            },
            onDelete: (id) =>
                _confirmDelete(id),
            onRename: (id, title) {
              ref
                  .read(
                    notesListProvider(
                      widget.notebookId,
                    ).notifier,
                  )
                  .rename(id, title);
            },
            onReorder: (noteIds) {
              ref
                  .read(
                    notesListProvider(
                      widget.notebookId,
                    ).notifier,
                  )
                  .reorder(noteIds);
            },
          ),
        ),
        const VerticalDivider(width: 1),
        // Editor area
        Expanded(
          child: activeNote != null
              ? _NoteEditor(
                  note: activeNote,
                  editorController:
                      _editorController,
                  titleController:
                      _titleController,
                  isSaving: notesState.isSaving,
                  lastSavedText:
                      _formatLastSaved(
                    notesState.lastSaved,
                  ),
                  onContentChanged: (value) {
                    ref
                        .read(
                          notesListProvider(
                            widget.notebookId,
                          ).notifier,
                        )
                        .updateContent(
                          activeNote.id,
                          value,
                        );
                  },
                  onTitleChanged: (value) {
                    ref
                        .read(
                          notesListProvider(
                            widget.notebookId,
                          ).notifier,
                        )
                        .rename(
                          activeNote.id,
                          value,
                        );
                  },
                  onSave: () {
                    ref
                        .read(
                          notesListProvider(
                            widget.notebookId,
                          ).notifier,
                        )
                        .saveNow(activeNote.id);
                  },
                )
              : _EmptyEditor(
                  onCreate: () {
                    ref
                        .read(
                          notesListProvider(
                            widget.notebookId,
                          ).notifier,
                        )
                        .create();
                  },
                ),
        ),
      ],
    );
  }

  Future<void> _confirmDelete(
    String noteId,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete note'),
        content: const Text(
          'Are you sure? This cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () =>
                Navigator.pop(context, true),
            style: TextButton.styleFrom(
              foregroundColor: AppColors.error,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      ref
          .read(
            notesListProvider(
              widget.notebookId,
            ).notifier,
          )
          .delete(noteId);
    }
  }
}

/// Sidebar showing note list with actions.
class _NotesSidebar extends StatelessWidget {
  const _NotesSidebar({
    required this.notebookId,
    required this.notes,
    required this.activeNoteId,
    required this.onSelect,
    required this.onCreate,
    required this.onDelete,
    required this.onRename,
    required this.onReorder,
  });

  final String notebookId;
  final List<Note> notes;
  final String? activeNoteId;
  final void Function(String id) onSelect;
  final VoidCallback onCreate;
  final void Function(String id) onDelete;
  final void Function(String id, String title)
      onRename;
  final void Function(List<String> noteIds)
      onReorder;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 12,
            vertical: 8,
          ),
          child: Row(
            children: [
              const Icon(
                Icons.edit_note,
                size: 18,
                color: AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              const Text(
                'Notes',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const Spacer(),
              IconButton(
                onPressed: onCreate,
                icon: const Icon(
                  Icons.add,
                  size: 20,
                ),
                tooltip: 'New note',
                style: IconButton.styleFrom(
                  foregroundColor:
                      AppColors.primary,
                ),
                constraints:
                    const BoxConstraints(),
                padding:
                    const EdgeInsets.all(4),
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        // Note list
        Expanded(
          child: notes.isEmpty
              ? const Center(
                  child: Padding(
                    padding:
                        EdgeInsets.all(16),
                    child: Text(
                      'No notes yet',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors
                            .textTertiary,
                      ),
                    ),
                  ),
                )
              : ReorderableListView.builder(
                  buildDefaultDragHandles:
                      false,
                  itemCount: notes.length,
                  onReorder:
                      (oldIndex, newIndex) {
                    if (newIndex > oldIndex) {
                      newIndex--;
                    }
                    final ids = notes
                        .map((n) => n.id)
                        .toList();
                    final id =
                        ids.removeAt(oldIndex);
                    ids.insert(newIndex, id);
                    onReorder(ids);
                  },
                  itemBuilder:
                      (context, index) {
                    final note = notes[index];
                    final isActive =
                        note.id == activeNoteId;
                    return _NoteListItem(
                      key: ValueKey(note.id),
                      note: note,
                      index: index,
                      isActive: isActive,
                      onSelect: () =>
                          onSelect(note.id),
                      onDelete: () =>
                          onDelete(note.id),
                      onRename: (title) =>
                          onRename(
                        note.id,
                        title,
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _NoteListItem extends StatelessWidget {
  const _NoteListItem({
    super.key,
    required this.note,
    required this.index,
    required this.isActive,
    required this.onSelect,
    required this.onDelete,
    required this.onRename,
  });

  final Note note;
  final int index;
  final bool isActive;
  final VoidCallback onSelect;
  final VoidCallback onDelete;
  final void Function(String title) onRename;

  @override
  Widget build(BuildContext context) {
    return ReorderableDragStartListener(
      index: index,
      child: Material(
        color: isActive
            ? AppColors.primary
                .withValues(alpha: 0.1)
            : Colors.transparent,
        child: InkWell(
          onTap: onSelect,
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 8,
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.drag_indicator,
                  size: 16,
                  color: AppColors.textTertiary,
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    note.title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: isActive
                          ? FontWeight.w600
                          : FontWeight.w400,
                      color: isActive
                          ? AppColors.primary
                          : AppColors
                              .textPrimary,
                    ),
                    maxLines: 1,
                    overflow:
                        TextOverflow.ellipsis,
                  ),
                ),
                PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'rename') {
                      _showRenameDialog(context);
                    }
                    if (value == 'delete') {
                      onDelete();
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'rename',
                      child: Row(
                        children: [
                          Icon(
                            Icons.edit_outlined,
                            size: 18,
                            color: AppColors
                                .textSecondary,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Rename',
                            style: TextStyle(
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(
                            Icons.delete_outline,
                            size: 18,
                            color:
                                AppColors.error,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Delete',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors
                                  .error,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  icon: const Icon(
                    Icons.more_vert,
                    size: 16,
                    color:
                        AppColors.textTertiary,
                  ),
                  padding: EdgeInsets.zero,
                  constraints:
                      const BoxConstraints(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showRenameDialog(
    BuildContext context,
  ) {
    final controller = TextEditingController(
      text: note.title,
    );
    showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Rename note'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Title',
          ),
          onSubmitted: (v) =>
              Navigator.pop(context, v.trim()),
        ),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(
              context,
              controller.text.trim(),
            ),
            child: const Text('Rename'),
          ),
        ],
      ),
    ).then((newTitle) {
      controller.dispose();
      if (newTitle != null &&
          newTitle.isNotEmpty &&
          newTitle != note.title) {
        onRename(newTitle);
      }
    });
  }
}

/// Editor area for the active note.
class _NoteEditor extends StatelessWidget {
  const _NoteEditor({
    required this.note,
    required this.editorController,
    required this.titleController,
    required this.isSaving,
    required this.lastSavedText,
    required this.onContentChanged,
    required this.onTitleChanged,
    required this.onSave,
  });

  final Note note;
  final TextEditingController editorController;
  final TextEditingController titleController;
  final bool isSaving;
  final String lastSavedText;
  final ValueChanged<String> onContentChanged;
  final ValueChanged<String> onTitleChanged;
  final VoidCallback onSave;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header with save status
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 8,
          ),
          child: Row(
            children: [
              if (isSaving)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child:
                      CircularProgressIndicator(
                    strokeWidth: 2,
                  ),
                )
              else
                Text(
                  lastSavedText,
                  style: const TextStyle(
                    fontSize: 12,
                    color:
                        AppColors.textTertiary,
                  ),
                ),
              const Spacer(),
              IconButton(
                onPressed:
                    isSaving ? null : onSave,
                icon: const Icon(
                  Icons.save_outlined,
                  size: 20,
                ),
                tooltip: 'Save now',
                style: IconButton.styleFrom(
                  foregroundColor:
                      AppColors.primary,
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        // Editable title
        Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 8,
          ),
          child: TextField(
            controller: titleController,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
            decoration: const InputDecoration(
              hintText: 'Note title',
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              contentPadding: EdgeInsets.zero,
              isDense: true,
            ),
            onSubmitted: onTitleChanged,
            onEditingComplete: () {
              onTitleChanged(
                titleController.text.trim(),
              );
            },
          ),
        ),
        const Divider(height: 1),
        // Content editor
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: editorController,
              maxLines: null,
              expands: true,
              textAlignVertical:
                  TextAlignVertical.top,
              onChanged: onContentChanged,
              decoration: const InputDecoration(
                hintText:
                    'Take notes here...\n\n'
                    'Content from Q&A can be '
                    'added using the note '
                    'button.',
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.zero,
              ),
              style: const TextStyle(
                fontSize: 14,
                height: 1.6,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Empty state when no note is selected.
class _EmptyEditor extends StatelessWidget {
  const _EmptyEditor({required this.onCreate});

  final VoidCallback onCreate;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.note_add_outlined,
            size: 48,
            color: AppColors.textTertiary,
          ),
          const SizedBox(height: 16),
          const Text(
            'Select a note or create a new one',
            style: TextStyle(
              fontSize: 15,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: onCreate,
            icon: const Icon(Icons.add, size: 18),
            label: const Text('Create Note'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }
}
