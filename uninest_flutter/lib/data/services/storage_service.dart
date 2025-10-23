import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path/path.dart' as path;
import 'package:uuid/uuid.dart';
import 'supabase_service.dart';

class StorageService {
  final SupabaseService _supabaseService;
  final _uuid = const Uuid();
  
  StorageService(this._supabaseService);
  
  // Upload product image
  Future<String> uploadProductImage({
    required dynamic imageFile, // Can be File, XFile, or Uint8List
    required String vendorId,
    String? existingUrl,
  }) async {
    try {
      // Delete existing image if provided
      if (existingUrl != null) {
        await deleteFile(existingUrl);
      }
      
      final fileName = '${vendorId}/${_uuid.v4()}.jpg';
      final bucket = 'products';
      
      await _ensureBucketExists(bucket);
      
      String publicUrl;
      
      if (imageFile is File) {
        final bytes = await imageFile.readAsBytes();
        publicUrl = await _uploadBytes(bucket, fileName, bytes);
      } else if (imageFile is XFile) {
        final bytes = await imageFile.readAsBytes();
        publicUrl = await _uploadBytes(bucket, fileName, bytes);
      } else if (imageFile is Uint8List) {
        publicUrl = await _uploadBytes(bucket, fileName, imageFile);
      } else {
        throw Exception('Invalid image file type');
      }
      
      return publicUrl;
    } catch (e) {
      throw Exception('Failed to upload product image: $e');
    }
  }
  
  // Upload user avatar
  Future<String> uploadAvatar({
    required dynamic imageFile,
    required String userId,
    String? existingUrl,
  }) async {
    try {
      if (existingUrl != null) {
        await deleteFile(existingUrl);
      }
      
      final fileName = '${userId}/avatar_${_uuid.v4()}.jpg';
      final bucket = 'avatars';
      
      await _ensureBucketExists(bucket);
      
      String publicUrl;
      
      if (imageFile is File) {
        final bytes = await imageFile.readAsBytes();
        publicUrl = await _uploadBytes(bucket, fileName, bytes);
      } else if (imageFile is XFile) {
        final bytes = await imageFile.readAsBytes();
        publicUrl = await _uploadBytes(bucket, fileName, bytes);
      } else if (imageFile is Uint8List) {
        publicUrl = await _uploadBytes(bucket, fileName, imageFile);
      } else {
        throw Exception('Invalid image file type');
      }
      
      return publicUrl;
    } catch (e) {
      throw Exception('Failed to upload avatar: $e');
    }
  }
  
  // Upload document (for study materials, etc.)
  Future<String> uploadDocument({
    required dynamic file,
    required String userId,
    required String category, // notes, assignments, etc.
  }) async {
    try {
      String fileName;
      Uint8List bytes;
      
      if (file is File) {
        fileName = path.basename(file.path);
        bytes = await file.readAsBytes();
      } else if (file is XFile) {
        fileName = path.basename(file.path);
        bytes = await file.readAsBytes();
      } else {
        throw Exception('Invalid file type');
      }
      
      final uniqueFileName = '${userId}/$category/${_uuid.v4()}_$fileName';
      final bucket = 'documents';
      
      await _ensureBucketExists(bucket);
      
      final publicUrl = await _uploadBytes(bucket, uniqueFileName, bytes);
      
      return publicUrl;
    } catch (e) {
      throw Exception('Failed to upload document: $e');
    }
  }
  
  // Upload chat attachment
  Future<String> uploadChatAttachment({
    required dynamic file,
    required String conversationId,
    required String senderId,
  }) async {
    try {
      String fileName;
      Uint8List bytes;
      
      if (file is File) {
        fileName = path.basename(file.path);
        bytes = await file.readAsBytes();
      } else if (file is XFile) {
        fileName = path.basename(file.path);
        bytes = await file.readAsBytes();
      } else if (file is Uint8List) {
        fileName = '${_uuid.v4()}.jpg';
        bytes = file;
      } else {
        throw Exception('Invalid file type');
      }
      
      final uniqueFileName = '$conversationId/${senderId}_${_uuid.v4()}_$fileName';
      final bucket = 'chat-attachments';
      
      await _ensureBucketExists(bucket);
      
      final publicUrl = await _uploadBytes(bucket, uniqueFileName, bytes);
      
      return publicUrl;
    } catch (e) {
      throw Exception('Failed to upload chat attachment: $e');
    }
  }
  
  // Upload multiple images
  Future<List<String>> uploadMultipleImages({
    required List<dynamic> imageFiles,
    required String folder,
    required String bucket,
  }) async {
    try {
      await _ensureBucketExists(bucket);
      
      final uploadFutures = imageFiles.map((file) async {
        final fileName = '$folder/${_uuid.v4()}.jpg';
        
        Uint8List bytes;
        if (file is File) {
          bytes = await file.readAsBytes();
        } else if (file is XFile) {
          bytes = await file.readAsBytes();
        } else if (file is Uint8List) {
          bytes = file;
        } else {
          throw Exception('Invalid file type');
        }
        
        return await _uploadBytes(bucket, fileName, bytes);
      });
      
      return await Future.wait(uploadFutures);
    } catch (e) {
      throw Exception('Failed to upload multiple images: $e');
    }
  }
  
  // Private helper to upload bytes
  Future<String> _uploadBytes(String bucket, String path, Uint8List bytes) async {
    final response = await _supabaseService.client.storage
        .from(bucket)
        .uploadBinary(path, bytes);
    
    final publicUrl = _supabaseService.client.storage
        .from(bucket)
        .getPublicUrl(path);
    
    return publicUrl;
  }
  
  // Delete file from storage
  Future<void> deleteFile(String fileUrl) async {
    try {
      final uri = Uri.parse(fileUrl);
      final pathSegments = uri.pathSegments;
      
      if (pathSegments.length < 3) return;
      
      final bucket = pathSegments[pathSegments.length - 2];
      final filePath = pathSegments.last;
      
      await _supabaseService.client.storage
          .from(bucket)
          .remove([filePath]);
    } catch (e) {
      debugPrint('Failed to delete file: $e');
    }
  }
  
  // Delete multiple files
  Future<void> deleteMultipleFiles(List<String> fileUrls) async {
    try {
      final deleteFutures = fileUrls.map((url) => deleteFile(url));
      await Future.wait(deleteFutures);
    } catch (e) {
      debugPrint('Failed to delete multiple files: $e');
    }
  }
  
  // Get signed URL for private files
  Future<String> getSignedUrl({
    required String bucket,
    required String path,
    int expiresIn = 3600, // 1 hour default
  }) async {
    try {
      final signedUrl = await _supabaseService.client.storage
          .from(bucket)
          .createSignedUrl(path, expiresIn);
      
      return signedUrl;
    } catch (e) {
      throw Exception('Failed to get signed URL: $e');
    }
  }
  
  // Download file
  Future<Uint8List> downloadFile({
    required String bucket,
    required String path,
  }) async {
    try {
      final response = await _supabaseService.client.storage
          .from(bucket)
          .download(path);
      
      return response;
    } catch (e) {
      throw Exception('Failed to download file: $e');
    }
  }
  
  // Ensure bucket exists
  Future<void> _ensureBucketExists(String bucketName) async {
    try {
      final buckets = await _supabaseService.client.storage.listBuckets();
      final bucketExists = buckets.any((b) => b.name == bucketName);
      
      if (!bucketExists) {
        await _supabaseService.client.storage.createBucket(
          bucketName,
          const BucketOptions(public: true),
        );
      }
    } catch (e) {
      // Bucket might already exist or we don't have permission to create
      debugPrint('Bucket check/creation: $e');
    }
  }
  
  // Pick image from gallery or camera
  Future<XFile?> pickImage({
    required ImageSource source,
    int? imageQuality = 85,
    double? maxWidth = 1920,
    double? maxHeight = 1080,
  }) async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(
        source: source,
        imageQuality: imageQuality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      );
      
      return image;
    } catch (e) {
      debugPrint('Failed to pick image: $e');
      return null;
    }
  }
  
  // Pick multiple images
  Future<List<XFile>> pickMultipleImages({
    int? imageQuality = 85,
    double? maxWidth = 1920,
    double? maxHeight = 1080,
  }) async {
    try {
      final picker = ImagePicker();
      final images = await picker.pickMultiImage(
        imageQuality: imageQuality,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
      );
      
      return images;
    } catch (e) {
      debugPrint('Failed to pick multiple images: $e');
      return [];
    }
  }
  
  // Pick video
  Future<XFile?> pickVideo({
    required ImageSource source,
    Duration? maxDuration,
  }) async {
    try {
      final picker = ImagePicker();
      final video = await picker.pickVideo(
        source: source,
        maxDuration: maxDuration,
      );
      
      return video;
    } catch (e) {
      debugPrint('Failed to pick video: $e');
      return null;
    }
  }
}
