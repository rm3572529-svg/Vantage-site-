import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetLink, useRecordDownload, useReportLink, useGetSettings } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileTypeIcon } from "@/components/FileTypeIcon";
import { AdSlot } from "@/components/AdSlot";
import { format } from "date-fns";
import { Download, AlertTriangle, Share2, Copy, Youtube, Instagram, MessageCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function DownloadPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  
  // Need custom query key for useGetLink
  const { data: link, isLoading, isError } = useGetLink(shortCode || "", { 
    query: { 
      enabled: !!shortCode,
      retry: false
    } 
  });

  const recordDownloadMutation = useRecordDownload();
  const reportLinkMutation = useReportLink();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  
  // Mock settings for now since we don't have useGetSettings endpoint
  const [settings] = useState({
    socialTaskEnabled: true,
    youtubeLink: "https://youtube.com",
    instagramLink: "https://instagram.com",
    whatsappLink: "https://whatsapp.com"
  });

  const [tasks, setTasks] = useState({
    youtube: false,
    instagram: false,
    whatsapp: false
  });

  const allTasksCompleted = !settings.socialTaskEnabled || (tasks.youtube && tasks.instagram && tasks.whatsapp);

  const handleDownload = async () => {
    if (!link) return;

    try {
      const isMobile = navigator.userAgent.toLowerCase().includes("mobile");
      await recordDownloadMutation.mutateAsync({
        id: link.id,
        data: {
          device: isMobile ? "mobile" : "desktop",
          country: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    } catch (err) {
      console.error("Failed to record download", err);
    }
    
    // Open in same tab or new tab
    window.location.href = link.directUrl;
  };

  const handleReport = async () => {
    if (!link || !reportReason.trim()) return;
    
    try {
      await reportLinkMutation.mutateAsync({
        id: link.id,
        data: { reason: reportReason }
      });
      toast.success("Link reported successfully. We will review it shortly.");
      setIsReportOpen(false);
      setReportReason("");
    } catch (err) {
      toast.error("Failed to report link.");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[70vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground font-medium">Fetching file details...</p>
      </div>
    );
  }

  if (isError || !link) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[70vh]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">File Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          The link you followed may be broken, or the file may have been removed.
        </p>
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    );
  }

  return (
    <main className="flex-1 bg-muted/10 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Top Ad */}
        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-[728px] h-[90px] bg-background border border-dashed rounded flex items-center justify-center text-muted-foreground text-sm">
            <AdSlot slot="download_top" format="horizontal" />
            <span className="sr-only">Advertisement</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-t-4 border-t-primary overflow-hidden">
              <CardHeader className="bg-card pb-8 border-b">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-muted rounded-xl">
                    <FileTypeIcon fileName={link.fileName} className="h-10 w-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl md:text-2xl break-words line-clamp-2" title={link.fileName}>
                      {link.fileName || "Unknown File"}
                    </CardTitle>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                        <Download className="h-3.5 w-3.5" />
                        {link.downloads} downloads
                      </span>
                      <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                        Added {format(new Date(link.createdAt), "MMM d, yyyy")}
                      </span>
                      {link.fileSize && (
                        <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                          {link.fileSize}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 md:p-8 bg-card relative">
                {settings.socialTaskEnabled && !allTasksCompleted ? (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold mb-2">Complete tasks to unlock</h3>
                      <p className="text-sm text-muted-foreground">Please complete the following actions to reveal the download link.</p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Youtube Task */}
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-background hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#FF0000]/10 p-2 rounded-full text-[#FF0000]">
                            <Youtube className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Subscribe on YouTube</p>
                          </div>
                        </div>
                        {tasks.youtube ? (
                          <div className="flex items-center gap-1 text-green-600 font-medium text-sm px-3 py-1 bg-green-50 rounded-full">
                            <CheckCircle2 className="h-4 w-4" /> Done
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              window.open(settings.youtubeLink, '_blank');
                              setTimeout(() => setTasks(p => ({ ...p, youtube: true })), 2000);
                            }}
                          >
                            Subscribe
                          </Button>
                        )}
                      </div>

                      {/* Instagram Task */}
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-background hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#E1306C]/10 p-2 rounded-full text-[#E1306C]">
                            <Instagram className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Follow on Instagram</p>
                          </div>
                        </div>
                        {tasks.instagram ? (
                          <div className="flex items-center gap-1 text-green-600 font-medium text-sm px-3 py-1 bg-green-50 rounded-full">
                            <CheckCircle2 className="h-4 w-4" /> Done
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.open(settings.instagramLink, '_blank');
                              setTimeout(() => setTasks(p => ({ ...p, instagram: true })), 2000);
                            }}
                          >
                            Follow
                          </Button>
                        )}
                      </div>

                      {/* Whatsapp Task */}
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-background hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#25D366]/10 p-2 rounded-full text-[#25D366]">
                            <MessageCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Join WhatsApp Channel</p>
                          </div>
                        </div>
                        {tasks.whatsapp ? (
                          <div className="flex items-center gap-1 text-green-600 font-medium text-sm px-3 py-1 bg-green-50 rounded-full">
                            <CheckCircle2 className="h-4 w-4" /> Done
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.open(settings.whatsappLink, '_blank');
                              setTimeout(() => setTasks(p => ({ ...p, whatsapp: true })), 2000);
                            }}
                          >
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 animate-in fade-in zoom-in duration-500">
                    <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                      <Download className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Ready to download</h3>
                    <p className="text-muted-foreground mb-8 text-center max-w-sm">
                      Your file is ready. Click the button below to start the download directly from Google Drive.
                    </p>
                    
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto min-w-[250px] h-14 text-lg font-bold shadow-lg shadow-primary/20"
                      onClick={handleDownload}
                      data-testid="btn-download-file"
                    >
                      Download File
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/30 border-t flex justify-between p-4 text-xs text-muted-foreground">
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setIsReportOpen(true)} data-testid="btn-report">
                  <AlertTriangle className="mr-2 h-3.5 w-3.5" /> Report Link
                </Button>
                <span>ID: {link.id.substring(0, 8)}...</span>
              </CardFooter>
            </Card>

            {/* Bottom Ad */}
            <div className="w-full h-[250px] md:h-[90px] bg-background border border-dashed rounded flex items-center justify-center text-muted-foreground text-sm mt-8">
              <AdSlot slot="download_bottom" format="auto" />
              <span className="sr-only">Advertisement</span>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Share Link</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <QRCodeSVG 
                    value={window.location.href}
                    size={180}
                    level="L"
                    includeMargin={false}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="w-full" onClick={copyLink}>
                    <Copy className="mr-2 h-4 w-4" /> Copy
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Download ${link.fileName}`,
                        url: window.location.href
                      });
                    } else {
                      copyLink();
                    }
                  }}>
                    <Share2 className="mr-2 h-4 w-4" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar Ad */}
            <div className="w-full h-[250px] bg-background border border-dashed rounded flex items-center justify-center text-muted-foreground text-sm">
              <AdSlot slot="download_sidebar" format="rectangle" />
              <span className="sr-only">Advertisement</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Link</DialogTitle>
            <DialogDescription>
              If this file violates our terms of service, contains malware, or is copyrighted material, please let us know.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Please provide details about why you are reporting this link..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReport} disabled={!reportReason.trim() || reportLinkMutation.isPending}>
              {reportLinkMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}