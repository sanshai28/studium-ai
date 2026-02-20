import 'package:dio/dio.dart';

import '../models/conversation.dart';
import '../models/message.dart';

/// Holds user and assistant messages returned
/// from a send-message request.
class SendMessageResult {
  /// The message sent by the user.
  final Message userMessage;

  /// The AI-generated assistant response.
  final Message assistantMessage;

  /// Creates a [SendMessageResult].
  const SendMessageResult({
    required this.userMessage,
    required this.assistantMessage,
  });
}

/// Manages conversation and message API calls.
class ConversationService {
  final Dio _dio;

  /// Creates a [ConversationService].
  ConversationService(this._dio);

  /// Fetches all conversations for [notebookId].
  Future<List<Conversation>> getAll(
    String notebookId,
  ) async {
    final response = await _dio.get(
      '/notebooks/$notebookId/conversations',
    );
    final list =
        response.data['conversations'] as List;
    return list
        .map(
          (j) => Conversation.fromJson(
            j as Map<String, dynamic>,
          ),
        )
        .toList();
  }

  /// Creates a new conversation in [notebookId].
  Future<Conversation> create(
    String notebookId,
  ) async {
    final response = await _dio.post(
      '/notebooks/$notebookId/conversations',
    );
    return Conversation.fromJson(
      response.data['conversation']
          as Map<String, dynamic>,
    );
  }

  /// Fetches all messages for [conversationId].
  Future<List<Message>> getMessages(
    String conversationId,
  ) async {
    final response = await _dio.get(
      '/conversations/$conversationId/messages',
    );
    final list =
        response.data['messages'] as List;
    return list
        .map(
          (j) => Message.fromJson(
            j as Map<String, dynamic>,
          ),
        )
        .toList();
  }

  /// Sends a [content] message in a conversation.
  Future<SendMessageResult> sendMessage(
    String conversationId,
    String content,
  ) async {
    final response = await _dio.post(
      '/conversations/$conversationId/messages',
      data: {'content': content},
    );
    final data = response.data;
    return SendMessageResult(
      userMessage: Message.fromJson(
        data['userMessage']
            as Map<String, dynamic>,
      ),
      assistantMessage: Message.fromJson(
        data['assistantMessage']
            as Map<String, dynamic>,
      ),
    );
  }

  /// Deletes a conversation by [conversationId].
  Future<void> delete(
    String conversationId,
  ) async {
    await _dio.delete(
      '/conversations/$conversationId',
    );
  }
}
