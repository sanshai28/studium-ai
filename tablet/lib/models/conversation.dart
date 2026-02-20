/// A Q&A conversation session in a notebook.
class Conversation {
  /// Unique identifier.
  final String id;

  /// ID of the parent notebook.
  final String notebookId;

  /// Timestamp when conversation started.
  final DateTime createdAt;

  /// Timestamp of the last exchange.
  final DateTime updatedAt;

  /// Creates a [Conversation].
  const Conversation({
    required this.id,
    required this.notebookId,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Deserializes from a JSON map.
  factory Conversation.fromJson(
    Map<String, dynamic> json,
  ) {
    return Conversation(
      id: json['id'] as String,
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
}
