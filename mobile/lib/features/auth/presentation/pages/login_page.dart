import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:cupid_ai/core/constants/app_constants.dart';
import 'package:cupid_ai/core/di/service_locator.dart';
import 'package:cupid_ai/core/router/app_router.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/widgets/index.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_event.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_state.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _passwordFocus = FocusNode();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(LoginSubmitted(
          email: _emailCtrl.text.trim(),
          password: _passwordCtrl.text,
        ));
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          context.go(AppRoutes.home);
        } else if (state is AuthFailure) {
          AppSnackBar.error(context, state.message);
        }
      },
      child: Scaffold(
        body: Container(
          decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
          child: SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 60),
                    _buildHeader(),
                    const SizedBox(height: 48),
                    _buildFields(),
                    const SizedBox(height: 12),
                    _buildForgotPassword(),
                    const SizedBox(height: 32),
                    _buildLoginButton(),
                    const SizedBox(height: 24),
                    _buildDivider(),
                    const SizedBox(height: 24),
                    _buildSignupLink(),
                    if (kDebugMode) ...[
                      const SizedBox(height: 16),
                      _buildDevBypass(),
                    ],
                    const SizedBox(height: 32),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: const Icon(Icons.favorite_rounded,
              color: Colors.white, size: 40),
        ),
        const SizedBox(height: 20),
        Text('Welcome Back', style: AppTheme.headlineLarge),
        const SizedBox(height: 8),
        Text(
          'Your AI flirting coach is waiting',
          style: AppTheme.bodyTextStyle,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildFields() {
    return Column(
      children: [
        AppEmailField(
          controller: _emailCtrl,
          onChanged: (_) {},
          textInputAction: TextInputAction.next,
          onFieldSubmitted: (_) =>
              FocusScope.of(context).requestFocus(_passwordFocus),
        ),
        const SizedBox(height: 16),
        AppPasswordField(
          controller: _passwordCtrl,
          focusNode: _passwordFocus,
          onChanged: (_) {},
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _submit(),
        ),
      ],
    );
  }

  Widget _buildForgotPassword() {
    return Align(
      alignment: Alignment.centerRight,
      child: AppTextButton(
        label: 'Forgot password?',
        onPressed: () {},
      ),
    );
  }

  Widget _buildLoginButton() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) => AppButton(
        label: 'Log In',
        onPressed: _submit,
        isLoading: state is AuthLoading,
      ),
    );
  }

  Widget _buildDivider() {
    return Row(
      children: [
        const Expanded(child: Divider(color: AppTheme.textHint)),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text('or', style: AppTheme.captionTextStyle),
        ),
        const Expanded(child: Divider(color: AppTheme.textHint)),
      ],
    );
  }

  // Visible only in debug builds — bypasses the real API by writing a fake
  // token to SharedPreferences so the auth guard lets us through to the home.
  Widget _buildDevBypass() {
    return OutlinedButton.icon(
      icon: const Icon(Icons.developer_mode, size: 16),
      label: const Text('DEV — Skip Login'),
      style: OutlinedButton.styleFrom(
        foregroundColor: AppTheme.textSecondaryColor,
        side: const BorderSide(color: AppTheme.textHint),
        textStyle: const TextStyle(fontSize: 12),
        minimumSize: const Size(double.infinity, 44),
      ),
      onPressed: () async {
        final prefs = sl<SharedPreferences>();
        await prefs.setString(AppConstants.accessTokenKey, 'dev_fake_token');
        await prefs.setString(AppConstants.userIdKey, 'dev_user_001');
        // ignore: use_build_context_synchronously
        if (context.mounted) context.go(AppRoutes.home);
      },
    );
  }

  Widget _buildSignupLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text("Don't have an account? ",
            style: AppTheme.bodyTextStyle
                .copyWith(color: AppTheme.textSecondaryColor)),
        AppTextButton(
          label: 'Sign Up',
          onPressed: () => context.go(AppRoutes.signup),
        ),
      ],
    );
  }
}
