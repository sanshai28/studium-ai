/// Centralized route path constants.
///
/// Prevents hardcoded path strings throughout the app
/// and provides a single source of truth for navigation.
abstract class AppRoutes {
  static const signIn = '/signin';
  static const signUp = '/signup';
  static const resetPassword = '/reset-password';
  static const notebooks = '/notebooks';

  /// Returns the path for a specific notebook editor.
  static String notebookEditor(String id) =>
      '/notebooks/$id';
}
