import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, ChevronRight, ImageIcon } from "lucide-react";
import { getInitiative, getPosts } from "@/lib/queries";
import type { Post } from "@/lib/database.types";
import { useLang, useT, pickField } from "@/lib/i18n";

export default function InitiativeDetail() {
  const { lang } = useLang();
  const t = useT();
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: initiative, isLoading: initiativeLoading } = useQuery({
    queryKey: ["initiative", slug],
    queryFn: () => getInitiative(slug!),
    enabled: !!slug,
  });

  const { data: postsData, isLoading: newsLoading } = useQuery({
    queryKey: ["posts_by_initiative", slug],
    queryFn: () =>
      getPosts({
        board: "news",
        initiativeSlug: slug,
        page: 1,
        limit: 100,
      }),
    enabled: !!slug,
  });

  const articles: Post[] = postsData?.posts ?? [];

  if (initiativeLoading) {
    return (
      <Layout>
        <div className="py-16 container mx-auto px-4 max-w-4xl">
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

  if (!initiative) {
    return (
      <Layout>
        <div className="py-32 text-center">
          <p className="text-2xl text-gray-400 mb-6">이니셔티브를 찾을 수 없습니다.</p>
          <Button onClick={() => navigate("/initiatives")} className="bg-cordia-teal text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />{t('initiatives.backToList')}
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-8 text-gray-500 hover:text-cordia-teal -ml-2"
            onClick={() => navigate("/initiatives")}
            data-testid="button-back-initiatives"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />{t('initiatives.backToList')}
          </Button>

          {initiative && (
            <>
              <img
                src={initiative.image_url || ""}
                alt={initiative.title}
                className="w-full max-h-96 object-cover rounded-2xl mb-8"
              />

              <Badge className="bg-cordia-teal/10 text-cordia-teal border-cordia-teal/20 mb-4">
                {initiative.category}
              </Badge>

              <h1 className="text-3xl sm:text-4xl font-bold text-cordia-dark mb-6 leading-tight">
                {pickField(initiative, 'title', lang)}
              </h1>

              <p className="text-lg text-gray-500 border-l-4 border-cordia-teal pl-4 mb-8 italic">
                {pickField(initiative, 'description', lang)}
              </p>

              <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed mb-12">
                {pickField(initiative, 'content', lang).split("\n").map((p, i) =>
                  p.trim() ? <p key={i} className="mb-4">{p.trim()}</p> : null
                )}
              </div>
            </>
          )}

          {/* Related News */}
          <div className="border-t pt-10">
            <h2 className="text-2xl font-bold text-cordia-dark mb-6">{t('initiatives.related')}</h2>

            {newsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-400">{t('initiatives.relatedEmpty')}</p>
                <p className="text-xs text-gray-400 mt-2">관리자에서 뉴스를 작성할 때 이 카테고리를 선택하면 여기에 표시됩니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => navigate(`/news/${article.id}`)}
                    className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-4 hover:shadow-md hover:border-cordia-teal/30 transition-all cursor-pointer group"
                    data-testid={`row-related-news-${article.id}`}
                  >
                    <div className="w-32 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                      {article.image_url ? (
                        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-cordia-dark group-hover:text-cordia-teal transition-colors line-clamp-1">
                        {pickField(article, 'title', lang)}
                      </h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mt-1">{pickField(article, 'excerpt', lang)}</p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2 text-xs text-gray-400 min-w-[100px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.published_date).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-cordia-teal shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t flex gap-3 justify-center">
            <Button
              className="bg-cordia-dark hover:bg-gray-800 text-white px-8 py-6 text-base"
              onClick={() => navigate("/contact")}
              data-testid="button-apply-now"
            >
              {t('initiatives.applyNow')}
            </Button>
          </div>
        </div>
      </article>
    </Layout>
  );
}
