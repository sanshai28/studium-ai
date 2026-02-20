import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/notes_provider.dart';
import '../../theme/colors.dart';

/// The notes editor pane with auto-save.
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
  final _controller = TextEditingController();
  bool _initialized = false;

  @override
  void dispose() {
    _controller.dispose();
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

  @override
  Widget build(BuildContext context) {
    final notesState = ref.watch(
      notesProvider(widget.notebookId),
    );

    if (!_initialized &&
        notesState.content.isNotEmpty) {
      _controller.text = notesState.content;
      _initialized = true;
    }

    return Column(
      children: [
        _NotesHeader(
          isSaving: notesState.isSaving,
          lastSavedText: _formatLastSaved(
            notesState.lastSaved,
          ),
          onSave: () => ref
              .read(
                notesProvider(widget.notebookId)
                    .notifier,
              )
              .save(),
        ),
        const Divider(height: 1),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _controller,
              maxLines: null,
              expands: true,
              textAlignVertical:
                  TextAlignVertical.top,
              onChanged: (value) {
                ref
                    .read(
                      notesProvider(
                        widget.notebookId,
                      ).notifier,
                    )
                    .updateContent(value);
              },
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
        _NotesFooter(
          characterCount:
              notesState.content.length,
        ),
      ],
    );
  }
}

class _NotesHeader extends StatelessWidget {
  const _NotesHeader({
    required this.isSaving,
    required this.lastSavedText,
    required this.onSave,
  });

  final bool isSaving;
  final String lastSavedText;
  final VoidCallback onSave;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          const Icon(
            Icons.edit_note,
            size: 20,
            color: AppColors.textSecondary,
          ),
          const SizedBox(width: 8),
          const Text(
            'Notes',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const Spacer(),
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
                color: AppColors.textTertiary,
              ),
            ),
          const SizedBox(width: 8),
          IconButton(
            onPressed:
                isSaving ? null : onSave,
            icon: const Icon(
              Icons.save_outlined,
              size: 20,
            ),
            tooltip: 'Save now',
            style: IconButton.styleFrom(
              foregroundColor: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _NotesFooter extends StatelessWidget {
  const _NotesFooter({
    required this.characterCount,
  });

  final int characterCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 8,
      ),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: AppColors.borderLight,
          ),
        ),
      ),
      child: Align(
        alignment: Alignment.centerRight,
        child: Text(
          '$characterCount characters',
          style: const TextStyle(
            fontSize: 11,
            color: AppColors.textTertiary,
          ),
        ),
      ),
    );
  }
}
