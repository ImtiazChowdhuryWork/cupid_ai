import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:cupid_ai/core/router/app_router.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/utils/validators.dart';
import 'package:cupid_ai/core/widgets/index.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_event.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_state.dart';

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();

  final _emailFocus = FocusNode();
  final _passwordFocus = FocusNode();
  final _confirmFocus = FocusNode();

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    _confirmFocus.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    context.read<AuthBloc>().add(RegisterSubmitted(
          email: _emailCtrl.text.trim(),
          password: _passwordCtrl.text,
          displayName: _nameCtrl.text.trim(),
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
                    const SizedBox(height: 48),
                    _buildHeader(),
                    const SizedBox(height: 40),
                    _buildFields(),
                    const SizedBox(height: 32),
                    _buildSignupButton(),
                    const SizedBox(height: 24),
                    _buildLoginLink(),
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
        Text('Create Account', style: AppTheme.headlineLarge),
        const SizedBox(height: 8),
        Text(
          'Start your flirting journey today',
          style: AppTheme.bodyTextStyle,
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildFields() {
    return Column(
      children: [
        AppTextField(
          label: 'Display Name',
          hint: 'How should we call you?',
          icon: Icons.person_outline,
          controller: _nameCtrl,
          textInputAction: TextInputAction.next,
          onChanged: (_) {},
          onFieldSubmitted: (_) =>
              FocusScope.of(context).requestFocus(_emailFocus),
          validator: Validators.displayName,
        ),
        const SizedBox(height: 16),
        AppEmailField(
          controller: _emailCtrl,
          focusNode: _emailFocus,
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
          textInputAction: TextInputAction.next,
          onFieldSubmitted: (_) =>
              FocusScope.of(context).requestFocus(_confirmFocus),
        ),
        const SizedBox(height: 16),
        AppPasswordField(
          label: 'Confirm Password',
          hint: 'Re-enter your password',
          controller: _confirmCtrl,
          focusNode: _confirmFocus,
          onChanged: (_) {},
          textInputAction: TextInputAction.done,
          onFieldSubmitted: (_) => _submit(),
          validator: (value) =>
              Validators.confirmPassword(value, _passwordCtrl.text),
        ),
      ],
    );
  }

  Widget _buildSignupButton() {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) => AppButton(
        label: 'Create Account',
        onPressed: _submit,
        isLoading: state is AuthLoading,
      ),
    );
  }

  Widget _buildLoginLink() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Already have an account? ',
            style: AppTheme.bodyTextStyle
                .copyWith(color: AppTheme.textSecondaryColor)),
        AppTextButton(
          label: 'Log In',
          onPressed: () => context.go(AppRoutes.login),
        ),
      ],
    );
  }
}
