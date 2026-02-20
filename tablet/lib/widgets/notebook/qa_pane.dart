import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/conversation_provider.dart';
import '../../theme/colors.dart';
import 'message_bubble.dart';

/// The Q&A pane for asking questions about
/// uploaded sources.
class QAPane extends ConsumerStatefulWidget {
  /// The notebook ID for the conversation.
  final String notebookId;

  /// Whether the notebook has uploaded sources.
  final bool hasSources;

  /// Callback to add content to notes.
  final void Function(String content)
      onAddToNotes;

  /// Creates a [QAPane].
  const QAPane({
    super.key,
    required this.notebookId,
    required this.hasSources,
    required this.onAddToNotes,
  });

  @override
  ConsumerState<QAPane> createState() =>
      _QAPaneState();
}

class _QAPaneState
    extends ConsumerState<QAPane> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance
        .addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController
              .position.maxScrollExtent,
          duration: const Duration(
            milliseconds: 300,
          ),
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
      await ref
          .read(
            conversationProvider(
              widget.notebookId,
            ).notifier,
          )
          .sendMessage(text);
      _scrollToBottom();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(
          SnackBar(
            content:
                Text('Failed to send: $e'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final convState = ref.watch(
      conversationProvider(widget.notebookId),
    );

    return Column(
      children: [
        const _QAHeader(),
        const Divider(height: 1),
        Expanded(
          child: convState.isLoading
              ? const Center(
                  child:
                      CircularProgressIndicator(),
                )
              : convState.messages.isEmpty
                  ? _EmptyMessages(
                      hasSources:
                          widget.hasSources,
                    )
                  : _MessageList(
                      scrollController:
                          _scrollController,
                      convState: convState,
                      onAddToNotes:
                          widget.onAddToNotes,
                    ),
        ),
        _MessageInput(
          controller: _controller,
          hasSources: widget.hasSources,
          isSending: convState.isSending,
          onSend: _sendMessage,
        ),
      ],
    );
  }
}

class _QAHeader extends StatelessWidget {
  const _QAHeader();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(16),
      child: Row(
        children: [
          Icon(
            Icons.chat_outlined,
            size: 20,
            color: AppColors.textSecondary,
          ),
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
    );
  }
}

class _EmptyMessages extends StatelessWidget {
  const _EmptyMessages({
    required this.hasSources,
  });

  final bool hasSources;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.forum_outlined,
              size: 48,
              color: AppColors.textTertiary,
            ),
            const SizedBox(height: 12),
            Text(
              hasSources
                  ? 'Ask a question about '
                      'your sources'
                  : 'Upload sources first to '
                      'start asking questions',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MessageList extends StatelessWidget {
  const _MessageList({
    required this.scrollController,
    required this.convState,
    required this.onAddToNotes,
  });

  final ScrollController scrollController;
  final ConversationState convState;
  final void Function(String) onAddToNotes;

  @override
  Widget build(BuildContext context) {
    final count = convState.messages.length +
        (convState.isSending ? 1 : 0);

    return ListView.builder(
      controller: scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: count,
      itemBuilder: (context, index) {
        if (index ==
            convState.messages.length) {
          return const _TypingIndicator();
        }
        final message =
            convState.messages[index];
        return MessageBubble(
          message: message,
          onAddToNotes: message.isAssistant
              ? () =>
                  onAddToNotes(message.content)
              : null,
        );
      },
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return const Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: EdgeInsets.symmetric(
          vertical: 8,
        ),
        child: SizedBox(
          width: 48,
          height: 24,
          child: Center(
            child: SizedBox(
              width: 20,
              height: 20,
              child:
                  CircularProgressIndicator(
                strokeWidth: 2,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MessageInput extends StatelessWidget {
  const _MessageInput({
    required this.controller,
    required this.hasSources,
    required this.isSending,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool hasSources;
  final bool isSending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: AppColors.borderLight,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: controller,
              enabled:
                  hasSources && !isSending,
              maxLines: 3,
              minLines: 1,
              textInputAction:
                  TextInputAction.send,
              onSubmitted: (_) => onSend(),
              decoration: InputDecoration(
                hintText: hasSources
                    ? 'Ask a question...'
                    : 'Upload sources to '
                        'ask questions',
                border: OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color:
                        AppColors.borderLight,
                  ),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            onPressed:
                hasSources && !isSending
                    ? onSend
                    : null,
            icon: const Icon(
              Icons.send_rounded,
            ),
            style: IconButton.styleFrom(
              backgroundColor:
                  AppColors.primary,
              foregroundColor: Colors.white,
              disabledBackgroundColor:
                  AppColors.borderLight,
            ),
          ),
        ],
      ),
    );
  }
}
