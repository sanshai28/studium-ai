import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

/// Singleton provider for the API client.
final apiClientProvider =
    Provider<ApiClient>((ref) => ApiClient());

/// Provider for [AuthService].
final authServiceProvider =
    Provider<AuthService>((ref) {
  return AuthService(
    ref.read(apiClientProvider).dio,
  );
});

/// Immutable state for authentication.
class AuthState {
  /// The currently signed-in user, if any.
  final User? user;

  /// Whether an auth operation is in progress.
  final bool isLoading;

  /// Whether the initial token check is done.
  final bool isInitialized;

  /// Creates an [AuthState].
  const AuthState({
    this.user,
    this.isLoading = false,
    this.isInitialized = false,
  });

  /// Whether a user is currently signed in.
  bool get isAuthenticated => user != null;

  /// Returns a copy with given fields replaced.
  ///
  /// Set [clearUser] to `true` to nullify user.
  AuthState copyWith({
    User? user,
    bool? isLoading,
    bool? isInitialized,
    bool clearUser = false,
  }) {
    return AuthState(
      user: clearUser
          ? null
          : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      isInitialized:
          isInitialized ?? this.isInitialized,
    );
  }
}

/// Manages authentication state transitions.
class AuthNotifier
    extends StateNotifier<AuthState> {
  final ApiClient _apiClient;
  final AuthService _authService;

  /// Creates an [AuthNotifier] and runs init.
  AuthNotifier(
    this._apiClient,
    this._authService,
  ) : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final token = await _apiClient.getToken();
    state = state.copyWith(
      isInitialized: true,
      user: token != null
          ? User(id: '', email: '', name: null)
          : null,
    );
  }

  /// Signs in with [email] and [password].
  Future<void> signIn(
    String email,
    String password,
  ) async {
    state = state.copyWith(isLoading: true);
    try {
      final result = await _authService.signIn(
        email,
        password,
      );
      await _apiClient.saveToken(result.token);
      state = state.copyWith(
        user: result.user,
        isLoading: false,
      );
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false);
      throw _extractError(e);
    }
  }

  /// Creates a new account and signs in.
  Future<void> signUp(
    String email,
    String password, {
    String? name,
  }) async {
    state = state.copyWith(isLoading: true);
    try {
      final result = await _authService.signUp(
        email,
        password,
        name: name,
      );
      await _apiClient.saveToken(result.token);
      state = state.copyWith(
        user: result.user,
        isLoading: false,
      );
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false);
      throw _extractError(e);
    }
  }

  /// Signs out by clearing the stored token.
  Future<void> signOut() async {
    await _apiClient.clearToken();
    state = state.copyWith(clearUser: true);
  }

  String _extractError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic> &&
        data.containsKey('error')) {
      return data['error'] as String;
    }
    return 'Something went wrong. '
        'Please try again.';
  }
}

/// Global provider for auth state management.
final authProvider = StateNotifierProvider<
    AuthNotifier, AuthState>(
  (ref) {
    return AuthNotifier(
      ref.read(apiClientProvider),
      ref.read(authServiceProvider),
    );
  },
);
