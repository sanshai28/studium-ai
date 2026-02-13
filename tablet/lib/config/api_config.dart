class ApiConfig {
  // For iOS simulator: localhost works
  // For Android emulator: use 10.0.2.2 instead of localhost
  static const String baseUrl = 'http://localhost:5000/api/v1';

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // File upload limits
  static const int maxFileSize = 10 * 1024 * 1024; // 10MB
  static const List<String> allowedFileTypes = [
    'pdf', 'doc', 'docx', 'txt', 'md', 'png', 'jpg', 'jpeg',
  ];
}
