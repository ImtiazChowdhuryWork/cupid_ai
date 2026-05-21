import 'package:equatable/equatable.dart';

sealed class AnalysisEvent extends Equatable {
  const AnalysisEvent();

  @override
  List<Object?> get props => [];
}

final class AnalysisSubmitted extends AnalysisEvent {
  const AnalysisSubmitted(this.conversationText);
  final String conversationText;

  @override
  List<Object?> get props => [conversationText];
}

final class AnalysisReset extends AnalysisEvent {
  const AnalysisReset();
}

final class HistoryLoadRequested extends AnalysisEvent {
  const HistoryLoadRequested({this.page = 1});
  final int page;

  @override
  List<Object?> get props => [page];
}

final class AnalysisDeleted extends AnalysisEvent {
  const AnalysisDeleted(this.id);
  final String id;

  @override
  List<Object?> get props => [id];
}
