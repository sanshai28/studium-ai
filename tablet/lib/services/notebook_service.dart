import 'package:dio/dio.dart';

import '../models/notebook.dart';

/// Manages notebook CRUD operations via the API.
class NotebookService {
  final Dio _dio;

  /// Creates a [NotebookService] backed by [_dio].
  NotebookService(this._dio);

  /// Fetches all notebooks for the current user.
  Future<List<Notebook>> getAll() async {
    final response = await _dio.get('/notebooks');
    final list =
        response.data['notebooks'] as List;
    return list
        .map(
          (j) => Notebook.fromJson(
            j as Map<String, dynamic>,
          ),
        )
        .toList();
  }

  /// Fetches a single notebook by [id].
  Future<Notebook> getOne(String id) async {
    final response =
        await _dio.get('/notebooks/$id');
    return Notebook.fromJson(
      response.data['notebook']
          as Map<String, dynamic>,
    );
  }

  /// Creates a new notebook with [title].
  Future<Notebook> create(String title) async {
    final response = await _dio.post(
      '/notebooks',
      data: {
        'title': title,
        'content': '',
      },
    );
    return Notebook.fromJson(
      response.data['notebook']
          as Map<String, dynamic>,
    );
  }

  /// Updates a notebook by [id].
  Future<Notebook> update(
    String id, {
    String? title,
    String? content,
  }) async {
    final response = await _dio.put(
      '/notebooks/$id',
      data: {
        'title': title,
        'content': content,
      },
    );
    return Notebook.fromJson(
      response.data['notebook']
          as Map<String, dynamic>,
    );
  }

  /// Deletes a notebook by [id].
  Future<void> delete(String id) async {
    await _dio.delete('/notebooks/$id');
  }
}
