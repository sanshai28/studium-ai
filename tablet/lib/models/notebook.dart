/// A user's notebook with notes and sources.
class Notebook {
  /// Unique identifier.
  final String id;

  /// Display title.
  final String title;

  /// Markdown/text content (notes).
  final String content;

  /// Timestamp when created.
  final DateTime createdAt;

  /// Timestamp of the most recent update.
  final DateTime updatedAt;

  /// Creates a [Notebook].
  const Notebook({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Deserializes from JSON.
  ///
  /// Defaults [content] to empty if null.
  factory Notebook.fromJson(
    Map<String, dynamic> json,
  ) {
    return Notebook(
      id: json['id'] as String,
      title: json['title'] as String,
      content:
          (json['content'] as String?) ?? '',
      createdAt: DateTime.parse(
        json['createdAt'] as String,
      ),
      updatedAt: DateTime.parse(
        json['updatedAt'] as String,
      ),
    );
  }

  /// Returns a copy with updated fields.
  Notebook copyWith({
    String? title,
    String? content,
  }) {
    return Notebook(
      id: id,
      title: title ?? this.title,
      content: content ?? this.content,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}
