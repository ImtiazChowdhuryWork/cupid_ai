import 'package:cupid_ai/features/analysis/domain/entities/response_suggestion.dart';

class ResponseSuggestionModel extends ResponseSuggestion {
  const ResponseSuggestionModel({
    required super.id,
    required super.mode,
    required super.text,
    required super.confidence,
  });

  factory ResponseSuggestionModel.fromJson(Map<String, dynamic> json) =>
      ResponseSuggestionModel(
        id: json['id'] as String? ?? '',
        mode: json['mode'] as String,
        text: json['text'] as String,
        confidence: (json['confidence'] as num).toDouble(),
      );
}
