import 'package:equatable/equatable.dart';
import 'package:cupid_ai/features/analysis/domain/entities/response_suggestion.dart';

class AnalysisResult extends Equatable {
  const AnalysisResult({
    required this.id,
    required this.conversationText,
    required this.suggestions,
    required this.sentiment,
    required this.createdAt,
  });

  final String id;
  final String conversationText;
  final List<ResponseSuggestion> suggestions;
  final String sentiment; // positive, neutral, negative
  final DateTime createdAt;

  @override
  List<Object?> get props =>
      [id, conversationText, suggestions, sentiment, createdAt];
}
