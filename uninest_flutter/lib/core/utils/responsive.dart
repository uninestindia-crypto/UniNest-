import 'package:flutter/material.dart';

/// Utility helpers for responsive breakpoints that mirror the
/// desktop/tablet/mobile cut-offs used by the React implementation.
class Responsive {
  static const double mobileMaxWidth = 768;
  static const double tabletMaxWidth = 1024;

  static bool isMobile(BuildContext context) {
    return MediaQuery.of(context).size.width < mobileMaxWidth;
  }

  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= mobileMaxWidth && width < tabletMaxWidth;
  }

  static bool isDesktop(BuildContext context) {
    return MediaQuery.of(context).size.width >= tabletMaxWidth;
  }
}
