import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <main className="flex-1 py-12 md:py-24 bg-muted/10">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Terms and Conditions</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <Card>
          <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Vantage ("the Service"), you agree to be bound by these Terms and Conditions. 
              If you disagree with any part of these terms, you may not access the Service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Vantage is a utility that generates direct download links and short URLs for Google Drive files. 
              We do not host the files ourselves; we simply provide a redirect mechanism.
            </p>

            <h2>3. Acceptable Use</h2>
            <p>
              You agree not to use the Service to:
            </p>
            <ul>
              <li>Share illegal, copyrighted, or unauthorized material.</li>
              <li>Distribute malware, viruses, or any harmful code.</li>
              <li>Engage in spamming or phishing activities.</li>
              <li>Bypass or attempt to bypass any limitations or security mechanisms of the Service.</li>
            </ul>
            <p>
              We reserve the right to terminate accounts or delete links that violate these terms without prior notice.
            </p>

            <h2>4. Disclaimer of Liability</h2>
            <p>
              The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service 
              will be uninterrupted, secure, or error-free. Vantage is not responsible for the content of the files 
              shared through our links. Users download files at their own risk.
            </p>

            <h2>5. Link Expiration and Limits</h2>
            <p>
              Free accounts are subject to link generation limits as specified on the dashboard. We reserve the right 
              to modify these limits or introduce paid tiers in the future.
            </p>

            <h2>6. Modifications to Service</h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) 
              with or without notice.
            </p>

            <h2>7. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with applicable laws, without regard to its 
              conflict of law provisions.
            </p>

            <h2>8. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}