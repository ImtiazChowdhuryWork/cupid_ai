import 'package:equatable/equatable.dart';

sealed class ProfileEvent extends Equatable {
  const ProfileEvent();

  @override
  List<Object?> get props => [];
}

final class ProfileLoadRequested extends ProfileEvent {
  const ProfileLoadRequested();
}

final class ProfileDisplayNameUpdated extends ProfileEvent {
  const ProfileDisplayNameUpdated(this.displayName);
  final String displayName;

  @override
  List<Object?> get props => [displayName];
}
