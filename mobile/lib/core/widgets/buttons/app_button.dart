import 'package:flutter/material.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.width = double.infinity,
    this.height = 56,
    this.color,
    this.fontSize = 16,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final double width;
  final double height;
  final Color? color;
  final double fontSize;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: color ?? AppTheme.primaryColor,
          disabledBackgroundColor: AppTheme.textHint,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: isLoading ? _spinner() : _label(),
      ),
    );
  }

  Widget _label() => Text(
        label,
        style: TextStyle(
          color: Colors.white,
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          fontFamily: 'Poppins',
        ),
      );

  Widget _spinner() => const SizedBox(
        width: 22,
        height: 22,
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
          strokeWidth: 2.5,
        ),
      );
}
