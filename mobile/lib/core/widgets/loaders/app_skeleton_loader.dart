import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';

class AppSkeletonLoader extends StatelessWidget {
  const AppSkeletonLoader({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  final double width;
  final double height;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppTheme.secondaryColor.withValues(alpha: 0.3),
      highlightColor: AppTheme.secondaryColor.withValues(alpha: 0.1),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: AppTheme.secondaryColor,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
      ),
    );
  }
}

class ResponseCardSkeleton extends StatelessWidget {
  const ResponseCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: AppTheme.secondaryColor.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              AppSkeletonLoader(width: 80, height: 24, borderRadius: 20),
              AppSkeletonLoader(width: 40, height: 16, borderRadius: 8),
            ],
          ),
          const SizedBox(height: 12),
          AppSkeletonLoader(width: double.infinity, height: 14),
          const SizedBox(height: 6),
          AppSkeletonLoader(width: double.infinity, height: 14),
          const SizedBox(height: 6),
          AppSkeletonLoader(width: 180, height: 14),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.bottomRight,
            child: AppSkeletonLoader(width: 60, height: 16),
          ),
        ],
      ),
    );
  }
}
