import 'package:flutter/material.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/widgets/cards/app_card.dart';

class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    final c = color ?? AppTheme.primaryColor;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: c.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: c, size: 20),
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: AppTheme.headlineSmall.copyWith(color: c),
          ),
          const SizedBox(height: 4),
          Text(label, style: AppTheme.captionTextStyle),
        ],
      ),
    );
  }
}
