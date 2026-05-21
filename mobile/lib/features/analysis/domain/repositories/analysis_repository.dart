import 'package:cupid_ai/features/analysis/domain/entities/analysis_result.dart';

abstract interface class AnalysisRepository {
  Future<AnalysisResult> analyze(String conversationText);
  Future<List<AnalysisResult>> getHistory({int page = 1, int limit = 20});
  Future<void> deleteAnalysis(String id);
}
