import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  message: z.string().min(1, "Message is required").min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubject?: string;
}

export default function ContactModal({ open, onOpenChange, defaultSubject }: ContactModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: defaultSubject ? `문의 제목: ${defaultSubject}\n\n` : "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us. We'll get back to you soon!",
      });
      form.reset();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Send Message",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    contactMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-contact">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cordia-dark">Contact Us</DialogTitle>
        </DialogHeader>
        
        <p className="text-gray-600 mb-6">
          We're here to help. Reach out to us with any questions or inquiries.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your Name" 
                      {...field} 
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="Your Email" 
                      {...field}
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Your message..." 
                      rows={4} 
                      className="resize-none" 
                      {...field}
                      data-testid="input-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-cordia-blue hover:bg-blue-600" 
                disabled={contactMutation.isPending}
                data-testid="button-submit"
              >
                {contactMutation.isPending ? "Sending..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
