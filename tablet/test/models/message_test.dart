import 'package:flutter_test/flutter_test.dart';
import 'package:studium_tablet/models/message.dart';

void main() {
  group('Message', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'msg-1',
        'role': 'user',
        'content': 'Hello',
        'createdAt': '2025-01-15T10:00:00.000Z',
      };

      final message = Message.fromJson(json);

      expect(message.id, 'msg-1');
      expect(message.role, 'user');
      expect(message.content, 'Hello');
    });

    test('isUser returns true for user role', () {
      final message = Message(
        id: '1',
        role: 'user',
        content: 'Hi',
        createdAt: DateTime(2025),
      );
      expect(message.isUser, true);
      expect(message.isAssistant, false);
    });

    test('isAssistant returns true for assistant role', () {
      final message = Message(
        id: '1',
        role: 'assistant',
        content: 'Response',
        createdAt: DateTime(2025),
      );
      expect(message.isUser, false);
      expect(message.isAssistant, true);
    });
  });
}
