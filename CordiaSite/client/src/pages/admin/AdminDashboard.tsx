import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Edit, ExternalLink, Eye, EyeOff, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { HistoryPost } from "@shared/schema";

type HistoryFormState = {
  title: string;
  summary: string;
  content: string;
  eventDate: string;
  thumbnailUrl: string;
  linkUrl: string;
  isPublished: boolean;
  sortOrder: number;
};

const emptyForm: HistoryFormState = {
  title: "",
  summary: "",
  content: "",
  eventDate: "",
  thumbnailUrl: "",
  linkUrl: "",
  isPublished: true,
  sortOrder: 0,
};

function toFormState(post?: HistoryPost | null): HistoryFormState {
  if (!post) {
    return emptyForm;
  }

  const date = new Date(post.eventDate);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return {
    title: post.title,
    summary: post.summary,
    content: post.content,
    eventDate: `${yyyy}-${mm}-${dd}`,
    thumbnailUrl: post.thumbnailUrl ?? "",
    linkUrl: post.linkUrl ?? "",
    isPublished: post.isPublished,
    sortOrder: post.sortOrder,
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formState, setFormState] = useState<HistoryFormState>(emptyForm);

  const sessionQuery = useQuery({
    queryKey: ["/api/admin/session"],
    queryFn: async () => {
      const response = await fetch("/api/admin/session", {
        credentials: "include",
      });
      return response.json();
    },
  });

  const authenticated = (sessionQuery.data as any)?.authenticated === true;
  const configured = (sessionQuery.data as any)?.configured !== false;

  const historyQuery = useQuery({
    queryKey: ["/api/admin/history"],
    enabled: authenticated,
    queryFn: async () => {
      const response = await fetch("/api/admin/history", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch history posts");
      }
      return response.json();
    },
  });

  const posts = ((historyQuery.data as any)?.posts || []) as HistoryPost[];

  useEffect(() => {
    if (!sessionQuery.isLoading && !authenticated && configured) {
      setLocation("/admin/login");
    }
  }, [authenticated, configured, sessionQuery.isLoading, setLocation]);

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedId) ?? null,
    [posts, selectedId],
  );

  useEffect(() => {
    if (selectedPost) {
      setFormState(toFormState(selectedPost));
    } else {
      setFormState(emptyForm);
    }
  }, [selectedPost]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formState,
        eventDate: formState.eventDate,
      };

      if (selectedId) {
        const response = await apiRequest("PATCH", `/api/admin/history/${selectedId}`, payload);
        return response.json();
      }

      const response = await apiRequest("POST", "/api/admin/history", payload);
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: selectedId ? "History post updated" : "History post created",
        description: "The change has been saved successfully.",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/history"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      setSelectedId(null);
      setFormState(emptyForm);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save post",
        description: error.message || "Please review the form and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/history/${id}`);
      return response.json();
    },
    onSuccess: async () => {
      toast({
        title: "History post deleted",
        description: "The post has been removed.",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/history"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      setSelectedId(null);
      setFormState(emptyForm);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "The post could not be deleted.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/logout");
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      setLocation("/admin/login");
    },
  });

  if (sessionQuery.isLoading) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!configured) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto rounded-3xl border border-amber-200 bg-amber-50 p-8">
          <h1 className="text-3xl font-bold text-cordia-dark mb-4">Admin Setup Required</h1>
          <p className="text-gray-700 mb-4">
            Configure `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` in your environment variables before opening the admin dashboard.
          </p>
          <Link href="/">
            <span className="text-cordia-blue font-medium cursor-pointer">Return to the public site</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cordia-teal font-semibold">Admin</p>
            <h1 className="text-3xl font-bold text-cordia-dark">History Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/history">
              <Button variant="outline">View Public Page</Button>
            </Link>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 grid xl:grid-cols-[1.1fr_0.9fr] gap-8">
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-cordia-dark">Posts</h2>
                <p className="text-sm text-gray-500">Create, review, and edit the milestones visible on the public history page.</p>
              </div>
              <Button
                className="bg-cordia-blue hover:bg-blue-600"
                onClick={() => {
                  setSelectedId(null);
                  setFormState(emptyForm);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>

            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`rounded-2xl border p-5 transition-colors ${
                    selectedId === post.id ? "border-cordia-blue bg-blue-50/40" : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-sm">
                        {post.isPublished ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 font-medium">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-3 py-1 font-medium">
                            <EyeOff className="w-3.5 h-3.5 mr-1" />
                            Draft
                          </span>
                        )}
                        <span className="text-gray-500">{new Date(post.eventDate).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-cordia-dark">{post.title}</h3>
                      <p className="text-gray-600 mt-2">{post.summary}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setSelectedId(post.id)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => deleteMutation.mutate(post.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {!posts.length && (
                <div className="rounded-2xl border border-dashed border-gray-200 p-10 text-center text-gray-500">
                  No history posts yet. Create the first one from the form on the right.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-cordia-dark">{selectedId ? "Edit Post" : "Create Post"}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Add text, an image URL, and a related link. Posts can stay as drafts until you publish them.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                saveMutation.mutate();
              }}
            >
              <div>
                <label className="text-sm font-medium text-cordia-dark block mb-2">Title</label>
                <Input
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-cordia-dark block mb-2">Summary</label>
                <Textarea
                  rows={3}
                  value={formState.summary}
                  onChange={(event) => setFormState((prev) => ({ ...prev, summary: event.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-cordia-dark block mb-2">Content</label>
                <Textarea
                  rows={8}
                  value={formState.content}
                  onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-cordia-dark block mb-2">Event Date</label>
                  <Input
                    type="date"
                    value={formState.eventDate}
                    onChange={(event) => setFormState((prev) => ({ ...prev, eventDate: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-cordia-dark block mb-2">Sort Order</label>
                  <Input
                    type="number"
                    value={formState.sortOrder}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, sortOrder: Number.parseInt(event.target.value || "0", 10) || 0 }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-cordia-dark block mb-2">Thumbnail URL</label>
                <Input
                  placeholder="https://..."
                  value={formState.thumbnailUrl}
                  onChange={(event) => setFormState((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-cordia-dark block mb-2">Related Link</label>
                <Input
                  placeholder="https://..."
                  value={formState.linkUrl}
                  onChange={(event) => setFormState((prev) => ({ ...prev, linkUrl: event.target.value }))}
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={formState.isPublished}
                  onChange={(event) => setFormState((prev) => ({ ...prev, isPublished: event.target.checked }))}
                />
                <span className="text-sm font-medium text-cordia-dark">Publish this post immediately</span>
              </label>

              {formState.thumbnailUrl && (
                <div className="rounded-2xl overflow-hidden border border-gray-100">
                  <img src={formState.thumbnailUrl} alt="Preview" className="w-full h-48 object-cover" />
                </div>
              )}

              {formState.linkUrl && (
                <a
                  href={formState.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center text-sm text-cordia-blue hover:text-blue-600"
                >
                  Preview link
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              )}

              <div className="flex flex-wrap gap-3 pt-4">
                <Button type="submit" className="bg-cordia-blue hover:bg-blue-600" disabled={saveMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {saveMutation.isPending ? "Saving..." : selectedId ? "Update Post" : "Create Post"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedId(null);
                    setFormState(emptyForm);
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
