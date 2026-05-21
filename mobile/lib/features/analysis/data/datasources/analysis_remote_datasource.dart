import 'package:dio/dio.dart';
import 'package:cupid_ai/core/network/api_client.dart';
import 'package:cupid_ai/features/analysis/data/models/analysis_result_model.dart';

abstract interface class AnalysisRemoteDataSource {
  Future<AnalysisResultModel> analyze(String conversationText);
  Future<List<AnalysisResultModel>> getHistory({int page = 1, int limit = 20});
  Future<void> deleteAnalysis(String id);
}

class AnalysisRemoteDataSourceImpl implements AnalysisRemoteDataSource {
  const AnalysisRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<AnalysisResultModel> analyze(String conversationText) async {
    try {
      final response = await _dio.post('/analysis', data: {
        'conversation_text': conversationText,
      });
      return AnalysisResultModel.fromJson(
          response.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiClient.handleError(e);
    }
  }

  @override
  Future<List<AnalysisResultModel>> getHistory({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get('/analysis/history', queryParameters: {
        'page': page,
        'limit': limit,
      });
      final items = (response.data['items'] as List?) ?? [];
      return items
          .map((e) =>
              AnalysisResultModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw ApiClient.handleError(e);
    }
  }

  @override
  Future<void> deleteAnalysis(String id) async {
    try {
      await _dio.delete('/analysis/$id');
    } catch (e) {
      throw ApiClient.handleError(e);
    }
  }
}
