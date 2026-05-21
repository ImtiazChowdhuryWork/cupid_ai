import 'package:equatable/equatable.dart';
import 'package:cupid_ai/features/analysis/domain/entities/analysis_result.dart';

sealed class AnalysisState extends Equatable {
  const AnalysisState();

  @override
  List<Object?> get props => [];
}

final class AnalysisInitial extends AnalysisState {
  const AnalysisInitial();
}

final class AnalysisLoading extends AnalysisState {
  const AnalysisLoading();
}

final class AnalysisSuccess extends AnalysisState {
  const AnalysisSuccess(this.result);
  final AnalysisResult result;

  @override
  List<Object?> get props => [result];
}

final class AnalysisFailure extends AnalysisState {
  const AnalysisFailure(this.message);
  final String message;

  @override
  List<Object?> get props => [message];
}

final class HistoryLoading extends AnalysisState {
  const HistoryLoading();
}

final class HistoryLoaded extends AnalysisState {
  const HistoryLoaded(this.results);
  final List<AnalysisResult> results;

  @override
  List<Object?> get props => [results];
}

final class HistoryFailure extends AnalysisState {
  const HistoryFailure(this.message);
  final String message;

  @override
  List<Object?> get props => [message];
}
