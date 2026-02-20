import 'package:flutter/material.dart';

/// Centralized color palette for the app.
abstract class AppColors {
  /// Dark navy for auth card background.
  static const navyDark = Color(0xFF0D1B2A);

  /// Lighter navy for auth card gradient end.
  static const navyLight = Color(0xFF1B2A4A);

  /// Primary brand color (purple-blue).
  static const primary = Color(0xFF667EEA);

  /// Darker variant of primary for pressed states.
  static const primaryDark = Color(0xFF5A67D8);

  /// Secondary accent (purple).
  static const secondary = Color(0xFF764BA2);

  /// High-emphasis text color.
  static const textPrimary = Color(0xFF202124);

  /// Medium-emphasis text color.
  static const textSecondary = Color(0xFF5F6368);

  /// Low-emphasis / hint text color.
  static const textTertiary = Color(0xFF9AA0A6);

  /// Page background color.
  static const background = Color(0xFFF8F9FA);

  /// Card and surface background.
  static const surface = Color(0xFFFFFFFF);

  /// Default border color.
  static const border = Color(0xFFDADCE0);

  /// Light border for dividers and pane edges.
  static const borderLight = Color(0xFFE8EAED);

  /// Error / destructive action color.
  static const error = Color(0xFFDC2626);

  /// Success / confirmation color.
  static const success = Color(0xFF16A34A);

  /// Warning / caution color.
  static const warning = Color(0xFFFBBC04);

  /// Link color used on auth screens.
  static const authLink = Color(0xFF7B93F5);

  /// Auth input field background (6% white).
  static const authInputBg = Color(0x0FFFFFFF);

  /// Auth input field border (12% white).
  static const authInputBorder = Color(0x1FFFFFFF);

  /// Auth subtitle text (55% white).
  static const authSubtitle = Color(0x8CFFFFFF);

  /// Auth label text (70% white).
  static const authLabel = Color(0xB3FFFFFF);

  /// Deterministic card header colors.
  static const cardColors = [
    Color(0xFF4285F4),
    Color(0xFFEA4335),
    Color(0xFFFBBC04),
    Color(0xFF34A853),
    Color(0xFFFF6D01),
    Color(0xFF46BDC6),
    Color(0xFFA855F7),
    Color(0xFF667EEA),
  ];

  /// Returns a consistent color based on [title] hash.
  static Color cardColorFromTitle(String title) {
    final hash = title.codeUnits.fold(
      0,
      (sum, c) => sum + c,
    );
    return cardColors[hash % cardColors.length];
  }
}
