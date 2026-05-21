import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import 'package:cupid_ai/core/network/api_client.dart';

// Auth
import 'package:cupid_ai/features/auth/data/datasources/auth_remote_datasource.dart';
import 'package:cupid_ai/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:cupid_ai/features/auth/domain/repositories/auth_repository.dart';
import 'package:cupid_ai/features/auth/domain/usecases/login_usecase.dart';
import 'package:cupid_ai/features/auth/domain/usecases/register_usecase.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_bloc.dart';

// Analysis
import 'package:cupid_ai/features/analysis/data/datasources/analysis_remote_datasource.dart';
import 'package:cupid_ai/features/analysis/data/repositories/analysis_repository_impl.dart';
import 'package:cupid_ai/features/analysis/domain/repositories/analysis_repository.dart';
import 'package:cupid_ai/features/analysis/domain/usecases/analyze_conversation_usecase.dart';
import 'package:cupid_ai/features/analysis/domain/usecases/get_history_usecase.dart';
import 'package:cupid_ai/features/analysis/presentation/bloc/analysis_bloc.dart';

// Profile
import 'package:cupid_ai/features/profile/data/datasources/profile_remote_datasource.dart';
import 'package:cupid_ai/features/profile/data/repositories/profile_repository_impl.dart';
import 'package:cupid_ai/features/profile/domain/repositories/profile_repository.dart';
import 'package:cupid_ai/features/profile/domain/usecases/get_profile_usecase.dart';
import 'package:cupid_ai/features/profile/presentation/bloc/profile_bloc.dart';

final sl = GetIt.instance;

Future<void> initServiceLocator() async {
  final prefs = await SharedPreferences.getInstance();
  sl.registerSingleton<SharedPreferences>(prefs);

  sl.registerLazySingleton<Dio>(
    () => ApiClient.create(
      tokenProvider: () =>
          sl<SharedPreferences>().getString('access_token'),
    ),
  );

  _registerAuth();
  _registerAnalysis();
  _registerProfile();
}

void _registerAuth() {
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(sl<Dio>()),
  );
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      sl<AuthRemoteDataSource>(),
      sl<SharedPreferences>(),
    ),
  );
  sl.registerLazySingleton(() => LoginUseCase(sl<AuthRepository>()));
  sl.registerLazySingleton(() => RegisterUseCase(sl<AuthRepository>()));
  sl.registerFactory(
    () => AuthBloc(
      loginUseCase: sl<LoginUseCase>(),
      registerUseCase: sl<RegisterUseCase>(),
      authRepository: sl<AuthRepository>(),
    ),
  );
}

void _registerAnalysis() {
  sl.registerLazySingleton<AnalysisRemoteDataSource>(
    () => AnalysisRemoteDataSourceImpl(sl<Dio>()),
  );
  sl.registerLazySingleton<AnalysisRepository>(
    () => AnalysisRepositoryImpl(sl<AnalysisRemoteDataSource>()),
  );
  sl.registerLazySingleton(
      () => AnalyzeConversationUseCase(sl<AnalysisRepository>()));
  sl.registerLazySingleton(
      () => GetHistoryUseCase(sl<AnalysisRepository>()));
  sl.registerFactory(
    () => AnalysisBloc(
      analyzeUseCase: sl<AnalyzeConversationUseCase>(),
      historyUseCase: sl<GetHistoryUseCase>(),
      repository: sl<AnalysisRepository>(),
    ),
  );
}

void _registerProfile() {
  sl.registerLazySingleton<ProfileRemoteDataSource>(
    () => ProfileRemoteDataSourceImpl(sl<Dio>()),
  );
  sl.registerLazySingleton<ProfileRepository>(
    () => ProfileRepositoryImpl(sl<ProfileRemoteDataSource>()),
  );
  sl.registerLazySingleton(
      () => GetProfileUseCase(sl<ProfileRepository>()));
  sl.registerFactory(
    () => ProfileBloc(
      getProfileUseCase: sl<GetProfileUseCase>(),
      repository: sl<ProfileRepository>(),
    ),
  );
}
