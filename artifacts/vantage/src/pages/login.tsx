import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiGoogle } from "react-icons/si";
import { toast } from "sonner";
import { Download } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      setLocation("/dashboard");
      toast.success("Successfully logged in");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast.success("Successfully logged in");
      } else {
        if (!displayName.trim()) {
          toast.error("Name is required");
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName);
        toast.success("Account created successfully");
      }
      setLocation("/dashboard");
    } catch (error: any) {
      console.error(error);
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        toast.error("Invalid email or password");
      } else if (msg.includes("email-already-in-use")) {
        toast.error("Email is already in use");
      } else if (msg.includes("weak-password")) {
        toast.error("Password should be at least 6 characters");
      } else {
        toast.error("An error occurred during authentication");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-140px)] bg-muted/10 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 pointer-events-none dark:bg-blue-900/20"></div>

      <div className="w-full max-w-md z-10">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <a className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg shadow-sm">
                <Download className="h-6 w-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight">Vantage</span>
            </a>
          </Link>
        </div>

        <Card className="border-border/50 shadow-xl bg-card/95 backdrop-blur">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Enter your details to create your free account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full h-11 text-base font-normal bg-background hover:bg-muted"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              data-testid="btn-google-auth"
            >
              <SiGoogle className="mr-2 h-4 w-4 text-blue-500" />
              Continue with Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted-foreground/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-xs text-primary hover:underline font-medium" tabIndex={-1}>
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                  data-testid="input-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 font-medium text-base shadow-sm mt-2" 
                disabled={isLoading}
                data-testid="btn-submit-auth"
              >
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t py-4 bg-muted/10">
            <div className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium focus:outline-none"
                disabled={isLoading}
                data-testid="btn-toggle-auth"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}