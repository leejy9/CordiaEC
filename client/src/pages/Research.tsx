import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ResearchModal from "@/components/modals/ResearchModal";
import type { ResearchPaper } from "@shared/schema";

export default function Research() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaper, setSelectedPaper] = useState<ResearchPaper | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 10;

  const { data: researchData, isLoading } = useQuery({
    queryKey: ["/api/research", currentPage, limit],
  });

  const papers = (researchData as any)?.papers || [];
  const total = (researchData as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const openModal = (paper: ResearchPaper) => {
    setSelectedPaper(paper);
    setModalOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-200 rounded-2xl h-96 animate-pulse"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-cordia-dark mb-6" data-testid="text-research-title">
              Research
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto" data-testid="text-research-description">
              Explore our latest research findings, issue briefs, and industry insights that drive innovation and inform 
              strategic decision-making.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Views</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {papers.map((paper: ResearchPaper) => (
                      <tr key={paper.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-research-${paper.id}`}>
                        <td className="px-6 py-4">
                          <div 
                            className="cursor-pointer"
                            onClick={() => openModal(paper)}
                          >
                            <h3 className="font-semibold text-cordia-dark hover:text-cordia-teal transition-colors" data-testid={`text-paper-title-${paper.id}`}>
                              {paper.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1" data-testid={`text-paper-description-${paper.id}`}>
                              {paper.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600" data-testid={`text-paper-date-${paper.id}`}>
                          {paper.publishedDate.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600" data-testid={`text-paper-views-${paper.id}`}>
                          {paper.views.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openModal(paper)}
                            className="text-cordia-blue hover:text-blue-600 font-medium"
                            data-testid={`button-paper-details-${paper.id}`}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
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
                        size="sm"
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
                    size="sm"
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
        </div>
      </section>

      <ResearchModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
        paper={selectedPaper}
      />
    </Layout>
  );
}
