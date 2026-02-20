import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/source.dart';
import '../services/source_service.dart';
import 'auth_provider.dart';

/// Provider for [SourceService].
final sourceServiceProvider =
    Provider<SourceService>((ref) {
  return SourceService(
    ref.read(apiClientProvider).dio,
  );
});

/// Family provider for sources by notebook ID.
final sourcesProvider = AsyncNotifierProvider
    .family<
        SourcesNotifier,
        List<Source>,
        String>(
  SourcesNotifier.new,
);

/// Manages sources for a specific notebook.
class SourcesNotifier extends FamilyAsyncNotifier<
    List<Source>, String> {
  /// Fetches all sources for the notebook.
  @override
  Future<List<Source>> build(String arg) async {
    final service =
        ref.read(sourceServiceProvider);
    return service.getAll(arg);
  }

  /// Uploads a file as a new source and
  /// refreshes the list.
  Future<Source> upload(
    String filePath,
    String fileName,
  ) async {
    final service =
        ref.read(sourceServiceProvider);
    final source = await service.upload(
      arg,
      filePath,
      fileName,
    );
    ref.invalidateSelf();
    return source;
  }

  /// Deletes a source by [sourceId] and
  /// refreshes the list.
  Future<void> delete(String sourceId) async {
    final service =
        ref.read(sourceServiceProvider);
    await service.delete(sourceId);
    ref.invalidateSelf();
  }
}
