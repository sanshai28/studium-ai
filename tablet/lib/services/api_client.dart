import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../config/api_config.dart';

/// HTTP client with JWT interceptor and token
/// storage backed by [FlutterSecureStorage].
class ApiClient {
  /// The underlying Dio instance for HTTP requests.
  late final Dio dio;

  final FlutterSecureStorage _storage;

  static const _tokenKey = 'auth_token';

  /// Creates an [ApiClient] with optional
  /// [storage] override for testing.
  ApiClient({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage() {
    dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: ApiConfig.connectTimeout,
      receiveTimeout: ApiConfig.receiveTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token =
            await _storage.read(key: _tokenKey);
        if (token != null) {
          options.headers['Authorization'] =
              'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          await clearToken();
        }
        handler.next(error);
      },
    ));
  }

  /// Persists the JWT [token] to secure storage.
  Future<void> saveToken(String token) async {
    await _storage.write(
      key: _tokenKey,
      value: token,
    );
  }

  /// Removes the stored JWT token.
  Future<void> clearToken() async {
    await _storage.delete(key: _tokenKey);
  }

  /// Returns the stored JWT token, or null.
  Future<String?> getToken() async {
    return _storage.read(key: _tokenKey);
  }
}
