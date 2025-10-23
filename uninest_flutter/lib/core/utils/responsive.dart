import 'package:flutter/material.dart';

class Responsive {
  final BuildContext context;
  late final MediaQueryData _mediaQuery;
  late final Size _size;
  
  Responsive(this.context) {
    _mediaQuery = MediaQuery.of(context);
    _size = _mediaQuery.size;
  }
  
  // Breakpoints matching the React app
  static const double mobileBreakpoint = 768;
  static const double tabletBreakpoint = 1024;
  static const double desktopBreakpoint = 1440;
  
  // Screen size getters
  double get width => _size.width;
  double get height => _size.height;
  double get aspectRatio => _size.aspectRatio;
  
  // Device type checks
  bool get isMobile => width < mobileBreakpoint;
  bool get isTablet => width >= mobileBreakpoint && width < tabletBreakpoint;
  bool get isDesktop => width >= tabletBreakpoint;
  bool get isLargeDesktop => width >= desktopBreakpoint;
  
  // Orientation checks
  bool get isPortrait => _mediaQuery.orientation == Orientation.portrait;
  bool get isLandscape => _mediaQuery.orientation == Orientation.landscape;
  
  // Platform checks
  bool get isIOS => Theme.of(context).platform == TargetPlatform.iOS;
  bool get isAndroid => Theme.of(context).platform == TargetPlatform.android;
  bool get isWeb => identical(0, 0.0); // Web platform check
  
  // Responsive values
  T value<T>({
    required T mobile,
    T? tablet,
    T? desktop,
    T? largeDesktop,
  }) {
    if (isLargeDesktop && largeDesktop != null) return largeDesktop;
    if (isDesktop && desktop != null) return desktop;
    if (isTablet && tablet != null) return tablet;
    return mobile;
  }
  
  // Responsive padding
  EdgeInsets get padding => EdgeInsets.all(
    value(
      mobile: 16,
      tablet: 24,
      desktop: 32,
    ).toDouble(),
  );
  
  EdgeInsets get horizontalPadding => EdgeInsets.symmetric(
    horizontal: value(
      mobile: 16,
      tablet: 24,
      desktop: 32,
    ).toDouble(),
  );
  
  EdgeInsets get verticalPadding => EdgeInsets.symmetric(
    vertical: value(
      mobile: 16,
      tablet: 24,
      desktop: 32,
    ).toDouble(),
  );
  
  // Responsive spacing
  double get smallSpacing => value(
    mobile: 8,
    tablet: 12,
    desktop: 16,
  ).toDouble();
  
  double get mediumSpacing => value(
    mobile: 16,
    tablet: 20,
    desktop: 24,
  ).toDouble();
  
  double get largeSpacing => value(
    mobile: 24,
    tablet: 32,
    desktop: 40,
  ).toDouble();
  
  // Grid columns
  int get gridColumns => value(
    mobile: 1,
    tablet: 2,
    desktop: 3,
    largeDesktop: 4,
  );
  
  // Font sizes
  double get headlineFontSize => value(
    mobile: 24,
    tablet: 28,
    desktop: 32,
  ).toDouble();
  
  double get titleFontSize => value(
    mobile: 18,
    tablet: 20,
    desktop: 24,
  ).toDouble();
  
  double get bodyFontSize => value(
    mobile: 14,
    tablet: 15,
    desktop: 16,
  ).toDouble();
  
  double get captionFontSize => value(
    mobile: 12,
    tablet: 13,
    desktop: 14,
  ).toDouble();
  
  // Container constraints
  BoxConstraints get containerConstraints => BoxConstraints(
    maxWidth: value(
      mobile: double.infinity,
      tablet: 768,
      desktop: 1200,
      largeDesktop: 1440,
    ),
  );
  
  // Card dimensions
  double get cardHeight => value(
    mobile: 200,
    tablet: 220,
    desktop: 250,
  ).toDouble();
  
  double get cardWidth => value(
    mobile: width - 32,
    tablet: (width - 48) / 2,
    desktop: (width - 64) / 3,
  ).toDouble();
  
  // Safe area
  EdgeInsets get safeArea => _mediaQuery.padding;
  double get safeAreaTop => _mediaQuery.padding.top;
  double get safeAreaBottom => _mediaQuery.padding.bottom;
  
  // Keyboard
  bool get isKeyboardVisible => _mediaQuery.viewInsets.bottom > 0;
  double get keyboardHeight => _mediaQuery.viewInsets.bottom;
  
  // Custom responsive builder
  Widget builder({
    required Widget mobile,
    Widget? tablet,
    Widget? desktop,
    Widget? largeDesktop,
  }) {
    if (isLargeDesktop && largeDesktop != null) return largeDesktop;
    if (isDesktop && desktop != null) return desktop;
    if (isTablet && tablet != null) return tablet;
    return mobile;
  }
  
  // Responsive layout builder
  static Widget layout({
    required BuildContext context,
    required Widget mobile,
    Widget? tablet,
    Widget? desktop,
    Widget? largeDesktop,
  }) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final responsive = Responsive(context);
        return responsive.builder(
          mobile: mobile,
          tablet: tablet,
          desktop: desktop,
          largeDesktop: largeDesktop,
        );
      },
    );
  }
}
