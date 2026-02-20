import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/routes.dart';
import '../../providers/auth_provider.dart';
import '../../providers/notebook_provider.dart';
import '../../theme/colors.dart';
import '../../widgets/dashboard/create_notebook_dialog.dart';
import '../../widgets/dashboard/notebook_card.dart';

/// The main dashboard screen showing all user
/// notebooks in a responsive grid.
class NotebookDashboardScreen
    extends ConsumerStatefulWidget {
  /// Creates a [NotebookDashboardScreen].
  const NotebookDashboardScreen({super.key});

  @override
  ConsumerState<NotebookDashboardScreen>
      createState() =>
          _NotebookDashboardScreenState();
}

class _NotebookDashboardScreenState
    extends ConsumerState<
        NotebookDashboardScreen> {
  String _searchQuery = '';

  Future<void> _createNotebook() async {
    final title = await showDialog<String>(
      context: context,
      builder: (context) =>
          const CreateNotebookDialog(),
    );
    if (title == null) return;

    try {
      final notebook = await ref
          .read(notebooksProvider.notifier)
          .create(title);
      if (mounted) {
        context.push(
          AppRoutes.notebookEditor(
            notebook.id,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(
          SnackBar(
            content: Text(
              'Failed to create notebook: $e',
            ),
          ),
        );
      }
    }
  }

  Future<void> _deleteNotebook(
    String id,
    String title,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete notebook'),
        content: Text(
          'Are you sure you want to delete '
          '"$title"? This cannot be undone.',
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
          .delete(id);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(
          SnackBar(
            content: Text(
              'Failed to delete notebook: $e',
            ),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final notebooksAsync =
        ref.watch(notebooksProvider);

    return Scaffold(
      appBar: AppBar(
        leading: const Padding(
          padding: EdgeInsets.only(left: 16),
          child: Center(
            child: Text(
              '\u{1F4DA}',
              style: TextStyle(fontSize: 28),
            ),
          ),
        ),
        title: const Text(
          'Studium AI',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 20,
          ),
        ),
        actions: [
          _SearchField(
            onChanged: (v) => setState(
              () => _searchQuery = v,
            ),
          ),
          const SizedBox(width: 16),
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sign out',
            onPressed: () {
              ref
                  .read(authProvider.notifier)
                  .signOut();
              context.go(AppRoutes.signIn);
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      floatingActionButton:
          FloatingActionButton.extended(
        onPressed: _createNotebook,
        icon: const Icon(Icons.add),
        label: const Text('New notebook'),
      ),
      body: notebooksAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, _) =>
            _ErrorView(
          onRetry: () => ref.invalidate(
            notebooksProvider,
          ),
        ),
        data: (notebooks) {
          final filtered =
              _searchQuery.isEmpty
                  ? notebooks
                  : notebooks.where((n) {
                      final q = _searchQuery
                          .toLowerCase();
                      return n.title
                              .toLowerCase()
                              .contains(q) ||
                          n.content
                              .toLowerCase()
                              .contains(q);
                    }).toList();

          if (notebooks.isEmpty) {
            return _EmptyState(
              onCreate: _createNotebook,
            );
          }

          if (filtered.isEmpty) {
            return Center(
              child: Text(
                'No notebooks match '
                '"$_searchQuery"',
                style: const TextStyle(
                  color:
                      AppColors.textSecondary,
                  fontSize: 16,
                ),
              ),
            );
          }

          return _NotebooksGrid(
            notebooks: filtered,
            onTap: (id) => context.push(
              AppRoutes.notebookEditor(id),
            ),
            onDelete: _deleteNotebook,
          );
        },
      ),
    );
  }
}

class _SearchField extends StatelessWidget {
  const _SearchField({
    required this.onChanged,
  });

  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 280,
      child: Padding(
        padding: const EdgeInsets.symmetric(
          vertical: 8,
        ),
        child: TextField(
          onChanged: onChanged,
          decoration: InputDecoration(
            hintText: 'Search notebooks...',
            prefixIcon: const Icon(
              Icons.search,
              size: 20,
            ),
            contentPadding:
                const EdgeInsets.symmetric(
              vertical: 0,
            ),
            border: OutlineInputBorder(
              borderRadius:
                  BorderRadius.circular(24),
              borderSide: BorderSide.none,
            ),
            filled: true,
            fillColor: AppColors.background,
          ),
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.onRetry});

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
            'Failed to load notebooks',
            style: Theme.of(context)
                .textTheme
                .titleMedium,
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

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onCreate});

  final VoidCallback onCreate;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  AppColors.primary.withValues(
                    alpha: 0.1,
                  ),
                  AppColors.secondary.withValues(
                    alpha: 0.05,
                  ),
                ],
              ),
              borderRadius:
                  BorderRadius.circular(24),
            ),
            child: const Column(
              children: [
                Text(
                  '\u{1F4DA}',
                  style: TextStyle(
                    fontSize: 64,
                  ),
                ),
                SizedBox(height: 24),
                Text(
                  'Welcome to Studium AI',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w600,
                    color:
                        AppColors.textPrimary,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'Upload documents, ask '
                  'questions, and take notes\n'
                  'with AI-powered assistance.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color:
                        AppColors.textSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: onCreate,
            icon: const Icon(Icons.add),
            label: const Text(
              'Create your first notebook',
            ),
            style: ElevatedButton.styleFrom(
              padding:
                  const EdgeInsets.symmetric(
                horizontal: 28,
                vertical: 16,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NotebooksGrid extends StatelessWidget {
  const _NotebooksGrid({
    required this.notebooks,
    required this.onTap,
    required this.onDelete,
  });

  final List<dynamic> notebooks;
  final void Function(String id) onTap;
  final void Function(String id, String title)
      onDelete;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount =
            constraints.maxWidth > 900 ? 3 : 2;
        return GridView.builder(
          padding: const EdgeInsets.all(24),
          gridDelegate:
              SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1.6,
          ),
          itemCount: notebooks.length,
          itemBuilder: (context, index) {
            final notebook = notebooks[index];
            return NotebookCard(
              notebook: notebook,
              onTap: () => onTap(notebook.id),
              onDelete: () => onDelete(
                notebook.id,
                notebook.title,
              ),
            );
          },
        );
      },
    );
  }
}
