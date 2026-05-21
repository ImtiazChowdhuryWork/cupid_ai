import 'package:flutter/material.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';

class AppLoader extends StatelessWidget {
  const AppLoader({super.key, this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(
            valueColor:
                AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
            strokeWidth: 3,
          ),
          if (message != null) ...[
            const SizedBox(height: 16),
            Text(
              message!,
              style: AppTheme.bodyTextStyle
                  .copyWith(color: AppTheme.textSecondaryColor),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

class PageLoader extends StatelessWidget {
  const PageLoader({super.key, this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppLoader(message: message),
    );
  }
}
