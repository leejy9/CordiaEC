import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye, Download } from "lucide-react";
import type { ResearchPaper } from "@shared/schema";

interface ResearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paper: ResearchPaper | null;
  loading?: boolean;
}

export default function ResearchModal({ 
  open, 
  onOpenChange, 
  paper, 
  loading = false 
}: ResearchModalProps) {
  
  const handleDownload = () => {
    // In a real implementation, this would trigger a PDF download
    console.log('Download research paper:', paper?.id);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-research">
          <DialogHeader>
            <Skeleton className="h-8 w-64" />
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!paper) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl" data-testid="modal-research">
          <DialogHeader>
            <DialogTitle>Research Paper Not Found</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">The requested research paper could not be found.</p>
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-research">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cordia-dark" data-testid="text-research-title">
            {paper.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center" data-testid="text-research-date">
              <Calendar className="w-4 h-4 mr-1" />
              Published: {paper.publishedDate.toLocaleDateString()}
            </span>
            <span className="flex items-center" data-testid="text-research-views">
              <Eye className="w-4 h-4 mr-1" />
              Views: {paper.views.toLocaleString()}
            </span>
            <span className="flex items-center" data-testid="text-research-downloads">
              <Download className="w-4 h-4 mr-1" />
              Downloads: {paper.downloads}
            </span>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 text-base leading-relaxed font-medium" data-testid="text-research-description">
              {paper.description}
            </p>
            
            <div className="mt-6 space-y-4 text-gray-700">
              {paper.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="leading-relaxed">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-cordia-dark mb-2">Author</h4>
              <p className="text-gray-600" data-testid="text-research-author">{paper.author}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-6 border-t">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => onOpenChange(false)}
            data-testid="button-close"
          >
            Close
          </Button>
          <Button 
            className="flex-1 bg-cordia-blue hover:bg-blue-600 text-white"
            onClick={handleDownload}
            data-testid="button-download"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
