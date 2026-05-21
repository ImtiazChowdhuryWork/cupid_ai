import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cupid_ai/features/analysis/domain/usecases/analyze_conversation_usecase.dart';
import 'package:cupid_ai/features/analysis/domain/usecases/get_history_usecase.dart';
import 'package:cupid_ai/features/analysis/domain/repositories/analysis_repository.dart';
import 'analysis_event.dart';
import 'analysis_state.dart';

class AnalysisBloc extends Bloc<AnalysisEvent, AnalysisState> {
  AnalysisBloc({
    required AnalyzeConversationUseCase analyzeUseCase,
    required GetHistoryUseCase historyUseCase,
    required AnalysisRepository repository,
  })  : _analyze = analyzeUseCase,
        _history = historyUseCase,
        _repository = repository,
        super(const AnalysisInitial()) {
    on<AnalysisSubmitted>(_onAnalysisSubmitted);
    on<AnalysisReset>(_onReset);
    on<HistoryLoadRequested>(_onHistoryLoad);
    on<AnalysisDeleted>(_onDelete);
  }

  final AnalyzeConversationUseCase _analyze;
  final GetHistoryUseCase _history;
  final AnalysisRepository _repository;

  Future<void> _onAnalysisSubmitted(
    AnalysisSubmitted event,
    Emitter<AnalysisState> emit,
  ) async {
    emit(const AnalysisLoading());
    try {
      final result = await _analyze.execute(event.conversationText);
      emit(AnalysisSuccess(result));
    } catch (e) {
      emit(AnalysisFailure(e.toString()));
    }
  }

  void _onReset(AnalysisReset event, Emitter<AnalysisState> emit) {
    emit(const AnalysisInitial());
  }

  Future<void> _onHistoryLoad(
    HistoryLoadRequested event,
    Emitter<AnalysisState> emit,
  ) async {
    emit(const HistoryLoading());
    try {
      final results = await _history.execute(page: event.page);
      emit(HistoryLoaded(results));
    } catch (e) {
      emit(HistoryFailure(e.toString()));
    }
  }

  Future<void> _onDelete(
    AnalysisDeleted event,
    Emitter<AnalysisState> emit,
  ) async {
    try {
      await _repository.deleteAnalysis(event.id);
      // Reload history after deletion
      add(const HistoryLoadRequested());
    } catch (e) {
      emit(HistoryFailure(e.toString()));
    }
  }
}
