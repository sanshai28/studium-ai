import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/conversation.dart';
import '../models/message.dart';
import '../services/conversation_service.dart';
import 'auth_provider.dart';

/// Provider for [ConversationService].
final conversationServiceProvider =
    Provider<ConversationService>((ref) {
  return ConversationService(
    ref.read(apiClientProvider).dio,
  );
});

/// Immutable state for a Q&A conversation.
class ConversationState {
  /// The active conversation, if loaded.
  final Conversation? conversation;

  /// Messages in the conversation.
  final List<Message> messages;

  /// Whether the conversation is loading.
  final bool isLoading;

  /// Whether a message is being sent.
  final bool isSending;

  /// Creates a [ConversationState].
  const ConversationState({
    this.conversation,
    this.messages = const [],
    this.isLoading = false,
    this.isSending = false,
  });

  /// Returns a copy with the given fields.
  ConversationState copyWith({
    Conversation? conversation,
    List<Message>? messages,
    bool? isLoading,
    bool? isSending,
  }) {
    return ConversationState(
      conversation:
          conversation ?? this.conversation,
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
    );
  }
}

/// Manages conversation state for a notebook.
class ConversationNotifier extends FamilyNotifier<
    ConversationState, String> {
  /// Builds initial state and starts loading.
  @override
  ConversationState build(String arg) {
    _init();
    return const ConversationState(
      isLoading: true,
    );
  }

  Future<void> _init() async {
    final service =
        ref.read(conversationServiceProvider);

    try {
      var conversations =
          await service.getAll(arg);
      Conversation conversation;
      if (conversations.isEmpty) {
        conversation =
            await service.create(arg);
      } else {
        conversation = conversations.first;
      }

      final messages = await service
          .getMessages(conversation.id);
      state = state.copyWith(
        conversation: conversation,
        messages: messages,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  /// Sends a [content] message and appends
  /// both user and AI response to state.
  Future<void> sendMessage(
    String content,
  ) async {
    final conversation = state.conversation;
    if (conversation == null) return;

    state = state.copyWith(isSending: true);

    try {
      final service =
          ref.read(conversationServiceProvider);
      final result = await service.sendMessage(
        conversation.id,
        content,
      );
      state = state.copyWith(
        messages: [
          ...state.messages,
          result.userMessage,
          result.assistantMessage,
        ],
        isSending: false,
      );
    } catch (e) {
      state = state.copyWith(isSending: false);
      rethrow;
    }
  }
}

/// Family provider for conversation state
/// keyed by notebook ID.
final conversationProvider = NotifierProvider
    .family<
        ConversationNotifier,
        ConversationState,
        String>(
  ConversationNotifier.new,
);
