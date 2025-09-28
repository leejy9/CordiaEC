import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import type { NewsArticle } from "@shared/schema";
import NewsModal from "@/components/modals/NewsModal";

export default function News() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const limit = 9;

  const { data: newsData, isLoading } = useQuery({
    queryKey: ["/api/news", currentPage, limit],
    queryFn: async () => {
      const response = await fetch(`/api/news?page=${currentPage}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      return response.json();
    },
  });

  const articles = (newsData as any)?.articles || [];
  const total = (newsData as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
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
      {/* Hero Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-6" data-testid="text-news-title">
              News
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="text-news-description">
              Stay updated with our latest announcements, partnerships, and industry developments that shape the future 
              of global collaboration.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: NewsArticle) => (
              <Card 
                key={article.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                data-testid={`card-news-${article.id}`}
              >
                <CardContent className="p-6">
                  {article.imageUrl ? (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-48 object-cover rounded-xl mb-6"
                      data-testid={`img-news-${article.id}`}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-cordia-green/20 to-cordia-teal/20 rounded-xl mb-6 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl text-cordia-teal mb-2">📰</div>
                        <div className="text-lg font-bold text-cordia-dark">News Article</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span data-testid={`text-news-date-${article.id}`}>
                      {new Date(article.publishedDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 
                    className="text-xl font-bold text-cordia-dark mb-3 hover:text-cordia-teal transition-colors cursor-pointer" 
                    data-testid={`text-news-title-${article.id}`}
                    onClick={() => {
                      setSelectedArticle(article);
                      setNewsModalOpen(true);
                    }}
                  >
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4" data-testid={`text-news-excerpt-${article.id}`}>
                    {article.excerpt}
                  </p>
                  
                  <Button
                    variant="ghost"
                    className="text-cordia-blue hover:text-blue-600 font-medium text-sm p-0 h-auto"
                    data-testid={`button-read-more-${article.id}`}
                    onClick={() => {
                      setSelectedArticle(article);
                      setNewsModalOpen(true);
                    }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
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
                      data-testid={`button-page-${pageNumber}`}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </div>
      </section>
      
      <NewsModal 
        article={selectedArticle} 
        open={newsModalOpen} 
        onOpenChange={setNewsModalOpen} 
      />
    </Layout>
  );
}
