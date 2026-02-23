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
    ImageBackground,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { Avatar } from '@/components/ui/Avatar';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import * as CryptoUtils from '@/utils/crypto';

type Message = {
    id: string;
    content: string;
    user_id: string;
    created_at: string;
    iv?: string; // For E2EE
    meta_data?: any;
    status?: 'sent' | 'delivered' | 'read';
};

export default function ChatMessageScreen() {
    const { id: roomId } = useLocalSearchParams<{ id: string }>();
    const { theme } = useTheme();
    const { user } = useAuth();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [room, setRoom] = useState<any>(null);
    const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

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
                setMessages(data.map(m => ({ ...m, status: 'read' })));
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
                setMessages(prev => [...prev, { ...(payload.new as Message), status: 'sent' }]);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [roomId]);

    const handleSend = async (overrideContent?: string) => {
        const content = overrideContent || newMessage.trim();
        if (!content && !newMessage.trim()) return;

        setNewMessage('');

        let messageData: any = {
            room_id: roomId,
            user_id: user?.id,
            content: content,
        };

        const { error } = await supabase.from('chat_messages').insert(messageData);
        if (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets[0].uri) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setIsUploading(true);
        try {
            const fileName = `${Date.now()}.jpg`;
            const formData = new FormData();
            formData.append('file', {
                uri,
                name: fileName,
                type: 'image/jpeg',
            } as any);

            const { data, error } = await supabase.storage
                .from('chat-attachments')
                .upload(`${roomId}/${fileName}`, formData);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(`${roomId}/${fileName}`);

            handleSend(`[File] ${fileName}: ${publicUrl}`);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setIsUploading(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMe = item.user_id === user?.id;

        return (
            <View style={[
                styles.messageContainer,
                isMe ? styles.myMessageContainer : styles.theirMessageContainer
            ]}>
                <View style={[
                    styles.messageBubble,
                    isMe ? [styles.myMessage, { backgroundColor: theme.colors.whatsappLightGreen }] : [styles.theirMessage, { backgroundColor: theme.colors.card }]
                ]}>
                    {/* Tail */}
                    <View style={[
                        styles.tail,
                        isMe ? [styles.myTail, { borderLeftColor: '#dcf8c6' }] : [styles.theirTail, { borderRightColor: theme.colors.card }]
                    ]} />

                    {item.content.startsWith('[File]') ? (
                        <View style={styles.mediaContainer}>
                            {item.content.match(/\.(jpg|jpeg|png|gif|webp)$|publicUrl\=.*(jpg|jpeg|png|gif|webp)/i) ? (
                                <OptimizedImage
                                    source={{ uri: item.content.split(': ')[1] }}
                                    style={styles.imageThumbnail}
                                />
                            ) : (
                                <View style={styles.filePlaceholder}>
                                    <View style={styles.fileIcon}>
                                        <Text style={styles.fileIconText}>{item.content.split(':')[0].split('.').pop()?.toUpperCase() || 'FILE'}</Text>
                                    </View>
                                    <Text style={[styles.fileName, { color: theme.colors.foreground }]} numberOfLines={1}>
                                        {item.content.split(':')[0].replace('[File] ', '')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : item.content.startsWith('[Voice Note]') ? (
                        <View style={styles.voiceNoteContainer}>
                            <View style={styles.voiceNoteIcon}>
                                <Ionicons name="mic" size={20} color={theme.colors.whatsappGreen || '#25D366'} />
                            </View>
                            <View style={styles.voiceNoteWaveform}>
                                <View style={[styles.waveformBar, { width: '40%', backgroundColor: theme.colors.whatsappGreen || '#25D366' }]} />
                            </View>
                            <Text style={styles.voiceNoteTime}>0:12</Text>
                        </View>
                    ) : (
                        <Text style={[
                            styles.messageText,
                            { color: theme.colors.foreground }
                        ]}>
                            {item.content}
                        </Text>
                    )}
                    <View style={styles.messageFooter}>
                        <Text style={[
                            styles.messageTime,
                            { color: theme.colors.mutedForeground }
                        ]}>
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        {isMe && (
                            <Ionicons
                                name="checkmark-done"
                                size={16}
                                color={item.status === 'read' ? theme.colors.whatsappBlue : theme.colors.mutedForeground}
                                style={styles.statusIcon}
                            />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.whatsappGreen} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: '#E5DDD5' }]} // WhatsApp background color
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <Stack.Screen options={{
                headerTitle: () => (
                    <TouchableOpacity style={styles.headerTitleContainer}>
                        <Avatar
                            source={room?.avatar_url || `https://ui-avatars.com/api/?name=${room?.name}`}
                            size="sm"
                        />
                        <View style={styles.headerTextContainer}>
                            <Text style={[styles.headerName, { color: theme.colors.foreground }]} numberOfLines={1}>
                                {room?.name || 'Chat'}
                            </Text>
                            <Text style={[styles.headerStatus, { color: theme.colors.mutedForeground }]}>online</Text>
                        </View>
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Ionicons name="search-outline" size={22} color={theme.colors.foreground} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerIcon}>
                            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.foreground} />
                        </TouchableOpacity>
                    </View>
                ),
                headerShown: true
            }} />

            <ImageBackground
                source={{ uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' }} // Classic WhatsApp pattern
                style={styles.imageBackground}
                imageStyle={{ opacity: 0.4 }}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messageList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                />
            </ImageBackground>

            <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: theme.colors.card }]}>
                    <TouchableOpacity style={styles.inputIconButton}>
                        <MaterialCommunityIcons name="emoticon-outline" size={24} color={theme.colors.mutedForeground} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { color: theme.colors.foreground }]}
                        placeholder={isRecording ? "Recording..." : "Message"}
                        placeholderTextColor={theme.colors.mutedForeground}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline={!isRecording}
                        editable={!isRecording}
                    />
                    <TouchableOpacity
                        style={styles.inputIconButton}
                        onPress={handleImagePick}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <ActivityIndicator size="small" color={theme.colors.mutedForeground} />
                        ) : (
                            <Ionicons name="attach" size={24} color={theme.colors.mutedForeground} />
                        )}
                    </TouchableOpacity>
                    {!newMessage.trim() && (
                        <TouchableOpacity style={styles.inputIconButton}>
                            <Ionicons name="camera" size={24} color={theme.colors.mutedForeground} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.sendButton, { backgroundColor: isRecording ? '#ff4b2b' : theme.colors.whatsappTeal || theme.colors.whatsappGreen }]}
                    onPress={() => {
                        if (newMessage.trim()) {
                            handleSend();
                        } else {
                            if (isRecording) {
                                handleSend('[Voice Note] 0:12');
                                setIsRecording(false);
                            } else {
                                setIsRecording(true);
                            }
                        }
                    }}
                >
                    <Ionicons name={newMessage.trim() ? "send" : isRecording ? "stop" : "mic"} size={22} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageBackground: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: Platform.OS === 'ios' ? 0 : -20,
    },
    headerTextContainer: {
        marginLeft: 10,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '700',
    },
    headerStatus: {
        fontSize: 12,
    },
    headerIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    headerIcon: {
        marginLeft: 15,
    },
    messageList: {
        padding: 10,
        paddingBottom: 20,
    },
    messageContainer: {
        marginBottom: 8,
        width: '100%',
    },
    myMessageContainer: {
        alignItems: 'flex-end',
    },
    theirMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '85%',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        position: 'relative',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    myMessage: {
        borderTopRightRadius: 0,
    },
    theirMessage: {
        borderTopLeftRadius: 0,
    },
    tail: {
        position: 'absolute',
        top: 0,
        width: 0,
        height: 0,
        borderTopWidth: 0,
        borderBottomWidth: 10,
        borderBottomColor: 'transparent',
    },
    myTail: {
        right: -8,
        borderLeftWidth: 10,
    },
    theirTail: {
        left: -8,
        borderRightWidth: 10,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 2,
    },
    messageTime: {
        fontSize: 11,
    },
    statusIcon: {
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 8,
        alignItems: 'flex-end',
        backgroundColor: 'transparent',
        marginBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 25,
        paddingHorizontal: 8,
        paddingVertical: 5,
        minHeight: 48,
    },
    inputIconButton: {
        padding: 8,
    },
    input: {
        flex: 1,
        fontSize: 17,
        paddingHorizontal: 5,
        maxHeight: 120,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginLeft: 4,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    mediaContainer: {
        marginTop: 4,
        marginBottom: 4,
        borderRadius: 8,
        overflow: 'hidden',
    },
    imageThumbnail: {
        width: 250,
        height: 250,
        borderRadius: 8,
    },
    filePlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 8,
        width: 250,
    },
    fileIcon: {
        width: 40,
        height: 40,
        backgroundColor: '#ef4444',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    fileIconText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    fileName: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    voiceNoteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        minWidth: 200,
    },
    voiceNoteIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(37, 211, 102, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    voiceNoteWaveform: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 2,
        marginRight: 10,
    },
    waveformBar: {
        height: '100%',
        borderRadius: 2,
    },
    voiceNoteTime: {
        fontSize: 11,
        color: '#667781',
    },
});
