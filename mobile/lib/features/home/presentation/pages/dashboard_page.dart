import 'package:flutter/material.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/widgets/index.dart';
import 'package:cupid_ai/core/constants/app_constants.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildGreeting(),
                const SizedBox(height: 28),
                _buildQuickAnalyze(context),
                const SizedBox(height: 28),
                _buildStats(),
                const SizedBox(height: 28),
                _buildTipCard(),
                const SizedBox(height: 96), // clear floating nav bar
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildGreeting() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(
                gradient: AppTheme.primaryGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.favorite_rounded,
                  color: Colors.white, size: 22),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Cupid AI',
                    style: AppTheme.captionTextStyle
                        .copyWith(color: AppTheme.primaryColor,
                            fontWeight: FontWeight.w600)),
                Text('Your flirting coach',
                    style: AppTheme.captionTextStyle),
              ],
            ),
          ],
        ),
        const SizedBox(height: 20),
        Text('Good to see you! 👋', style: AppTheme.headlineLarge),
        const SizedBox(height: 6),
        Text(
          'Ready to craft the perfect reply?',
          style: AppTheme.bodyTextStyle
              .copyWith(color: AppTheme.textSecondaryColor),
        ),
      ],
    );
  }

  Widget _buildQuickAnalyze(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.auto_awesome_rounded,
                    color: Colors.white, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Quick Analyze', style: AppTheme.labelTextStyle),
                    Text('Paste a conversation & get replies',
                        style: AppTheme.captionTextStyle),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          AppButton(
            label: 'Start Analyzing',
            onPressed: () {
              // Switch to analyze tab via IndexedStack
              // The parent HomePage manages this; trigger via callback
            },
          ),
        ],
      ),
    );
  }

  Widget _buildStats() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Your Stats', style: AppTheme.labelTextStyle),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: StatCard(
                label: 'Analyses',
                value: '0',
                icon: Icons.analytics_outlined,
                color: AppTheme.primaryColor,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatCard(
                label: 'Day streak',
                value: '0',
                icon: Icons.local_fire_department_rounded,
                color: AppTheme.warningColor,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatCard(
                label: 'Free left',
                value: '${AppConstants.freeAnalysesPerDay}',
                icon: Icons.star_rounded,
                color: AppTheme.successColor,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTipCard() {
    const tips = [
      'Be genuine — authenticity is always attractive.',
      'Mirror their energy. Match the vibe of the conversation.',
      'Ask follow-up questions to show you\'re interested.',
      'A little humor goes a long way. Don\'t be too serious.',
    ];

    final tip = tips[DateTime.now().day % tips.length];

    return AppCard(
      padding: const EdgeInsets.all(20),
      color: AppTheme.primaryColor.withValues(alpha: 0.04),
      borderColor: AppTheme.primaryColor.withValues(alpha: 0.15),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.tips_and_updates_rounded,
                  color: AppTheme.accentColor, size: 20),
              const SizedBox(width: 8),
              Text('Daily Tip', style: AppTheme.labelTextStyle),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            '"$tip"',
            style: AppTheme.bodyTextStyle
                .copyWith(fontStyle: FontStyle.italic),
          ),
        ],
      ),
    );
  }
}
