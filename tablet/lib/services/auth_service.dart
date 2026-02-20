import 'package:dio/dio.dart';

import '../models/user.dart';

/// Holds the JWT token and user returned after
/// a successful authentication request.
class AuthResult {
  /// The JWT authentication token.
  final String token;

  /// The authenticated user.
  final User user;

  /// Creates an [AuthResult].
  const AuthResult({
    required this.token,
    required this.user,
  });
}

/// Handles authentication API calls.
class AuthService {
  final Dio _dio;

  /// Creates an [AuthService] backed by [_dio].
  AuthService(this._dio);

  /// Signs in with [email] and [password].
  Future<AuthResult> signIn(
    String email,
    String password,
  ) async {
    final response = await _dio.post(
      '/auth/signin',
      data: {
        'email': email,
        'password': password,
      },
    );
    return AuthResult(
      token: response.data['token'] as String,
      user: User.fromJson(
        response.data['user']
            as Map<String, dynamic>,
      ),
    );
  }

  /// Creates a new account with [email] and
  /// [password], with an optional [name].
  Future<AuthResult> signUp(
    String email,
    String password, {
    String? name,
  }) async {
    final response = await _dio.post(
      '/auth/signup',
      data: {
        'email': email,
        'password': password,
        'name': name,
      },
    );
    return AuthResult(
      token: response.data['token'] as String,
      user: User.fromJson(
        response.data['user']
            as Map<String, dynamic>,
      ),
    );
  }

  /// Sends a password-reset email to [email].
  Future<void> requestPasswordReset(
    String email,
  ) async {
    await _dio.post(
      '/auth/request-password-reset',
      data: {'email': email},
    );
  }

  /// Resets the password using a reset [token].
  Future<void> resetPassword(
    String token,
    String newPassword,
  ) async {
    await _dio.post(
      '/auth/reset-password',
      data: {
        'token': token,
        'newPassword': newPassword,
      },
    );
  }
}
