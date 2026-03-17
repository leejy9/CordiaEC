import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { data: sessionData, isLoading } = useQuery({
    queryKey: ["/api/admin/session"],
    queryFn: async () => {
      const response = await fetch("/api/admin/session", {
        credentials: "include",
      });
      return response.json();
    },
  });

  useEffect(() => {
    if ((sessionData as any)?.authenticated) {
      setLocation("/admin");
    }
  }, [sessionData, setLocation]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/login", {
        username,
        password,
      });
      return response.json();
    },
    onSuccess: () => {
      setLocation("/admin");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Please check your admin credentials.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  const configured = (sessionData as any)?.configured !== false;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl border-gray-100">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-cordia-blue/10 mx-auto mb-4 flex items-center justify-center">
              <LockKeyhole className="w-7 h-7 text-cordia-blue" />
            </div>
            <h1 className="text-3xl font-bold text-cordia-dark mb-2">Admin Login</h1>
            <p className="text-gray-600">
              Manage history posts, drafts, and published milestones from one place.
            </p>
          </div>

          {!configured && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in Vercel before using the admin panel.
            </div>
          )}

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              loginMutation.mutate();
            }}
          >
            <div>
              <label className="text-sm font-medium text-cordia-dark block mb-2">Username</label>
              <Input value={username} onChange={(event) => setUsername(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-cordia-dark block mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-cordia-blue hover:bg-blue-600"
              disabled={loginMutation.isPending || !configured}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
