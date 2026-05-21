import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:cupid_ai/core/di/service_locator.dart';
import 'package:cupid_ai/core/router/app_router.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/widgets/index.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_event.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_state.dart';
import 'package:cupid_ai/features/profile/domain/entities/user_profile.dart';
import 'package:cupid_ai/features/profile/presentation/bloc/profile_bloc.dart';
import 'package:cupid_ai/features/profile/presentation/bloc/profile_event.dart';
import 'package:cupid_ai/features/profile/presentation/bloc/profile_state.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (_) =>
              sl<ProfileBloc>()..add(const ProfileLoadRequested()),
        ),
      ],
      child: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthUnauthenticated) {
            context.go(AppRoutes.login);
          }
        },
        child: Scaffold(
          body: Container(
            decoration:
                const BoxDecoration(gradient: AppTheme.backgroundGradient),
            child: SafeArea(
              child: BlocBuilder<ProfileBloc, ProfileState>(
                builder: (context, state) {
                  if (state is ProfileLoading || state is ProfileInitial) {
                    return const AppLoader(message: 'Loading profile...');
                  }
                  if (state is ProfileFailure) {
                    return _ErrorView(
                      message: state.message,
                      onRetry: () => context
                          .read<ProfileBloc>()
                          .add(const ProfileLoadRequested()),
                    );
                  }
                  if (state is ProfileLoaded) {
                    return _ProfileContent(profile: state.profile);
                  }
                  return const SizedBox.shrink();
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ProfileContent extends StatelessWidget {
  const _ProfileContent({required this.profile});

  final UserProfile profile;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 16),
          _buildAvatar(profile),
          const SizedBox(height: 20),
          _buildTierBadge(profile),
          const SizedBox(height: 32),
          _buildUsageBar(profile),
          const SizedBox(height: 28),
          _buildStats(profile),
          const SizedBox(height: 28),
          _buildMenuItems(context),
          const SizedBox(height: 24),
          _buildLogoutButton(context),
          const SizedBox(height: 96), // clear floating nav bar
        ],
      ),
    );
  }

  Widget _buildAvatar(UserProfile p) {
    return Column(
      children: [
        Container(
          width: 88,
          height: 88,
          decoration: BoxDecoration(
            gradient: AppTheme.primaryGradient,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Icon(Icons.person_rounded,
              color: Colors.white, size: 44),
        ),
        const SizedBox(height: 16),
        Text(p.displayName.isEmpty ? 'No name set' : p.displayName,
            style: AppTheme.headlineMedium),
        const SizedBox(height: 4),
        Text(p.email, style: AppTheme.captionTextStyle),
      ],
    );
  }

  Widget _buildTierBadge(UserProfile p) {
    final label = switch (p.subscriptionTier) {
      'basic' => 'Basic Plan',
      'monthly' => 'Monthly Plan',
      'premium' => 'Premium Plan',
      _ => 'Free Plan',
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        gradient: p.isPremium
            ? AppTheme.primaryGradient
            : const LinearGradient(
                colors: [Color(0xFF6B7280), Color(0xFF9CA3AF)]),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primaryColor
                .withValues(alpha: p.isPremium ? 0.3 : 0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.star_rounded, color: Colors.white, size: 18),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
              fontFamily: 'Poppins',
              fontSize: 14,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUsageBar(UserProfile p) {
    final used = p.dailyAnalysesUsed;
    final limit = p.dailyAnalysesLimit;
    final ratio = limit == 0 ? 0.0 : (used / limit).clamp(0.0, 1.0);

    return AppCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Daily Usage', style: AppTheme.labelTextStyle),
              Text('$used / $limit',
                  style: AppTheme.captionTextStyle.copyWith(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: ratio,
              backgroundColor: AppTheme.secondaryColor.withValues(alpha: 0.3),
              valueColor: AlwaysStoppedAnimation<Color>(
                ratio >= 1.0 ? AppTheme.errorColor : AppTheme.primaryColor,
              ),
              minHeight: 10,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            p.dailyAnalysesRemaining > 0
                ? '${p.dailyAnalysesRemaining} analyses remaining today'
                : 'Daily limit reached. Upgrade for more.',
            style: AppTheme.captionTextStyle,
          ),
        ],
      ),
    );
  }

  Widget _buildStats(UserProfile p) {
    return Row(
      children: [
        Expanded(
          child: StatCard(
            label: 'Total Analyses',
            value: '${p.totalAnalyses}',
            icon: Icons.bar_chart_rounded,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: StatCard(
            label: 'Best Streak',
            value: '${p.bestStreak}d',
            icon: Icons.local_fire_department_rounded,
            color: AppTheme.warningColor,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: StatCard(
            label: 'Streak',
            value: '${p.currentStreak}d',
            icon: Icons.bolt_rounded,
            color: AppTheme.accentColor,
          ),
        ),
      ],
    );
  }

  Widget _buildMenuItems(BuildContext context) {
    return AppCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          _MenuItem(
            icon: Icons.upgrade_rounded,
            label: 'Upgrade Plan',
            color: AppTheme.primaryColor,
            onTap: () {},
          ),
          const Divider(height: 1, color: AppTheme.surfaceVariant),
          _MenuItem(
            icon: Icons.edit_outlined,
            label: 'Edit Display Name',
            onTap: () => _editName(context),
          ),
          const Divider(height: 1, color: AppTheme.surfaceVariant),
          _MenuItem(
            icon: Icons.notifications_outlined,
            label: 'Notifications',
            onTap: () {},
          ),
          const Divider(height: 1, color: AppTheme.surfaceVariant),
          _MenuItem(
            icon: Icons.privacy_tip_outlined,
            label: 'Privacy Policy',
            onTap: () {},
          ),
          const Divider(height: 1, color: AppTheme.surfaceVariant),
          _MenuItem(
            icon: Icons.help_outline_rounded,
            label: 'Help & Support',
            onTap: () {},
          ),
        ],
      ),
    );
  }

  void _editName(BuildContext context) {
    final ctrl = TextEditingController(text: profile.displayName);
    AppBottomSheet.show(
      context,
      title: 'Edit Display Name',
      child: Column(
        children: [
          AppTextField(
            label: 'Display Name',
            hint: 'Your name',
            controller: ctrl,
            icon: Icons.person_outline,
            onChanged: (_) {},
          ),
          const SizedBox(height: 20),
          AppButton(
            label: 'Save',
            onPressed: () {
              final name = ctrl.text.trim();
              if (name.isNotEmpty) {
                context.read<ProfileBloc>().add(
                      ProfileDisplayNameUpdated(name),
                    );
              }
              Navigator.pop(context);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildLogoutButton(BuildContext context) {
    return AppSecondaryButton(
      label: 'Log Out',
      onPressed: () async {
        final confirmed = await AppConfirmationDialog.show(
          context,
          title: 'Log Out',
          message: 'Are you sure you want to log out?',
          confirmLabel: 'Log Out',
          isDestructive: true,
        );
        if (confirmed == true && context.mounted) {
          context.read<AuthBloc>().add(const LogoutRequested());
        }
      },
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline,
                color: AppTheme.errorColor, size: 56),
            const SizedBox(height: 16),
            Text('Could not load profile', style: AppTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(message,
                style: AppTheme.bodyTextStyle
                    .copyWith(color: AppTheme.textSecondaryColor),
                textAlign: TextAlign.center),
            const SizedBox(height: 24),
            AppButton(label: 'Retry', onPressed: onRetry, width: 140),
          ],
        ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  const _MenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading:
          Icon(icon, color: color ?? AppTheme.textSecondaryColor, size: 22),
      title: Text(
        label,
        style: AppTheme.bodyTextStyle.copyWith(
          color: color ?? AppTheme.textPrimary,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(Icons.chevron_right_rounded,
          color: AppTheme.textHint, size: 20),
      onTap: onTap,
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
    );
  }
}
