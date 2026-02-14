import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../models/conversation.dart';
import '../models/message.dart';
import '../services/conversation_service.dart';
import 'auth_provider.dart';

final conversationServiceProvider = Provider<ConversationService>((ref) {
  return ConversationService(ref.read(apiClientProvider).dio);
});

class ConversationState {
  final Conversation? conversation;
  final List<Message> messages;
  final bool isLoading;
  final bool isSending;

  const ConversationState({
    this.conversation,
    this.messages = const [],
    this.isLoading = false,
    this.isSending = false,
  });

  ConversationState copyWith({
    Conversation? conversation,
    List<Message>? messages,
    bool? isLoading,
    bool? isSending,
  }) {
    return ConversationState(
      conversation: conversation ?? this.conversation,
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isSending: isSending ?? this.isSending,
    );
  }
}

class ConversationNotifier extends FamilyNotifier<ConversationState, String> {
  @override
  ConversationState build(String arg) {
    _init();
    return const ConversationState(isLoading: true);
  }

  Future<void> _init() async {
    final service = ref.read(conversationServiceProvider);

    try {
      // Get or create conversation
      var conversations = await service.getAll(arg);
      Conversation conversation;
      if (conversations.isEmpty) {
        conversation = await service.create(arg);
      } else {
        conversation = conversations.first;
      }

      // Load messages
      final messages = await service.getMessages(conversation.id);
      state = state.copyWith(
        conversation: conversation,
        messages: messages,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> sendMessage(String content) async {
    final conversation = state.conversation;
    if (conversation == null) return;

    state = state.copyWith(isSending: true);

    try {
      final service = ref.read(conversationServiceProvider);
      final result = await service.sendMessage(conversation.id, content);
      state = state.copyWith(
        messages: [...state.messages, result.userMessage, result.assistantMessage],
        isSending: false,
      );
    } catch (e) {
      state = state.copyWith(isSending: false);
      rethrow;
    }
  }
}

final conversationProvider =
    NotifierProvider.family<ConversationNotifier, ConversationState, String>(
  ConversationNotifier.new,
);
