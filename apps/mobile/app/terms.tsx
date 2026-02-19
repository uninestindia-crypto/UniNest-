import React from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';

const SECTION_CONTENT = [
    {
        id: '1',
        title: '1. Introduction & Acceptance of Terms',
        content: 'Welcome to UniNest ("we," "us," or "our"). These Terms and Conditions ("Terms") govern your access to and use of our website, services, and platform (collectively, the "Platform"). By creating an account or using our Platform, you agree to be bound by these Terms. If you do not agree, you may not use the Platform.',
    },
    {
        id: '2',
        title: '2. Eligibility',
        content: 'To use the Platform, you must be a registered student, a verified campus vendor, or an authorized library representative. By creating an account, you represent that you meet these eligibility requirements and that all information you provide is accurate and complete.',
    },
    {
        id: '3',
        title: '3. Account Responsibilities',
        content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. You must comply with all applicable laws and regulations in your use of the Platform and are solely responsible for all data and content you upload.',
    },
    {
        id: '4',
        title: '4. Marketplace Transactions',
        content: "UniNest provides a marketplace for students and vendors to buy and sell goods. All payments are processed through Razorpay, and you agree to comply with Razorpay's terms of service. UniNest is not a party to any transaction and is not responsible for the quality, safety, or legality of items sold. Refund policies are determined by the individual vendors, and UniNest is not responsible for mediating disputes.",
    },
    {
        id: '5',
        title: '5. Content Policy',
        content: 'You retain ownership of any content you post, upload, or share on the Platform, including notes and social feed posts. However, you grant UniNest a worldwide, royalty-free license to use, reproduce, and display this content in connection with the Platform. You agree not to post content that is illegal, defamatory, or infringes on intellectual property rights. Plagiarism and academic dishonesty are strictly prohibited. We reserve the right to remove any content that violates these Terms.',
    },
    {
        id: '6',
        title: '6. Data Privacy & Security',
        content: 'Our collection and use of your personal information are described in our Privacy Policy. We implement enterprise-grade security measures to protect your data, but we cannot guarantee that unauthorized third parties will never be able to defeat our security measures.',
    },
    {
        id: '7',
        title: '7. Limitation of Liability',
        content: 'The Platform is provided "as is" without any warranties. To the fullest extent permitted by law, UniNest shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the Platform.',
    },
    {
        id: '8',
        title: '8. Governing Law & Contact',
        content: 'These Terms shall be governed by the laws of the jurisdiction in which our company is incorporated, without regard to its conflict of law provisions. For any questions about these Terms, please contact us at legal@uninest.com.',
    },
];

export default function TermsScreen() {
    const { theme } = useTheme();

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Terms & Conditions', headerShown: true }} />
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.foreground }]}>Terms & Conditions</Text>
                <Text style={[styles.lastUpdated, { color: theme.colors.mutedForeground }]}>
                    Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
            </View>

            <View style={styles.content}>
                {SECTION_CONTENT.map((section) => (
                    <View key={section.id} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.colors.foreground }]}>{section.title}</Text>
                        <Text style={[styles.sectionBody, { color: theme.colors.mutedForeground }]}>{section.content}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.mutedForeground }]}>
                    By using the UniNest app, you agree to these terms.
                </Text>
                <TouchableOpacity onPress={() => Linking.openURL('mailto:legal@uninest.com')}>
                    <Text style={[styles.link, { color: theme.colors.primary[600] }]}>legal@uninest.com</Text>
                </TouchableOpacity>
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
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    lastUpdated: {
        fontSize: 14,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 10,
    },
    sectionBody: {
        fontSize: 16,
        lineHeight: 24,
    },
    footer: {
        padding: 40,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    footerText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    link: {
        fontSize: 16,
        fontWeight: '600',
    },
});
