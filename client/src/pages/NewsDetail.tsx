import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import { getPost } from "@/lib/queries";
import type { Post } from "@/lib/database.types";

export default function NewsDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: article, isLoading, isError } = useQuery<Post | null>({
    queryKey: ["post", id],
    queryFn: () => getPost(id!),
    enabled: !!id,
  });

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

  if (isError || !article) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <p className="text-2xl text-gray-400 mb-6">게시글을 찾을 수 없습니다.</p>
          <Button onClick={() => navigate("/news")} className="bg-cordia-teal text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />목록으로
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
            onClick={() => navigate("/news")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />뉴스 목록
          </Button>

          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-auto rounded-2xl mb-8"
            />
          )}

          <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
            <Calendar className="w-4 h-4" />
            <span>{new Date(article.published_date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-lg text-gray-500 border-l-4 border-cordia-teal pl-4 mb-8 italic">
            {article.excerpt}
          </p>

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
            {article.content.split("\n").map((p, i) =>
              p.trim() ? <p key={i} className="mb-4">{p.trim()}</p> : null
            )}
          </div>

          {article.link_url && (
            <div className="mt-10 pt-8 border-t">
              <a
                href={article.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cordia-teal text-white px-6 py-3 rounded-xl hover:bg-cordia-green transition-colors font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                원문 보기
              </a>
            </div>
          )}
        </div>
      </article>
    </Layout>
  );
}
