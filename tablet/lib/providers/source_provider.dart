import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/source.dart';
import '../services/source_service.dart';
import 'auth_provider.dart';

final sourceServiceProvider = Provider<SourceService>((ref) {
  return SourceService(ref.read(apiClientProvider).dio);
});

final sourcesProvider =
    AsyncNotifierProvider.family<SourcesNotifier, List<Source>, String>(
  SourcesNotifier.new,
);

class SourcesNotifier extends FamilyAsyncNotifier<List<Source>, String> {
  @override
  Future<List<Source>> build(String arg) async {
    final service = ref.read(sourceServiceProvider);
    return service.getAll(arg);
  }

  Future<Source> upload(String filePath, String fileName) async {
    final service = ref.read(sourceServiceProvider);
    final source = await service.upload(arg, filePath, fileName);
    ref.invalidateSelf();
    return source;
  }

  Future<void> delete(String sourceId) async {
    final service = ref.read(sourceServiceProvider);
    await service.delete(sourceId);
    ref.invalidateSelf();
  }
}
