import 'package:flutter/material.dart';
import 'package:cupid_ai/core/widgets/index.dart';
import 'package:cupid_ai/features/analysis/domain/entities/response_suggestion.dart';

class ResponseSuggestionsList extends StatefulWidget {
  const ResponseSuggestionsList({super.key, required this.suggestions});

  final List<ResponseSuggestion> suggestions;

  @override
  State<ResponseSuggestionsList> createState() =>
      _ResponseSuggestionsListState();
}

class _ResponseSuggestionsListState extends State<ResponseSuggestionsList> {
  String? _selectedId;

  @override
  Widget build(BuildContext context) {
    return SliverList.separated(
      itemCount: widget.suggestions.length,
      separatorBuilder: (context, i) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final suggestion = widget.suggestions[index];
        return ResponseCard(
          mode: suggestion.mode,
          text: suggestion.text,
          confidence: suggestion.confidence,
          isSelected: _selectedId == suggestion.id,
          onTap: () => setState(() => _selectedId = suggestion.id),
        );
      },
    );
  }
}
