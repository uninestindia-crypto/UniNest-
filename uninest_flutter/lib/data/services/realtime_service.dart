import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

class RealtimeService {
  final SupabaseService _supabaseService;
  final Map<String, RealtimeChannel> _channels = {};
  final Map<String, StreamController> _streamControllers = {};
  
  RealtimeService(this._supabaseService);
  
  // Subscribe to notifications for a user
  Stream<Map<String, dynamic>> subscribeToNotifications(String userId) {
    final channelName = 'notifications_$userId';
    
    if (_streamControllers.containsKey(channelName)) {
      return _streamControllers[channelName]!.stream as Stream<Map<String, dynamic>>;
    }
    
    final controller = StreamController<Map<String, dynamic>>.broadcast();
    _streamControllers[channelName] = controller;
    
    final channel = _supabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'notifications',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'user_id',
            value: userId,
          ),
          callback: (payload) {
            controller.add(payload.newRecord);
          },
        )
        .subscribe();
    
    _channels[channelName] = channel;
    
    return controller.stream;
  }
  
  // Subscribe to chat messages
  Stream<Map<String, dynamic>> subscribeToChatMessages(String conversationId) {
    final channelName = 'chat_$conversationId';
    
    if (_streamControllers.containsKey(channelName)) {
      return _streamControllers[channelName]!.stream as Stream<Map<String, dynamic>>;
    }
    
    final controller = StreamController<Map<String, dynamic>>.broadcast();
    _streamControllers[channelName] = controller;
    
    final channel = _supabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'messages',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'conversation_id',
            value: conversationId,
          ),
          callback: (payload) {
            controller.add(payload.newRecord);
          },
        )
        .subscribe();
    
    _channels[channelName] = channel;
    
    return controller.stream;
  }
  
  // Subscribe to order updates for vendors
  Stream<Map<String, dynamic>> subscribeToVendorOrders(String vendorId) {
    final channelName = 'vendor_orders_$vendorId';
    
    if (_streamControllers.containsKey(channelName)) {
      return _streamControllers[channelName]!.stream as Stream<Map<String, dynamic>>;
    }
    
    final controller = StreamController<Map<String, dynamic>>.broadcast();
    _streamControllers[channelName] = controller;
    
    final channel = _supabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'orders',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'vendor_id',
            value: vendorId,
          ),
          callback: (payload) {
            controller.add({
              'event': payload.eventType.name,
              'data': payload.newRecord ?? payload.oldRecord,
            });
          },
        )
        .subscribe();
    
    _channels[channelName] = channel;
    
    return controller.stream;
  }
  
  // Subscribe to product updates
  Stream<Map<String, dynamic>> subscribeToProductUpdates(String productId) {
    final channelName = 'product_$productId';
    
    if (_streamControllers.containsKey(channelName)) {
      return _streamControllers[channelName]!.stream as Stream<Map<String, dynamic>>;
    }
    
    final controller = StreamController<Map<String, dynamic>>.broadcast();
    _streamControllers[channelName] = controller;
    
    final channel = _supabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'products',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'id',
            value: productId,
          ),
          callback: (payload) {
            controller.add(payload.newRecord);
          },
        )
        .subscribe();
    
    _channels[channelName] = channel;
    
    return controller.stream;
  }
  
  // Subscribe to live feed posts
  Stream<Map<String, dynamic>> subscribeToFeedPosts() {
    const channelName = 'feed_posts';
    
    if (_streamControllers.containsKey(channelName)) {
      return _streamControllers[channelName]!.stream as Stream<Map<String, dynamic>>;
    }
    
    final controller = StreamController<Map<String, dynamic>>.broadcast();
    _streamControllers[channelName] = controller;
    
    final channel = _supabaseService.client
        .channel(channelName)
        .onPostgresChanges(
          event: PostgresChangeEvent.insert,
          schema: 'public',
          table: 'posts',
          callback: (payload) {
            controller.add(payload.newRecord);
          },
        )
        .subscribe();
    
    _channels[channelName] = channel;
    
    return controller.stream;
  }
  
  // Presence channel for online users
  Stream<List<Map<String, dynamic>>> subscribeToPresence(String roomId) {
    final channelName = 'presence_$roomId';
    
    if (_streamControllers.containsKey(channelName)) {
      return _streamControllers[channelName]!.stream as Stream<List<Map<String, dynamic>>>;
    }
    
    final controller = StreamController<List<Map<String, dynamic>>>.broadcast();
    _streamControllers[channelName] = controller;
    
    final channel = _supabaseService.client.channel(channelName);
    
    channel
        .onPresenceSync((payload) {
          final presences = channel.presenceState()
              .entries
              .map((e) => e.value.first as Map<String, dynamic>)
              .toList();
          controller.add(presences);
        })
        .onPresenceJoin((payload) {
          final presences = channel.presenceState()
              .entries
              .map((e) => e.value.first as Map<String, dynamic>)
              .toList();
          controller.add(presences);
        })
        .onPresenceLeave((payload) {
          final presences = channel.presenceState()
              .entries
              .map((e) => e.value.first as Map<String, dynamic>)
              .toList();
          controller.add(presences);
        })
        .subscribe();
    
    _channels[channelName] = channel;
    
    return controller.stream;
  }
  
  // Track user presence
  Future<void> trackPresence(String roomId, Map<String, dynamic> userInfo) async {
    final channelName = 'presence_$roomId';
    
    if (!_channels.containsKey(channelName)) {
      subscribeToPresence(roomId);
    }
    
    await _channels[channelName]!.track(userInfo);
  }
  
  // Broadcast events
  Future<void> broadcastEvent({
    required String channel,
    required String event,
    required Map<String, dynamic> payload,
  }) async {
    final channelName = 'broadcast_$channel';
    
    if (!_channels.containsKey(channelName)) {
      final broadcastChannel = _supabaseService.client.channel(channelName);
      await broadcastChannel.subscribe();
      _channels[channelName] = broadcastChannel;
    }
    
    await _channels[channelName]!.sendBroadcastMessage(
      event: event,
      payload: payload,
    );
  }
  
  // Listen to broadcast events
  Stream<Map<String, dynamic>> listenToBroadcast({
    required String channel,
    required String event,
  }) {
    final channelName = 'broadcast_$channel';
    final streamKey = '${channelName}_$event';
    
    if (_streamControllers.containsKey(streamKey)) {
      return _streamControllers[streamKey]!.stream as Stream<Map<String, dynamic>>;
    }
    
    final controller = StreamController<Map<String, dynamic>>.broadcast();
    _streamControllers[streamKey] = controller;
    
    if (!_channels.containsKey(channelName)) {
      final broadcastChannel = _supabaseService.client.channel(channelName);
      broadcastChannel.subscribe();
      _channels[channelName] = broadcastChannel;
    }
    
    _channels[channelName]!.onBroadcast(
      event: event,
      callback: (payload) {
        controller.add(payload);
      },
    );
    
    return controller.stream;
  }
  
  // Unsubscribe from a channel
  Future<void> unsubscribe(String channelName) async {
    if (_channels.containsKey(channelName)) {
      await _supabaseService.client.removeChannel(_channels[channelName]!);
      _channels.remove(channelName);
    }
    
    if (_streamControllers.containsKey(channelName)) {
      await _streamControllers[channelName]!.close();
      _streamControllers.remove(channelName);
    }
  }
  
  // Unsubscribe from all channels
  Future<void> unsubscribeAll() async {
    for (final channel in _channels.values) {
      await _supabaseService.client.removeChannel(channel);
    }
    _channels.clear();
    
    for (final controller in _streamControllers.values) {
      await controller.close();
    }
    _streamControllers.clear();
  }
  
  void dispose() {
    unsubscribeAll();
  }
}
