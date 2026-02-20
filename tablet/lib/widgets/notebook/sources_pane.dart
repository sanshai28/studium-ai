import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/source_provider.dart';
import '../../theme/colors.dart';

/// Displays and manages source documents for
/// a notebook.
class SourcesPane extends ConsumerWidget {
  /// The notebook ID to load sources for.
  final String notebookId;

  /// Creates a [SourcesPane].
  const SourcesPane({
    super.key,
    required this.notebookId,
  });

  Future<void> _uploadFile(
    WidgetRef ref,
    BuildContext context,
  ) async {
    final result =
        await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: [
        'pdf',
        'doc',
        'docx',
        'txt',
        'md',
        'png',
        'jpg',
        'jpeg',
      ],
    );
    if (result == null ||
        result.files.isEmpty) {
      return;
    }

    final file = result.files.first;
    final filePath = file.path;
    if (filePath == null) return;

    try {
      await ref
          .read(
            sourcesProvider(notebookId).notifier,
          )
          .upload(filePath, file.name);
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(
          const SnackBar(
            content: Text(
              'File uploaded successfully',
            ),
          ),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(
          SnackBar(
            content: Text('Upload failed: $e'),
          ),
        );
      }
    }
  }

  @override
  Widget build(
    BuildContext context,
    WidgetRef ref,
  ) {
    final sourcesAsync =
        ref.watch(sourcesProvider(notebookId));

    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        _SourcesHeader(
          onUpload: () =>
              _uploadFile(ref, context),
        ),
        const Divider(height: 1),
        Expanded(
          child: sourcesAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(),
            ),
            error: (e, _) => Center(
              child: Padding(
                padding:
                    const EdgeInsets.all(16),
                child: Text(
                  'Failed to load sources',
                  style: TextStyle(
                    color: AppColors.error,
                  ),
                ),
              ),
            ),
            data: (sources) {
              if (sources.isEmpty) {
                return _EmptySourcesView(
                  onUpload: () =>
                      _uploadFile(ref, context),
                );
              }
              return _SourcesList(
                sources: sources,
                notebookId: notebookId,
              );
            },
          ),
        ),
      ],
    );
  }
}

class _SourcesHeader extends StatelessWidget {
  const _SourcesHeader({
    required this.onUpload,
  });

  final VoidCallback onUpload;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          const Icon(
            Icons.source,
            size: 20,
            color: AppColors.textSecondary,
          ),
          const SizedBox(width: 8),
          const Text(
            'Sources',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const Spacer(),
          IconButton(
            onPressed: onUpload,
            icon: const Icon(
              Icons.add,
              size: 20,
            ),
            tooltip: 'Upload file',
            style: IconButton.styleFrom(
              backgroundColor:
                  AppColors.primary.withValues(
                alpha: 0.1,
              ),
              foregroundColor: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }
}

class _EmptySourcesView extends StatelessWidget {
  const _EmptySourcesView({
    required this.onUpload,
  });

  final VoidCallback onUpload;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.upload_file,
              size: 48,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 12),
            const Text(
              'No sources yet',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Upload documents to get started',
              style: TextStyle(
                color: AppColors.textTertiary,
                fontSize: 12,
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: onUpload,
              icon: const Icon(
                Icons.add,
                size: 18,
              ),
              label: const Text('Upload'),
            ),
          ],
        ),
      ),
    );
  }
}

class _SourcesList extends ConsumerWidget {
  const _SourcesList({
    required this.sources,
    required this.notebookId,
  });

  final List<dynamic> sources;
  final String notebookId;

  @override
  Widget build(
    BuildContext context,
    WidgetRef ref,
  ) {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(
        vertical: 8,
      ),
      itemCount: sources.length,
      separatorBuilder: (_, _) =>
          const Divider(
        height: 1,
        indent: 16,
        endIndent: 16,
      ),
      itemBuilder: (context, index) {
        final source = sources[index];
        return ListTile(
          leading: Text(
            source.fileIcon,
            style: const TextStyle(fontSize: 24),
          ),
          title: Text(
            source.fileName,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 14),
          ),
          subtitle: Text(
            source.formattedSize,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textTertiary,
            ),
          ),
          trailing: IconButton(
            icon: const Icon(
              Icons.delete_outline,
              size: 18,
              color: AppColors.textTertiary,
            ),
            onPressed: () async {
              try {
                await ref
                    .read(
                      sourcesProvider(notebookId)
                          .notifier,
                    )
                    .delete(source.id);
              } catch (e) {
                if (context.mounted) {
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
            },
          ),
          dense: true,
        );
      },
    );
  }
}
