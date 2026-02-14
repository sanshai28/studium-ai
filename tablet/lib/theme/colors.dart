import 'package:flutter/material.dart';

abstract class AppColors {
  // Auth theme — dark navy
  static const navyDark = Color(0xFF0D1B2A);
  static const navyLight = Color(0xFF1B2A4A);

  // Primary brand
  static const primary = Color(0xFF667EEA);
  static const primaryDark = Color(0xFF5A67D8);
  static const secondary = Color(0xFF764BA2);

  // Neutrals
  static const textPrimary = Color(0xFF202124);
  static const textSecondary = Color(0xFF5F6368);
  static const textTertiary = Color(0xFF9AA0A6);
  static const background = Color(0xFFF8F9FA);
  static const surface = Color(0xFFFFFFFF);
  static const border = Color(0xFFDADCE0);
  static const borderLight = Color(0xFFE8EAED);

  // Semantic
  static const error = Color(0xFFDC2626);
  static const success = Color(0xFF16A34A);
  static const warning = Color(0xFFFBBC04);

  // Auth-specific
  static const authLink = Color(0xFF7B93F5);
  static const authInputBg = Color(0x0FFFFFFF); // 6% white
  static const authInputBorder = Color(0x1FFFFFFF); // 12% white
  static const authSubtitle = Color(0x8CFFFFFF); // 55% white
  static const authLabel = Color(0xB3FFFFFF); // 70% white

  // Card header colors
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

  static Color cardColorFromTitle(String title) {
    final hash = title.codeUnits.fold(0, (sum, c) => sum + c);
    return cardColors[hash % cardColors.length];
  }
}
