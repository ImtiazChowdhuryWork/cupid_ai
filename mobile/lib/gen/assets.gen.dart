// dart format width=80
// GENERATED CODE - DO NOT MODIFY BY HAND
// Run: flutter pub run build_runner build to regenerate after adding assets.

// coverage:ignore-file
// ignore_for_file: type=lint

import 'package:flutter/widgets.dart';

class $AssetsIconsGen {
  const $AssetsIconsGen();

  // Nav icons (SVG) — add .svg files to assets/icons/ and regenerate
  String get home => 'assets/icons/home_icon.svg';
  String get analyze => 'assets/icons/analyze_icon.svg';
  String get history => 'assets/icons/history_icon.svg';
  String get profile => 'assets/icons/profile_icon.svg';
  String get heart => 'assets/icons/heart_icon.svg';

  // Auth icons
  String get google => 'assets/icons/google_icon.svg';
  String get eyeOpen => 'assets/icons/eye_open.svg';
  String get eyeClosed => 'assets/icons/eye_closed.svg';
  String get lock => 'assets/icons/lock_icon.svg';
  String get email => 'assets/icons/email_icon.svg';
}

class $AssetsImagesGen {
  const $AssetsImagesGen();

  // App branding — add .png files to assets/images/ and regenerate
  AssetGenImage get appLogo =>
      const AssetGenImage('assets/images/app_logo.png');
  AssetGenImage get splashLogo =>
      const AssetGenImage('assets/images/splash_logo.png');
  AssetGenImage get onboardingOne =>
      const AssetGenImage('assets/images/onboarding_one.png');
  AssetGenImage get onboardingTwo =>
      const AssetGenImage('assets/images/onboarding_two.png');
  AssetGenImage get defaultAvatar =>
      const AssetGenImage('assets/images/default_avatar.png');
}

class $AssetsAnimationsGen {
  const $AssetsAnimationsGen();

  // Lottie animations — add .json files to assets/animations/ and regenerate
  String get splash => 'assets/animations/splash.json';
  String get analyzing => 'assets/animations/analyzing.json';
  String get success => 'assets/animations/success.json';
  String get empty => 'assets/animations/empty.json';
  String get heartBeat => 'assets/animations/heart_beat.json';
}

class Assets {
  Assets._();

  static const $AssetsIconsGen icons = $AssetsIconsGen();
  static const $AssetsImagesGen images = $AssetsImagesGen();
  static const $AssetsAnimationsGen animations = $AssetsAnimationsGen();
}

class AssetGenImage {
  const AssetGenImage(this._assetName);

  final String _assetName;

  Image image({
    Key? key,
    double? width,
    double? height,
    Color? color,
    BoxFit? fit,
    AlignmentGeometry alignment = Alignment.center,
  }) {
    return Image.asset(
      _assetName,
      key: key,
      width: width,
      height: height,
      color: color,
      fit: fit,
      alignment: alignment,
    );
  }

  ImageProvider provider() => AssetImage(_assetName);

  String get path => _assetName;
}
