import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/routes.dart';
import '../../providers/auth_provider.dart';
import '../../services/auth_service.dart';
import '../../theme/colors.dart';
import '../../widgets/auth/auth_card.dart';
import '../../widgets/common/gradient_button.dart';

/// Screen that lets users request a password
/// reset link by entering their email address.
class ResetPasswordScreen
    extends ConsumerStatefulWidget {
  /// Creates a [ResetPasswordScreen].
  const ResetPasswordScreen({super.key});

  @override
  ConsumerState<ResetPasswordScreen>
      createState() =>
          _ResetPasswordScreenState();
}

class _ResetPasswordScreenState
    extends ConsumerState<ResetPasswordScreen> {
  final _emailController =
      TextEditingController();
  String? _error;
  String? _success;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleReset() async {
    setState(() {
      _error = null;
      _success = null;
      _isLoading = true;
    });

    try {
      final authService = AuthService(
        ref.read(apiClientProvider).dio,
      );
      await authService.requestPasswordReset(
        _emailController.text.trim(),
      );
      if (mounted) {
        setState(() {
          _success =
              'If an account with that email '
              'exists, a password reset link '
              'has been sent.';
          _isLoading = false;
        });
      }
    } on DioException catch (e) {
      if (mounted) {
        final data = e.response?.data;
        setState(() {
          _error = (data is Map &&
                  data.containsKey('error'))
              ? data['error'] as String
              : 'Something went wrong. '
                  'Please try again.';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DecoratedBox(
        decoration: const BoxDecoration(
          image: DecorationImage(
            image: AssetImage(
              'assets/images/unnamed.jpg',
            ),
            fit: BoxFit.cover,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: AuthCard(
              children: [
                const Text(
                  '\u{1F4DA}',
                  style: TextStyle(fontSize: 48),
                ),
                const SizedBox(height: 32),
                const Text(
                  'Reset password',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.w500,
                    letterSpacing: -0.75,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  "Enter your email and we'll "
                  'send a reset link',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white
                        .withValues(alpha: 0.55),
                    fontSize: 15,
                  ),
                ),
                const SizedBox(height: 44),
                if (_error != null) ...[
                  _ErrorBanner(
                    message: _error ?? '',
                  ),
                  const SizedBox(height: 20),
                ],
                if (_success != null) ...[
                  _SuccessBanner(
                    message: _success ?? '',
                  ),
                  const SizedBox(height: 20),
                ],
                AuthTextField(
                  label: 'Email',
                  hint: 'Enter your email',
                  controller: _emailController,
                  keyboardType:
                      TextInputType.emailAddress,
                  enabled: !_isLoading,
                ),
                const SizedBox(height: 28),
                GradientButton(
                  text: 'Send reset link',
                  isLoading: _isLoading,
                  onPressed: _handleReset,
                ),
                const SizedBox(height: 36),
                GestureDetector(
                  onTap: () => context.go(
                    AppRoutes.signIn,
                  ),
                  child: const Text(
                    'Back to sign in',
                    style: TextStyle(
                      color: AppColors.authLink,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({
    required this.message,
  });

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(
          alpha: 0.12,
        ),
        borderRadius:
            BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.error.withValues(
            alpha: 0.2,
          ),
        ),
      ),
      child: Text(
        message,
        style: const TextStyle(
          color: Color(0xFFFCA5A5),
          fontSize: 14,
        ),
      ),
    );
  }
}

class _SuccessBanner extends StatelessWidget {
  const _SuccessBanner({
    required this.message,
  });

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.success.withValues(
          alpha: 0.12,
        ),
        borderRadius:
            BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.success.withValues(
            alpha: 0.2,
          ),
        ),
      ),
      child: Text(
        message,
        style: const TextStyle(
          color: Color(0xFF86EFAC),
          fontSize: 14,
        ),
      ),
    );
  }
}
