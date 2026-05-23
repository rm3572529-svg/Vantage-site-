import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Download, Menu, User as UserIcon, LogOut, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { user, userProfile, signOut } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="flex items-center gap-2" data-testid="nav-logo">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <Download className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl hidden sm:inline-block text-foreground">Vantage</span>
            </a>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/">
            <a className={`transition-colors hover:text-foreground/80 ${location === "/" ? "text-foreground" : "text-foreground/60"}`} data-testid="nav-home">Home</a>
          </Link>
          {user && (
            <Link href="/dashboard">
              <a className={`transition-colors hover:text-foreground/80 ${location === "/dashboard" ? "text-foreground" : "text-foreground/60"}`} data-testid="nav-dashboard">My Files</a>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} data-testid="btn-theme-toggle">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="btn-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || <UserIcon className="h-4 w-4" />}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.displayName || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <a className="w-full cursor-pointer flex items-center" data-testid="menu-dashboard">
                      <Download className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
                {userProfile?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <a className="w-full cursor-pointer flex items-center" data-testid="menu-admin">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Admin Panel</span>
                      </a>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer" data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">
                  <a data-testid="nav-login">Log in</a>
                </Link>
              </Button>
              <Button asChild>
                <Link href="/login">
                  <a data-testid="nav-signup">Sign up</a>
                </Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 py-4">
                <Link href="/">
                  <a className="flex items-center gap-2">
                    <div className="bg-primary text-primary-foreground p-1 rounded-md">
                      <Download className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-lg">Vantage</span>
                  </a>
                </Link>
                <nav className="flex flex-col gap-4">
                  <Link href="/">
                    <a className="text-foreground/70 hover:text-foreground font-medium">Home</a>
                  </Link>
                  {user && (
                    <Link href="/dashboard">
                      <a className="text-foreground/70 hover:text-foreground font-medium">My Files</a>
                    </Link>
                  )}
                  {!user && (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button variant="outline" asChild className="justify-start">
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button asChild className="justify-start">
                        <Link href="/login">Sign up</Link>
                      </Button>
                    </div>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}