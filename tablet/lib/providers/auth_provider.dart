import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/user.dart';
import '../services/api_client.dart';
import '../services/auth_service.dart';

// Singleton API client
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient());

// Auth service depends on API client's Dio
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService(ref.read(apiClientProvider).dio);
});

// Auth state
class AuthState {
  final User? user;
  final bool isLoading;
  final bool isInitialized;

  const AuthState({this.user, this.isLoading = false, this.isInitialized = false});

  bool get isAuthenticated => user != null;

  AuthState copyWith({User? user, bool? isLoading, bool? isInitialized, bool clearUser = false}) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      isInitialized: isInitialized ?? this.isInitialized,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;
  final AuthService _authService;

  AuthNotifier(this._apiClient, this._authService) : super(const AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final token = await _apiClient.getToken();
    state = state.copyWith(
      isInitialized: true,
      user: token != null ? User(id: '', email: '', name: null) : null,
    );
  }

  Future<void> signIn(String email, String password) async {
    state = state.copyWith(isLoading: true);
    try {
      final result = await _authService.signIn(email, password);
      await _apiClient.saveToken(result.token);
      state = state.copyWith(user: result.user, isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false);
      throw _extractError(e);
    }
  }

  Future<void> signUp(String email, String password, {String? name}) async {
    state = state.copyWith(isLoading: true);
    try {
      final result = await _authService.signUp(email, password, name: name);
      await _apiClient.saveToken(result.token);
      state = state.copyWith(user: result.user, isLoading: false);
    } on DioException catch (e) {
      state = state.copyWith(isLoading: false);
      throw _extractError(e);
    }
  }

  Future<void> signOut() async {
    await _apiClient.clearToken();
    state = state.copyWith(clearUser: true);
  }

  String _extractError(DioException e) {
    final data = e.response?.data;
    if (data is Map<String, dynamic> && data.containsKey('error')) {
      return data['error'] as String;
    }
    return 'Something went wrong. Please try again.';
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    ref.read(apiClientProvider),
    ref.read(authServiceProvider),
  );
});
