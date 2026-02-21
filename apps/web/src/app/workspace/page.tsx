
import type { Metadata } from 'next';
import WorkspaceClient from '@/components/workspace/workspace-client';


export const metadata: Metadata = {
  title: 'Internships & Competitions for Students in India | Uninest Workspace',
  description: 'Find internships and competitions. Get AI to draft your application essay. Uninest Workspace: free AI career co-pilot for Indian college students.',
};

export default function WorkspacePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Uninest AI Assistant",
            "applicationCategory": "EducationApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
            "description": "AI assistant for students powered by Llama-3.3-70b-versatile via Groq. Helps students search for hostels, book library seats, find food mess plans, and draft internship application essays. Human approval required before any booking or submission.",
            "featureList": [
              "Hostel search and booking preparation",
              "Live library seat booking",
              "Food mess subscription discovery",
              "Internship and competition search",
              "AI internship application essay drafting",
              "Vendor listing and management",
              "AI vendor support tools"
            ]
          })
        }}
      />
      <WorkspaceClient />
    </>
  );
}
