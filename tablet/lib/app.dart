import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'config/routes.dart';
import 'providers/auth_provider.dart';
import 'screens/auth/reset_password_screen.dart';
import 'screens/auth/sign_in_screen.dart';
import 'screens/auth/sign_up_screen.dart';
import 'screens/dashboard/notebook_dashboard_screen.dart';
import 'screens/notebook/notebook_editor_screen.dart';
import 'theme/app_theme.dart';

/// Provides [GoRouter] with auth-aware redirects.
final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    initialLocation: AppRoutes.signIn,
    redirect: (context, state) {
      if (!auth.isInitialized) return null;

      final loc = state.matchedLocation;
      final isOnAuth =
          loc == AppRoutes.signIn ||
          loc == AppRoutes.signUp ||
          loc == AppRoutes.resetPassword;

      if (!auth.isAuthenticated && !isOnAuth) {
        return AppRoutes.signIn;
      }
      if (auth.isAuthenticated && isOnAuth) {
        return AppRoutes.notebooks;
      }
      return null;
    },
    routes: [
      GoRoute(
        path: AppRoutes.signIn,
        builder: (_, _) => const SignInScreen(),
      ),
      GoRoute(
        path: AppRoutes.signUp,
        builder: (_, _) => const SignUpScreen(),
      ),
      GoRoute(
        path: AppRoutes.resetPassword,
        builder: (_, _) =>
            const ResetPasswordScreen(),
      ),
      GoRoute(
        path: AppRoutes.notebooks,
        builder: (_, _) =>
            const NotebookDashboardScreen(),
      ),
      GoRoute(
        path: '${AppRoutes.notebooks}/:id',
        builder: (_, state) {
          final id =
              state.pathParameters['id'] ?? '';
          return NotebookEditorScreen(
            notebookId: id,
          );
        },
      ),
    ],
  );
});

/// Root widget with theming and routing.
class StudiumApp extends ConsumerWidget {
  /// Creates the root app widget.
  const StudiumApp({super.key});

  @override
  Widget build(
    BuildContext context,
    WidgetRef ref,
  ) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Studium AI',
      theme: AppTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
