import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch as UISwitch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ShieldAlert, Users, Link as LinkIcon, Trash2, Settings, Activity } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAnalyticsSummary,
  useAdminGetUsers,
  useAdminGetLinks,
  useAdminDeleteLink,
  useAdminUpdateRole,
  useGetSettings,
  useUpdateSettings,
  getAdminGetLinksQueryKey,
  getAdminGetUsersQueryKey,
  getGetSettingsQueryKey,
} from "@workspace/api-client-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const BAR_DATA = [
  { name: "Mon", downloads: 400 },
  { name: "Tue", downloads: 300 },
  { name: "Wed", downloads: 550 },
  { name: "Thu", downloads: 450 },
  { name: "Fri", downloads: 700 },
  { name: "Sat", downloads: 200 },
  { name: "Sun", downloads: 150 },
];

export default function Admin() {
  const { userProfile, loading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsSummary();
  const { data: users, isLoading: usersLoading } = useAdminGetUsers();
  const { data: links, isLoading: linksLoading } = useAdminGetLinks();
  const { data: settings } = useGetSettings();

  const deleteLinkMutation = useAdminDeleteLink();
  const updateRoleMutation = useAdminUpdateRole();
  const updateSettingsMutation = useUpdateSettings();

  const [settingsForm, setSettingsForm] = useState({
    socialTaskEnabled: settings?.socialTaskEnabled ?? true,
    directDownloadEnabled: settings?.directDownloadEnabled ?? true,
    monetizationEnabled: settings?.monetizationEnabled ?? false,
    youtubeLink: settings?.youtubeLink ?? "",
    instagramLink: settings?.instagramLink ?? "",
    whatsappLink: settings?.whatsappLink ?? "",
    adsensePublisherId: settings?.adsensePublisherId ?? "",
  });

  // Sync form when settings load
  if (settings && settingsForm.youtubeLink === "" && settings.youtubeLink) {
    setSettingsForm({
      socialTaskEnabled: settings.socialTaskEnabled,
      directDownloadEnabled: settings.directDownloadEnabled,
      monetizationEnabled: settings.monetizationEnabled,
      youtubeLink: settings.youtubeLink,
      instagramLink: settings.instagramLink,
      whatsappLink: settings.whatsappLink,
      adsensePublisherId: settings.adsensePublisherId ?? "",
    });
  }

  if (!loading && (!userProfile || userProfile.role !== "admin")) {
    setLocation("/");
    return null;
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleDeleteLink = (id: string) => {
    deleteLinkMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Link deleted");
        queryClient.invalidateQueries({ queryKey: getAdminGetLinksQueryKey() });
      },
      onError: () => toast.error("Failed to delete link"),
    });
  };

  const handleToggleRole = (uid: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    updateRoleMutation.mutate({ uid, data: { role: newRole } }, {
      onSuccess: () => {
        toast.success(`Role updated to ${newRole}`);
        queryClient.invalidateQueries({ queryKey: getAdminGetUsersQueryKey() });
      },
      onError: () => toast.error("Failed to update role"),
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({ data: settingsForm }, {
      onSuccess: () => {
        toast.success("Settings saved");
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      },
      onError: () => toast.error("Failed to save settings"),
    });
  };

  const pieData = analytics?.deviceBreakdown
    ? Object.entries(analytics.deviceBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <main className="flex-1 bg-muted/10 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
            <p className="text-muted-foreground">Manage platform, users, and settings.</p>
          </div>
        </div>

        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="mb-6 bg-card border shadow-sm h-12 p-1 flex-wrap gap-1">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm px-4">
              <Activity className="h-4 w-4 mr-2" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm px-4">
              <Users className="h-4 w-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="links" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm px-4">
              <LinkIcon className="h-4 w-4 mr-2" /> Links
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-sm px-4">
              <Settings className="h-4 w-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 outline-none">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analyticsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}><CardContent className="pt-6"><Skeleton className="h-8 w-24" /></CardContent></Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Links</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{analytics?.totalLinks?.toLocaleString() ?? 0}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{analytics?.totalDownloads?.toLocaleString() ?? 0}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{analytics?.totalUsers?.toLocaleString() ?? 0}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Today's Visitors</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{analytics?.todayVisitors?.toLocaleString() ?? 0}</div></CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Weekly Downloads</CardTitle></CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={BAR_DATA}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: "hsl(var(--muted))" }} />
                      <Bar dataKey="downloads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Device Breakdown</CardTitle></CardHeader>
                <CardContent className="h-[280px]">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No download data yet</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="outline-none">
            <Card>
              <CardHeader><CardTitle>Manage Users</CardTitle></CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Links Used</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.map((u) => (
                          <TableRow key={u.uid}>
                            <TableCell className="font-medium">{u.email || u.uid}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                {u.role}
                              </span>
                            </TableCell>
                            <TableCell>{u.linksUsed} / {u.linksLimit}</TableCell>
                            <TableCell>{format(new Date(u.createdAt), "MMM d, yyyy")}</TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" onClick={() => handleToggleRole(u.uid, u.role)}>
                                {u.role === "admin" ? "Demote" : "Make Admin"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!users?.length && (
                          <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="outline-none">
            <Card>
              <CardHeader><CardTitle>Manage Links</CardTitle></CardHeader>
              <CardContent>
                {linksLoading ? (
                  <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File Name</TableHead>
                          <TableHead>Short Code</TableHead>
                          <TableHead>Downloads</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {links?.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell className="font-medium max-w-[200px] truncate" title={l.fileName}>{l.fileName}</TableCell>
                            <TableCell><code className="text-xs bg-muted px-2 py-1 rounded">{l.shortCode}</code></TableCell>
                            <TableCell>{l.downloads}</TableCell>
                            <TableCell>
                              {l.reported ? (
                                <span className="flex items-center text-xs text-destructive font-medium">
                                  <ShieldAlert className="w-3 h-3 mr-1" /> Reported
                                </span>
                              ) : (
                                <span className="text-xs text-green-600 font-medium">Active</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteLink(l.id)}
                                disabled={deleteLinkMutation.isPending}
                                data-testid={`button-delete-link-${l.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {!links?.length && (
                          <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No links found</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="outline-none">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure global features and integrations.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div className="space-y-4 border-b pb-6">
                    <h3 className="font-semibold text-lg">Features</h3>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Social Task Wall</Label>
                        <p className="text-sm text-muted-foreground">Require users to complete social tasks before downloading.</p>
                      </div>
                      <UISwitch checked={settingsForm.socialTaskEnabled} onCheckedChange={(c) => setSettingsForm(s => ({ ...s, socialTaskEnabled: c }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Direct Downloads</Label>
                        <p className="text-sm text-muted-foreground">Allow instant downloads without social tasks.</p>
                      </div>
                      <UISwitch checked={settingsForm.directDownloadEnabled} onCheckedChange={(c) => setSettingsForm(s => ({ ...s, directDownloadEnabled: c }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Monetization</Label>
                        <p className="text-sm text-muted-foreground">Enable AdSense ads across the platform.</p>
                      </div>
                      <UISwitch checked={settingsForm.monetizationEnabled} onCheckedChange={(c) => setSettingsForm(s => ({ ...s, monetizationEnabled: c }))} />
                    </div>
                  </div>

                  <div className="space-y-4 border-b pb-6">
                    <h3 className="font-semibold text-lg">Social Links</h3>
                    <div className="space-y-2">
                      <Label>YouTube Link</Label>
                      <Input value={settingsForm.youtubeLink} onChange={(e) => setSettingsForm(s => ({ ...s, youtubeLink: e.target.value }))} placeholder="https://youtube.com/c/..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Instagram Link</Label>
                      <Input value={settingsForm.instagramLink} onChange={(e) => setSettingsForm(s => ({ ...s, instagramLink: e.target.value }))} placeholder="https://instagram.com/..." />
                    </div>
                    <div className="space-y-2">
                      <Label>WhatsApp Link</Label>
                      <Input value={settingsForm.whatsappLink} onChange={(e) => setSettingsForm(s => ({ ...s, whatsappLink: e.target.value }))} placeholder="https://wa.me/..." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">AdSense</h3>
                    <div className="space-y-2">
                      <Label>Publisher ID</Label>
                      <Input value={settingsForm.adsensePublisherId} onChange={(e) => setSettingsForm(s => ({ ...s, adsensePublisherId: e.target.value }))} placeholder="ca-pub-XXXXXXXXXXXXXXXXXX" />
                      <p className="text-xs text-muted-foreground">Find this in your Google AdSense account under Account settings.</p>
                    </div>
                  </div>

                  <Button type="submit" disabled={updateSettingsMutation.isPending} data-testid="button-save-settings">
                    {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
