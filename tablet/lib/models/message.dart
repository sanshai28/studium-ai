/// A single message in a conversation.
class Message {
  /// Unique identifier.
  final String id;

  /// Either 'user' or 'assistant'.
  final String role;

  /// The text content.
  final String content;

  /// Timestamp when sent.
  final DateTime createdAt;

  /// Creates a [Message].
  const Message({
    required this.id,
    required this.role,
    required this.content,
    required this.createdAt,
  });

  /// Deserializes from a JSON map.
  factory Message.fromJson(
    Map<String, dynamic> json,
  ) {
    return Message(
      id: json['id'] as String,
      role: json['role'] as String,
      content: json['content'] as String,
      createdAt: DateTime.parse(
        json['createdAt'] as String,
      ),
    );
  }

  /// Whether sent by the user.
  bool get isUser => role == 'user';

  /// Whether this is an AI response.
  bool get isAssistant => role == 'assistant';
}
