# CLAUDE.md — Studium AI Tablet App (Flutter)

## Project Overview

Flutter tablet app for Studium AI — a notebook application with a three-pane interface inspired by NotebookLM. Connects to the **same backend** as the web frontend (`../backend/`). No backend changes needed.

**Target devices**: iPad (iOS) and Android tablets, landscape-first design.

### Features
- **Auth**: Sign in, sign up, forgot password, reset password
- **Notebook Dashboard**: Grid of notebooks, search, create, delete
- **Notebook Editor**: Three-pane layout (Sources | Q&A | Notes)
  - Sources: Upload documents (PDF, DOC, DOCX, TXT, MD, images), list, delete
  - Q&A: Chat with AI about uploaded sources, copy responses, add to notes
  - Notes: Rich text editor with 2-second auto-save debounce

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Flutter 3.41+ | Cross-platform tablets |
| Language | Dart 3.11+ | Null safety, pattern matching |
| State Management | Riverpod 2.x | Compile-safe, testable, no context dependency |
| Navigation | go_router | Declarative, deep linking, auth guards |
| HTTP | Dio 5.x | Interceptors, multipart upload, cancellation |
| Token Storage | flutter_secure_storage | Keychain (iOS) / EncryptedSharedPreferences (Android) |
| File Picking | file_picker | Cross-platform document selection |
| Date Formatting | intl | Locale-aware relative timestamps |

## Common Commands

```bash
# From /tablet directory
flutter run                     # Run on connected device/simulator
flutter run -d "iPad"           # Run on specific iPad simulator
flutter run -d emulator-5554    # Run on Android emulator
flutter build ios               # Build iOS release
flutter build apk               # Build Android APK
flutter test                    # Run all unit & widget tests
flutter test --coverage         # Run tests with coverage
flutter test test/unit/         # Run only unit tests
flutter test test/widget/       # Run only widget tests
flutter analyze                 # Run Dart linter
flutter pub get                 # Install dependencies
flutter pub upgrade             # Upgrade dependencies
flutter clean                   # Clean build cache
```

## Project Structure

```
tablet/
├── lib/
│   ├── main.dart                        # Entry point, ProviderScope
│   ├── app.dart                         # MaterialApp.router, theme, GoRouter
│   ├── config/
│   │   └── api_config.dart              # Base URL, timeouts, constants
│   ├── models/                          # Immutable data classes
│   │   ├── user.dart
│   │   ├── notebook.dart
│   │   ├── source.dart
│   │   ├── conversation.dart
│   │   └── message.dart
│   ├── services/                        # API communication (no UI logic)
│   │   ├── api_client.dart              # Dio singleton + JWT interceptor
│   │   ├── auth_service.dart
│   │   ├── notebook_service.dart
│   │   ├── source_service.dart
│   │   └── conversation_service.dart
│   ├── providers/                       # Riverpod state management
│   │   ├── auth_provider.dart
│   │   ├── notebook_provider.dart
│   │   ├── source_provider.dart
│   │   ├── conversation_provider.dart
│   │   └── notes_provider.dart
│   ├── screens/                         # Full-page screens
│   │   ├── auth/
│   │   │   ├── sign_in_screen.dart
│   │   │   ├── sign_up_screen.dart
│   │   │   └── reset_password_screen.dart
│   │   ├── dashboard/
│   │   │   └── notebook_dashboard_screen.dart
│   │   └── notebook/
│   │       └── notebook_editor_screen.dart
│   ├── widgets/                         # Reusable UI components
│   │   ├── auth/
│   │   │   └── auth_card.dart
│   │   ├── dashboard/
│   │   │   ├── notebook_card.dart
│   │   │   └── create_notebook_dialog.dart
│   │   ├── notebook/
│   │   │   ├── sources_pane.dart
│   │   │   ├── qa_pane.dart
│   │   │   ├── notes_pane.dart
│   │   │   └── message_bubble.dart
│   │   └── common/
│   │       ├── gradient_button.dart
│   │       └── loading_indicator.dart
│   └── theme/
│       ├── app_theme.dart               # Material 3 light theme
│       ├── auth_theme.dart              # Dark navy auth theme
│       └── colors.dart                  # AppColors constants
├── assets/
│   └── images/
│       └── unnamed.jpg                  # Auth background image
├── test/
│   ├── unit/                            # Pure Dart logic tests
│   │   ├── models/
│   │   ├── services/
│   │   └── providers/
│   ├── widget/                          # Widget render tests
│   │   ├── widgets/
│   │   └── screens/
│   └── helpers/                         # Test utilities, mocks, fakes
│       ├── test_helpers.dart
│       └── mock_services.dart
└── pubspec.yaml
```

## Backend API Contract

The tablet app connects to the same REST API as the web frontend.

**Base URL**: Configurable in `api_config.dart`
- iOS Simulator: `http://localhost:5000/api/v1`
- Android Emulator: `http://10.0.2.2:5000/api/v1`
- Production: `https://your-domain.com/api/v1`

**Auth**: JWT token via `Authorization: Bearer <token>` header.

### Endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/auth/signup` | `{ email, password, name? }` | `{ token, user }` |
| POST | `/auth/signin` | `{ email, password }` | `{ token, user }` |
| POST | `/auth/request-password-reset` | `{ email }` | `{ message }` |
| POST | `/auth/reset-password` | `{ token, newPassword }` | `{ message }` |
| GET | `/notebooks` | — | `{ notebooks: [...] }` |
| POST | `/notebooks` | `{ title, content? }` | `{ notebook }` |
| GET | `/notebooks/:id` | — | `{ notebook }` |
| PUT | `/notebooks/:id` | `{ title?, content? }` | `{ notebook }` |
| DELETE | `/notebooks/:id` | — | `{ message }` |
| GET | `/notebooks/:id/sources` | — | `{ sources: [...] }` |
| POST | `/notebooks/:id/sources` | `FormData(file)` | `{ source }` |
| DELETE | `/sources/:id` | — | `{ message }` |
| GET | `/sources/:id/download` | — | binary blob |
| POST | `/notebooks/:id/conversations` | — | `{ conversation }` |
| GET | `/notebooks/:id/conversations` | — | `{ conversations: [...] }` |
| GET | `/conversations/:id/messages` | — | `{ messages: [...] }` |
| POST | `/conversations/:id/messages` | `{ content }` | `{ userMessage, assistantMessage }` |
| DELETE | `/conversations/:id` | — | `{ message }` |

### Response Patterns
- Success: `{ data: ... }` or `{ notebooks: [], sources: [], etc. }`
- Error: `{ error: 'Error message' }` with appropriate HTTP status

---

## Coding Conventions

### Dart Style

- Follow [Effective Dart](https://dart.dev/effective-dart) strictly
- **80-character line limit** — enforced by `dart format`
- Use `dart format` — never manually format code
- All files use `snake_case.dart` naming
- Classes use `PascalCase`, variables/functions use `camelCase`
- Private members prefixed with `_` (Dart convention)
- Prefer `final` for variables that don't change
- Use `const` constructors wherever possible for widget performance
- **Avoid `!` (bang operator)** — use null-safe alternatives (`??`, `?.`, `if-case`, pattern matching)
- Use **exhaustive switch expressions** (Dart 3) — handle all enum/sealed cases
- Use `log()` from `dart:developer` instead of `print()` — supports structured metadata
- Functions should be **< 20 lines** — extract helpers for readability
- Use `///` doc comments on all public APIs (classes, constructors, methods)
- Comment _why_, not _what_ — avoid restating what the code already says

### Models

- **Immutable**: All fields `final`, no setters
- **Factory constructors**: `fromJson` for deserialization
- **copyWith**: For creating modified copies
- **No business logic** in models — they are pure data holders

```dart
class Notebook {
  final String id;
  final String title;
  final String content;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Notebook({
    required this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Notebook.fromJson(Map<String, dynamic> json) {
    return Notebook(
      id: json['id'] as String,
      title: json['title'] as String,
      content: (json['content'] as String?) ?? '',
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Notebook copyWith({String? title, String? content}) {
    return Notebook(
      id: id,
      title: title ?? this.title,
      content: content ?? this.content,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
    );
  }
}
```

### Services

- **One class per API resource**: `AuthService`, `NotebookService`, etc.
- **No state** — pure functions that call Dio and return parsed models
- **Throw typed exceptions** — never return null for errors
- Accept `Dio` as a constructor parameter for testability

```dart
class NotebookService {
  final Dio _dio;
  NotebookService(this._dio);

  Future<List<Notebook>> getAll() async {
    final response = await _dio.get('/notebooks');
    final list = response.data['notebooks'] as List;
    return list.map((j) => Notebook.fromJson(j)).toList();
  }
}
```

### Providers (Riverpod)

- Use `@riverpod` annotation style when possible, otherwise manual providers
- **AsyncNotifier** for data that loads from API
- **StateNotifier** for complex local state (auth)
- **Family providers** for parameterized data (sources by notebookId)
- Never call `ref.read` inside build — use `ref.watch`
- Use `ref.invalidate()` to force refresh after mutations

```dart
// Provider for notebooks list
final notebooksProvider = AsyncNotifierProvider<NotebooksNotifier, List<Notebook>>(
  NotebooksNotifier.new,
);

class NotebooksNotifier extends AsyncNotifier<List<Notebook>> {
  @override
  Future<List<Notebook>> build() async {
    final service = ref.read(notebookServiceProvider);
    return service.getAll();
  }

  Future<Notebook> create(String title) async {
    final service = ref.read(notebookServiceProvider);
    final notebook = await service.create(title);
    ref.invalidateSelf(); // Refresh the list
    return notebook;
  }
}
```

### Screens

- **One screen per file** in `screens/` directory
- Screens are `ConsumerWidget` or `ConsumerStatefulWidget` (Riverpod)
- Screens handle **layout and coordination** — delegate UI to widgets
- Use `ref.watch` for reactive data, `ref.read` for one-shot actions (button callbacks)

### Widgets

- **Small, focused, reusable** — one responsibility per widget
- **Favor composition over inheritance** — build complex UIs from small widget classes
- **Extract private Widget classes** instead of helper methods (`Widget _buildHeader()`) — private classes enable framework optimizations and `const` constructors
- Use `const` constructors when all fields are final
- Prefer `StatelessWidget` unless local animation/controller state is needed
- Extract widgets into separate files when they exceed ~80 lines
- Pass callbacks down, not providers — keeps widgets testable
- Use `compute()` to run expensive operations in a separate isolate (parsing large files, heavy transforms)

```dart
class NotebookCard extends StatelessWidget {
  final Notebook notebook;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const NotebookCard({
    super.key,
    required this.notebook,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) { ... }
}
```

### Error Handling

- **Services**: Let `DioException` propagate — providers catch them
- **Providers**: Use `AsyncValue.guard()` or try/catch, expose error state
- **Screens**: Use `ref.watch(provider).when(data:, error:, loading:)` pattern
- **User feedback**: `ScaffoldMessenger.of(context).showSnackBar()` for errors
- **401 responses**: Dio interceptor auto-clears token and redirects to sign-in

### Navigation

- **go_router** with `GoRouter` defined in `app.dart`
- Auth guard via `redirect` — check token, redirect to `/signin` if missing
- Named routes with constants — never hardcode path strings
- Use `context.go()` for replacement, `context.push()` for stack

```dart
// Route constants
abstract class AppRoutes {
  static const signIn = '/signin';
  static const signUp = '/signup';
  static const notebooks = '/notebooks';
  static String notebookEditor(String id) => '/notebooks/$id';
}
```

---

## Design System

### Color Palette

```dart
abstract class AppColors {
  // Auth theme — dark navy
  static const navyDark = Color(0xFF0D1B2A);
  static const navyLight = Color(0xFF1B2A4A);

  // Primary brand
  static const primary = Color(0xFF667EEA);
  static const primaryDark = Color(0xFF5A67D8);
  static const secondary = Color(0xFF764BA2);

  // Neutrals
  static const textPrimary = Color(0xFF202124);
  static const textSecondary = Color(0xFF5F6368);
  static const background = Color(0xFFF8F9FA);
  static const surface = Color(0xFFFFFFFF);
  static const border = Color(0xFFDADCE0);

  // Semantic
  static const error = Color(0xFFDC2626);
  static const success = Color(0xFF16A34A);

  // Card header colors (deterministic from title hash)
  static const cardColors = [
    Color(0xFF4285F4), Color(0xFFEA4335), Color(0xFFFBBC04),
    Color(0xFF34A853), Color(0xFFFF6D01), Color(0xFF46BDC6),
    Color(0xFFA855F7), Color(0xFF667EEA),
  ];
}
```

### Auth Screens Design

Must match the web app exactly:
- **Background**: Full-bleed `unnamed.jpg` image, no overlay
- **Card**: Dark navy gradient (`#0D1B2A` → `#1B2A4A`), `borderRadius: 28`, max width 360
- **Inputs**: `Color(0x0FFFFFFF)` background (6% white), 1px white 12% border, white text
- **Button**: Gradient `#667EEA` → `#764BA2`, border radius 14, 16px vertical padding
- **Text**: White headings, 55% white subtitles, 70% white labels
- **Links**: `#7B93F5` color

### Dashboard Design

- Material 3 light theme
- AppBar with search field, user avatar, sign out
- Grid of notebook cards (2-3 columns based on width)
- FAB for creating notebooks
- Card: Colored header band (deterministic color from title), white body, shadow

### Three-Pane Layout

Landscape (primary):
```
┌──────────────┬──────────────────────┬────────────────────────┐
│ Sources      │       Q&A Chat       │        Notes           │
│   flex: 1    │       flex: 1.5      │       flex: 1.5        │
│              │                      │                        │
│ [Upload btn] │ [Message bubbles]    │ [TextField multiline]  │
│ [File list]  │ [Input + Send]       │ [Save btn] [Char cnt]  │
└──────────────┴──────────────────────┴────────────────────────┘
```

Portrait: Tab bar or bottom navigation to switch between panes.

Use `LayoutBuilder` to detect orientation:
```dart
LayoutBuilder(builder: (context, constraints) {
  if (constraints.maxWidth > 900) {
    return ThreePaneRow(...);  // Landscape
  }
  return TabbedPaneView(...);  // Portrait
});
```

### Accessibility (A11Y)

- Ensure **text contrast ratio ≥ 4.5:1** against backgrounds (WCAG AA)
- Use `Semantics` widget for descriptive labels on interactive elements
- Test with system font scaling enabled (large/extra-large text sizes)
- Test with **VoiceOver** (iOS) and **TalkBack** (Android)
- Ensure all interactive elements have a minimum tap target of **48x48 dp**
- Provide meaningful labels for icons and buttons (via `tooltip` or `Semantics`)

### Theming

- Use **Material 3** with `useMaterial3: true`
- Provide both `theme` (light) and `darkTheme` (dark) in `MaterialApp`
- Use `ColorScheme.fromSeed()` for harmonious palette generation where appropriate
- Use `ThemeExtension<T>` for custom design tokens beyond standard `ThemeData`
- Support `ThemeMode` toggling (system/light/dark) for user preference

### Typography

- Limit to **1–2 font families** application-wide
- Establish a clear font size scale for visual hierarchy
- Set line height to **1.4–1.6x** font size for body text readability
- Aim for **45–75 character** line length for body text

### Animation Standards

- Page transitions: 300ms `Curves.easeInOut`
- Card hover/press: 150ms scale or elevation change
- Loading: `Shimmer` placeholders matching content shape
- Snackbar: `SnackBarBehavior.floating` with rounded corners
- List items: `AnimatedList` for add/remove, or staggered fade-in on load

---

## Testing Strategy

### Test Structure

```
test/
├── unit/                    # Fast, no Flutter framework needed
│   ├── models/
│   │   └── notebook_test.dart      # fromJson, copyWith
│   ├── services/
│   │   └── auth_service_test.dart  # Mock Dio, verify requests
│   └── providers/
│       └── auth_provider_test.dart # State transitions
├── widget/                  # Flutter widget rendering
│   ├── widgets/
│   │   └── notebook_card_test.dart # Renders correctly, tap works
│   └── screens/
│       └── sign_in_screen_test.dart # Form validation, submit
└── helpers/
    ├── test_helpers.dart    # pumpApp(), createMockDio()
    └── mock_services.dart   # Fake service implementations
```

### Test Principles

- Follow **Arrange–Act–Assert** (Given–When–Then) pattern in all tests
- **Prefer fakes and stubs over mocks** — simpler, faster, less brittle
- If mocks are needed, use `mocktail` (no code generation required)
- Avoid mocking Flutter framework internals

### Unit Tests (models, services, providers)

- Test every model's `fromJson` with real-shaped API responses
- Test `copyWith` preserves unchanged fields
- Mock `Dio` with `MockDio` — verify correct endpoint, method, headers
- Test provider state transitions: loading → data, loading → error
- Test auth provider: stores token, clears on sign-out, restores on init

```dart
// Example: model test
test('Notebook.fromJson parses correctly', () {
  final json = {
    'id': '123',
    'title': 'Test',
    'content': 'Hello',
    'createdAt': '2026-01-01T00:00:00.000Z',
    'updatedAt': '2026-01-02T00:00:00.000Z',
  };
  final notebook = Notebook.fromJson(json);
  expect(notebook.id, '123');
  expect(notebook.title, 'Test');
  expect(notebook.content, 'Hello');
});

// Example: service test with mock Dio
test('NotebookService.getAll returns notebooks', () async {
  final dio = MockDio();
  when(() => dio.get('/notebooks')).thenAnswer((_) async => Response(
    data: {'notebooks': [notebookJson]},
    statusCode: 200,
    requestOptions: RequestOptions(),
  ));

  final service = NotebookService(dio);
  final notebooks = await service.getAll();
  expect(notebooks, hasLength(1));
  expect(notebooks.first.title, 'Test');
});
```

### Widget Tests

- Use `pumpWidget` with `ProviderScope` overrides for Riverpod
- Test that screens show loading → data → error states correctly
- Test form validation: empty email, short password, submit button disabled
- Test navigation: tap "Create account" link goes to sign-up
- Test three-pane layout renders all panes in landscape width

```dart
// Example: widget test
testWidgets('SignInScreen shows error on failed login', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        authServiceProvider.overrideWithValue(mockAuthService),
      ],
      child: const MaterialApp(home: SignInScreen()),
    ),
  );

  await tester.enterText(find.byKey(Key('email')), 'bad@email.com');
  await tester.enterText(find.byKey(Key('password')), 'wrong');
  await tester.tap(find.text('Sign in'));
  await tester.pumpAndSettle();

  expect(find.text('Invalid credentials'), findsOneWidget);
});
```

### Coverage Target

- **Models**: 100% — they're pure data, no excuse
- **Services**: 90%+ — mock Dio, test all endpoints and error paths
- **Providers**: 85%+ — test state transitions and side effects
- **Widgets**: 75%+ — test rendering, interactions, and state display
- **Overall**: 80%+ minimum

### What NOT to Test

- Flutter framework internals (Material widgets render correctly)
- Third-party package behavior (Dio actually makes HTTP calls)
- Pixel-perfect layout — use integration tests or manual QA for this
- Platform-specific code (Keychain, file system) — mock at boundary

---

## Performance Guidelines

### Widget Performance

- Use `const` constructors — prevents unnecessary rebuilds
- Extract subtrees into separate widgets instead of large build methods
- Use `ListView.builder` for long lists — never `ListView(children: [...])`
- Add `Key` to list items for efficient diffing during reorder/delete
- Use `AutomaticKeepAliveClientMixin` for tab views that shouldn't reload

### State Performance

- Use `select` on Riverpod providers to watch only what you need:
  ```dart
  // Only rebuild when notebook title changes, not content
  final title = ref.watch(notebookProvider.select((n) => n.value?.title));
  ```
- Avoid putting large objects (file bytes) in provider state
- Use `ref.invalidate` instead of re-fetching manually

### Network Performance

- Cancel in-flight requests when navigating away (`CancelToken`)
- Debounce auto-save (2 seconds) — don't save on every keystroke
- Load notebook data in parallel: `Future.wait([getNotebook, getSources, getConversations])`
- Cache notebook list locally — refresh in background

### Image/Asset Performance

- Auth background: Load via `AssetImage` with `BoxFit.cover`
- File icons: Use Material `Icons` — no custom icon assets needed
- Avoid loading full-resolution images in lists — not applicable here since sources are docs

---

## Security

- **Token storage**: Always use `flutter_secure_storage` — never `SharedPreferences`
- **Token lifecycle**: Clear on sign-out, clear on 401, restore on app start
- **Input validation**: Validate email format and password length client-side before API call
- **No secrets in code**: API base URL is config, no API keys in the tablet app
- **HTTPS in production**: Enforce HTTPS base URL for release builds

---

## Implementation Order

Build in this sequence — each step produces a runnable app:

1. **Project setup** — `flutter create`, pubspec, folder structure, assets
2. **Config + Models + API client** — Dio with JWT interceptor, all 5 models
3. **Theme + Colors** — `AppColors`, light theme, dark navy auth theme
4. **Auth flow** — services → providers → screens → go_router with guards
5. **Dashboard** — notebook service → provider → dashboard screen + cards
6. **Three-pane editor** — sources pane → Q&A pane → notes pane with auto-save
7. **Tests** — unit tests for models/services, widget tests for screens
8. **Polish** — shimmer loading, error snackbars, animations, keyboard handling

At each step: run `flutter analyze` and `flutter test` before moving on.
