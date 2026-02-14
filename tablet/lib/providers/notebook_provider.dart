import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/notebook.dart';
import '../services/notebook_service.dart';
import 'auth_provider.dart';

final notebookServiceProvider = Provider<NotebookService>((ref) {
  return NotebookService(ref.read(apiClientProvider).dio);
});

final notebooksProvider =
    AsyncNotifierProvider<NotebooksNotifier, List<Notebook>>(NotebooksNotifier.new);

final notebookProvider =
    FutureProvider.family<Notebook, String>((ref, id) async {
  final service = ref.read(notebookServiceProvider);
  return service.getOne(id);
});

class NotebooksNotifier extends AsyncNotifier<List<Notebook>> {
  @override
  Future<List<Notebook>> build() async {
    final service = ref.read(notebookServiceProvider);
    return service.getAll();
  }

  Future<Notebook> create(String title) async {
    final service = ref.read(notebookServiceProvider);
    final notebook = await service.create(title);
    ref.invalidateSelf();
    return notebook;
  }

  Future<void> delete(String id) async {
    final service = ref.read(notebookServiceProvider);
    await service.delete(id);
    ref.invalidateSelf();
  }
}
