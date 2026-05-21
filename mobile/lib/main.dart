import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cupid_ai/core/di/service_locator.dart';
import 'package:cupid_ai/core/router/app_router.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/features/auth/presentation/bloc/auth_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait — same as BloodFit's rotation() call
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  await initServiceLocator();

  // Disable runtime font fetching — fonts must be bundled in assets/fonts/.
  // Without this, google_fonts tries to download from fonts.gstatic.com and
  // crashes when the device has no internet, or on first launch.
  GoogleFonts.config.allowRuntimeFetching = false;

  runApp(const CupidAiApp());
}

class CupidAiApp extends StatelessWidget {
  const CupidAiApp({super.key});

  @override
  Widget build(BuildContext context) {
    // ScreenUtilInit wraps everything so .sp / .w / .h / .r work everywhere.
    // designSize matches BloodFit's Size(440, 956) — a common mid-size Android.
    return ScreenUtilInit(
      designSize: const Size(440, 956),
      minTextAdapt: true,
      splitScreenMode: true,
      builder: (context, child) {
        return BlocProvider(
          create: (_) => sl<AuthBloc>(),
          child: MaterialApp.router(
            title: 'Cupid AI',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            routerConfig: appRouter,
          ),
        );
      },
    );
  }
}
