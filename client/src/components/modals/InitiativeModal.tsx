import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import type { Initiative } from "@shared/schema";

interface InitiativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initiative: Initiative | null;
  loading?: boolean;
}

export default function InitiativeModal({ 
  open, 
  onOpenChange, 
  initiative, 
  loading = false 
}: InitiativeModalProps) {
  const [, setLocation] = useLocation();
  
  const handleApplyNow = () => {
    onOpenChange(false); // Close the modal
    setLocation('/contact'); // Navigate to contact page
  };
  
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-initiative">
          <DialogHeader>
            <Skeleton className="h-8 w-64" />
          </DialogHeader>
          <div className="space-y-6">
            <Skeleton className="w-full h-48 rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!initiative) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl" data-testid="modal-initiative">
          <DialogHeader>
            <DialogTitle>Initiative Not Found</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">The requested initiative could not be found.</p>
          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-initiative">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cordia-dark" data-testid="text-initiative-title">
            {initiative.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {initiative.imageUrl && (
            <img 
              src={initiative.imageUrl} 
              alt={initiative.title}
              className="w-full h-48 object-cover rounded-xl"
              data-testid="img-initiative"
            />
          )}
          
          <div className="prose max-w-none">
            <p className="text-gray-600 text-base leading-relaxed" data-testid="text-initiative-description">
              {initiative.description}
            </p>
            
            <div className="mt-6 space-y-4 text-gray-700">
              {initiative.content.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="leading-relaxed">
                    {paragraph.trim()}
                  </p>
                )
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-cordia-dark mb-2">Program Category</h4>
              <p className="text-gray-600">{initiative.category}</p>
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
            className="flex-1 bg-cordia-teal hover:bg-cordia-green text-white"
            onClick={handleApplyNow}
            data-testid="button-apply"
          >
            Apply Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
