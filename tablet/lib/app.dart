import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'providers/auth_provider.dart';
import 'screens/auth/reset_password_screen.dart';
import 'screens/auth/sign_in_screen.dart';
import 'screens/auth/sign_up_screen.dart';
import 'screens/dashboard/notebook_dashboard_screen.dart';
import 'screens/notebook/notebook_editor_screen.dart';
import 'theme/app_theme.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/signin',
    redirect: (context, state) {
      if (!auth.isInitialized) return null;

      final isOnAuth = state.matchedLocation == '/signin' ||
          state.matchedLocation == '/signup' ||
          state.matchedLocation == '/reset-password';

      if (!auth.isAuthenticated && !isOnAuth) return '/signin';
      if (auth.isAuthenticated && isOnAuth) return '/notebooks';
      return null;
    },
    routes: [
      GoRoute(
        path: '/signin',
        builder: (context, state) => const SignInScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignUpScreen(),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) => const ResetPasswordScreen(),
      ),
      GoRoute(
        path: '/notebooks',
        builder: (context, state) => const NotebookDashboardScreen(),
      ),
      GoRoute(
        path: '/notebooks/:id',
        builder: (context, state) => NotebookEditorScreen(
          notebookId: state.pathParameters['id']!,
        ),
      ),
    ],
  );
});

class StudiumApp extends ConsumerWidget {
  const StudiumApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Studium AI',
      theme: AppTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
