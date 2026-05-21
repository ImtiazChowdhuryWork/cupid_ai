import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cupid_ai/features/profile/domain/usecases/get_profile_usecase.dart';
import 'package:cupid_ai/features/profile/domain/repositories/profile_repository.dart';
import 'profile_event.dart';
import 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  ProfileBloc({
    required GetProfileUseCase getProfileUseCase,
    required ProfileRepository repository,
  })  : _getProfile = getProfileUseCase,
        _repository = repository,
        super(const ProfileInitial()) {
    on<ProfileLoadRequested>(_onLoad);
    on<ProfileDisplayNameUpdated>(_onUpdateName);
  }

  final GetProfileUseCase _getProfile;
  final ProfileRepository _repository;

  Future<void> _onLoad(
    ProfileLoadRequested event,
    Emitter<ProfileState> emit,
  ) async {
    emit(const ProfileLoading());
    try {
      final profile = await _getProfile.execute();
      emit(ProfileLoaded(profile));
    } catch (e) {
      emit(ProfileFailure(e.toString()));
    }
  }

  Future<void> _onUpdateName(
    ProfileDisplayNameUpdated event,
    Emitter<ProfileState> emit,
  ) async {
    try {
      final profile = await _repository.updateDisplayName(event.displayName);
      emit(ProfileLoaded(profile));
    } catch (e) {
      emit(ProfileFailure(e.toString()));
    }
  }
}
