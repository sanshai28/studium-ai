import 'package:flutter_test/flutter_test.dart';
import 'package:studium_tablet/models/user.dart';

void main() {
  group('User', () {
    test('fromJson parses correctly', () {
      final json = {
        'id': 'usr-1',
        'email': 'test@example.com',
        'name': 'Test User',
      };

      final user = User.fromJson(json);

      expect(user.id, 'usr-1');
      expect(user.email, 'test@example.com');
      expect(user.name, 'Test User');
    });

    test('fromJson handles null name', () {
      final json = {
        'id': 'usr-1',
        'email': 'test@example.com',
        'name': null,
      };

      final user = User.fromJson(json);
      expect(user.name, isNull);
    });

    test('toJson produces correct map', () {
      final user = User(id: 'usr-1', email: 'test@example.com', name: 'Test');
      final json = user.toJson();

      expect(json['id'], 'usr-1');
      expect(json['email'], 'test@example.com');
      expect(json['name'], 'Test');
    });
  });
}
