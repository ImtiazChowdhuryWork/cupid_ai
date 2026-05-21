import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:cupid_ai/core/di/service_locator.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/utils/ui_helper.dart';
import 'package:cupid_ai/features/analysis/presentation/bloc/analysis_bloc.dart';
import 'package:cupid_ai/features/analysis/presentation/pages/analysis_page.dart';
import 'package:cupid_ai/features/analysis/presentation/pages/history_page.dart';
import 'package:cupid_ai/features/home/presentation/pages/dashboard_page.dart';
import 'package:cupid_ai/features/profile/presentation/pages/profile_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;
  late final PageController _pageController;

  static const _pages = [
    DashboardPage(),
    AnalysisPage(),
    HistoryPage(),
    ProfilePage(),
  ];

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _selectedIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onTabTapped(int index) {
    if (index == _selectedIndex) return;
    setState(() => _selectedIndex = index);
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.ease,
    );
  }

  void _onPageChanged(int index) {
    setState(() => _selectedIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<AnalysisBloc>(),
      child: Scaffold(
        backgroundColor: AppColors.scaffoldBackground,
        // PageView allows smooth animated transitions between tabs.
        // NeverScrollableScrollPhysics disables swipe — tabs are always
        // intentional taps via the custom bottom nav.
        body: PageView(
          controller: _pageController,
          onPageChanged: _onPageChanged,
          physics: const NeverScrollableScrollPhysics(),
          children: _pages,
        ),
        floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
        floatingActionButton: _buildNavBar(),
      ),
    );
  }

  Widget _buildNavBar() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: UIHelper.defaultPadding),
      child: Container(
        height: 68.h,
        width: double.infinity,
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(UIHelper.radiusXL),
          boxShadow: [
            BoxShadow(
              color: AppColors.primary.withValues(alpha: 0.12),
              blurRadius: 24.r,
              offset: Offset(0, 6.h),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _NavItem(
              icon: Icons.home_rounded,
              outlinedIcon: Icons.home_outlined,
              label: 'Home',
              index: 0,
              selectedIndex: _selectedIndex,
              onTap: _onTabTapped,
            ),
            _NavItem(
              icon: Icons.chat_bubble_rounded,
              outlinedIcon: Icons.chat_bubble_outline_rounded,
              label: 'Analyze',
              index: 1,
              selectedIndex: _selectedIndex,
              onTap: _onTabTapped,
            ),
            _NavItem(
              icon: Icons.history_rounded,
              outlinedIcon: Icons.history_rounded,
              label: 'History',
              index: 2,
              selectedIndex: _selectedIndex,
              onTap: _onTabTapped,
            ),
            _NavItem(
              icon: Icons.person_rounded,
              outlinedIcon: Icons.person_outline_rounded,
              label: 'Profile',
              index: 3,
              selectedIndex: _selectedIndex,
              onTap: _onTabTapped,
            ),
          ],
        ),
      ),
    );
  }
}

// Mirrors BloodFit's NavItem — AnimationController drives a scale animation
// on selection, and an indicator dot animates in/out below the icon.
class _NavItem extends StatefulWidget {
  const _NavItem({
    required this.icon,
    required this.outlinedIcon,
    required this.label,
    required this.index,
    required this.selectedIndex,
    required this.onTap,
  });

  final IconData icon;
  final IconData outlinedIcon;
  final String label;
  final int index;
  final int selectedIndex;
  final void Function(int) onTap;

  @override
  State<_NavItem> createState() => _NavItemState();
}

class _NavItemState extends State<_NavItem> with SingleTickerProviderStateMixin {
  late final AnimationController _scaleCtrl;
  late final Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _scaleCtrl = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnim = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _scaleCtrl, curve: Curves.easeInOut),
    );
    if (widget.selectedIndex == widget.index) _scaleCtrl.forward();
  }

  @override
  void didUpdateWidget(_NavItem oldWidget) {
    super.didUpdateWidget(oldWidget);
    final nowSelected = widget.selectedIndex == widget.index;
    final wasSelected = oldWidget.selectedIndex == oldWidget.index;
    if (nowSelected && !wasSelected) {
      _scaleCtrl.forward();
    } else if (!nowSelected && wasSelected) {
      _scaleCtrl.reverse();
    }
  }

  @override
  void dispose() {
    _scaleCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isSelected = widget.selectedIndex == widget.index;

    return GestureDetector(
      onTap: () => widget.onTap(widget.index),
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 72.w,
        child: AnimatedBuilder(
          animation: _scaleAnim,
          builder: (context, child) => Transform.scale(
            scale: isSelected ? _scaleAnim.value : 1.0,
            child: child,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                isSelected ? widget.icon : widget.outlinedIcon,
                size: 22.sp,
                color: isSelected
                    ? AppColors.navIconSelected
                    : AppColors.navIconUnselected,
              ),
              UIHelper.vXS,
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  widget.label,
                  style: AppTextStyles.navLabel.copyWith(
                    color: isSelected
                        ? AppColors.navIconSelected
                        : AppColors.navIconUnselected,
                    fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  ),
                  maxLines: 1,
                ),
              ),
              UIHelper.vXS,
              // Selection indicator dot — animates in when selected
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                width: isSelected ? 20.w : 0,
                height: isSelected ? 4.h : 0,
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(UIHelper.radiusSM),
                    topRight: Radius.circular(UIHelper.radiusSM),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
