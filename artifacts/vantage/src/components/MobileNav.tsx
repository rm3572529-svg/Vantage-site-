import { Link, useLocation } from "wouter";
import { Home, Files, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex items-center justify-around px-2 pb-safe pt-2 h-16 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
      <Link href="/">
        <div className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", location === "/" ? "text-primary" : "text-muted-foreground")} data-testid="mobilenav-home">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </div>
      </Link>
      <Link href="/dashboard">
        <div className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", location === "/dashboard" ? "text-primary" : "text-muted-foreground")} data-testid="mobilenav-files">
          <Files className="w-5 h-5" />
          <span className="text-[10px] font-medium">Files</span>
        </div>
      </Link>
      
      <div className="relative -top-5 flex justify-center w-full">
        <Link href="/">
          <div className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg shadow-primary/30 transition-transform active:scale-95" data-testid="mobilenav-add">
            <Plus className="w-6 h-6" />
          </div>
        </Link>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground" data-testid="mobilenav-notifications">
        <Bell className="w-5 h-5" />
        <span className="text-[10px] font-medium">Alerts</span>
      </div>
      <Link href={user ? "/dashboard" : "/login"}>
        <div className={cn("flex flex-col items-center justify-center w-full h-full space-y-1", location === "/login" || location === "/dashboard" ? "text-primary" : "text-muted-foreground")} data-testid="mobilenav-user">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">{user ? "Profile" : "Login"}</span>
        </div>
      </Link>
    </div>
  );
}