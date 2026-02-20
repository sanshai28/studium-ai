/// Central configuration for API connectivity.
class ApiConfig {
  // For iOS simulator: localhost works.
  // For Android emulator: use 10.0.2.2.

  /// Base URL for all API requests.
  static const String baseUrl =
      'http://localhost:5000/api/v1';

  /// Timeout for establishing a connection.
  static const Duration connectTimeout =
      Duration(seconds: 15);

  /// Timeout for receiving a response.
  static const Duration receiveTimeout =
      Duration(seconds: 30);

  /// Maximum allowed file upload size in bytes.
  static const int maxFileSize =
      10 * 1024 * 1024; // 10 MB

  /// File extensions permitted for upload.
  static const List<String> allowedFileTypes = [
    'pdf',
    'doc',
    'docx',
    'txt',
    'md',
    'png',
    'jpg',
    'jpeg',
  ];
}
