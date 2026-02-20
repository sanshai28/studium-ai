import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

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

  /// Creates a [NotebookCard].
  const NotebookCard({
    super.key,
    required this.notebook,
    required this.onTap,
    required this.onDelete,
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
                    Text(
                      _formatDate(
                        notebook.updatedAt,
                      ),
                      style: const TextStyle(
                        fontSize: 12,
                        color:
                            AppColors.textTertiary,
                      ),
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

class _TitleRow extends StatelessWidget {
  const _TitleRow({
    required this.title,
    required this.onDelete,
  });

  final String title;
  final VoidCallback onDelete;

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
            if (value == 'delete') onDelete();
          },
          itemBuilder: (context) => [
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
