import 'package:equatable/equatable.dart';

class ResponseSuggestion extends Equatable {
  const ResponseSuggestion({
    required this.id,
    required this.mode,
    required this.text,
    required this.confidence,
  });

  final String id;
  final String mode;
  final String text;
  final double confidence;

  @override
  List<Object?> get props => [id, mode, text, confidence];
}
