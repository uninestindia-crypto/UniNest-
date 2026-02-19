import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';

export default function SupportScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('support_tickets')
                .insert({
                    user_id: user?.id,
                    subject: subject.trim(),
                    message: message.trim(),
                    status: 'open',
                });

            if (error) throw error;

            Alert.alert('Success', 'Your support ticket has been submitted. We will get back to you soon!');
            setSubject('');
            setMessage('');
        } catch (error) {
            console.error('Support ticket submission failed:', error);
            Alert.alert('Error', 'Failed to submit support ticket. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Contact Support', headerShown: true }} />

            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.foreground }]}>Contact Support</Text>
                <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
                    Have an issue or some feedback? Let us know!
                </Text>
                <TouchableOpacity onPress={() => Linking.openURL('mailto:support@uninest.co.in')}>
                    <Text style={[styles.emailLink, { color: theme.colors.primary[600] }]}>
                        Reach us at support@uninest.co.in
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.foreground }]}>Subject</Text>
                    <TextInput
                        style={[styles.input, {
                            color: theme.colors.foreground,
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border
                        }]}
                        placeholder="What's this about?"
                        placeholderTextColor={theme.colors.mutedForeground}
                        value={subject}
                        onChangeText={setSubject}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.colors.foreground }]}>Message</Text>
                    <TextInput
                        style={[styles.input, styles.textArea, {
                            color: theme.colors.foreground,
                            backgroundColor: theme.colors.card,
                            borderColor: theme.colors.border
                        }]}
                        placeholder="Tell us more..."
                        placeholderTextColor={theme.colors.mutedForeground}
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: theme.colors.primary[600] }]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Ticket</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.faqPreview}>
                <Text style={[styles.faqTitle, { color: theme.colors.foreground }]}>Common Questions</Text>
                <View style={styles.faqList}>
                    <TouchableOpacity style={styles.faqItem} onPress={() => Linking.openURL('https://uninest.co.in/faq')}>
                        <Text style={[styles.faqQuestion, { color: theme.colors.foreground }]}>How do I book a hostel room?</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedForeground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.faqItem} onPress={() => Linking.openURL('https://uninest.co.in/faq')}>
                        <Text style={[styles.faqQuestion, { color: theme.colors.foreground }]}>What is the refund policy?</Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 24,
        paddingTop: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 18,
        lineHeight: 26,
        marginBottom: 12,
    },
    emailLink: {
        fontSize: 16,
        fontWeight: '600',
    },
    form: {
        padding: 24,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
    },
    textArea: {
        height: 150,
        paddingTop: 12,
    },
    submitButton: {
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    faqPreview: {
        padding: 24,
        paddingBottom: 60,
    },
    faqTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    faqList: {
        gap: 12,
    },
    faqItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    faqQuestion: {
        fontSize: 16,
    },
});
