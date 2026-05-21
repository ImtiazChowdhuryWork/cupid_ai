import 'package:cupid_ai/features/analysis/data/datasources/analysis_remote_datasource.dart';
import 'package:cupid_ai/features/analysis/domain/entities/analysis_result.dart';
import 'package:cupid_ai/features/analysis/domain/repositories/analysis_repository.dart';

class AnalysisRepositoryImpl implements AnalysisRepository {
  const AnalysisRepositoryImpl(this._remote);

  final AnalysisRemoteDataSource _remote;

  @override
  Future<AnalysisResult> analyze(String conversationText) =>
      _remote.analyze(conversationText);

  @override
  Future<List<AnalysisResult>> getHistory({int page = 1, int limit = 20}) =>
      _remote.getHistory(page: page, limit: limit);

  @override
  Future<void> deleteAnalysis(String id) => _remote.deleteAnalysis(id);
}
