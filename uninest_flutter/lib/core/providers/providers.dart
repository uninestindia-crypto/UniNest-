import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../data/services/supabase_service.dart';
import '../../data/repositories/product_repository.dart';
import '../../data/repositories/user_repository.dart';
import '../../data/repositories/order_repository.dart';
import '../../data/repositories/booking_repository.dart';
import '../../data/repositories/notification_repository.dart';

// SharedPreferences provider
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw UnimplementedError('SharedPreferences not initialized');
});

// Supabase service provider
final supabaseServiceProvider = Provider<SupabaseService>((ref) {
  return SupabaseService();
});

// Repository providers
final productRepositoryProvider = Provider<ProductRepository>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  return ProductRepository(supabaseService);
});

final userRepositoryProvider = Provider<UserRepository>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  return UserRepository(supabaseService);
});

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  return OrderRepository(supabaseService);
});

final bookingRepositoryProvider = Provider<BookingRepository>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  return BookingRepository(supabaseService);
});

final notificationRepositoryProvider = Provider<NotificationRepository>((ref) {
  final supabaseService = ref.watch(supabaseServiceProvider);
  return NotificationRepository(supabaseService);
});

// Theme mode provider
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  final prefs = ref.watch(sharedPreferencesProvider);
  return ThemeModeNotifier(prefs);
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  final SharedPreferences _prefs;
  static const String _key = 'theme_mode';
  
  ThemeModeNotifier(this._prefs) : super(ThemeMode.system) {
    _loadThemeMode();
  }
  
  void _loadThemeMode() {
    final savedMode = _prefs.getString(_key);
    switch (savedMode) {
      case 'light':
        state = ThemeMode.light;
        break;
      case 'dark':
        state = ThemeMode.dark;
        break;
      default:
        state = ThemeMode.system;
    }
  }
  
  Future<void> setThemeMode(ThemeMode mode) async {
    state = mode;
    await _prefs.setString(_key, mode.name);
  }
  
  void toggleTheme() {
    if (state == ThemeMode.light) {
      setThemeMode(ThemeMode.dark);
    } else if (state == ThemeMode.dark) {
      setThemeMode(ThemeMode.light);
    } else {
      // If system, default to light
      setThemeMode(ThemeMode.light);
    }
  }
}

// Loading state provider
final loadingProvider = StateProvider<bool>((ref) => false);

// Error state provider
final errorProvider = StateProvider<String?>((ref) => null);

// Search query provider
final searchQueryProvider = StateProvider<String>((ref) => '');

// Selected category provider
final selectedCategoryProvider = StateProvider<String?>((ref) => null);

// Cart provider
final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});

class CartItem {
  final String productId;
  final String name;
  final double price;
  final int quantity;
  final String? imageUrl;
  
  CartItem({
    required this.productId,
    required this.name,
    required this.price,
    required this.quantity,
    this.imageUrl,
  });
  
  CartItem copyWith({
    String? productId,
    String? name,
    double? price,
    int? quantity,
    String? imageUrl,
  }) {
    return CartItem(
      productId: productId ?? this.productId,
      name: name ?? this.name,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
      imageUrl: imageUrl ?? this.imageUrl,
    );
  }
}

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);
  
  void addItem(CartItem item) {
    final existingIndex = state.indexWhere((i) => i.productId == item.productId);
    
    if (existingIndex >= 0) {
      // Update quantity if item already exists
      state = [
        ...state.sublist(0, existingIndex),
        state[existingIndex].copyWith(
          quantity: state[existingIndex].quantity + item.quantity,
        ),
        ...state.sublist(existingIndex + 1),
      ];
    } else {
      // Add new item
      state = [...state, item];
    }
  }
  
  void removeItem(String productId) {
    state = state.where((item) => item.productId != productId).toList();
  }
  
  void updateQuantity(String productId, int quantity) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    final index = state.indexWhere((item) => item.productId == productId);
    if (index >= 0) {
      state = [
        ...state.sublist(0, index),
        state[index].copyWith(quantity: quantity),
        ...state.sublist(index + 1),
      ];
    }
  }
  
  void clearCart() {
    state = [];
  }
  
  double get totalAmount {
    return state.fold(0, (total, item) => total + (item.price * item.quantity));
  }
  
  int get totalItems {
    return state.fold(0, (total, item) => total + item.quantity);
  }
}
