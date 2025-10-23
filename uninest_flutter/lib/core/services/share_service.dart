import 'package:share_plus/share_plus.dart';
import 'package:flutter/material.dart';

class ShareService {
  static ShareService? _instance;
  
  ShareService._();
  
  factory ShareService() {
    _instance ??= ShareService._();
    return _instance!;
  }
  
  /// Share text content
  Future<void> shareText({
    required String text,
    String? subject,
  }) async {
    try {
      await Share.share(
        text,
        subject: subject,
      );
    } catch (e) {
      debugPrint('Failed to share text: $e');
    }
  }
  
  /// Share a social post
  Future<void> sharePost({
    required String postId,
    required String content,
    required String authorName,
  }) async {
    final shareText = '''
Check out this post by $authorName on UniNest!

$content

View on UniNest: https://app.uninest.com/social/post/$postId
''';
    
    await shareText(
      text: shareText,
      subject: 'Post from UniNest',
    );
  }
  
  /// Share a product listing
  Future<void> shareProduct({
    required String productId,
    required String productName,
    required double price,
  }) async {
    final shareText = '''
Check out this product on UniNest!

$productName
Price: ₹$price

View on UniNest: https://app.uninest.com/marketplace/product/$productId
''';
    
    await shareText(
      text: shareText,
      subject: 'Product from UniNest Marketplace',
    );
  }
  
  /// Share an internship opportunity
  Future<void> shareInternship({
    required String internshipId,
    required String title,
    required String company,
  }) async {
    final shareText = '''
Check out this internship opportunity on UniNest!

$title
Company: $company

Apply now: https://app.uninest.com/workspace/internship/$internshipId
''';
    
    await shareText(
      text: shareText,
      subject: 'Internship from UniNest',
    );
  }
  
  /// Share app invite
  Future<void> shareAppInvite() async {
    final shareText = '''
Join me on UniNest - Your Complete Campus Companion!

🏠 Find PG accommodations
📚 Access study materials
💼 Get internship opportunities
🛒 Campus marketplace
👥 Connect with students

Download now: https://uninest.app
''';
    
    await shareText(
      text: shareText,
      subject: 'Join me on UniNest!',
    );
  }
  
  /// Share with custom URL
  Future<void> shareUrl({
    required String url,
    String? text,
  }) async {
    final shareText = text != null ? '$text\n\n$url' : url;
    await Share.share(shareText);
  }
  
  /// Share files (images, documents, etc.)
  Future<void> shareFiles({
    required List<String> filePaths,
    String? text,
  }) async {
    try {
      final files = filePaths.map((path) => XFile(path)).toList();
      await Share.shareXFiles(
        files,
        text: text,
      );
    } catch (e) {
      debugPrint('Failed to share files: $e');
    }
  }
}
