import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../models/message.dart';
import '../../theme/colors.dart';

/// A chat bubble that displays a single message.
class MessageBubble extends StatelessWidget {
  /// The message to display.
  final Message message;

  /// Called when the user taps "Add to notes".
  final VoidCallback? onAddToNotes;

  /// Creates a [MessageBubble].
  const MessageBubble({
    super.key,
    required this.message,
    this.onAddToNotes,
  });

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;

    return Align(
      alignment: isUser
          ? Alignment.centerRight
          : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth:
              MediaQuery.of(context).size.width *
                  0.3,
        ),
        margin: const EdgeInsets.symmetric(
          vertical: 4,
        ),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isUser
              ? AppColors.primary.withValues(
                  alpha: 0.1,
                )
              : AppColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(
              isUser ? 16 : 4,
            ),
            bottomRight: Radius.circular(
              isUser ? 4 : 16,
            ),
          ),
          border: isUser
              ? null
              : Border.all(
                  color: AppColors.borderLight,
                ),
        ),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            SelectableText(
              message.content,
              style: TextStyle(
                fontSize: 14,
                height: 1.5,
                color: isUser
                    ? AppColors.primaryDark
                    : AppColors.textPrimary,
              ),
            ),
            if (message.isAssistant) ...[
              const SizedBox(height: 8),
              _AssistantActions(
                message: message,
                onAddToNotes: onAddToNotes,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AssistantActions extends StatelessWidget {
  const _AssistantActions({
    required this.message,
    required this.onAddToNotes,
  });

  final Message message;
  final VoidCallback? onAddToNotes;

  @override
  Widget build(BuildContext context) {
    final addCallback = onAddToNotes;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _ActionButton(
          icon: Icons.copy,
          tooltip: 'Copy',
          onPressed: () {
            Clipboard.setData(
              ClipboardData(
                text: message.content,
              ),
            );
            ScaffoldMessenger.of(context)
                .showSnackBar(
              const SnackBar(
                content: Text(
                  'Copied to clipboard',
                ),
                duration: Duration(seconds: 1),
              ),
            );
          },
        ),
        const SizedBox(width: 4),
        if (addCallback != null)
          _ActionButton(
            icon: Icons.note_add,
            tooltip: 'Add to notes',
            onPressed: addCallback,
          ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.tooltip,
    required this.onPressed,
  });

  final IconData icon;
  final String tooltip;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(4),
        child: Padding(
          padding: const EdgeInsets.all(4),
          child: Icon(
            icon,
            size: 16,
            color: AppColors.textTertiary,
          ),
        ),
      ),
    );
  }
}
