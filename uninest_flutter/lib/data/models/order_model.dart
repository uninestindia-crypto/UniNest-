import 'package:json_annotation/json_annotation.dart';

part 'order_model.g.dart';

@JsonSerializable()
class OrderModel {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  @JsonKey(name: 'vendor_id')
  final String? vendorId;
  final List<OrderItem> items;
  @JsonKey(name: 'total_amount')
  final double totalAmount;
  @JsonKey(name: 'subtotal')
  final double subtotal;
  @JsonKey(name: 'tax_amount')
  final double? taxAmount;
  @JsonKey(name: 'delivery_fee')
  final double? deliveryFee;
  @JsonKey(name: 'discount_amount')
  final double? discountAmount;
  @JsonKey(name: 'coupon_code')
  final String? couponCode;
  final String status; // pending, confirmed, processing, shipped, delivered, cancelled
  @JsonKey(name: 'payment_status')
  final String paymentStatus; // pending, paid, failed, refunded
  @JsonKey(name: 'payment_method')
  final String? paymentMethod;
  @JsonKey(name: 'payment_id')
  final String? paymentId;
  @JsonKey(name: 'delivery_address')
  final Map<String, dynamic>? deliveryAddress;
  @JsonKey(name: 'delivery_date')
  final DateTime? deliveryDate;
  @JsonKey(name: 'tracking_number')
  final String? trackingNumber;
  final String? notes;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  
  // Relations
  final Map<String, dynamic>? user;
  final Map<String, dynamic>? vendor;
  
  OrderModel({
    required this.id,
    required this.userId,
    this.vendorId,
    required this.items,
    required this.totalAmount,
    required this.subtotal,
    this.taxAmount,
    this.deliveryFee,
    this.discountAmount,
    this.couponCode,
    required this.status,
    required this.paymentStatus,
    this.paymentMethod,
    this.paymentId,
    this.deliveryAddress,
    this.deliveryDate,
    this.trackingNumber,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    this.user,
    this.vendor,
  });
  
  factory OrderModel.fromJson(Map<String, dynamic> json) => _$OrderModelFromJson(json);
  Map<String, dynamic> toJson() => _$OrderModelToJson(this);
  
  // Computed properties
  String get userName => user?['full_name'] ?? 'Customer';
  String? get userEmail => user?['email'];
  String? get userPhone => user?['phone'];
  String? get userAvatar => user?['avatar_url'];
  
  String get vendorName => vendor?['full_name'] ?? 'Vendor';
  String? get vendorAvatar => vendor?['avatar_url'];
  
  bool get isPaid => paymentStatus == 'paid';
  bool get isDelivered => status == 'delivered';
  bool get isCancelled => status == 'cancelled';
  bool get canCancel => status == 'pending' || status == 'confirmed';
  bool get canTrack => trackingNumber != null && 
                       (status == 'shipped' || status == 'delivered');
  
  String get statusDisplay {
    switch (status) {
      case 'pending':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }
  
  OrderModel copyWith({
    String? id,
    String? userId,
    String? vendorId,
    List<OrderItem>? items,
    double? totalAmount,
    double? subtotal,
    double? taxAmount,
    double? deliveryFee,
    double? discountAmount,
    String? couponCode,
    String? status,
    String? paymentStatus,
    String? paymentMethod,
    String? paymentId,
    Map<String, dynamic>? deliveryAddress,
    DateTime? deliveryDate,
    String? trackingNumber,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
    Map<String, dynamic>? user,
    Map<String, dynamic>? vendor,
  }) {
    return OrderModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      vendorId: vendorId ?? this.vendorId,
      items: items ?? this.items,
      totalAmount: totalAmount ?? this.totalAmount,
      subtotal: subtotal ?? this.subtotal,
      taxAmount: taxAmount ?? this.taxAmount,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      discountAmount: discountAmount ?? this.discountAmount,
      couponCode: couponCode ?? this.couponCode,
      status: status ?? this.status,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentId: paymentId ?? this.paymentId,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      deliveryDate: deliveryDate ?? this.deliveryDate,
      trackingNumber: trackingNumber ?? this.trackingNumber,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      user: user ?? this.user,
      vendor: vendor ?? this.vendor,
    );
  }
}

@JsonSerializable()
class OrderItem {
  @JsonKey(name: 'product_id')
  final String productId;
  @JsonKey(name: 'product_name')
  final String productName;
  @JsonKey(name: 'product_image')
  final String? productImage;
  final int quantity;
  @JsonKey(name: 'unit_price')
  final double unitPrice;
  @JsonKey(name: 'total_price')
  final double totalPrice;
  final Map<String, dynamic>? variations;
  final String? notes;
  
  OrderItem({
    required this.productId,
    required this.productName,
    this.productImage,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.variations,
    this.notes,
  });
  
  factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);
  Map<String, dynamic> toJson() => _$OrderItemToJson(this);
  
  OrderItem copyWith({
    String? productId,
    String? productName,
    String? productImage,
    int? quantity,
    double? unitPrice,
    double? totalPrice,
    Map<String, dynamic>? variations,
    String? notes,
  }) {
    return OrderItem(
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      productImage: productImage ?? this.productImage,
      quantity: quantity ?? this.quantity,
      unitPrice: unitPrice ?? this.unitPrice,
      totalPrice: totalPrice ?? this.totalPrice,
      variations: variations ?? this.variations,
      notes: notes ?? this.notes,
    );
  }
}
