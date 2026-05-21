import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cupid_ai/features/auth/domain/usecases/login_usecase.dart';
import 'package:cupid_ai/features/auth/domain/usecases/register_usecase.dart';
import 'package:cupid_ai/features/auth/domain/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required AuthRepository authRepository,
  })  : _login = loginUseCase,
        _register = registerUseCase,
        _auth = authRepository,
        super(const AuthInitial()) {
    on<LoginSubmitted>(_onLogin);
    on<RegisterSubmitted>(_onRegister);
    on<LogoutRequested>(_onLogout);
  }

  final LoginUseCase _login;
  final RegisterUseCase _register;
  final AuthRepository _auth;

  Future<void> _onLogin(
    LoginSubmitted event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final result = await _login.execute(
        email: event.email,
        password: event.password,
      );
      emit(AuthAuthenticated(result.user));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onRegister(
    RegisterSubmitted event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());
    try {
      final result = await _register.execute(
        email: event.email,
        password: event.password,
        displayName: event.displayName,
      );
      emit(AuthAuthenticated(result.user));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onLogout(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _auth.logout();
    emit(const AuthUnauthenticated());
  }
}
