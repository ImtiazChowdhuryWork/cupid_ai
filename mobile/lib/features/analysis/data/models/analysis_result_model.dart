import 'package:cupid_ai/features/analysis/data/models/response_suggestion_model.dart';
import 'package:cupid_ai/features/analysis/domain/entities/analysis_result.dart';

class AnalysisResultModel extends AnalysisResult {
  const AnalysisResultModel({
    required super.id,
    required super.conversationText,
    required super.suggestions,
    required super.sentiment,
    required super.createdAt,
  });

  factory AnalysisResultModel.fromJson(Map<String, dynamic> json) =>
      AnalysisResultModel(
        id: json['id'] as String,
        conversationText: json['conversation_text'] as String,
        suggestions: (json['suggestions'] as List)
            .map((s) =>
                ResponseSuggestionModel.fromJson(s as Map<String, dynamic>))
            .toList(),
        sentiment: json['sentiment'] as String? ?? 'neutral',
        createdAt: DateTime.parse(json['created_at'] as String),
      );
}
