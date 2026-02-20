/// An uploaded document attached to a notebook.
class Source {
  /// Unique identifier.
  final String id;

  /// Original file name with extension.
  final String fileName;

  /// MIME type of the file.
  final String fileType;

  /// File size in bytes.
  final int fileSize;

  /// Timestamp when uploaded.
  final DateTime uploadedAt;

  /// Creates a [Source].
  const Source({
    required this.id,
    required this.fileName,
    required this.fileType,
    required this.fileSize,
    required this.uploadedAt,
  });

  /// Deserializes from a JSON map.
  factory Source.fromJson(
    Map<String, dynamic> json,
  ) {
    return Source(
      id: json['id'] as String,
      fileName: json['fileName'] as String,
      fileType: json['fileType'] as String,
      fileSize: json['fileSize'] as int,
      uploadedAt: DateTime.parse(
        json['uploadedAt'] as String,
      ),
    );
  }

  /// Human-readable file size (B, KB, or MB).
  String get formattedSize {
    if (fileSize < 1024) return '$fileSize B';
    if (fileSize < 1024 * 1024) {
      final kb = (fileSize / 1024)
          .toStringAsFixed(1);
      return '$kb KB';
    }
    final mb = (fileSize / (1024 * 1024))
        .toStringAsFixed(1);
    return '$mb MB';
  }

  /// Emoji icon based on file extension.
  String get fileIcon {
    final ext =
        fileName.split('.').last.toLowerCase();
    return switch (ext) {
      'pdf' => '📄',
      'doc' || 'docx' => '📝',
      'png' || 'jpg' || 'jpeg' => '🖼️',
      'txt' || 'md' => '📃',
      _ => '📎',
    };
  }
}
