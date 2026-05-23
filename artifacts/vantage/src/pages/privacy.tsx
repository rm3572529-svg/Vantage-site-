import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <main className="flex-1 py-12 md:py-24 bg-muted/10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <Card>
          <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Vantage ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website 
              or use our services.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when using our services:
            </p>
            <ul>
              <li><strong>Account Information:</strong> If you create an account, we collect your email address, display name, and authentication data (such as via Google Sign-In).</li>
              <li><strong>Link Data:</strong> We store the Google Drive URLs you submit and the generated short codes.</li>
              <li><strong>Usage Data:</strong> We collect anonymous analytics related to link generation and downloads.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use the collected information for the following purposes:
            </p>
            <ul>
              <li>To provide, maintain, and improve our services.</li>
              <li>To manage your account and track your link limits.</li>
              <li>To monitor usage patterns and prevent abuse.</li>
              <li>To provide customer support and respond to inquiries.</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption. Authentication is handled by Firebase, 
              which maintains rigorous security standards. We do not store or have access to your raw passwords.
            </p>

            <h2>5. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
              This includes essential cookies for authentication and optional cookies for analytics or advertising (such as Google AdSense).
            </p>

            <h2>6. Third-Party Services</h2>
            <p>
              Our service integrates with third-party providers (e.g., Google Drive, Firebase, Google AdSense). 
              These providers may collect information as dictated by their own privacy policies. We are not responsible 
              for the practices of these third-party services.
            </p>

            <h2>7. Your Data Rights</h2>
            <p>
              Depending on your location, you may have the right to access, update, or delete your personal data. 
              You can delete your account and associated data at any time from your dashboard or by contacting us.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us via our Contact page.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}