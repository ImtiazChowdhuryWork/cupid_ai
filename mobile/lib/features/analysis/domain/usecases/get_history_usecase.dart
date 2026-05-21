import 'package:cupid_ai/features/analysis/domain/entities/analysis_result.dart';
import 'package:cupid_ai/features/analysis/domain/repositories/analysis_repository.dart';

class GetHistoryUseCase {
  const GetHistoryUseCase(this._repository);

  final AnalysisRepository _repository;

  Future<List<AnalysisResult>> execute({int page = 1, int limit = 20}) {
    return _repository.getHistory(page: page, limit: limit);
  }
}
