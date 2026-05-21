import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cupid_ai/core/constants/app_constants.dart';
import 'package:cupid_ai/core/di/service_locator.dart';
import 'package:cupid_ai/core/router/app_router.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';

// Shown immediately on launch. Checks auth state in the background and
// navigates to the correct screen once ready. The branded UI is always
// visible during initialization — no blank flash.
final class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _fadeAnim;
  late final Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
      ),
    );

    _scaleAnim = Tween<double>(begin: 0.75, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOutBack),
      ),
    );

    _controller.forward();
    _initializeApp();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _initializeApp() async {
    // Ensure splash is visible for at least 2 seconds for branding
    await Future.delayed(const Duration(milliseconds: 2200));

    if (!mounted) return;

    final prefs = sl<SharedPreferences>();
    final token = prefs.getString(AppConstants.accessTokenKey);
    final isLoggedIn = token != null && token.isNotEmpty;
    final onboardingDone =
        prefs.getBool(AppConstants.onboardingCompleteKey) ?? false;

    if (isLoggedIn) {
      context.go(AppRoutes.home);
    } else if (!onboardingDone) {
      // First-time user — go to login (onboarding can be added later)
      context.go(AppRoutes.login);
    } else {
      context.go(AppRoutes.login);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: SafeArea(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return FadeTransition(
                opacity: _fadeAnim,
                child: Transform.scale(
                  scale: _scaleAnim.value,
                  child: child,
                ),
              );
            },
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildLogo(),
                SizedBox(height: 24.h),
                _buildTitle(),
                SizedBox(height: 8.h),
                _buildTagline(),
                SizedBox(height: 80.h),
                _buildLoadingIndicator(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return Container(
      width: 100.w,
      height: 100.w,
      decoration: BoxDecoration(
        gradient: AppTheme.primaryGradient,
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.4),
            blurRadius: 32.r,
            offset: Offset(0, 12.h),
          ),
        ],
      ),
      child: Icon(
        Icons.favorite_rounded,
        color: Colors.white,
        size: 48.sp,
      ),
    );
  }

  Widget _buildTitle() {
    return Text(
      'Cupid AI',
      style: AppTextStyles.displayLarge.copyWith(
        foreground: Paint()
          ..shader = const LinearGradient(
            colors: [AppColors.primaryDark, AppColors.primary],
          ).createShader(Rect.fromLTWH(0, 0, 200.w, 50.h)),
      ),
    );
  }

  Widget _buildTagline() {
    return Text(
      'Your AI flirting coach',
      style: AppTextStyles.bodyMedium.copyWith(
        color: AppColors.textSecondary,
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    return SizedBox(
      width: 24.w,
      height: 24.w,
      child: CircularProgressIndicator(
        strokeWidth: 2.5.w,
        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
      ),
    );
  }
}
