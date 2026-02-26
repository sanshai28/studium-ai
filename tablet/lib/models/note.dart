/// A single note within a notebook.
class Note {
  /// Unique identifier.
  final String id;

  /// Display title.
  final String title;

  /// Note content (plain text or HTML).
  final String content;

  /// Sort order within the notebook.
  final int order;

  /// Parent notebook ID.
  final String notebookId;

  /// Timestamp when created.
  final DateTime createdAt;

  /// Timestamp of the most recent update.
  final DateTime updatedAt;

  /// Creates a [Note].
  const Note({
    required this.id,
    required this.title,
    required this.content,
    required this.order,
    required this.notebookId,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Deserializes from JSON.
  factory Note.fromJson(
    Map<String, dynamic> json,
  ) {
    return Note(
      id: json['id'] as String,
      title:
          (json['title'] as String?) ??
              'Untitled Note',
      content:
          (json['content'] as String?) ?? '',
      order: (json['order'] as num?)?.toInt() ?? 0,
      notebookId:
          json['notebookId'] as String,
      createdAt: DateTime.parse(
        json['createdAt'] as String,
      ),
      updatedAt: DateTime.parse(
        json['updatedAt'] as String,
      ),
    );
  }

  /// Returns a copy with updated fields.
  Note copyWith({
    String? title,
    String? content,
    int? order,
  }) {
    return Note(
      id: id,
      title: title ?? this.title,
      content: content ?? this.content,
      order: order ?? this.order,
      notebookId: notebookId,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}
