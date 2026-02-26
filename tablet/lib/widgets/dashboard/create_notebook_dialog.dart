import 'package:flutter/material.dart';

import '../../constants/note_methods.dart';
import '../../theme/colors.dart';

/// Result returned by [CreateNotebookDialog].
class CreateNotebookResult {
  final String title;
  final String defaultMethod;

  const CreateNotebookResult({
    required this.title,
    required this.defaultMethod,
  });
}

/// A two-step dialog: first pick a note-taking
/// method, then enter the notebook title.
class CreateNotebookDialog
    extends StatefulWidget {
  /// Creates a [CreateNotebookDialog].
  const CreateNotebookDialog({super.key});

  @override
  State<CreateNotebookDialog> createState() =>
      _CreateNotebookDialogState();
}

class _CreateNotebookDialogState
    extends State<CreateNotebookDialog> {
  int _step = 1;
  String? _selectedMethod;
  final _controller = TextEditingController(
    text: 'Untitled notebook',
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _selectMethod(String methodId) {
    setState(() {
      _selectedMethod = methodId;
      _step = 2;
    });
    // Auto-select title text for easy editing.
    _controller.selection = TextSelection(
      baseOffset: 0,
      extentOffset: _controller.text.length,
    );
  }

  void _submit() {
    final title = _controller.text.trim();
    if (title.isNotEmpty &&
        _selectedMethod != null) {
      Navigator.pop(
        context,
        CreateNotebookResult(
          title: title,
          defaultMethod: _selectedMethod!,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_step == 1) {
      return _buildMethodStep(context);
    }
    return _buildTitleStep(context);
  }

  Widget _buildMethodStep(BuildContext context) {
    return AlertDialog(
      title: const Text(
        'Choose a note-taking method',
      ),
      content: SizedBox(
        width: 400,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            const Text(
              'This will be the default for all '
              'notes in this notebook',
              style: TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            ...noteMethods.map(
              (m) => _MethodTile(
                method: m,
                isSelected:
                    _selectedMethod == m.id,
                onTap: () => _selectMethod(m.id),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () =>
              Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ],
    );
  }

  Widget _buildTitleStep(BuildContext context) {
    final method = noteMethodById(
      _selectedMethod!,
    );
    return AlertDialog(
      title: const Text('Name your notebook'),
      content: SizedBox(
        width: 360,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 6,
              ),
              decoration: BoxDecoration(
                color: AppColors.primary
                    .withValues(alpha: 0.1),
                borderRadius:
                    BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    method.icon,
                    size: 18,
                    color: AppColors.primary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    method.name,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _controller,
              autofocus: true,
              decoration: const InputDecoration(
                labelText: 'Notebook name',
                hintText:
                    'Enter notebook name...',
              ),
              onSubmitted: (_) => _submit(),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => setState(
            () => _step = 1,
          ),
          child: const Text('\u2190 Back'),
        ),
        TextButton(
          onPressed: () =>
              Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _submit,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
          ),
          child: const Text('Create'),
        ),
      ],
    );
  }
}

class _MethodTile extends StatelessWidget {
  const _MethodTile({
    required this.method,
    required this.isSelected,
    required this.onTap,
  });

  final NoteMethod method;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: isSelected
            ? AppColors.primary
                .withValues(alpha: 0.1)
            : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius:
              BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            child: Row(
              children: [
                Icon(
                  method.icon,
                  size: 24,
                  color: isSelected
                      ? AppColors.primary
                      : AppColors.textSecondary,
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment.start,
                    children: [
                      Text(
                        method.name,
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight:
                              FontWeight.w600,
                          color: isSelected
                              ? AppColors.primary
                              : AppColors
                                  .textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        method.description,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors
                              .textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isSelected)
                  const Icon(
                    Icons.check_circle,
                    color: AppColors.primary,
                    size: 20,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
