import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink } from "lucide-react";
import type { OverseasKoreanPost } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OverseasKorean() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<OverseasKoreanPost | null>(null);
  const limit = 9;

  const { data, isLoading } = useQuery({
    queryKey: ["/api/overseas-korean", currentPage, limit],
    queryFn: async () => {
      const response = await fetch(`/api/overseas-korean?page=${currentPage}&limit=${limit}`);
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  const posts: OverseasKoreanPost[] = data?.posts || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-2xl h-80 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-cordia-teal/10 text-cordia-teal border-cordia-teal/20 mb-4 text-sm px-4 py-1">
              재외동포
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-6">
              Overseas Korean Community
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              News, resources, and connections for the global Korean diaspora community — bridging cultures and creating opportunities worldwide.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🌏</div>
              <h3 className="text-2xl font-bold text-cordia-dark mb-2">No posts yet</h3>
              <p className="text-gray-500">Check back soon for updates from the Korean diaspora community.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-xl mb-6"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-cordia-teal/20 to-cordia-green/20 rounded-xl mb-6 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🌏</div>
                          <div className="text-lg font-bold text-cordia-dark">재외동포</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(post.publishedDate).toLocaleDateString()}</span>
                    </div>

                    <h3
                      className="text-xl font-bold text-cordia-dark mb-3 hover:text-cordia-teal transition-colors cursor-pointer line-clamp-2"
                      onClick={() => setSelectedPost(post)}
                    >
                      {post.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="text-cordia-blue hover:text-blue-600 font-medium text-sm p-0 h-auto"
                        onClick={() => setSelectedPost(post)}
                      >
                        Read More
                      </Button>
                      {post.linkUrl && (
                        <a
                          href={post.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-cordia-teal hover:text-cordia-green font-medium"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Visit Link
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNumber = i + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={currentPage === pageNumber ? "bg-cordia-teal hover:bg-cordia-green" : ""}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </div>
      </section>

      {/* Post Detail Modal */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cordia-dark pr-8">
              {selectedPost?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div>
              {selectedPost.imageUrl && (
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(selectedPost.publishedDate).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-6">
                {selectedPost.content}
              </p>
              {selectedPost.linkUrl && (
                <a
                  href={selectedPost.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-cordia-teal text-white px-4 py-2 rounded-lg hover:bg-cordia-green transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Link
                </a>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
