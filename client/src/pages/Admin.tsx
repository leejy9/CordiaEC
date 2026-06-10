import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminPostsTab from "@/components/admin/AdminPostsTab";
import AdminInitiativesTab from "@/components/admin/AdminInitiativesTab";
import AdminMilestonesTab from "@/components/admin/AdminMilestonesTab";
import AdminHomeSettingsTab from "@/components/admin/AdminHomeSettingsTab";
import AdminContactsTab from "@/components/admin/AdminContactsTab";

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <AdminLoginForm />;
  }

  return (
    <Layout>
      <div className="py-12 bg-gray-50 min-h-[80vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cordia-dark">관리자 패널</h1>
              <p className="text-gray-500 mt-1">모든 게시판 콘텐츠를 관리하세요</p>
              <p className="text-sm text-gray-400 mt-2">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Lock className="w-4 h-4" />
              로그아웃
            </button>
          </div>

          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="posts">게시글</TabsTrigger>
              <TabsTrigger value="initiatives">이니셔티브</TabsTrigger>
              <TabsTrigger value="milestones">연혁</TabsTrigger>
              <TabsTrigger value="home">홈 게시판</TabsTrigger>
              <TabsTrigger value="contacts">문의함</TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              <AdminPostsTab />
            </TabsContent>

            <TabsContent value="initiatives">
              <AdminInitiativesTab />
            </TabsContent>

            <TabsContent value="milestones">
              <AdminMilestonesTab />
            </TabsContent>

            <TabsContent value="home">
              <AdminHomeSettingsTab />
            </TabsContent>

            <TabsContent value="contacts">
              <AdminContactsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
