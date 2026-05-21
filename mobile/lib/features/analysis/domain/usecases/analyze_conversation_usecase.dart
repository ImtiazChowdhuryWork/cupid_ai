import 'package:cupid_ai/features/analysis/domain/entities/analysis_result.dart';
import 'package:cupid_ai/features/analysis/domain/repositories/analysis_repository.dart';

class AnalyzeConversationUseCase {
  const AnalyzeConversationUseCase(this._repository);

  final AnalysisRepository _repository;

  Future<AnalysisResult> execute(String conversationText) {
    return _repository.analyze(conversationText);
  }
}
