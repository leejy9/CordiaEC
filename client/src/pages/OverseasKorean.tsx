import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ImageIcon, ExternalLink, ChevronRight } from "lucide-react";
import type { OverseasKoreanPost } from "@shared/schema";

export default function OverseasKorean() {
  const [currentPage, setCurrentPage] = useState(1);
  const [, navigate] = useLocation();
  const limit = 15;

  const { data, isLoading } = useQuery({
    queryKey: ["/api/overseas-korean", currentPage, limit],
    queryFn: async () => {
      const res = await fetch(`/api/overseas-korean?page=${currentPage}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const posts: OverseasKoreanPost[] = data?.posts || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <Layout>
      <section className="py-16 bg-gray-50 min-h-[80vh]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="bg-cordia-teal/10 text-cordia-teal border-cordia-teal/20 mb-4 text-sm px-4 py-1">
              재외동포
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-4">
              Overseas Korean Community
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              News, resources, and connections for the global Korean diaspora community.
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3 max-w-4xl mx-auto">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-24 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🌏</div>
              <p className="text-xl text-gray-400">아직 게시글이 없습니다.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/overseas-korean/${post.id}`)}
                  className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-md hover:border-cordia-teal/30 transition-all cursor-pointer group"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  {/* Title + Excerpt */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-cordia-dark group-hover:text-cordia-teal transition-colors truncate text-[15px]">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 text-sm truncate mt-0.5">{post.excerpt}</p>
                  </div>

                  {/* Meta */}
                  <div className="shrink-0 flex flex-col items-end gap-1 text-xs text-gray-400 min-w-[90px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.publishedDate).toLocaleDateString("ko-KR")}
                    </span>
                    {post.linkUrl && (
                      <span className="flex items-center gap-1 text-cordia-teal">
                        <ExternalLink className="w-3 h-3" />링크
                      </span>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-cordia-teal shrink-0" />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10 gap-2">
              <Button variant="outline" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                이전
              </Button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const p = i + 1;
                return (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "outline"}
                    onClick={() => setCurrentPage(p)}
                    className={currentPage === p ? "bg-cordia-teal hover:bg-cordia-green" : ""}
                  >
                    {p}
                  </Button>
                );
              })}
              <Button variant="outline" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
                다음
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
