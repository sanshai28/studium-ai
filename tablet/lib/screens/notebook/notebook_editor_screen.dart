import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../providers/notebook_provider.dart';
import '../../providers/notes_provider.dart';
import '../../providers/source_provider.dart';
import '../../theme/colors.dart';
import '../../widgets/notebook/notes_pane.dart';
import '../../widgets/notebook/qa_pane.dart';
import '../../widgets/notebook/sources_pane.dart';

class NotebookEditorScreen extends ConsumerStatefulWidget {
  final String notebookId;

  const NotebookEditorScreen({super.key, required this.notebookId});

  @override
  ConsumerState<NotebookEditorScreen> createState() =>
      _NotebookEditorScreenState();
}

class _NotebookEditorScreenState extends ConsumerState<NotebookEditorScreen> {
  bool _notesInitialized = false;
  int _selectedPaneIndex = 0; // For portrait mode tab navigation

  @override
  Widget build(BuildContext context) {
    final notebookAsync = ref.watch(notebookProvider(widget.notebookId));
    final sourcesAsync = ref.watch(sourcesProvider(widget.notebookId));

    // Initialize notes content from notebook
    if (!_notesInitialized) {
      notebookAsync.whenData((notebook) {
        ref
            .read(notesProvider(widget.notebookId).notifier)
            .setInitialContent(notebook.content);
        _notesInitialized = true;
      });
    }

    final hasSources = sourcesAsync.whenOrNull(data: (s) => s.isNotEmpty) ?? false;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/notebooks'),
        ),
        title: notebookAsync.when(
          loading: () => const Text('Loading...'),
          error: (_, _) => const Text('Notebook'),
          data: (notebook) => Text(
            notebook.title,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 18),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            tooltip: 'Rename notebook',
            onPressed: () => _renameNotebook(notebookAsync.valueOrNull?.title),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: notebookAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: AppColors.error),
              const SizedBox(height: 16),
              Text('Failed to load notebook: $error'),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.invalidate(notebookProvider(widget.notebookId)),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (_) => LayoutBuilder(
          builder: (context, constraints) {
            final isWide = constraints.maxWidth > 700;

            if (isWide) {
              return _buildLandscapeLayout(hasSources);
            } else {
              return _buildPortraitLayout(hasSources);
            }
          },
        ),
      ),
    );
  }

  Widget _buildLandscapeLayout(bool hasSources) {
    return Row(
      children: [
        // Sources pane
        Expanded(
          flex: 1,
          child: Container(
            decoration: const BoxDecoration(
              border: Border(right: BorderSide(color: AppColors.borderLight)),
            ),
            child: SourcesPane(notebookId: widget.notebookId),
          ),
        ),
        // Q&A pane
        Expanded(
          flex: 2,
          child: Container(
            decoration: const BoxDecoration(
              border: Border(right: BorderSide(color: AppColors.borderLight)),
            ),
            child: QAPane(
              notebookId: widget.notebookId,
              hasSources: hasSources,
              onAddToNotes: (content) {
                ref
                    .read(notesProvider(widget.notebookId).notifier)
                    .addToNotes(content);
              },
            ),
          ),
        ),
        // Notes pane
        Expanded(
          flex: 2,
          child: NotesPane(notebookId: widget.notebookId),
        ),
      ],
    );
  }

  Widget _buildPortraitLayout(bool hasSources) {
    return Column(
      children: [
        // Tab bar
        Container(
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: AppColors.borderLight)),
          ),
          child: Row(
            children: [
              _buildTab(0, Icons.source, 'Sources'),
              _buildTab(1, Icons.chat_outlined, 'Q&A'),
              _buildTab(2, Icons.edit_note, 'Notes'),
            ],
          ),
        ),
        // Active pane
        Expanded(
          child: IndexedStack(
            index: _selectedPaneIndex,
            children: [
              SourcesPane(notebookId: widget.notebookId),
              QAPane(
                notebookId: widget.notebookId,
                hasSources: hasSources,
                onAddToNotes: (content) {
                  ref
                      .read(notesProvider(widget.notebookId).notifier)
                      .addToNotes(content);
                  setState(() => _selectedPaneIndex = 2);
                },
              ),
              NotesPane(notebookId: widget.notebookId),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTab(int index, IconData icon, String label) {
    final isSelected = _selectedPaneIndex == index;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedPaneIndex = index),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isSelected ? AppColors.primary : Colors.transparent,
                width: 2,
              ),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected ? AppColors.primary : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _renameNotebook(String? currentTitle) async {
    final controller = TextEditingController(text: currentTitle ?? '');
    final newTitle = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Rename notebook'),
        content: TextField(
          controller: controller,
          autofocus: true,
          decoration: const InputDecoration(labelText: 'Title'),
          onSubmitted: (v) => Navigator.pop(context, v.trim()),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, controller.text.trim()),
            child: const Text('Rename'),
          ),
        ],
      ),
    );
    controller.dispose();

    if (newTitle == null || newTitle.isEmpty || newTitle == currentTitle) return;

    try {
      final service = ref.read(notebookServiceProvider);
      await service.update(widget.notebookId, title: newTitle);
      ref.invalidate(notebookProvider(widget.notebookId));
      ref.invalidate(notebooksProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to rename: $e')),
        );
      }
    }
  }
}
