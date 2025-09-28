import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { NewsArticle } from "@shared/schema";

interface NewsModalProps {
  article: NewsArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewsModal({ article, open, onOpenChange }: NewsModalProps) {

  if (!article) return null;

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-news-detail">
          <DialogHeader>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <Badge 
                  className="bg-cordia-teal text-white"
                  data-testid="badge-category-news"
                >
                  News
                </Badge>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span data-testid="text-publish-date">{formatDate(article.publishedDate)}</span>
                </div>
              </div>
              <DialogTitle className="text-2xl font-bold text-left text-cordia-dark" data-testid="text-article-title">
                {article.title}
              </DialogTitle>
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-1" />
                <span data-testid="text-author">By CordiaEC Team</span>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Article Content */}
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-cordia-teal mb-6">
                <p className="text-gray-700 italic" data-testid="text-article-excerpt">
                  {article.excerpt}
                </p>
              </div>
              
              <div className="text-gray-800 leading-relaxed" data-testid="text-article-content">
                {article.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
            
            {/* Image Display */}
            {article.imageUrl && (
              <div className="border-t pt-6">
                <img 
                  src={article.imageUrl} 
                  alt={article.title}
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}
            
            {/* Contact Section */}
            <div className="bg-gradient-to-r from-cordia-teal/5 to-cordia-green/5 p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-cordia-dark mb-2">
                Need More Information?
              </h3>
              <p className="text-gray-600 mb-4">
                If you have any additional questions or inquiries about this news, please don't hesitate to contact us.
              </p>
              <Link href="/contact">
                <Button 
                  onClick={() => onOpenChange(false)}
                  className="bg-cordia-teal hover:bg-cordia-green text-white"
                  data-testid="button-contact-inquiry"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}