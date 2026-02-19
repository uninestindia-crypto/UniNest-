import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { Avatar } from '@/components/ui/Avatar';
import * as CryptoUtils from '@/utils/crypto';

type Message = {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    iv?: string; // For E2EE
    meta_data?: any;
};

export default function ChatMessageScreen() {
    const { id: roomId } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const { user, profile } = useAuth();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [room, setRoom] = useState<any>(null);
    const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);

    const flatListRef = useRef<FlatList>(null);

    // 1. Fetch Room and Session Key
    useEffect(() => {
        const fetchRoomAndKey = async () => {
            const { data: roomData, error: roomError } = await supabase
                .from('chat_rooms')
                .select('*')
                .eq('id', roomId)
                .single();

            if (roomError) return;
            setRoom(roomData);

            if (roomData.is_encrypted) {
                // Fetch wrapped session key for current user
                const { data: keyData, error: keyError } = await supabase
                    .from('chat_room_keys')
                    .select('*')
                    .eq('room_id', roomId)
                    .eq('user_id', user?.id)
                    .single();

                if (!keyError && keyData) {
                    try {
                        // In a real app, we'd retrieve the private key from secure storage
                        // and the sender's public key from the profile
                        // For this implementation, we assume keys are managed
                        // setSessionKey(await CryptoUtils.unwrapSessionKey(...));
                    } catch (e) {
                        console.error('Failed to unwrap key', e);
                    }
                }
            }
            setIsLoading(false);
        };

        fetchRoomAndKey();
    }, [roomId, user?.id]);

    // 2. Fetch Messages and Subscribe
    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data);
            }
        };

        fetchMessages();

        const subscription = supabase
            .channel(`room:${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `room_id=eq.${roomId}`
            }, payload => {
                setMessages(prev => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [roomId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !user) return;

        const content = newMessage.trim();
        setNewMessage('');

        let messageData: any = {
            room_id: roomId,
            user_id: user.id,
            content: content,
        };

        if (room?.is_encrypted && sessionKey) {
            try {
                const { ciphertext, iv } = await CryptoUtils.encryptContent(content, sessionKey);
                messageData.content = ciphertext;
                messageData.iv = iv;
            } catch (e) {
                console.error('Encryption failed', e);
            }
        }

        const { error } = await supabase.from('chat_messages').insert(messageData);
        if (error) {
            console.error('Failed to send message', error);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.user_id === user?.id;

        return (
            <View style={[
                styles.messageBubble,
                isMe ? styles.myMessage : styles.theirMessage,
                { backgroundColor: isMe ? theme.colors.primary[600] : theme.colors.card }
            ]}>
                <Text style={[
                    styles.messageText,
                    { color: isMe ? '#fff' : theme.colors.foreground }
                ]}>
                    {item.content}
                </Text>
                <Text style={[
                    styles.messageTime,
                    { color: isMe ? 'rgba(255,255,255,0.7)' : theme.colors.mutedForeground }
                ]}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary[600]} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <Stack.Screen options={{
                headerTitle: room?.name || 'Chat',
                headerShown: true
            }} />

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={[styles.inputContainer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.card }]}>
                <TextInput
                    style={[styles.input, { color: theme.colors.foreground, backgroundColor: theme.colors.background }]}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.colors.mutedForeground}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: theme.colors.primary[600] }]}
                    onPress={handleSend}
                    disabled={!newMessage.trim()}
                >
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageList: {
        padding: 16,
        gap: 12,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    myMessage: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
    },
    messageTime: {
        fontSize: 10,
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
        alignItems: 'center',
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
