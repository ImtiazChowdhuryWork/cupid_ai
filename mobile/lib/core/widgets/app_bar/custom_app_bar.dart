import 'package:flutter/material.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  const CustomAppBar({
    super.key,
    required this.title,
    this.leading,
    this.actions,
    this.showBackButton = true,
    this.centerTitle = true,
    this.backgroundColor,
  });

  final String title;
  final Widget? leading;
  final List<Widget>? actions;
  final bool showBackButton;
  final bool centerTitle;
  final Color? backgroundColor;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: backgroundColor ?? Colors.transparent,
      elevation: 0,
      centerTitle: centerTitle,
      leading: leading ??
          (showBackButton && Navigator.canPop(context)
              ? IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded,
                      color: AppTheme.textPrimary, size: 20),
                  onPressed: () => Navigator.pop(context),
                )
              : null),
      title: Text(
        title,
        style: AppTheme.headlineSmall.copyWith(fontSize: 18),
      ),
      actions: actions,
    );
  }
}
