/// Represents an authenticated user.
class User {
  /// Unique identifier.
  final String id;

  /// User's email address.
  final String email;

  /// Optional display name.
  final String? name;

  /// Creates a [User].
  const User({
    required this.id,
    required this.email,
    this.name,
  });

  /// Deserializes from a JSON map.
  factory User.fromJson(
    Map<String, dynamic> json,
  ) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String?,
    );
  }

  /// Serializes to a JSON map.
  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'name': name,
      };
}
