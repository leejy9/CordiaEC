import { Calendar, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { HistoryPost } from "@shared/schema";

interface HistoryModalProps {
  post: HistoryPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function HistoryModal({ post, open, onOpenChange }: HistoryModalProps) {
  if (!post) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="modal-history-detail">
        <DialogHeader>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{new Date(post.eventDate).toLocaleDateString()}</span>
          </div>
          <DialogTitle className="text-2xl font-bold text-left text-cordia-dark">
            {post.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {post.thumbnailUrl && (
            <img
              src={post.thumbnailUrl}
              alt={post.title}
              className="w-full h-72 object-cover rounded-xl"
            />
          )}

          <p className="text-gray-700 italic">{post.summary}</p>

          <div className="space-y-4 text-gray-800 leading-relaxed">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {post.linkUrl && (
            <div className="pt-2">
              <Button asChild className="bg-cordia-blue hover:bg-blue-600">
                <a href={post.linkUrl} target="_blank" rel="noreferrer">
                  View Related Link
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
