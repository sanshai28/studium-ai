import 'package:dio/dio.dart';

import '../models/source.dart';

/// Manages source document operations via the API.
class SourceService {
  final Dio _dio;

  /// Creates a [SourceService] backed by [_dio].
  SourceService(this._dio);

  /// Fetches all sources for a [notebookId].
  Future<List<Source>> getAll(
    String notebookId,
  ) async {
    final response = await _dio.get(
      '/notebooks/$notebookId/sources',
    );
    final list =
        response.data['sources'] as List;
    return list
        .map(
          (j) => Source.fromJson(
            j as Map<String, dynamic>,
          ),
        )
        .toList();
  }

  /// Uploads a file as a new source.
  Future<Source> upload(
    String notebookId,
    String filePath,
    String fileName,
  ) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(
        filePath,
        filename: fileName,
      ),
    });
    final response = await _dio.post(
      '/notebooks/$notebookId/sources',
      data: formData,
    );
    return Source.fromJson(
      response.data['source']
          as Map<String, dynamic>,
    );
  }

  /// Deletes a source by [sourceId].
  Future<void> delete(String sourceId) async {
    await _dio.delete('/sources/$sourceId');
  }
}
