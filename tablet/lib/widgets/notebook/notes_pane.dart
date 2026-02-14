import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/notes_provider.dart';
import '../../theme/colors.dart';

class NotesPane extends ConsumerStatefulWidget {
  final String notebookId;

  const NotesPane({super.key, required this.notebookId});

  @override
  ConsumerState<NotesPane> createState() => _NotesPaneState();
}

class _NotesPaneState extends ConsumerState<NotesPane> {
  final _controller = TextEditingController();
  bool _initialized = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _formatLastSaved(DateTime? lastSaved) {
    if (lastSaved == null) return '';
    final diff = DateTime.now().difference(lastSaved);
    if (diff.inSeconds < 5) return 'Just saved';
    if (diff.inMinutes < 1) return 'Saved ${diff.inSeconds}s ago';
    return 'Saved ${diff.inMinutes}m ago';
  }

  @override
  Widget build(BuildContext context) {
    final notesState = ref.watch(notesProvider(widget.notebookId));

    // Sync controller with provider on first load
    if (!_initialized && notesState.content.isNotEmpty) {
      _controller.text = notesState.content;
      _initialized = true;
    }

    return Column(
      children: [
        // Header
        Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              const Icon(Icons.edit_note, size: 20, color: AppColors.textSecondary),
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
              if (notesState.isSaving)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              else
                Text(
                  _formatLastSaved(notesState.lastSaved),
                  style: const TextStyle(fontSize: 12, color: AppColors.textTertiary),
                ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: notesState.isSaving
                    ? null
                    : () => ref.read(notesProvider(widget.notebookId).notifier).save(),
                icon: const Icon(Icons.save_outlined, size: 20),
                tooltip: 'Save now',
                style: IconButton.styleFrom(
                  foregroundColor: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1),

        // Text editor
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _controller,
              maxLines: null,
              expands: true,
              textAlignVertical: TextAlignVertical.top,
              onChanged: (value) {
                ref.read(notesProvider(widget.notebookId).notifier).updateContent(value);
              },
              decoration: const InputDecoration(
                hintText: 'Take notes here...\n\nContent from Q&A can be added using the note button.',
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.zero,
              ),
              style: const TextStyle(fontSize: 14, height: 1.6, color: AppColors.textPrimary),
            ),
          ),
        ),

        // Footer
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            border: Border(top: BorderSide(color: AppColors.borderLight)),
          ),
          child: Align(
            alignment: Alignment.centerRight,
            child: Text(
              '${notesState.content.length} characters',
              style: const TextStyle(fontSize: 11, color: AppColors.textTertiary),
            ),
          ),
        ),
      ],
    );
  }
}
