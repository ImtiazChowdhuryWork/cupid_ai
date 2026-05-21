import 'package:flutter/material.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/widgets/buttons/app_button.dart';
import 'package:cupid_ai/core/widgets/buttons/app_secondary_button.dart';

class AppConfirmationDialog extends StatelessWidget {
  const AppConfirmationDialog({
    super.key,
    required this.title,
    required this.message,
    this.confirmLabel = 'Confirm',
    this.cancelLabel = 'Cancel',
    this.isDestructive = false,
  });

  final String title;
  final String message;
  final String confirmLabel;
  final String cancelLabel;
  final bool isDestructive;

  static Future<bool?> show(
    BuildContext context, {
    required String title,
    required String message,
    String confirmLabel = 'Confirm',
    String cancelLabel = 'Cancel',
    bool isDestructive = false,
  }) {
    return showDialog<bool>(
      context: context,
      builder: (_) => AppConfirmationDialog(
        title: title,
        message: message,
        confirmLabel: confirmLabel,
        cancelLabel: cancelLabel,
        isDestructive: isDestructive,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isDestructive ? Icons.warning_rounded : Icons.help_outline_rounded,
              color: isDestructive ? AppTheme.errorColor : AppTheme.primaryColor,
              size: 48,
            ),
            const SizedBox(height: 16),
            Text(title,
                style: AppTheme.headlineSmall, textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(message,
                style: AppTheme.bodyTextStyle.copyWith(
                    color: AppTheme.textSecondaryColor),
                textAlign: TextAlign.center),
            const SizedBox(height: 24),
            AppButton(
              label: confirmLabel,
              onPressed: () => Navigator.pop(context, true),
              color: isDestructive ? AppTheme.errorColor : AppTheme.primaryColor,
            ),
            const SizedBox(height: 12),
            AppSecondaryButton(
              label: cancelLabel,
              onPressed: () => Navigator.pop(context, false),
            ),
          ],
        ),
      ),
    );
  }
}
