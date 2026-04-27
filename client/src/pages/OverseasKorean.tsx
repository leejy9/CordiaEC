import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ImageIcon, ExternalLink, ChevronRight, Search } from "lucide-react";
import type { OverseasKoreanPost } from "@shared/schema";

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
}

export default function OverseasKorean() {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/overseas-korean", currentPage, limit, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(currentPage), limit: String(limit) });
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/overseas-korean?${params}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const posts: OverseasKoreanPost[] = data?.posts || [];
  const total: number = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pageList = useMemo(() => buildPageList(currentPage, totalPages), [currentPage, totalPages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
  };

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

          {/* Toolbar */}
          <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="제목 또는 요약에서 검색..."
                className="pl-9 bg-white"
                data-testid="input-search-overseas"
              />
            </form>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>페이지당</span>
              <Select
                value={String(limit)}
                onValueChange={(v) => { setLimit(Number(v)); setCurrentPage(1); }}
              >
                <SelectTrigger className="w-24 bg-white" data-testid="select-page-size-overseas">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3 max-w-4xl mx-auto">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-36 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🌏</div>
              <p className="text-xl text-gray-400">
                {searchQuery ? "검색 결과가 없습니다." : "아직 게시글이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/overseas-korean/${post.id}`)}
                  className="flex items-center gap-5 bg-white border border-gray-100 rounded-xl px-5 py-4 hover:shadow-md hover:border-cordia-teal/30 transition-all cursor-pointer group"
                  data-testid={`row-overseas-${post.id}`}
                >
                  <div className="w-40 h-28 rounded-lg overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-cordia-dark group-hover:text-cordia-teal transition-colors text-base sm:text-lg line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 mt-1.5">{post.excerpt}</p>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1.5 text-xs text-gray-400 min-w-[100px]">
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

          {totalPages > 1 && (
            <div className="flex justify-center mt-10 gap-1.5 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                이전
              </Button>
              {pageList.map((p, i) =>
                p === "..." ? (
                  <span key={`gap-${i}`} className="px-2 self-center text-gray-400">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(p)}
                    className={currentPage === p ? "bg-cordia-teal hover:bg-cordia-green min-w-[36px]" : "min-w-[36px]"}
                    data-testid={`button-page-${p}`}
                  >
                    {p}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
