import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cupid_ai/gen/colors.gen.dart';

final class UIHelper {
  UIHelper._();

  // --- Vertical spacing ---
  static Widget get vXS => SizedBox(height: 4.h);
  static Widget get vSM => SizedBox(height: 8.h);
  static Widget get vMD => SizedBox(height: 16.h);
  static Widget get vLG => SizedBox(height: 24.h);
  static Widget get vXL => SizedBox(height: 32.h);
  static Widget get v2XL => SizedBox(height: 48.h);
  static Widget get v3XL => SizedBox(height: 64.h);

  // --- Horizontal spacing ---
  static Widget get hXS => SizedBox(width: 4.w);
  static Widget get hSM => SizedBox(width: 8.w);
  static Widget get hMD => SizedBox(width: 16.w);
  static Widget get hLG => SizedBox(width: 24.w);
  static Widget get hXL => SizedBox(width: 32.w);

  // --- Custom sizing ---
  static Widget verticalSpace(double height) => SizedBox(height: height.h);
  static Widget horizontalSpace(double width) => SizedBox(width: width.w);

  // --- Screen padding ---
  static double get defaultPadding => 24.w;
  static EdgeInsets get screenPadding => EdgeInsets.symmetric(horizontal: 24.w);
  static EdgeInsets get cardPadding => EdgeInsets.all(16.r);

  // --- Border radii ---
  static double get radiusSM => 8.r;
  static double get radiusMD => 12.r;
  static double get radiusLG => 16.r;
  static double get radiusXL => 24.r;
  static double get radiusFull => 100.r;

  // --- Divider ---
  static Widget divider() => Container(
        height: 0.6.h,
        color: AppColors.textHint.withValues(alpha: 0.3),
        width: double.infinity,
      );

  // --- Bottom nav space (so content isn't hidden behind nav) ---
  static Widget get bottomNavSpace => SizedBox(height: 80.h);
}
