import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useGetLinks, useDeleteLink, getGetLinksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Copy, Trash2, ExternalLink, Activity, Link as LinkIcon, Settings, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { FileTypeIcon } from "@/components/FileTypeIcon";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Dashboard() {
  const { user, userProfile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: links, isLoading: linksLoading } = useGetLinks(
    { uid: user?.uid || "" },
    { query: { enabled: !!user?.uid, queryKey: getGetLinksQueryKey({ uid: user?.uid || "" }) } }
  );

  const deleteLinkMutation = useDeleteLink();

  // Redirect if not logged in
  if (!loading && !user) {
    setLocation("/login");
    return null;
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteLinkMutation.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getGetLinksQueryKey({ uid: user?.uid || "" }) });
      toast.success("Link deleted successfully");
    } catch (error) {
      toast.error("Failed to delete link");
    }
  };

  const copyLink = (shortCode: string) => {
    const url = `${window.location.origin}/d/${shortCode}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const sortedByDownloads = useMemo(() => {
    if (!links) return [];
    return [...links].sort((a, b) => b.downloads - a.downloads);
  }, [links]);

  if (loading || !userProfile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const usagePercent = Math.min(100, Math.round((userProfile.linksUsed / userProfile.linksLimit) * 100));

  return (
    <main className="flex-1 bg-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your links and view analytics.</p>
          </div>
          <Button asChild>
            <Link href="/">
              <a className="flex items-center gap-2" data-testid="btn-create-new">
                <LinkIcon className="w-4 h-4" />
                Create New Link
              </a>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Usage</CardTitle>
              <CardDescription>You have used {userProfile.linksUsed} of {userProfile.linksLimit} links</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={usagePercent} className="h-3 mb-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{usagePercent}% utilized</span>
                <span>{userProfile.linksLimit - userProfile.linksUsed} remaining</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{userProfile.displayName || "User"}</h3>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary capitalize">
                  {userProfile.role}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="links" className="w-full">
          <TabsList className="mb-6 bg-card border shadow-sm h-12 p-1">
            <TabsTrigger value="links" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm px-6">My Links</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm px-6">Top Performing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="links" className="mt-0 outline-none">
            <Card className="border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[300px]">File</TableHead>
                      <TableHead>Short Link</TableHead>
                      <TableHead className="text-center">Downloads</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linksLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          Loading links...
                        </TableCell>
                      </TableRow>
                    ) : !links || links.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <LinkIcon className="h-10 w-10 mb-3 opacity-20" />
                            <p>You haven't created any links yet.</p>
                            <Button variant="link" asChild className="mt-2">
                              <Link href="/">Create your first link</Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      links.map((link) => (
                        <TableRow key={link.id} className="group hover:bg-muted/20">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <FileTypeIcon fileName={link.fileName} className="h-8 w-8 opacity-70 shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-sm truncate" title={link.fileName}>
                                  {link.fileName || "Unknown File"}
                                </span>
                                <a href={link.originalUrl} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground truncate hover:underline hover:text-primary flex items-center gap-1">
                                  Google Drive <ExternalLink className="h-3 w-3 inline" />
                                </a>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-2 py-1 rounded">/d/{link.shortCode}</code>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyLink(link.shortCode)}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {link.downloads}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(link.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild title="View Page">
                                <Link href={`/d/${link.shortCode}`}>
                                  <a><ExternalLink className="h-4 w-4" /></a>
                                </Link>
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Link</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this link? Anyone trying to download this file will see a 404 error. This cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(link.id)} className="bg-destructive hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="mt-0 outline-none">
            <Card className="border-border shadow-sm p-6">
              {!sortedByDownloads || sortedByDownloads.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No data available yet.</div>
              ) : (
                <div className="space-y-6">
                  {sortedByDownloads.slice(0, 10).map((link, index) => (
                    <div key={link.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-muted-foreground">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{link.fileName}</p>
                        <p className="text-xs text-muted-foreground truncate">{window.location.origin}/d/{link.shortCode}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="font-bold">{link.downloads}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}