import 'package:dio/dio.dart';

import '../models/user.dart';

class AuthResult {
  final String token;
  final User user;

  const AuthResult({required this.token, required this.user});
}

class AuthService {
  final Dio _dio;

  AuthService(this._dio);

  Future<AuthResult> signIn(String email, String password) async {
    final response = await _dio.post('/auth/signin', data: {
      'email': email,
      'password': password,
    });
    return AuthResult(
      token: response.data['token'] as String,
      user: User.fromJson(response.data['user']),
    );
  }

  Future<AuthResult> signUp(String email, String password, {String? name}) async {
    final response = await _dio.post('/auth/signup', data: {
      'email': email,
      'password': password,
      'name': name,
    });
    return AuthResult(
      token: response.data['token'] as String,
      user: User.fromJson(response.data['user']),
    );
  }

  Future<void> requestPasswordReset(String email) async {
    await _dio.post('/auth/request-password-reset', data: {'email': email});
  }

  Future<void> resetPassword(String token, String newPassword) async {
    await _dio.post('/auth/reset-password', data: {
      'token': token,
      'newPassword': newPassword,
    });
  }
}
