import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/widgets/cards/app_card.dart';

class ResponseCard extends StatelessWidget {
  const ResponseCard({
    super.key,
    required this.mode,
    required this.text,
    required this.confidence,
    this.onTap,
    this.isSelected = false,
  });

  final String mode;
  final String text;
  final double confidence;
  final VoidCallback? onTap;
  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      color: isSelected
          ? AppTheme.primaryColor.withValues(alpha: 0.05)
          : AppTheme.surface,
      borderColor: isSelected ? AppTheme.primaryColor : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _ModeBadge(mode: mode),
              _ConfidenceChip(confidence: confidence),
            ],
          ),
          const SizedBox(height: 12),
          Text(text, style: AppTheme.bodyTextStyle),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.bottomRight,
            child: _CopyButton(text: text),
          ),
        ],
      ),
    );
  }
}

class _ModeBadge extends StatelessWidget {
  const _ModeBadge({required this.mode});
  final String mode;

  @override
  Widget build(BuildContext context) {
    final color = _modeColor(mode);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color),
      ),
      child: Text(
        mode.toUpperCase(),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          fontFamily: 'Poppins',
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Color _modeColor(String mode) => switch (mode.toLowerCase()) {
        'witty' => const Color(0xFF3B82F6),
        'sincere' => AppTheme.primaryColor,
        'confident' => const Color(0xFFF59E0B),
        'thoughtful' => const Color(0xFF8B5CF6),
        'casual' => const Color(0xFF10B981),
        _ => AppTheme.primaryColor,
      };
}

class _ConfidenceChip extends StatelessWidget {
  const _ConfidenceChip({required this.confidence});
  final double confidence;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.star_rounded, color: AppTheme.accentColor, size: 16),
        const SizedBox(width: 2),
        Text(
          '${(confidence * 100).toStringAsFixed(0)}%',
          style: AppTheme.captionTextStyle.copyWith(
            fontWeight: FontWeight.w600,
            color: AppTheme.textSecondaryColor,
          ),
        ),
      ],
    );
  }
}

class _CopyButton extends StatefulWidget {
  const _CopyButton({required this.text});
  final String text;

  @override
  State<_CopyButton> createState() => _CopyButtonState();
}

class _CopyButtonState extends State<_CopyButton> {
  bool _copied = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _copy,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        child: _copied
            ? const Row(
                key: ValueKey('done'),
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.check, color: AppTheme.successColor, size: 16),
                  SizedBox(width: 4),
                  Text(
                    'Copied',
                    style: TextStyle(
                      color: AppTheme.successColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              )
            : const Row(
                key: ValueKey('copy'),
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.copy_rounded,
                      color: AppTheme.textSecondaryColor, size: 16),
                  SizedBox(width: 4),
                  Text(
                    'Copy',
                    style: TextStyle(
                      color: AppTheme.textSecondaryColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  void _copy() async {
    await Clipboard.setData(ClipboardData(text: widget.text));
    setState(() => _copied = true);
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) setState(() => _copied = false);
  }
}
