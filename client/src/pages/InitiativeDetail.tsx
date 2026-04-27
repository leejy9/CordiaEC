import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import type { Initiative } from "@shared/schema";

export default function InitiativeDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data, isLoading, isError } = useQuery<{ success: boolean; initiative: Initiative }>({
    queryKey: ["/api/initiatives", slug],
    queryFn: async () => {
      const res = await fetch(`/api/initiatives/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const initiative = data?.initiative;

  if (isLoading) {
    return (
      <Layout>
        <div className="py-16 container mx-auto px-4 max-w-3xl">
          <div className="h-8 bg-gray-200 rounded w-24 mb-8 animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl mb-8 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !initiative) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <p className="text-2xl text-gray-400 mb-6">이니셔티브 내용을 찾을 수 없습니다.</p>
          <p className="text-gray-400 text-sm mb-8">Admin에서 해당 이니셔티브를 먼저 등록해주세요.</p>
          <Button onClick={() => navigate("/initiatives")} className="bg-cordia-teal text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />이니셔티브 목록
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <Button
            variant="ghost"
            className="mb-8 text-gray-500 hover:text-cordia-teal -ml-2"
            onClick={() => navigate("/initiatives")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />이니셔티브 목록
          </Button>

          {initiative.imageUrl && (
            <img
              src={initiative.imageUrl}
              alt={initiative.title}
              className="w-full max-h-96 object-cover rounded-2xl mb-8"
            />
          )}

          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-cordia-teal/10 text-cordia-teal border-cordia-teal/20">
              {initiative.category}
            </Badge>
            {initiative.publishedDate && (
              <span className="flex items-center gap-1.5 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                {new Date(initiative.publishedDate).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-6 leading-tight">
            {initiative.title}
          </h1>

          <p className="text-lg text-gray-500 border-l-4 border-cordia-teal pl-4 mb-8 italic">
            {initiative.description}
          </p>

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
            {initiative.content.split("\n").map((p, i) =>
              p.trim() ? <p key={i} className="mb-4">{p.trim()}</p> : null
            )}
          </div>

          <div className="mt-10 pt-8 border-t flex gap-3">
            {(initiative as any).linkUrl && (
              <a
                href={(initiative as any).linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cordia-teal text-white px-6 py-3 rounded-xl hover:bg-cordia-green transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                원문 보기
              </a>
            )}
            <Button
              className="bg-cordia-dark hover:bg-gray-800 text-white px-6"
              onClick={() => navigate("/contact")}
            >
              Apply Now
            </Button>
          </div>
        </div>
      </article>
    </Layout>
  );
}
