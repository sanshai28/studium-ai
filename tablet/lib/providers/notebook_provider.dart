import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/notebook.dart';
import '../services/notebook_service.dart';
import 'auth_provider.dart';

/// Provider for [NotebookService].
final notebookServiceProvider =
    Provider<NotebookService>((ref) {
  return NotebookService(
    ref.read(apiClientProvider).dio,
  );
});

/// Provider for the list of user notebooks.
final notebooksProvider =
    AsyncNotifierProvider<
        NotebooksNotifier,
        List<Notebook>>(
  NotebooksNotifier.new,
);

/// Provider for a single notebook by ID.
final notebookProvider =
    FutureProvider.family<Notebook, String>(
  (ref, id) async {
    final service =
        ref.read(notebookServiceProvider);
    return service.getOne(id);
  },
);

/// Manages the notebooks list with CRUD ops.
class NotebooksNotifier
    extends AsyncNotifier<List<Notebook>> {
  /// Fetches all notebooks from the API.
  @override
  Future<List<Notebook>> build() async {
    final service =
        ref.read(notebookServiceProvider);
    return service.getAll();
  }

  /// Creates a notebook with [title] and optional
  /// [defaultMethod], then refreshes the list.
  Future<Notebook> create(
    String title, {
    String defaultMethod = 'blank',
  }) async {
    final service =
        ref.read(notebookServiceProvider);
    final notebook = await service.create(
      title,
      defaultMethod: defaultMethod,
    );
    ref.invalidateSelf();
    return notebook;
  }

  /// Renames a notebook by [id].
  Future<void> rename(
    String id,
    String newTitle,
  ) async {
    final service =
        ref.read(notebookServiceProvider);
    await service.update(id, title: newTitle);
    ref.invalidateSelf();
  }

  /// Changes the default method of a notebook.
  Future<void> updateMethod(
    String id,
    String method,
  ) async {
    final service =
        ref.read(notebookServiceProvider);
    await service.update(
      id,
      defaultMethod: method,
    );
    ref.invalidateSelf();
  }

  /// Deletes a notebook by [id] and refreshes
  /// the list.
  Future<void> delete(String id) async {
    final service =
        ref.read(notebookServiceProvider);
    await service.delete(id);
    ref.invalidateSelf();
  }
}
