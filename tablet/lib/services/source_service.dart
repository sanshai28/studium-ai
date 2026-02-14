import 'package:dio/dio.dart';

import '../models/source.dart';

class SourceService {
  final Dio _dio;

  SourceService(this._dio);

  Future<List<Source>> getAll(String notebookId) async {
    final response = await _dio.get('/notebooks/$notebookId/sources');
    final list = response.data['sources'] as List;
    return list.map((j) => Source.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<Source> upload(String notebookId, String filePath, String fileName) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath, filename: fileName),
    });
    final response = await _dio.post(
      '/notebooks/$notebookId/sources',
      data: formData,
    );
    return Source.fromJson(response.data['source'] as Map<String, dynamic>);
  }

  Future<void> delete(String sourceId) async {
    await _dio.delete('/sources/$sourceId');
  }
}
