import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        toast({
          title: "로그인 성공",
          description: "관리자 패널로 이동합니다.",
        });
        navigate("/admin");
      }
    } catch (err: any) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-cordia-teal/10 rounded-full p-4">
                <Lock className="w-8 h-8 text-cordia-teal" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-cordia-dark">
              Admin Access
            </CardTitle>
            <p className="text-gray-500 text-sm mt-1">
              관리자 로그인
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="admin@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="비밀번호"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-cordia-teal hover:bg-cordia-green text-white"
              >
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            <p className="text-xs text-gray-400 mt-4 text-center">
              관리자 계정이 필요합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
