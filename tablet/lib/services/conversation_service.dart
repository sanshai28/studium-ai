import 'package:dio/dio.dart';

import '../models/conversation.dart';
import '../models/message.dart';

class SendMessageResult {
  final Message userMessage;
  final Message assistantMessage;

  const SendMessageResult({
    required this.userMessage,
    required this.assistantMessage,
  });
}

class ConversationService {
  final Dio _dio;

  ConversationService(this._dio);

  Future<List<Conversation>> getAll(String notebookId) async {
    final response = await _dio.get('/notebooks/$notebookId/conversations');
    final list = response.data['conversations'] as List;
    return list.map((j) => Conversation.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<Conversation> create(String notebookId) async {
    final response = await _dio.post('/notebooks/$notebookId/conversations');
    return Conversation.fromJson(response.data['conversation'] as Map<String, dynamic>);
  }

  Future<List<Message>> getMessages(String conversationId) async {
    final response = await _dio.get('/conversations/$conversationId/messages');
    final list = response.data['messages'] as List;
    return list.map((j) => Message.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<SendMessageResult> sendMessage(String conversationId, String content) async {
    final response = await _dio.post(
      '/conversations/$conversationId/messages',
      data: {'content': content},
    );
    return SendMessageResult(
      userMessage: Message.fromJson(response.data['userMessage'] as Map<String, dynamic>),
      assistantMessage: Message.fromJson(response.data['assistantMessage'] as Map<String, dynamic>),
    );
  }

  Future<void> delete(String conversationId) async {
    await _dio.delete('/conversations/$conversationId');
  }
}
