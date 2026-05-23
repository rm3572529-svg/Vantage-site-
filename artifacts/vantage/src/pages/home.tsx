import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateLink, useGetLinks } from "@workspace/api-client-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { AdSlot } from "@/components/AdSlot";
import { Copy, ArrowRight, Share2, Link as LinkIcon, Download, Zap, Shield, CheckCircle2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<{ directUrl: string; shortCode: string; originalUrl: string } | null>(null);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const createLinkMutation = useCreateLink();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    if (!url.includes("drive.google.com")) {
      toast.error("Invalid URL. Please enter a valid Google Drive link.");
      return;
    }

    setIsGenerating(true);

    try {
      let fileId = "";
      const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
      
      if (match1 && match1[1]) fileId = match1[1];
      else if (match2 && match2[1]) fileId = match2[1];

      if (!fileId) {
        toast.error("Could not extract File ID from the URL.");
        setIsGenerating(false);
        return;
      }

      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const shortCode = nanoid(8);

      if (user) {
        await createLinkMutation.mutateAsync({
          data: {
            uid: user.uid,
            originalUrl: url,
            customSlug: shortCode
          }
        });
      } else {
        const guestLinksStr = localStorage.getItem("vantage_guest_links");
        let guestLinks = guestLinksStr ? JSON.parse(guestLinksStr) : [];
        
        if (guestLinks.length >= 3) {
          toast.error("Guest limit reached. Please log in to generate more links.");
          setLocation("/login");
          return;
        }

        guestLinks.push({ shortCode, originalUrl: url, createdAt: new Date().toISOString() });
        localStorage.setItem("vantage_guest_links", JSON.stringify(guestLinks));
        
        if (guestLinks.length === 3) {
          toast.warning("You've used all 3 free guest links. Please sign up to create more.");
        }
      }

      setGeneratedLink({ directUrl, shortCode, originalUrl: url });
      setUrl("");
      toast.success("Link generated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate link.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-24 border-b">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              Google Drive links, <span className="text-primary">perfected.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Convert messy Google Drive share links into professional, direct download pages. Share faster, track better, look pro.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <Input
                      type="url"
                      placeholder="Paste your Google Drive link here..."
                      className="pl-10 h-14 text-base"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      data-testid="input-drive-url"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="h-14 px-8 text-base font-medium shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isGenerating}
                    data-testid="btn-generate"
                  >
                    {isGenerating ? "Generating..." : "Generate Link"}
                    {!isGenerating && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                  <Shield className="h-4 w-4" /> Secure, fast, and reliable.
                </p>
              </CardContent>
            </Card>

            {/* Result Card */}
            {generatedLink && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-primary/20 shadow-lg shadow-primary/5">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                      <h3 className="text-xl font-bold">Your link is ready!</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Short Link (Share this)</label>
                            <div className="flex gap-2">
                              <Input 
                                readOnly 
                                value={`${window.location.origin}/d/${generatedLink.shortCode}`} 
                                className="bg-muted font-mono text-sm"
                              />
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => copyToClipboard(`${window.location.origin}/d/${generatedLink.shortCode}`, "Short Link")}
                                title="Copy short link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                asChild
                                title="Visit short link"
                              >
                                <a href={`/d/${generatedLink.shortCode}`} target="_blank" rel="noreferrer">
                                  <ArrowRight className="h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Direct Download Link</label>
                            <div className="flex gap-2">
                              <Input 
                                readOnly 
                                value={generatedLink.directUrl} 
                                className="bg-muted font-mono text-xs"
                              />
                              <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => copyToClipboard(generatedLink.directUrl, "Direct Link")}
                                title="Copy direct link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-lg border">
                          <QRCodeSVG 
                            value={`${window.location.origin}/d/${generatedLink.shortCode}`}
                            size={128}
                            level="M"
                            includeMargin={false}
                            className="mb-2 rounded"
                          />
                          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Scan to download</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AdSense Leaderboard */}
      <div className="container mx-auto py-8 flex justify-center border-b">
        <div className="w-full max-w-[728px] h-[90px] bg-muted/20 flex items-center justify-center text-muted-foreground text-sm border border-dashed rounded">
          <AdSlot slot="leaderboard" format="auto" />
          <span className="sr-only">Advertisement</span>
        </div>
      </div>

      {/* Features / Tutorial */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How it works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Three simple steps to transform your file sharing experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <LinkIcon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">1. Paste Link</h3>
              <p className="text-muted-foreground">Copy your Google Drive share link and paste it into our generator.</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 space-y-4 relative">
              <div className="hidden md:block absolute top-14 -left-12 w-24 border-t-2 border-dashed border-border"></div>
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">2. Generate</h3>
              <p className="text-muted-foreground">We instantly create a secure, direct download page for your file.</p>
              <div className="hidden md:block absolute top-14 -right-12 w-24 border-t-2 border-dashed border-border"></div>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold">3. Share</h3>
              <p className="text-muted-foreground">Share the short link or QR code. Track downloads from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-primary/5 border-t">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Unlock powerful features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Sign up for a free account to track downloads, manage your links, and optionally require social actions before downloading.
            </p>
            <Button size="lg" asChild className="h-14 px-8 text-base">
              <Link href="/login">Create Free Account</Link>
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}