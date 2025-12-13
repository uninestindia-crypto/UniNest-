
'use client';

import { useState, useEffect } from 'react';

export default function TermsContent() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // This code now runs only on the client, after hydration
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Terms & Conditions</h1>
          {lastUpdated ? (
            <p className="mt-4 text-lg text-muted-foreground">Last updated: {lastUpdated}</p>
          ) : (
            <div className="mt-4 h-7 w-48 bg-muted rounded-md animate-pulse mx-auto" />
          )}
        </div>

        <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground">1. Introduction & Acceptance of Terms</h2>
            <p>
              Welcome to UniNest ("we," "us," or "our"). These Terms and Conditions ("Terms") govern your access to and use of our website, services, and platform (collectively, the "Platform"). By creating an account or using our Platform, you agree to be bound by these Terms. If you do not agree, you may not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">2. Eligibility</h2>
            <p>
              To use the Platform, you must be a registered student, a verified campus vendor, or an authorized library representative. By creating an account, you represent that you meet these eligibility requirements and that all information you provide is accurate and complete.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">3. Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account. You must comply with all applicable laws and regulations in your use of the Platform and are solely responsible for all data and content you upload.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">4. Marketplace Transactions</h2>
            <p>
              UniNest provides a marketplace for students and vendors to buy and sell goods. All payments are processed through Razorpay, and you agree to comply with Razorpay's terms of service. UniNest is not a party to any transaction and is not responsible for the quality, safety, or legality of items sold. Refund policies are determined by the individual vendors, and UniNest is not responsible for mediating disputes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">5. Content Policy</h2>
            <p>
              You retain ownership of any content you post, upload, or share on the Platform, including notes and social feed posts. However, you grant UniNest a worldwide, royalty-free license to use, reproduce, and display this content in connection with the Platform. You agree not to post content that is illegal, defamatory, or infringes on intellectual property rights. Plagiarism and academic dishonesty are strictly prohibited. We reserve the right to remove any content that violates these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">6. Data Privacy & Security</h2>
            <p>
              Our collection and use of your personal information are described in our Privacy Policy. We implement enterprise-grade security measures to protect your data, but we cannot guarantee that unauthorized third parties will never be able to defeat our security measures.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-foreground">7. Limitation of Liability</h2>
            <p>
              The Platform is provided "as is" without any warranties. To the fullest extent permitted by law, UniNest shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, resulting from your use of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground">8. Governing Law & Contact</h2>
            <p>
              These Terms shall be governed by the laws of the jurisdiction in which our company is incorporated, without regard to its conflict of law provisions. For any questions about these Terms, please contact us at <a href="mailto:legal@uninest.com" className="text-primary hover:underline">legal@uninest.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
