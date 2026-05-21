import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cupid_ai/core/constants/app_constants.dart';
import 'package:cupid_ai/core/di/service_locator.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:cupid_ai/features/auth/presentation/pages/login_page.dart';
import 'package:cupid_ai/features/auth/presentation/pages/signup_page.dart';
import 'package:cupid_ai/features/home/presentation/pages/home_page.dart';
import 'package:cupid_ai/splash_screen.dart';

class AppRoutes {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String signup = '/signup';
  static const String home = '/';
  static const String analysis = '/analysis';
  static const String history = '/history';
  static const String profile = '/profile';
}

final appRouter = GoRouter(
  // Always start at splash — it handles auth decision
  initialLocation: AppRoutes.splash,
  redirect: (context, state) {
    // Splash manages its own navigation; don't interfere
    if (state.matchedLocation == AppRoutes.splash) return null;

    final prefs = sl<SharedPreferences>();
    final token = prefs.getString(AppConstants.accessTokenKey);
    final isLoggedIn = token != null && token.isNotEmpty;

    final isAuthRoute = state.matchedLocation == AppRoutes.login ||
        state.matchedLocation == AppRoutes.signup;

    if (!isLoggedIn && !isAuthRoute) return AppRoutes.login;
    if (isLoggedIn && isAuthRoute) return AppRoutes.home;
    return null;
  },
  routes: [
    GoRoute(
      path: AppRoutes.splash,
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: AppRoutes.login,
      builder: (context, state) => BlocProvider(
        create: (_) => sl<AuthBloc>(),
        child: const LoginPage(),
      ),
    ),
    GoRoute(
      path: AppRoutes.signup,
      builder: (context, state) => BlocProvider(
        create: (_) => sl<AuthBloc>(),
        child: const SignupPage(),
      ),
    ),
    GoRoute(
      path: AppRoutes.home,
      builder: (context, state) => const HomePage(),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(child: Text('Page not found: ${state.error}')),
  ),
);
