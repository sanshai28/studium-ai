import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../constants/note_methods.dart';
import '../../models/notebook.dart';
import '../../theme/colors.dart';

/// A card widget that displays a notebook summary.
class NotebookCard extends StatelessWidget {
  /// The notebook data to display.
  final Notebook notebook;

  /// Called when the card is tapped.
  final VoidCallback onTap;

  /// Called when the user chooses to delete.
  final VoidCallback onDelete;

  /// Called when the user chooses to rename.
  final VoidCallback onRename;

  /// Creates a [NotebookCard].
  const NotebookCard({
    super.key,
    required this.notebook,
    required this.onTap,
    required this.onDelete,
    required this.onRename,
  });

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inHours < 1) {
      return '${diff.inMinutes}m ago';
    }
    if (diff.inDays < 1) {
      return '${diff.inHours}h ago';
    }
    if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    }
    return DateFormat.MMMd().format(date);
  }

  @override
  Widget build(BuildContext context) {
    final color = AppColors.cardColorFromTitle(
      notebook.title,
    );
    final content = notebook.content;
    final preview = content.isEmpty
        ? 'No content yet'
        : content.length > 120
            ? '${content.substring(0, 120)}...'
            : content;
    final method = noteMethodById(
      notebook.defaultMethod,
    );

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            Container(height: 8, color: color),
            Expanded(
              child: Padding(
                padding:
                    const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    _TitleRow(
                      title: notebook.title,
                      onDelete: onDelete,
                      onRename: onRename,
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: Text(
                        preview,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors
                              .textSecondary,
                          height: 1.4,
                        ),
                        maxLines: 3,
                        overflow:
                            TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _MethodBadge(
                          method: method,
                        ),
                        const Spacer(),
                        Text(
                          _formatDate(
                            notebook.updatedAt,
                          ),
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors
                                .textTertiary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MethodBadge extends StatelessWidget {
  const _MethodBadge({required this.method});

  final NoteMethod method;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: AppColors.primary
            .withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            method.icon,
            size: 14,
            color: AppColors.primary,
          ),
          const SizedBox(width: 4),
          Text(
            method.name,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _TitleRow extends StatelessWidget {
  const _TitleRow({
    required this.title,
    required this.onDelete,
    required this.onRename,
  });

  final String title;
  final VoidCallback onDelete;
  final VoidCallback onRename;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        PopupMenuButton<String>(
          onSelected: (value) {
            if (value == 'rename') onRename();
            if (value == 'delete') onDelete();
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'rename',
              child: Row(
                children: [
                  Icon(
                    Icons.edit_outlined,
                    size: 20,
                    color:
                        AppColors.textSecondary,
                  ),
                  SizedBox(width: 8),
                  Text('Rename'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'delete',
              child: Row(
                children: [
                  Icon(
                    Icons.delete_outline,
                    size: 20,
                    color: AppColors.error,
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Delete',
                    style: TextStyle(
                      color: AppColors.error,
                    ),
                  ),
                ],
              ),
            ),
          ],
          icon: const Icon(
            Icons.more_vert,
            size: 20,
            color: AppColors.textTertiary,
          ),
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
        ),
      ],
    );
  }
}
