import 'package:flutter/material.dart';

class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Privacy Policy for UniNest',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              'Last updated: ${DateTime.now().year}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: 24),
            _buildSection(
              context,
              title: '1. Introduction',
              content:
                  'Welcome to UniNest ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website.',
            ),
            _buildSection(
              context,
              title: '2. Information We Collect',
              content:
                  'We collect information that you provide directly to us, including:\n\n'
                  '• Personal Information: Name, email address, phone number, profile picture\n'
                  '• Account Information: Username, password, preferences\n'
                  '• Payment Information: Payment card details (processed securely via Razorpay)\n'
                  '• User Content: Posts, comments, messages, listings, reviews\n'
                  '• Academic Information: College name, course, year of study\n'
                  '• Location Data: City, campus location (with your permission)',
            ),
            _buildSection(
              context,
              title: '3. How We Use Your Information',
              content: 'We use the information we collect to:\n\n'
                  '• Provide, maintain, and improve our services\n'
                  '• Process transactions and send related information\n'
                  '• Send you technical notices and support messages\n'
                  '• Respond to your comments and questions\n'
                  '• Send you marketing communications (with your consent)\n'
                  '• Monitor and analyze trends and usage\n'
                  '• Detect and prevent fraudulent transactions\n'
                  '• Personalize your experience',
            ),
            _buildSection(
              context,
              title: '4. Information Sharing and Disclosure',
              content: 'We may share your information with:\n\n'
                  '• Service Providers: Third-party vendors who perform services on our behalf (Supabase for database, Razorpay for payments, Firebase for analytics)\n'
                  '• Business Partners: Vendors and property owners you interact with\n'
                  '• Legal Requirements: When required by law or to protect our rights\n'
                  '• Business Transfers: In connection with any merger or sale of company assets\n\n'
                  'We do NOT sell your personal information to third parties.',
            ),
            _buildSection(
              context,
              title: '5. Data Storage and Security',
              content:
                  'We implement appropriate security measures to protect your information. Your data is stored securely using Supabase infrastructure with encryption at rest and in transit. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.',
            ),
            _buildSection(
              context,
              title: '6. Your Rights and Choices',
              content: 'You have the right to:\n\n'
                  '• Access and update your personal information\n'
                  '• Delete your account and associated data\n'
                  '• Opt-out of marketing communications\n'
                  '• Request a copy of your data\n'
                  '• Restrict or object to processing of your data\n\n'
                  'To exercise these rights, please contact us at privacy@uninest.app',
            ),
            _buildSection(
              context,
              title: '7. Cookies and Tracking Technologies',
              content:
                  'We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.',
            ),
            _buildSection(
              context,
              title: '8. Third-Party Services',
              content: 'Our app integrates with third-party services:\n\n'
                  '• Supabase: Database and authentication services\n'
                  '• Razorpay: Payment processing\n'
                  '• Firebase: Analytics and crash reporting\n'
                  '• Google Maps: Location services\n\n'
                  'These services have their own privacy policies, and we encourage you to review them.',
            ),
            _buildSection(
              context,
              title: '9. Children\'s Privacy',
              content:
                  'Our service is intended for users who are at least 13 years old. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.',
            ),
            _buildSection(
              context,
              title: '10. Data Retention',
              content:
                  'We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this Privacy Policy. You can request deletion of your account at any time.',
            ),
            _buildSection(
              context,
              title: '11. International Data Transfers',
              content:
                  'Your information may be transferred to and maintained on servers located outside of your country. By using our service, you consent to the transfer of information to countries outside of your country of residence.',
            ),
            _buildSection(
              context,
              title: '12. Changes to This Privacy Policy',
              content:
                  'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
            ),
            _buildSection(
              context,
              title: '13. Contact Us',
              content:
                  'If you have any questions about this Privacy Policy, please contact us:\n\n'
                  'Email: privacy@uninest.app\n'
                  'Support: support@uninest.app\n'
                  'Address: [Your Company Address]',
            ),
            const SizedBox(height: 32),
            Center(
              child: Text(
                '© ${DateTime.now().year} UniNest. All rights reserved.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required String content,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  height: 1.6,
                ),
          ),
        ],
      ),
    );
  }
}
