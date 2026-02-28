import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/routes.dart';
import '../../constants/note_methods.dart';
import '../../providers/note_provider.dart';
import '../../providers/notebook_provider.dart';
import '../../providers/source_provider.dart';
import '../../theme/colors.dart';
import '../../widgets/notebook/notes_pane.dart';
import '../../widgets/notebook/qa_pane.dart';
import '../../widgets/notebook/sources_pane.dart';

/// Three-pane editor screen for a single
/// notebook with sources, Q&A, and notes.
class NotebookEditorScreen
    extends ConsumerStatefulWidget {
  /// The ID of the notebook to edit.
  final String notebookId;

  /// Creates a [NotebookEditorScreen].
  const NotebookEditorScreen({
    super.key,
    required this.notebookId,
  });

  @override
  ConsumerState<NotebookEditorScreen>
      createState() =>
          _NotebookEditorScreenState();
}

class _NotebookEditorScreenState
    extends ConsumerState<
        NotebookEditorScreen> {
  int _selectedPaneIndex = 0;

  @override
  Widget build(BuildContext context) {
    final notebookAsync = ref.watch(
      notebookProvider(widget.notebookId),
    );
    final sourcesAsync = ref.watch(
      sourcesProvider(widget.notebookId),
    );

    final hasSources = sourcesAsync.whenOrNull(
          data: (s) => s.isNotEmpty,
        ) ??
        false;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () =>
              context.go(AppRoutes.notebooks),
        ),
        title: notebookAsync.when(
          loading: () =>
              const Text('Loading...'),
          error: (_, _) =>
              const Text('Notebook'),
          data: (notebook) => Text(
            notebook.title,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 18,
            ),
          ),
        ),
        actions: [
          // Method badge
          notebookAsync.whenOrNull(
                data: (notebook) =>
                    _MethodBadge(
                  notebookId: widget.notebookId,
                  currentMethod:
                      notebook.defaultMethod,
                ),
              ) ??
              const SizedBox.shrink(),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(
              Icons.edit_outlined,
            ),
            tooltip: 'Rename notebook',
            onPressed: () => _renameNotebook(
              notebookAsync.valueOrNull?.title,
            ),
          ),
          IconButton(
            icon: const Icon(
              Icons.delete_outline,
              color: AppColors.error,
            ),
            tooltip: 'Delete notebook',
            onPressed: () =>
                _deleteNotebook(
              notebookAsync.valueOrNull?.title,
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: notebookAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, _) => _EditorError(
          error: error,
          onRetry: () => ref.invalidate(
            notebookProvider(
              widget.notebookId,
            ),
          ),
        ),
        data: (_) => LayoutBuilder(
          builder: (context, constraints) {
            if (constraints.maxWidth > 700) {
              return _LandscapeLayout(
                notebookId: widget.notebookId,
                hasSources: hasSources,
              );
            }
            return _PortraitLayout(
              notebookId: widget.notebookId,
              hasSources: hasSources,
              selectedIndex:
                  _selectedPaneIndex,
              onTabChanged: (i) => setState(
                () => _selectedPaneIndex = i,
              ),
            );
          },
        ),
      ),
    );
  }

  Future<void> _renameNotebook(
    String? currentTitle,
  ) async {
    final controller = TextEditingController(
      text: currentTitle ?? '',
    );
    final newTitle = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Rename notebook'),
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
    );
    controller.dispose();

    if (newTitle == null ||
        newTitle.isEmpty ||
        newTitle == currentTitle) {
      return;
    }

    try {
      final service =
          ref.read(notebookServiceProvider);
      await service.update(
        widget.notebookId,
        title: newTitle,
      );
      ref.invalidate(
        notebookProvider(widget.notebookId),
      );
      ref.invalidate(notebooksProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(
          SnackBar(
            content: Text(
              'Failed to rename: $e',
            ),
          ),
        );
      }
    }
  }

  Future<void> _deleteNotebook(
    String? title,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete notebook'),
        content: Text(
          'Are you sure you want to delete '
          '"${title ?? 'this notebook'}"? '
          'This cannot be undone.',
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
    if (confirmed != true) return;

    try {
      await ref
          .read(notebooksProvider.notifier)
          .delete(widget.notebookId);
      if (mounted) {
        context.go(AppRoutes.notebooks);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(
          SnackBar(
            content: Text(
              'Failed to delete: $e',
            ),
          ),
        );
      }
    }
  }
}

/// Method badge button with dropdown picker.
class _MethodBadge extends ConsumerWidget {
  const _MethodBadge({
    required this.notebookId,
    required this.currentMethod,
  });

  final String notebookId;
  final String currentMethod;

  @override
  Widget build(
    BuildContext context,
    WidgetRef ref,
  ) {
    final method = noteMethodById(currentMethod);
    final notesState =
        ref.watch(notesListProvider(notebookId));
    final notesCount = notesState.notes.length;
    return PopupMenuButton<String>(
      onSelected: (newMethod) async {
        if (newMethod == currentMethod) return;
        try {
          await ref
              .read(notebooksProvider.notifier)
              .updateMethod(
                notebookId,
                newMethod,
              );
          ref.invalidate(
            notebookProvider(notebookId),
          );
          if (context.mounted) {
            final selected =
                noteMethodById(newMethod);
            ScaffoldMessenger.of(context)
                .showSnackBar(
              SnackBar(
                content: Text(
                  'New notes will use '
                  '${selected.name}. Your '
                  '$notesCount existing '
                  '${notesCount == 1 ? 'note' : 'notes'}'
                  ' won\'t change.',
                ),
              ),
            );
          }
        } catch (e) {
          if (context.mounted) {
            ScaffoldMessenger.of(context)
                .showSnackBar(
              SnackBar(
                content: Text(
                  'Failed to change method: $e',
                ),
              ),
            );
          }
        }
      },
      itemBuilder: (context) => [
        ...noteMethods.map(
          (m) => PopupMenuItem<String>(
            value: m.id,
            child: Row(
              children: [
                Icon(
                  m.icon,
                  size: 20,
                  color:
                      m.id == currentMethod
                          ? AppColors.primary
                          : AppColors
                              .textSecondary,
                ),
                const SizedBox(width: 12),
                Text(
                  m.name,
                  style: TextStyle(
                    fontWeight:
                        m.id == currentMethod
                            ? FontWeight.w600
                            : FontWeight.w400,
                    color:
                        m.id == currentMethod
                            ? AppColors.primary
                            : AppColors
                                .textPrimary,
                  ),
                ),
                if (m.id == currentMethod) ...[
                  const Spacer(),
                  const Icon(
                    Icons.check,
                    size: 18,
                    color: AppColors.primary,
                  ),
                ],
              ],
            ),
          ),
        ),
        const PopupMenuDivider(),
        PopupMenuItem<String>(
          enabled: false,
          height: 32,
          child: Text(
            'Only new notes will use the '
            'selected method. Your '
            '$notesCount existing '
            '${notesCount == 1 ? 'note' : 'notes'}'
            ' won\'t change.',
            style: TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 10,
          vertical: 4,
        ),
        decoration: BoxDecoration(
          color: AppColors.primary
              .withValues(alpha: 0.1),
          borderRadius:
              BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              method.icon,
              size: 16,
              color: AppColors.primary,
            ),
            const SizedBox(width: 4),
            Text(
              method.name,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: 4),
            const Icon(
              Icons.arrow_drop_down,
              size: 18,
              color: AppColors.primary,
            ),
          ],
        ),
      ),
    );
  }
}

class _EditorError extends StatelessWidget {
  const _EditorError({
    required this.error,
    required this.onRetry,
  });

  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.error_outline,
            size: 48,
            color: AppColors.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Failed to load notebook: $error',
          ),
          const SizedBox(height: 8),
          ElevatedButton(
            onPressed: onRetry,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

class _LandscapeLayout
    extends ConsumerWidget {
  const _LandscapeLayout({
    required this.notebookId,
    required this.hasSources,
  });

  final String notebookId;
  final bool hasSources;

  @override
  Widget build(
    BuildContext context,
    WidgetRef ref,
  ) {
    return Row(
      children: [
        Expanded(
          flex: 1,
          child: Container(
            decoration: const BoxDecoration(
              border: Border(
                right: BorderSide(
                  color: AppColors.borderLight,
                ),
              ),
            ),
            child: SourcesPane(
              notebookId: notebookId,
            ),
          ),
        ),
        Expanded(
          flex: 2,
          child: Container(
            decoration: const BoxDecoration(
              border: Border(
                right: BorderSide(
                  color: AppColors.borderLight,
                ),
              ),
            ),
            child: QAPane(
              notebookId: notebookId,
              hasSources: hasSources,
              onAddToNotes: (content) {
                ref
                    .read(
                      notesListProvider(
                        notebookId,
                      ).notifier,
                    )
                    .addToNotes(content);
              },
            ),
          ),
        ),
        Expanded(
          flex: 2,
          child: NotesPane(
            notebookId: notebookId,
          ),
        ),
      ],
    );
  }
}

class _PortraitLayout
    extends ConsumerWidget {
  const _PortraitLayout({
    required this.notebookId,
    required this.hasSources,
    required this.selectedIndex,
    required this.onTabChanged,
  });

  final String notebookId;
  final bool hasSources;
  final int selectedIndex;
  final ValueChanged<int> onTabChanged;

  @override
  Widget build(
    BuildContext context,
    WidgetRef ref,
  ) {
    return Column(
      children: [
        Container(
          decoration: const BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: AppColors.borderLight,
              ),
            ),
          ),
          child: Row(
            children: [
              _PaneTab(
                index: 0,
                icon: Icons.source,
                label: 'Sources',
                isSelected: selectedIndex == 0,
                onTap: () => onTabChanged(0),
              ),
              _PaneTab(
                index: 1,
                icon: Icons.chat_outlined,
                label: 'Q&A',
                isSelected: selectedIndex == 1,
                onTap: () => onTabChanged(1),
              ),
              _PaneTab(
                index: 2,
                icon: Icons.edit_note,
                label: 'Notes',
                isSelected: selectedIndex == 2,
                onTap: () => onTabChanged(2),
              ),
            ],
          ),
        ),
        Expanded(
          child: IndexedStack(
            index: selectedIndex,
            children: [
              SourcesPane(
                notebookId: notebookId,
              ),
              QAPane(
                notebookId: notebookId,
                hasSources: hasSources,
                onAddToNotes: (content) {
                  ref
                      .read(
                        notesListProvider(
                          notebookId,
                        ).notifier,
                      )
                      .addToNotes(content);
                  onTabChanged(2);
                },
              ),
              NotesPane(
                notebookId: notebookId,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PaneTab extends StatelessWidget {
  const _PaneTab({
    required this.index,
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final int index;
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(
            vertical: 12,
          ),
          decoration: BoxDecoration(
            border: Border(
              bottom: BorderSide(
                color: isSelected
                    ? AppColors.primary
                    : Colors.transparent,
                width: 2,
              ),
            ),
          ),
          child: Row(
            mainAxisAlignment:
                MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 18,
                color: isSelected
                    ? AppColors.primary
                    : AppColors.textSecondary,
              ),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isSelected
                      ? FontWeight.w600
                      : FontWeight.w400,
                  color: isSelected
                      ? AppColors.primary
                      : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
