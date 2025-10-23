import 'package:flutter/foundation.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../core/config/app_config.dart';
import '../models/order_model.dart';
import 'supabase_service.dart';

class PaymentService {
  static PaymentService? _instance;
  late final Razorpay _razorpay;
  final SupabaseService _supabaseService;
  
  // Callbacks
  Function(PaymentSuccessResponse)? _onSuccess;
  Function(PaymentFailureResponse)? _onFailure;
  Function(ExternalWalletResponse)? _onWallet;
  
  PaymentService._(this._supabaseService) {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }
  
  factory PaymentService(SupabaseService supabaseService) {
    _instance ??= PaymentService._(supabaseService);
    return _instance!;
  }
  
  Future<void> initiatePayment({
    required OrderModel order,
    required String userEmail,
    required String userPhone,
    required Function(PaymentSuccessResponse) onSuccess,
    required Function(PaymentFailureResponse) onFailure,
    Function(ExternalWalletResponse)? onWallet,
  }) async {
    _onSuccess = onSuccess;
    _onFailure = onFailure;
    _onWallet = onWallet;
    
    try {
      // Create order in backend first
      final razorpayOrder = await _createRazorpayOrder(order);
      
      final options = {
        'key': AppConfig.razorpayKey,
        'amount': (order.totalAmount * 100).toInt(), // Amount in paise
        'name': 'UniNest',
        'order_id': razorpayOrder['id'],
        'description': 'Order #${order.id}',
        'prefill': {
          'contact': userPhone,
          'email': userEmail,
        },
        'theme': {
          'color': '#38BDF8', // Primary blue color
        },
        'modal': {
          'confirm_close': true,
          'animation': true,
        },
        'notes': {
          'order_id': order.id,
          'user_id': order.userId,
        },
      };
      
      _razorpay.open(options);
    } catch (e) {
      debugPrint('Error initiating payment: $e');
      throw Exception('Failed to initiate payment: $e');
    }
  }
  
  Future<Map<String, dynamic>> _createRazorpayOrder(OrderModel order) async {
    try {
      // Call your backend API to create Razorpay order
      final response = await _supabaseService.client.rpc('create_razorpay_order', params: {
        'amount': (order.totalAmount * 100).toInt(),
        'currency': 'INR',
        'receipt': order.id,
        'notes': {
          'order_id': order.id,
          'user_id': order.userId,
        },
      });
      
      return response as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to create Razorpay order: $e');
    }
  }
  
  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    debugPrint('Payment Success: ${response.paymentId}');
    _onSuccess?.call(response);
    _clearCallbacks();
  }
  
  void _handlePaymentError(PaymentFailureResponse response) {
    debugPrint('Payment Error: ${response.code} - ${response.message}');
    _onFailure?.call(response);
    _clearCallbacks();
  }
  
  void _handleExternalWallet(ExternalWalletResponse response) {
    debugPrint('External Wallet: ${response.walletName}');
    _onWallet?.call(response);
    _clearCallbacks();
  }
  
  Future<bool> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    try {
      final response = await _supabaseService.client.rpc('verify_payment', params: {
        'razorpay_order_id': orderId,
        'razorpay_payment_id': paymentId,
        'razorpay_signature': signature,
      });
      
      return response['verified'] as bool;
    } catch (e) {
      debugPrint('Payment verification failed: $e');
      return false;
    }
  }
  
  Future<void> updateOrderPaymentStatus({
    required String orderId,
    required String paymentId,
    required String status,
  }) async {
    try {
      await _supabaseService.client
          .from('orders')
          .update({
            'payment_id': paymentId,
            'payment_status': status,
            'status': status == 'paid' ? 'confirmed' : 'payment_failed',
            'updated_at': DateTime.now().toIso8601String(),
          })
          .eq('id', orderId);
    } catch (e) {
      throw Exception('Failed to update order payment status: $e');
    }
  }
  
  Future<Map<String, dynamic>> getPaymentDetails(String paymentId) async {
    try {
      final response = await _supabaseService.client.rpc('get_payment_details', params: {
        'payment_id': paymentId,
      });
      
      return response as Map<String, dynamic>;
    } catch (e) {
      throw Exception('Failed to get payment details: $e');
    }
  }
  
  Future<List<Map<String, dynamic>>> getPaymentHistory(String userId) async {
    try {
      final response = await _supabaseService.client
          .from('payments')
          .select('''
            *,
            order:order_id (
              id,
              total_amount,
              status,
              created_at
            )
          ''')
          .eq('user_id', userId)
          .order('created_at', ascending: false);
      
      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to get payment history: $e');
    }
  }
  
  Future<void> initiateRefund({
    required String paymentId,
    required double amount,
    required String reason,
  }) async {
    try {
      await _supabaseService.client.rpc('initiate_refund', params: {
        'payment_id': paymentId,
        'amount': (amount * 100).toInt(),
        'reason': reason,
      });
    } catch (e) {
      throw Exception('Failed to initiate refund: $e');
    }
  }
  
  void _clearCallbacks() {
    _onSuccess = null;
    _onFailure = null;
    _onWallet = null;
  }
  
  void dispose() {
    _razorpay.clear();
  }
}

// Payment options for different scenarios
class PaymentOptions {
  static Map<String, dynamic> forOrder(OrderModel order, String userEmail, String userPhone) {
    return {
      'amount': (order.totalAmount * 100).toInt(),
      'currency': 'INR',
      'name': 'UniNest Order',
      'description': 'Payment for Order #${order.id}',
      'prefill': {
        'email': userEmail,
        'contact': userPhone,
      },
    };
  }
  
  static Map<String, dynamic> forSubscription({
    required String planId,
    required double amount,
    required String userEmail,
    required String userPhone,
  }) {
    return {
      'amount': (amount * 100).toInt(),
      'currency': 'INR',
      'name': 'UniNest Subscription',
      'description': 'Vendor subscription plan',
      'prefill': {
        'email': userEmail,
        'contact': userPhone,
      },
      'notes': {
        'plan_id': planId,
      },
    };
  }
  
  static Map<String, dynamic> forDonation({
    required double amount,
    required String userEmail,
    required String userPhone,
    String? message,
  }) {
    return {
      'amount': (amount * 100).toInt(),
      'currency': 'INR',
      'name': 'UniNest Donation',
      'description': 'Support UniNest platform',
      'prefill': {
        'email': userEmail,
        'contact': userPhone,
      },
      'notes': {
        'type': 'donation',
        'message': message ?? '',
      },
    };
  }
}
