import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/conversation_provider.dart';
import '../../theme/colors.dart';
import 'message_bubble.dart';

class QAPane extends ConsumerStatefulWidget {
  final String notebookId;
  final bool hasSources;
  final void Function(String content) onAddToNotes;

  const QAPane({
    super.key,
    required this.notebookId,
    required this.hasSources,
    required this.onAddToNotes,
  });

  @override
  ConsumerState<QAPane> createState() => _QAPaneState();
}

class _QAPaneState extends ConsumerState<QAPane> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    _controller.clear();

    try {
      await ref.read(conversationProvider(widget.notebookId).notifier).sendMessage(text);
      _scrollToBottom();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final convState = ref.watch(conversationProvider(widget.notebookId));

    return Column(
      children: [
        // Header
        const Padding(
          padding: EdgeInsets.all(16),
          child: Row(
            children: [
              Icon(Icons.chat_outlined, size: 20, color: AppColors.textSecondary),
              SizedBox(width: 8),
              Text(
                'Ask Questions',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
        const Divider(height: 1),

        // Messages
        Expanded(
          child: convState.isLoading
              ? const Center(child: CircularProgressIndicator())
              : convState.messages.isEmpty
                  ? Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.forum_outlined, size: 48, color: AppColors.textTertiary),
                            const SizedBox(height: 12),
                            Text(
                              widget.hasSources
                                  ? 'Ask a question about your sources'
                                  : 'Upload sources first to start asking questions',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  : ListView.builder(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16),
                      itemCount: convState.messages.length + (convState.isSending ? 1 : 0),
                      itemBuilder: (context, index) {
                        if (index == convState.messages.length) {
                          // Typing indicator
                          return const Align(
                            alignment: Alignment.centerLeft,
                            child: Padding(
                              padding: EdgeInsets.symmetric(vertical: 8),
                              child: SizedBox(
                                width: 48,
                                height: 24,
                                child: Center(
                                  child: SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }
                        final message = convState.messages[index];
                        return MessageBubble(
                          message: message,
                          onAddToNotes: message.isAssistant
                              ? () => widget.onAddToNotes(message.content)
                              : null,
                        );
                      },
                    ),
        ),

        // Input
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            border: Border(top: BorderSide(color: AppColors.borderLight)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  enabled: widget.hasSources && !convState.isSending,
                  maxLines: 3,
                  minLines: 1,
                  textInputAction: TextInputAction.send,
                  onSubmitted: (_) => _sendMessage(),
                  decoration: InputDecoration(
                    hintText: widget.hasSources
                        ? 'Ask a question...'
                        : 'Upload sources to ask questions',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.borderLight),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: widget.hasSources && !convState.isSending ? _sendMessage : null,
                icon: const Icon(Icons.send_rounded),
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: AppColors.borderLight,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
