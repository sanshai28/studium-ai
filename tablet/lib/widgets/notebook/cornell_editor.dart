import 'dart:convert';

import 'package:flutter/material.dart';

import '../../theme/colors.dart';

/// Three-section Cornell editor: Cues | Notes + Summary.
///
/// Content is stored as a JSON string:
/// ```json
/// {"cues":"...","notes":"...","summary":"..."}
/// ```
class CornellEditor extends StatefulWidget {
  /// The JSON-stringified content.
  final String content;

  /// Called when any section changes.
  final ValueChanged<String> onChanged;

  /// Creates a [CornellEditor].
  const CornellEditor({
    super.key,
    required this.content,
    required this.onChanged,
  });

  @override
  State<CornellEditor> createState() =>
      _CornellEditorState();
}

class _CornellEditorState
    extends State<CornellEditor> {
  late TextEditingController _cuesController;
  late TextEditingController _notesController;
  late TextEditingController _summaryController;
  String? _focusedSection;

  @override
  void initState() {
    super.initState();
    final parsed = _parse(widget.content);
    _cuesController =
        TextEditingController(text: parsed.cues);
    _notesController =
        TextEditingController(text: parsed.notes);
    _summaryController = TextEditingController(
      text: parsed.summary,
    );
  }

  @override
  void didUpdateWidget(
    covariant CornellEditor oldWidget,
  ) {
    super.didUpdateWidget(oldWidget);
    if (widget.content != oldWidget.content) {
      final parsed = _parse(widget.content);
      if (_cuesController.text != parsed.cues) {
        _cuesController.text = parsed.cues;
      }
      if (_notesController.text != parsed.notes) {
        _notesController.text = parsed.notes;
      }
      if (_summaryController.text !=
          parsed.summary) {
        _summaryController.text = parsed.summary;
      }
    }
  }

  @override
  void dispose() {
    _cuesController.dispose();
    _notesController.dispose();
    _summaryController.dispose();
    super.dispose();
  }

  _CornellContent _parse(String raw) {
    try {
      final map =
          jsonDecode(raw) as Map<String, dynamic>;
      return _CornellContent(
        cues: (map['cues'] as String?) ?? '',
        notes: (map['notes'] as String?) ?? '',
        summary:
            (map['summary'] as String?) ?? '',
      );
    } catch (_) {
      // Legacy plain text → put in notes
      return _CornellContent(
        cues: '',
        notes: raw,
        summary: '',
      );
    }
  }

  void _emitChange() {
    final json = jsonEncode({
      'cues': _cuesController.text,
      'notes': _notesController.text,
      'summary': _summaryController.text,
    });
    widget.onChanged(json);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Top row: Cues (30%) | Notes (70%)
        Expanded(
          child: Row(
            crossAxisAlignment:
                CrossAxisAlignment.stretch,
            children: [
              // Cues section
              SizedBox(
                width: 200,
                child: _Section(
                  label: 'CUES',
                  controller: _cuesController,
                  placeholder:
                      'Questions, keywords...',
                  focused:
                      _focusedSection == 'cues',
                  onFocus: () => setState(
                    () =>
                        _focusedSection = 'cues',
                  ),
                  onChanged: (_) =>
                      _emitChange(),
                  borderSide: BorderSide(
                    color: AppColors.border,
                    width: 2,
                  ),
                ),
              ),
              // Notes section
              Expanded(
                child: _Section(
                  label: 'NOTES',
                  controller: _notesController,
                  placeholder:
                      'Main notes, details...',
                  focused:
                      _focusedSection == 'notes',
                  onFocus: () => setState(
                    () =>
                        _focusedSection = 'notes',
                  ),
                  onChanged: (_) =>
                      _emitChange(),
                ),
              ),
            ],
          ),
        ),
        // Divider
        Container(
          height: 2,
          color: AppColors.border,
        ),
        // Summary section
        SizedBox(
          height: 120,
          child: _Section(
            label: 'SUMMARY',
            controller: _summaryController,
            placeholder:
                'Summarize key points...',
            focused:
                _focusedSection == 'summary',
            onFocus: () => setState(
              () =>
                  _focusedSection = 'summary',
            ),
            onChanged: (_) => _emitChange(),
          ),
        ),
      ],
    );
  }
}

class _CornellContent {
  final String cues;
  final String notes;
  final String summary;

  const _CornellContent({
    required this.cues,
    required this.notes,
    required this.summary,
  });
}

/// A labeled section with a text editor.
class _Section extends StatelessWidget {
  const _Section({
    required this.label,
    required this.controller,
    required this.placeholder,
    required this.focused,
    required this.onFocus,
    required this.onChanged,
    this.borderSide,
  });

  final String label;
  final TextEditingController controller;
  final String placeholder;
  final bool focused;
  final VoidCallback onFocus;
  final ValueChanged<String> onChanged;
  final BorderSide? borderSide;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: borderSide != null
            ? Border(right: borderSide!)
            : null,
        boxShadow: focused
            ? [
                BoxShadow(
                  color: AppColors.primary
                      .withValues(alpha: 0.2),
                  blurRadius: 0,
                  spreadRadius: 2,
                ),
              ]
            : null,
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.stretch,
        children: [
          // Label
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 6,
            ),
            color: AppColors.background,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1,
                color: AppColors.textTertiary,
              ),
            ),
          ),
          const Divider(height: 1),
          // Editor
          Expanded(
            child: Focus(
              onFocusChange: (hasFocus) {
                if (hasFocus) onFocus();
              },
              child: TextField(
                controller: controller,
                maxLines: null,
                expands: true,
                textAlignVertical:
                    TextAlignVertical.top,
                onChanged: onChanged,
                decoration: InputDecoration(
                  hintText: placeholder,
                  border: InputBorder.none,
                  enabledBorder:
                      InputBorder.none,
                  focusedBorder:
                      InputBorder.none,
                  contentPadding:
                      const EdgeInsets.all(12),
                ),
                style: const TextStyle(
                  fontSize: 14,
                  height: 1.6,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
