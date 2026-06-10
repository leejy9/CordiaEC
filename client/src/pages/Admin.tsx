import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Lock, FileText, Layers, History, LayoutGrid, Mail, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import AdminPostsTab from "@/components/admin/AdminPostsTab";
import AdminInitiativesTab from "@/components/admin/AdminInitiativesTab";
import AdminMilestonesTab from "@/components/admin/AdminMilestonesTab";
import AdminHomeSettingsTab from "@/components/admin/AdminHomeSettingsTab";
import AdminContactsTab from "@/components/admin/AdminContactsTab";

const MENU = [
  { id: "posts", label: "게시글", icon: FileText },
  { id: "initiatives", label: "이니셔티브", icon: Layers },
  { id: "milestones", label: "연혁", icon: History },
  { id: "home", label: "홈 게시판", icon: LayoutGrid },
  { id: "contacts", label: "문의함", icon: Mail },
] as const;

type MenuId = (typeof MENU)[number]["id"];

export default function Admin() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [active, setActive] = useState<MenuId>("posts");

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
      <div className="py-10 bg-gray-50 min-h-[85vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Sidebar */}
            <aside className="w-full md:w-60 shrink-0 md:sticky md:top-24">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-5 border-b border-gray-100">
                  <h1 className="text-lg font-bold text-cordia-dark flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cordia-teal" />
                    관리자 패널
                  </h1>
                  <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>
                </div>
                <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto">
                  {MENU.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActive(item.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap md:w-full text-left ${
                          isActive
                            ? "bg-cordia-teal text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 hover:text-cordia-teal"
                        }`}
                        data-testid={`menu-${item.id}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    로그아웃
                  </button>
                </div>
              </div>
            </aside>

            {/* Content */}
            <section className="flex-1 min-w-0 w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {active === "posts" && <AdminPostsTab />}
              {active === "initiatives" && <AdminInitiativesTab />}
              {active === "milestones" && <AdminMilestonesTab />}
              {active === "home" && <AdminHomeSettingsTab />}
              {active === "contacts" && <AdminContactsTab />}
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
