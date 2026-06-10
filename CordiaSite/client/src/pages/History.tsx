import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ExternalLink } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HistoryModal from "@/components/modals/HistoryModal";
import type { HistoryPost } from "@shared/schema";

export default function History() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<HistoryPost | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/history", currentPage, limit],
    queryFn: async () => {
      const response = await fetch(`/api/history?page=${currentPage}&limit=${limit}`);
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }
      return response.json();
    },
  });

  const posts = (data as any)?.posts || [];
  const total = (data as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const openPost = (post: HistoryPost) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-12 bg-gray-200 rounded w-72 mx-auto mb-6" />
            <div className="h-6 bg-gray-200 rounded w-[28rem] max-w-full mx-auto mb-12" />
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center bg-red-50 rounded-2xl border border-red-100 p-10">
              <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-6">History</h1>
              <p className="text-lg text-red-600">
                Failed to load history posts. Please check the API deployment and database connection.
              </p>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-6">History</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore the milestones, programs, publications, and partnerships that have shaped CordiaEC&apos;s work over time.
            </p>
          </div>

          <Card className="shadow-lg border-gray-100 overflow-hidden">
            <CardContent className="p-0">
              <div className="hidden md:grid grid-cols-[180px_1fr_180px] gap-4 px-8 py-4 border-b border-gray-100 bg-gray-50 text-sm font-semibold text-gray-500">
                <span>Date</span>
                <span>Title</span>
                <span>Links</span>
              </div>

              <div className="divide-y divide-gray-100">
                {posts.map((post: HistoryPost) => (
                  <div
                    key={post.id}
                    className="grid md:grid-cols-[180px_1fr_180px] gap-4 px-6 md:px-8 py-6 hover:bg-gray-50 transition-colors"
                    data-testid={`row-history-${post.id}`}
                  >
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(post.eventDate).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => openPost(post)}
                      >
                        <h3 className="text-lg font-semibold text-cordia-dark hover:text-cordia-teal transition-colors">
                          {post.title}
                        </h3>
                      </button>
                      <p className="text-gray-600 mt-2">{post.summary}</p>
                    </div>

                    <div className="flex md:justify-end items-start gap-3">
                      <Button variant="outline" onClick={() => openPost(post)}>
                        Read More
                      </Button>
                      {post.linkUrl && (
                        <Button asChild className="bg-cordia-blue hover:bg-blue-600">
                          <a href={post.linkUrl} target="_blank" rel="noreferrer">
                            Link
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      className={currentPage === pageNumber ? "bg-cordia-teal hover:bg-cordia-green" : ""}
                      onClick={() => setCurrentPage(pageNumber)}
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

      <HistoryModal post={selectedPost} open={modalOpen} onOpenChange={setModalOpen} />
    </Layout>
  );
}
